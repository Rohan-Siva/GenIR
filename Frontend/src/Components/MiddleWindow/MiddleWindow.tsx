import React, { useState } from 'react';
import './MiddleWindow.css';
import { ChatForm } from "../ChatForm/ChatForm.tsx";
import { ChatMessage } from "../ChatMessage/ChatMessage.tsx";

interface Chat {
    role: string;
    message: string;
}

const MiddleWindow: React.FC = () => {
    const [chatHistory, setChatHistory] = useState<Chat[]>([]);
    return (
        <div className="middle-window">
            <div className="conversation-container">
                {chatHistory.map((chat, index) =>
                    (<ChatMessage key={index} chat={chat}></ChatMessage>))}
            </div>
            <ChatForm setChatHistory={setChatHistory}></ChatForm>
        </div>
    );
};

export default MiddleWindow;