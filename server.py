from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
from dotenv import load_dotenv
from datetime import datetime
import uuid
from botocore.exceptions import ClientError


from models import (
    QueryRequest, UserRegister, UserLogin, Token, UserResponse,
    ConversationCreate, ConversationUpdate, ConversationResponse,
    PreferencesUpdate, PreferencesResponse, Message
)
from auth import AuthService, get_current_user_dependency
from database import get_db, db_client

load_dotenv()


PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "127.0.0.1")

if not PERPLEXITY_API_KEY:
    raise ValueError("PERPLEXITY_API_KEY environment variable is not set")


client = OpenAI(api_key=PERPLEXITY_API_KEY, base_url="https://api.perplexity.ai")

app = FastAPI(title="GenIR API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():

    print("Initializing DynamoDB tables...")
    db_client.create_tables()
    print("Server startup complete!")




@app.post("/auth/register", response_model=UserResponse)
def register(user: UserRegister, db=Depends(get_db)):

    return AuthService.register_user(user.username, user.email, user.password, db)


@app.post("/auth/login", response_model=Token)
def login(user: UserLogin, db=Depends(get_db)):

    return AuthService.login_user(user.email, user.password, db)


@app.get("/auth/me", response_model=UserResponse)
def get_current_user(current_user: dict = Depends(get_current_user_dependency)):

    return current_user




@app.post("/generate")
def generate_response(
    request: QueryRequest,
    current_user: dict = Depends(get_current_user_dependency),
    db=Depends(get_db)
):

    try:

        messages = [
            {
                "role": "system",
                "content": (
                    f"You are an AI assistant skilled in assisting with the goal of: {request.goal}. "
                    f"Focus on the domain: {request.target_domain}. "
                    f"Provide responses in a {request.response_style} manner, "
                    f"using only the following type of information source: {request.information_source}, "
                    f"and only use sources from the following time range: {request.time_range}."
                ),
            },
            {"role": "user", "content": request.query},
        ]


        response = client.chat.completions.create(
            model="sonar-reasoning",
            messages=messages,
        )


        content = response.choices[0].message.content
        citations = getattr(response, "citations", [])


        if request.conversation_id:
            try:

                conv_response = db.conversations_table.get_item(
                    Key={
                        'user_id': current_user['user_id'],
                        'conversation_id': request.conversation_id
                    }
                )
                
                if 'Item' in conv_response:
                    conversation = conv_response['Item']
                    messages_list = conversation.get('messages', [])
                    

                    messages_list.append({
                        'role': 'user',
                        'content': request.query,
                        'timestamp': datetime.utcnow().isoformat()
                    })
                    messages_list.append({
                        'role': 'assistant',
                        'content': content,
                        'timestamp': datetime.utcnow().isoformat()
                    })
                    

                    db.conversations_table.update_item(
                        Key={
                            'user_id': current_user['user_id'],
                            'conversation_id': request.conversation_id
                        },
                        UpdateExpression='SET messages = :messages, updated_at = :updated_at',
                        ExpressionAttributeValues={
                            ':messages': messages_list,
                            ':updated_at': datetime.utcnow().isoformat()
                        }
                    )
            except Exception as e:
                print(f"Error saving to conversation: {e}")

        return {"response": content, "citations": citations}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




@app.post("/conversations", response_model=ConversationResponse)
def create_conversation(
    conversation: ConversationCreate,
    current_user: dict = Depends(get_current_user_dependency),
    db=Depends(get_db)
):

    try:
        conversation_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        conversation_data = {
            'user_id': current_user['user_id'],
            'conversation_id': conversation_id,
            'title': conversation.title,
            'messages': [msg.dict() for msg in conversation.messages],
            'created_at': now,
            'updated_at': now
        }

        db.conversations_table.put_item(Item=conversation_data)

        return conversation_data

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/conversations")
def get_conversations(
    current_user: dict = Depends(get_current_user_dependency),
    db=Depends(get_db)
):

    try:
        response = db.conversations_table.query(
            KeyConditionExpression='user_id = :user_id',
            ExpressionAttributeValues={
                ':user_id': current_user['user_id']
            },
            ScanIndexForward=False
        )

        conversations = response.get('Items', [])
        

        return [
            {
                'conversation_id': conv['conversation_id'],
                'title': conv['title'],
                'created_at': conv['created_at'],
                'updated_at': conv['updated_at'],
                'message_count': len(conv.get('messages', []))
            }
            for conv in conversations
        ]

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user_dependency),
    db=Depends(get_db)
):

    try:
        response = db.conversations_table.get_item(
            Key={
                'user_id': current_user['user_id'],
                'conversation_id': conversation_id
            }
        )

        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Conversation not found")

        return response['Item']

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.put("/conversations/{conversation_id}")
def update_conversation(
    conversation_id: str,
    update: ConversationUpdate,
    current_user: dict = Depends(get_current_user_dependency),
    db=Depends(get_db)
):

    try:

        update_expr_parts = []
        expr_attr_values = {':updated_at': datetime.utcnow().isoformat()}

        if update.title is not None:
            update_expr_parts.append('title = :title')
            expr_attr_values[':title'] = update.title

        if update.messages is not None:
            update_expr_parts.append('messages = :messages')
            expr_attr_values[':messages'] = [msg.dict() for msg in update.messages]

        update_expr_parts.append('updated_at = :updated_at')
        update_expression = 'SET ' + ', '.join(update_expr_parts)

        db.conversations_table.update_item(
            Key={
                'user_id': current_user['user_id'],
                'conversation_id': conversation_id
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expr_attr_values
        )

        return {"message": "Conversation updated successfully"}

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user_dependency),
    db=Depends(get_db)
):

    try:
        db.conversations_table.delete_item(
            Key={
                'user_id': current_user['user_id'],
                'conversation_id': conversation_id
            }
        )

        return {"message": "Conversation deleted successfully"}

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")




@app.get("/preferences", response_model=PreferencesResponse)
def get_preferences(
    current_user: dict = Depends(get_current_user_dependency),
    db=Depends(get_db)
):

    try:
        response = db.preferences_table.get_item(
            Key={'user_id': current_user['user_id']}
        )

        if 'Item' not in response:

            return {
                'user_id': current_user['user_id'],
                'domain': 'Healthcare',
                'response_style': 'Comparative Report',
                'information_sources': {
                    'web': False,
                    'academic': False,
                    'social': False
                }
            }

        return response['Item']

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.put("/preferences")
def update_preferences(
    preferences: PreferencesUpdate,
    current_user: dict = Depends(get_current_user_dependency),
    db=Depends(get_db)
):

    try:

        update_expr_parts = []
        expr_attr_values = {}

        if preferences.domain is not None:
            update_expr_parts.append('domain = :domain')
            expr_attr_values[':domain'] = preferences.domain

        if preferences.response_style is not None:
            update_expr_parts.append('response_style = :response_style')
            expr_attr_values[':response_style'] = preferences.response_style

        if preferences.information_sources is not None:
            update_expr_parts.append('information_sources = :information_sources')
            expr_attr_values[':information_sources'] = preferences.information_sources.dict()

        if not update_expr_parts:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_expression = 'SET ' + ', '.join(update_expr_parts)

        db.preferences_table.update_item(
            Key={'user_id': current_user['user_id']},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expr_attr_values
        )

        return {"message": "Preferences updated successfully"}

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")




@app.get("/")
def root():

    return {
        "message": "GenIR API is running",
        "version": "1.0.0",
        "status": "healthy"
    }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host=HOST, port=PORT, reload=True)