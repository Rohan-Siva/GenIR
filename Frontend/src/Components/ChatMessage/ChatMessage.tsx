import './ChatMessage.css';

interface Chat{
    role: string;
    message: string;
}

export const  ChatMessage= ({chat}:{chat:Chat}) => {
    return (
        <div className = {`message-aligner ${chat.role === "user"? 'user' : 'bot'}-message`}>
            <div className={`message-container ${chat.role === "user"? 'userMsg' :'botMsg'}-container`}>
              <div className="text">{chat.message}</div>
            </div>

        </div>
    );
};
