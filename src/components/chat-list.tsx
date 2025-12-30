
"use client";

import type { Chat, Message, User } from "@/lib/data";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Check, CheckCheck } from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { formatDistanceToNow } from 'date-fns';
import { useMemo, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  isLoading: boolean;
}

export function ChatList({ chats, selectedChat, onSelectChat, isLoading }: ChatListProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
        try {
            const data = await api.users.getAll();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };
    fetchUsers();
  }, []);

  const usersById = useMemo(() => {
    const map = new Map<string, User>();
    users?.forEach(user => map.set(user.id, user));
    return map;
  }, [users]);

  const renderStatus = (message: Message | undefined) => {
    if (!message || message.senderId !== currentUser?.id) return null;
    
    const className = "h-4 w-4 mr-1";
    if (message.status === "read") {
      return <CheckCheck className={cn(className, "text-primary")} />;
    }
    if (message.status === "delivered") {
      return <CheckCheck className={className} />;
    }
    return <Check className={className} />;
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const parsedDate = new Date(timestamp);
      if(!isNaN(parsedDate.getTime())){
         return formatDistanceToNow(parsedDate, { addSuffix: true });
      }
    } catch (parseError) {}
    return 'just now';
  };
  
  const getTime = (ts: any) => {
    if (!ts) return 0;
    if (ts instanceof Date) return ts.getTime();
    return new Date(ts).getTime() || 0;
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {chats.sort((a, b) => getTime(b.lastMessageTimestamp) - getTime(a.lastMessageTimestamp)).map((chat) => {
          const lastMessage = chat.messages?.[chat.messages.length - 1];
          
          let chatName = chat.name;
          let chatAvatar = chat.avatar;

          if(chat.type === 'private') {
            const otherUserId = chat.members.find(uid => uid !== currentUser?.id);
            const otherUser = otherUserId ? usersById.get(otherUserId) : undefined;
            if(otherUser) {
              chatName = otherUser.username;
              chatAvatar = otherUser.profilePicture!;
            }
          }

          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={cn(
                "flex items-center gap-3 w-full p-2 rounded-lg text-left transition-colors",
                selectedChat?.id === chat.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
            >
              <UserAvatar
                src={chatAvatar}
                name={chatName}
                className="h-12 w-12"
              />
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">{chatName}</h3>
                  {chat.lastMessageTimestamp && (
                    <p className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTimestamp(chat.lastMessageTimestamp)}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground truncate flex items-center">
                    {renderStatus(lastMessage)}
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                  {chat.unreadCount > 0 && (
                    <Badge variant="default" className="flex-shrink-0">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
