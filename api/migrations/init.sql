CREATE DATABASE IF NOT EXISTS securechat;
USE securechat;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    profile_picture TEXT,
    online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chats (
    id VARCHAR(255) PRIMARY KEY,
    type ENUM('private', 'group') NOT NULL,
    name VARCHAR(255),
    avatar TEXT,
    last_message TEXT,
    last_message_timestamp TIMESTAMP NULL,
    unread_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_members (
    chat_id VARCHAR(255),
    user_id VARCHAR(255),
    PRIMARY KEY (chat_id, user_id),
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(255) PRIMARY KEY,
    chat_id VARCHAR(255),
    sender_id VARCHAR(255),
    text TEXT NOT NULL,
    status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
