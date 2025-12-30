# SecureChat Development Guide

This document serves as a reference for the **Laravel + React + Vite** architecture and outlines the roadmap for future development.

## 🏗️ Current Architecture

- **Backend**: Laravel 11 (PHP 8.3+)
- **Frontend**: React 19 + Vite 6
- **Database**: MySQL (relational schema with Eloquent models)
- **Styling**: Tailwind CSS + Shadcn UI
- **API Strategy**: RESTful API via `routes/api.php`
- **Frontend Entry**: `resources/js/app.tsx`
- **Blade Container**: `resources/views/welcome.blade.php`

---

## 🛠️ Getting Started

### 1. Prerequisites
- PHP 8.2+
- Node.js & NPM
- MySQL (Laragon/XAMPP)

### 2. Installation
```bash
# Install PHP dependencies
composer install

# Install JS dependencies
npm install --legacy-peer-deps

# Generate App Key
php artisan key:generate
```

### 3. Running Development Servers
```bash
# Terminal 1: Laravel Backend
php artisan serve

# Terminal 2: Vite Frontend (HMR)
npm run dev
```

---

## 🚀 Roadmap: Features to Build

### 1. Authentication & Security
- **JWT or Sanctum**: Implement proper token-based authentication (currently using localStorage placeholder).
- **Middleware**: Secure API routes so only authenticated users can fetch messages or chats.
- **Password Hashing**: Ensure user passwords (if added) are hashed using `Bcrypt`.

### 2. Real-time Communication
- **Laravel Reverb or Pusher**: Integrate WebSockets for real-time message delivery.
- **Presence Channels**: Show "Online/Offline" status and "Typing..." indicators.

### 3. Advanced Chat Features
- **File Uploads**: Implement `S3` or `Local` storage for sending images, videos, and documents.
- **Group Management**: Add UI/API to add/remove members from group chats.
- **Message Status**: Implement "Delivered" and "Read" receipts.

### 4. AI Integration (Gemini/OpenAI)
- **Persistent AI Chat**: Move the AI logic from a placeholder to a real integration in `AIController.php`.
- **Contextual AI**: Allow the AI to "read" recent chat history to provide better assistance.

---

## 📂 File Structure Reference

- `app/Http/Controllers/`: Backend logic for Users, Chats, and Messages.
- `app/Models/`: Eloquent models (`User`, `Chat`, `Message`, `ChatMember`).
- `resources/js/components/`: UI components (Interface, List, View).
- `resources/js/lib/api.ts`: Centralized API utility for frontend-backend communication.
- `routes/api.php`: API endpoint definitions.
- `routes/web.php`: Frontend entry point and SPA routing.

---

## 📝 Best Practices
- **Models**: Always use Eloquent models instead of raw SQL where possible.
- **Validation**: Use `Request` validation in Laravel controllers to sanitize inputs.
- **Environment**: Keep all secrets (API keys, DB credentials) in `.env`.
