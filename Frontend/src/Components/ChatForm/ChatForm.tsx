import { BACKEND_URL } from "../../config";
import attachment from "../../../public/gg_attachment.png";
import send from "../../../public/send.png";
import { useRef, FormEvent, Dispatch, SetStateAction, useState } from "react";
import './ChatForm.css';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

interface Chat {
    role: string;
    message: string;
}

interface ChatFormProps {
    setChatHistory: Dispatch<SetStateAction<Chat[]>>;
}

const ChatForm: React.FC<ChatFormProps> = ({ setChatHistory }) => {
    const ref = useRef<HTMLInputElement>(null);
    const { domain, responseStyle, informationSources } = useAppContext();
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Helper function to convert information sources to a string
    const getInformationSourcesString = (): string => {
        const selectedSources = [];
        if (informationSources.web) selectedSources.push("Web");
        if (informationSources.academic) selectedSources.push("Academic");
        if (informationSources.social) selectedSources.push("Social");

        return selectedSources.length > 0 ? selectedSources.join(", ") : "Verified sources";
    };

    const fetchResponse = async (userMessage: string) => {
        try {
            setIsLoading(true);  // Set loading to true before fetching
            const response = await fetch(`${BACKEND_URL}/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: userMessage,
                    goal: "Provide insightful responses",
                    target_domain: domain,
                    response_style: responseStyle,
                    information_source: getInformationSourcesString(),
                    time_range: "Last 2 years"
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch response");

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error("Error:", error);
            return "Error fetching response.";
        } finally {
            setIsLoading(false);  // Set loading to false after fetch is done
        }
    };

    const handleFormSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!ref.current) return;

        const userMessage: string = ref.current.value.trim();
        if (!userMessage) return;

        setChatHistory((history) => [...history, { role: "user", message: userMessage }]);
        ref.current.value = "";

        // Temporary "Thinking..." message
        setChatHistory((history) => [...history, { role: "bot", message: "Thinking..." }]);

        // Fetch AI response and update the chat
        const aiResponse = await fetchResponse(userMessage);
        setChatHistory((history) => [...history.slice(0, -1), { role: "bot", message: aiResponse }]);
    };

    return (
        <form className="chat-form" onSubmit={handleFormSubmit}>
            <div className="input-container">
                <button className='attach'>
                    <img src={attachment} width={40} alt="Attach" />
                </button>
                <input
                    className="input-box"
                    ref={ref}
                    type="text"
                    placeholder="Type your message here..."
                    disabled={isLoading} // Disable input while loading
                />
                <button type="submit" className='send' disabled={isLoading}>
                    <img src={send} width={40} alt="Send" />
                </button>
            </div>
        </form>
    );
};

export { ChatForm };
