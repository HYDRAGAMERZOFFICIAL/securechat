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
    registrationToken: string | null;
    requestOtp: (phone: string) => Promise<any>;
    verifyOtp: (phone: string, otp: string) => Promise<any>;
    register: (username: string, profilePicture: string | null) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
};

const getDeviceName = () => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    return 'Web Browser';
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [registrationToken, setRegistrationToken] = useState<string | null>(null);
    const [tempPhone, setTempPhone] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const requestOtp = async (phone: string) => {
        setIsLoading(true);
        try {
            const res = await api.users.requestOtp(phone);
            setTempPhone(phone);
            return res;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async (phone: string, otp: string) => {
        setIsLoading(true);
        try {
            const res = await api.users.verifyOtp(phone, otp, getDeviceId(), getDeviceName());
            if (res.status === 'registration_required') {
                setRegistrationToken(res.registration_token);
            } else if (res.status === 'success') {
                setUser(res.user);
                localStorage.setItem('user', JSON.stringify(res.user));
                localStorage.setItem('access_token', res.access_token);
            }
            return res;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, profilePicture: string | null) => {
        if (!registrationToken) throw new Error('Registration token missing');
        setIsLoading(true);
        try {
            const res = await api.users.register(
                registrationToken, 
                username, 
                profilePicture, 
                getDeviceId(), 
                getDeviceName()
            );
            if (res.status === 'success') {
                setUser(res.user);
                localStorage.setItem('user', JSON.stringify(res.user));
                localStorage.setItem('access_token', res.access_token);
                setRegistrationToken(null);
            }
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
        localStorage.removeItem('access_token');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, registrationToken, requestOtp, verifyOtp, register, logout }}>
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
