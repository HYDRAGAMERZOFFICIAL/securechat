# **App Name**: SecureChat

## Core Features:

- 1-to-1 Chat: Real-time messaging between two users with end-to-end encryption.
- Group Chat: Create and manage groups for real-time messaging.
- Media Sharing: Share images, videos, and documents securely.
- Status Updates: Share ephemeral status updates (stories) with contacts.
- Voice and Video Calls: Initiate and receive voice and video calls with end-to-end encryption.
- Multi-Device Sync: Synchronize chats and media across multiple devices.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust and security.
- Background color: Light blue-gray (#ECEFF1) for a clean, modern feel.
- Accent color: Electric purple (#7CB342) to highlight interactive elements.
- Body and headline font: 'Inter' for a modern, neutral user experience.
- Use minimalistic vector icons to represent different chat actions and media types.
- Clean and intuitive layout with a focus on readability and user experience.
- Subtle animations for message delivery and status updates.

Goal

Build a secure, real-time messaging web application with:

Clean modern UI

Real-time communication

Privacy-first architecture

Scalable backend (future-ready)

Current Reality

✅ Frontend UX is strong

❌ Core system logic is missing

❌ Security is visual, not functional

This blueprint bridges that gap.

2. HIGH-LEVEL SYSTEM BLUEPRINT
┌──────────────┐
│   Web UI     │  (Next.js + React)
│ (SecureChat) │
└──────┬───────┘
       │ HTTPS + WebSocket
┌──────▼───────┐
│ API Gateway  │  (Auth, routing, rate-limit)
└──────┬───────┘
       │
┌──────▼──────────────────────────────┐
│            BACKEND SERVICES          │
│                                      │
│  Auth Service     Chat Service       │
│  User Service     Message Service    │
│  Media Service    Status Service     │
│  Call Signaling   Notification Svc   │
└──────┬──────────────────────────────┘
       │
┌──────▼──────────────────────────────┐
│            DATA & STORAGE            │
│                                      │
│ PostgreSQL   Cassandra   Redis       │
│ Object Store (Media)                 │
└─────────────────────────────────────┘

3. FRONTEND BLUEPRINT (WHAT YOU HAVE)
Responsibility

UI rendering

User interaction

Encryption (future)

Local state

Status

✅ Well-built

Key Modules
UI LAYER
│
├── Auth Flow (Phone → OTP → Profile)
├── Chat Interface
├── Chat List & New Chat
├── Groups UI
├── Status Viewer
├── Calls View
├── Linked Devices UI
└── Settings / Block / Report UI


⚠️ All data is mock / local only

4. BACKEND BLUEPRINT (WHAT IS MISSING)
Responsibility

Make the app actually work

Handle real users

Deliver messages

Enforce security

Required Backend Stack

Node.js + NestJS

REST APIs

WebSockets

JWT Auth

Service-Level Blueprint
BACKEND
│
├── Auth Service
│   ├── OTP generation
│   ├── OTP verification
│   └── JWT issuance
│
├── User Service
│   ├── Profiles
│   ├── Devices
│   └── Settings
│
├── Chat Service
│   ├── Chat creation
│   ├── Group management
│   └── Permissions
│
├── Message Service
│   ├── Message routing
│   ├── Offline queue
│   └── Receipts
│
├── Media Service
│   ├── Upload handling
│   ├── Compression
│   └── CDN links
│
├── Status Service
│   ├── Upload
│   ├── Expiry jobs
│   └── View tracking
│
├── Call Signaling Service
│   ├── WebRTC signaling
│   └── Call state
│
└── Notification Service
    ├── Push notifications
    └── Unread sync

5. REAL-TIME BLUEPRINT (CRITICAL)
Messaging Flow
User A
 → Encrypt Message
 → WebSocket
 → Message Service
 → Store Encrypted Payload
 → Deliver via WebSocket / Push
 → User B
 → Decrypt Message

Missing

❌ WebSocket server
❌ Message queues
❌ Offline delivery

6. SECURITY BLUEPRINT (CRITICAL GAP)
Intended Security Model

End-to-End Encryption (Signal Protocol)

Per-device keys

Forward secrecy

Current State

❌ No real encryption
❌ No key management
❌ Lock icon is UI-only

Required Security Modules
SECURITY
│
├── Key Generation (client)
├── Key Exchange (server relay)
├── Per-device key store
├── Forward secrecy
└── Secure local storage

7. DATABASE BLUEPRINT
Core Entities
USERS
DEVICES
CONTACTS
CHATS
CHAT_MEMBERS
MESSAGES
MESSAGE_RECEIPTS
MEDIA
STATUS
STATUS_VIEWS
CALLS
BLOCKS
USER_SETTINGS
AUDIT_LOGS

Missing

❌ No real database
❌ No persistence
❌ No schema implementation

8. MEDIA BLUEPRINT
Intended Flow
User selects file
 → Compress (client)
 → Upload to Object Storage
 → Save metadata in DB
 → Serve via CDN

Missing

❌ Upload backend
❌ Storage
❌ CDN

9. MULTI-DEVICE BLUEPRINT
Intended Flow
Primary Device
 → Generate QR
 → Secondary Device scans
 → Key sync
 → Message fan-out

Current State

UI only

10. DEVOPS & DEPLOYMENT BLUEPRINT
Required
Docker
Kubernetes (optional)
CI/CD
.env configs
Monitoring
Logs

Current State

❌ None implemented

11. FUNCTIONALITY STATUS MATRIX
Layer	Status
UI / UX	✅ Complete
Frontend Architecture	✅ Strong
Backend Logic	❌ Missing
Real-time Messaging	❌ Missing
Security	❌ Missing
Database	❌ Missing
Production Ready	❌ No
12. FINAL BLUEPRINT SUMMARY (ONE PARAGRAPH)

SecureChat is a well-designed frontend prototype that visually represents a modern secure chat application. To become a functional system, it requires a complete backend, real-time infrastructure, database persistence, end-to-end encryption, and production deployment. This blueprint defines how those missing layers should be architected and integrated.