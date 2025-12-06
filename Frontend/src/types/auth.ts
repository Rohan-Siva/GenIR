export interface User {
    user_id: string;
    username: string;
    email: string;
    created_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface Conversation {
    conversation_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    message_count: number;
}

export interface Message {
    role: string;
    content: string;
    timestamp: string;
}

export interface Preferences {
    user_id: string;
    domain: string;
    response_style: string;
    information_sources: {
        web: boolean;
        academic: boolean;
        social: boolean;
    };
}
