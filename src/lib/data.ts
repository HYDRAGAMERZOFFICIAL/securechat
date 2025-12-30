
import type { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  username: string;
  profilePicture?: string;
  name?: string; // a display name
  avatar?: string;
  online?: boolean;
  lastSeen?: string;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp | Date | string;
  status: "sent" | "delivered" | "read";
};

export type Chat = {
  id: string;
  type: "private" | "group";
  name: string;
  avatar: string;
  members: string[];
  messages?: Message[];
  unreadCount: number;
  lastMessage?: string | null;
  lastMessageTimestamp?: Timestamp | Date | null;
};

export type Status = {
  id: string;
  userId: string;
  imageUrl: string;
  timestamp: string;
  duration: number; // Duration in seconds
  viewed: boolean;
};

export type Call = {
  id: string;
  type: "voice" | "video";
  direction: 'incoming' | 'outgoing';
  participantIds: string[];
  timestamp: string;
  status: "ongoing" | "ended" | "missed";
};

// Mock data is no longer the primary source for users and chats.
// It can be kept for reference or removed.
export const users: User[] = [];
export const chats: Chat[] = [];
export const statuses: Status[] = [];
export const calls: Call[] = [];
