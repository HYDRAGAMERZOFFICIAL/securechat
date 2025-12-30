"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

export type User = {
    id: string;
    username: string;
    profilePicture?: string;
    online?: boolean;
};

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (id: string) => Promise<void>;
    register: (id: string, username: string, profilePicture: string | null) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (id: string) => {
        setIsLoading(true);
        try {
            const userData = await api.users.login(id);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (id: string, username: string, profilePicture: string | null) => {
        setIsLoading(true);
        try {
            await api.users.register(id, username, profilePicture);
            const userData = { id, username, profilePicture: profilePicture || undefined };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
