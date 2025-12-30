# SecureChat Project Overview

## Project Architecture
SecureChat is a full-stack real-time messaging application.
- **Frontend**: Next.js + React (located in the root and `.next` directory suggests build artifacts, but source is likely in `resources/js` or similar, wait, `app/` directory exists for Laravel but also `next.config.ts` and `tsconfig.json` at root).
- **Backend**: Laravel (PHP) providing API services.
- **Database**: MySQL (configured in `.env`).
- **Real-time**: Planned for WebSockets/Pusher, currently using polling/Firestore snapshots (according to status).
- **Authentication**: Firebase Authentication (integrated for OTP).

## Current Status (Summary)
- **UI/UX**: Mostly complete and high quality.
- **Backend**: Basic structure exists but most business logic (E2EE, Media handling, Statuses, Calling) is missing.
- **Security**: Visual indicators exist, but functional End-to-End Encryption (E2EE) is not yet implemented.
- **Database**: Basic schema for users and chats exists, but many supporting tables (receipts, media, calls, etc.) are missing.

## Missing Components (Priority)
1. **Security**: Functional Signal Protocol implementation for E2EE.
2. **Messaging Logic**: Offline queuing, retry mechanisms, and presence tracking.
3. **Media**: Backend for uploads, compression, and secure delivery.
4. **Social Features**: Status updates (stories) and group admin roles.
5. **Real-time**: Robust WebSocket implementation.
6. **Infrastructure**: Push notifications, multi-device sync, and DevOps setup.

## Technical Stack
- **Backend**: PHP 8.x, Laravel 11.x
- **Frontend**: React, Next.js, Tailwind CSS
- **Database**: MySQL
- **Auth**: Firebase Auth
- **Real-time**: Firestore (Current), Pusher/WebSockets (Planned)
