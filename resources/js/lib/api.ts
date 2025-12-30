declare global {
    interface Window {
        Laravel: {
            apiUrl: string;
        }
    }
}

const API_BASE_URL = window.Laravel?.apiUrl || (import.meta.env.VITE_API_URL as string) || '/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
}

export const api = {
    users: {
        getAll: () => apiFetch('users'),
        login: (id: string) => apiFetch('users', {
            method: 'POST',
            body: JSON.stringify({ action: 'login', id }),
        }),
        register: (id: string, username: string, profilePicture: string | null) => apiFetch('users', {
            method: 'POST',
            body: JSON.stringify({ action: 'register', id, username, profile_picture: profilePicture }),
        }),
        update: (id: string, username: string, profilePicture: string | null) => apiFetch('users', {
            method: 'PUT',
            body: JSON.stringify({ id, username, profilePicture }),
        }),
    },
    chats: {
        getAll: (userId: string) => apiFetch(`chats?user_id=${userId}`),
        create: (data: any) => apiFetch('chats', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },
    messages: {
        getByChatId: (chatId: string) => apiFetch(`messages?chat_id=${chatId}`),
        send: (data: any) => apiFetch('messages', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },
};
