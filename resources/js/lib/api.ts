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
    const token = localStorage.getItem('access_token');
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
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
        requestOtp: (phoneNumber: string) => apiFetch('users', {
            method: 'POST',
            body: JSON.stringify({ action: 'request_otp', phone_number: phoneNumber }),
        }),
        verifyOtp: (phoneNumber: string, otp: string, deviceId: string, deviceName: string) => apiFetch('users', {
            method: 'POST',
            body: JSON.stringify({ action: 'verify_otp', phone_number: phoneNumber, otp, device_id: deviceId, device_name: deviceName }),
        }),
        register: (regToken: string, username: string, profilePicture: string | null, deviceId: string, deviceName: string) => apiFetch('users', {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'register', 
                registration_token: regToken, 
                username, 
                profile_picture: profilePicture,
                device_id: deviceId,
                device_name: deviceName
            }),
        }),
        login: (id: string, deviceId: string, deviceName: string) => apiFetch('users', {
            method: 'POST',
            body: JSON.stringify({ action: 'login', id, device_id: deviceId, device_name: deviceName }),
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
