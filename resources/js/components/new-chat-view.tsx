
"use client";

import { ArrowLeft, Search } from "lucide-react";
import { type User } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "./user-avatar";
import { useAuth } from "@/components/auth-context";
import { useState } from "react";

export function NewChatView({ users, onSelectUser, onClose }: { users: User[]; onSelectUser: (user: User) => void; onClose: () => void; }) {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users
    .filter(u => u.id !== currentUser?.id)
    .filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-card">
      <header className="p-3 border-b border-border flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={onClose}>
          <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">New Chat</h2>
          <p className="text-sm text-muted-foreground">Select a contact to start a chat</p>
        </div>
      </header>
       <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-10 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="flex items-center gap-3 w-full p-2 rounded-lg text-left transition-colors hover:bg-muted cursor-pointer"
            >
              <UserAvatar src={user.profilePicture} name={user.username} className="h-12 w-12" />
              <div className="flex-1 overflow-hidden">
                <h3 className="font-semibold truncate">{user.username}</h3>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
