import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './app/page';
import { AuthProvider } from './components/auth-context';
import { Toaster } from './components/ui/toaster';

const app = document.getElementById('app');

if (app) {
    createRoot(app).render(
        <React.StrictMode>
            <AuthProvider>
                <Home />
                <Toaster />
            </AuthProvider>
        </React.StrictMode>
    );
}
