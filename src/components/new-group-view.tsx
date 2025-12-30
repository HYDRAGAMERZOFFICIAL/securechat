
"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Camera, Check, Search, Users } from "lucide-react";
import { type User, type Chat } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "./user-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "@/firebase";
import { serverTimestamp } from "firebase/firestore";

export function NewGroupView({ users, onCreateGroup, onClose }: { users: User[], onCreateGroup: (group: Omit<Chat, 'id' | 'messages' | 'unreadCount'>) => void; onClose: () => void; }) {
  const { user: currentUser } = useUser();
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleUser = (user: User) => {
    setSelectedUsers(prev =>
      prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  }

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length > 0 && currentUser) {
      const newGroup = {
        type: 'group' as const,
        name: groupName,
        avatar: groupAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=random`,
        members: [currentUser.uid, ...selectedUsers.map(u => u.id)],
        lastMessage: "Group created",
        lastMessageTimestamp: serverTimestamp(),
      };
      onCreateGroup(newGroup);
    }
  }
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setGroupAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const filteredUsers = users
    .filter(u => u.id !== currentUser?.uid)
    .filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-card">
      <header className="p-3 border-b border-border flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={onClose}>
          <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">New Group</h2>
          <p className="text-sm text-muted-foreground">Add subject and select members</p>
        </div>
      </header>

      <div className="p-4 space-y-4 border-b">
         <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 text-3xl">
                <AvatarImage src={groupAvatar ?? undefined} />
                <AvatarFallback>
                  <Users />
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-6 w-6"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-3 h-3" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            <Input 
              placeholder="Group Subject" 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="text-lg"
            />
         </div>
      </div>
      
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
              onClick={() => handleToggleUser(user)}
              className="flex items-center gap-3 w-full p-2 rounded-lg text-left transition-colors hover:bg-muted cursor-pointer"
            >
              <div className="relative">
                <UserAvatar src={user.profilePicture} name={user.username} className="h-12 w-12" />
                {selectedUsers.find(u => u.id === user.id) && (
                  <div className="absolute bottom-0 right-0 bg-primary rounded-full p-0.5">
                    <Check className="h-3 w-3 text-primary-foreground"/>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-semibold truncate">{user.username}</h3>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {selectedUsers.length > 0 && (
         <footer className="p-4 bg-card border-t">
           <Button className="w-full" onClick={handleCreateGroup} disabled={!groupName.trim()}>
             Create Group ({selectedUsers.length} selected)
           </Button>
         </footer>
      )}
    </div>
  );
}
