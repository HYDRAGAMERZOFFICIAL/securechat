# SecureChat - Web Application

## 1. Project Overview

This repository contains the source code for the SecureChat web application, a modern, secure, and real-time messaging platform. This project was built to be a feature-rich chat application with a focus on user experience and a clean, modern interface. This document outlines the features, technology stack, and project structure as built through a 12-phase development process.

## 2. Technology Stack

The application is built using a modern decoupled architecture:

-   **Frontend:** Next.js (with App Router)
-   **Backend:** PHP (Native/Custom Routing)
-   **Database:** MySQL (Laragon Connectivity)
-   **Styling:** Tailwind CSS
-   **Component Library:** ShadCN UI
-   **Icons:** Lucide React
-   **AI Infrastructure:** PHP Controller + Next.js Frontend Context

## 3. Features & Development Phases

The application was developed in 12 distinct phases, each focusing on a specific set of features.

### Phase 1: Core Authentication & User System

-   **Phone Number Authentication UI:** A multi-step login flow was created, starting with phone number entry.
-   **OTP Verification Screen:** A screen for users to input a one-time password sent to their phone.
-   **Profile Setup:** A final step for new users to set their display name and upload a profile picture.

### Phase 2: Contacts & Chat Foundation

-   **New Chat Screen:** A dedicated view to see a list of contacts and start a new private conversation.

### Phase 3: Real-Time Messaging

-   **Message Sending:** Implemented the client-side logic for typing a message in the input box and having it appear in the chat view.
-   **Message Bubbles:** Styled messages to distinguish between the current user and other participants.

### Phase 4: End-to-End Encryption

-   **Visual Indicators:** Added an alert banner and lock icon within the chat view to visually confirm to users that the conversation is secure and end-to-end encrypted.

### Phase 5: Media Messaging

-   **Media Sharing UI:** Implemented a dropdown menu attached to the paperclip icon in the message input area, providing options to share "Photo or Video" and "Document".

### Phase 6: Groups & Broadcasts

-   **Group Creation UI:** A dedicated flow for creating new group chats. Users can select members from a contact list, set a group subject (name), and upload a group avatar.

### Phase 7: Status (Stories System)

-   **Status Tab:** A "Status" view was added to the main sidebar, showing recent updates from contacts.
-   **Status Viewer:** Implemented a full-screen, immersive story viewer (similar to Instagram/WhatsApp) that opens when a status is clicked. It includes progress bars and automatically transitions through a user's statuses.

### Phase 8: Voice & Video Calls

-   **Calls Tab:** Added a "Calls" view accessible from the main sidebar.
-   **Call History:** The UI displays a log of past voice and video calls, indicating the call type (voice/video), direction (incoming/outgoing), and status (e.g., missed).

### Phase 9: Notifications & Background Sync

-   **Unread Message Badge:** A notification badge was added to the "Chats" icon in the sidebar. This badge displays the total count of unread messages across all conversations.

### Phase 10: Multi-Device Support

-   **Linked Devices Screen:** Created a UI accessible from the main dropdown menu that shows a list of connected devices and includes a placeholder UI for linking a new device via QR code.

### Phase 11: Privacy, Blocking & Abuse Control

-   **Block & Report UI:** Added "Block" and "Report" options to the dropdown menu in the chat header, allowing users to take action against other users directly from a conversation.

### Phase 12: Performance, Scaling & Production

-   **Code Refactoring:** The main application logic previously in a single file (`page.tsx`) was broken down into smaller, reusable components for better maintainability, scalability, and performance. This included creating separate components for the main `ChatInterface` and the `LoginPage`.

## 4. Project Structure

The project follows a standard Next.js App Router structure. Key directories and files are outlined below:

```
.
├── api/                    # PHP Backend (Laragon)
│   ├── config/             # Database configuration
│   ├── controllers/        # Business logic
│   ├── migrations/         # SQL initialization scripts
│   └── index.php           # API entry point and routing
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── auth-context.tsx    # Authentication state management
│   │   ├── chat-interface.tsx
│   │   ├── chat-list.tsx
│   │   ├── chat-view.tsx
│   │   ├── ui/                 # Reusable ShadCN UI components
│   │   └── user-avatar.tsx
│   │
│   ├── lib/
│   │   ├── api.ts              # API client for PHP backend
│   │   ├── data.ts             # Type definitions
│   │   └── utils.ts
│   │
│   └── ai/
│       └── AIContext.tsx       # AI infrastructure using React Context
│
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and scripts
└── tailwind.config.ts          # Tailwind CSS configuration
```

## 5. Running the Application

### Prerequisites

-   Node.js (v18+)
-   npm / yarn / pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd <project-directory>
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To run the app in development mode:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) to view it in the browser.
