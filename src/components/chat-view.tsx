
"use client";

import { useState, useMemo } from "react";
import type { Chat, Message, User } from "@/lib/data";
import {
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  Send,
  ArrowLeft,
  ShieldCheck,
  Image as ImageIcon,
  FileText,
  UserX,
  AlertOctagon,
} from "lucide-react";
import { UserAvatar } from "./user-avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { format } from 'date-fns';

interface ChatViewProps {
  chat: Chat;
  onClose: () => void;
  onSendMessage: (text: string) => void;
  allUsers: Map<string, User>;
}

export function ChatView({ chat, onClose, onSendMessage, allUsers }: ChatViewProps) {
  const [messageText, setMessageText] = useState("");
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  const messagesQuery = useMemoFirebase(
    () =>
      chat
        ? query(collection(firestore, "chats", chat.id, "messages"), orderBy("timestamp", "asc"))
        : null,
    [firestore, chat]
  );
  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
  
  const userDetails = useMemo(() => {
    const details = new Map<string, Partial<User>>();
    if (chat.members) {
      chat.members.forEach(memberId => {
        const user = allUsers.get(memberId);
        if (user) {
          details.set(memberId, {
            name: user.username,
            avatar: user.profilePicture,
          });
        }
      });
    }
    return details;
  }, [chat.members, allUsers]);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() === "") return;
    onSendMessage(messageText);
    setMessageText("");
  };

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) {
      return '';
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
      return format(timestamp.toDate(), 'p');
    }
    try {
        const date = new Date(timestamp);
        if(!isNaN(date.getTime())) {
            return format(date, 'p');
        }
    } catch(e) {
        // Not a valid date string
    }
    return String(timestamp);
  };
  
  const chatName = chat.type === 'private' ? allUsers.get(chat.members.find(m => m !== currentUser?.uid)!)?.username : chat.name;
  const chatAvatar = chat.type === 'private' ? allUsers.get(chat.members.find(m => m !== currentUser?.uid)!)?.profilePicture : chat.avatar;


  return (
    <div className="flex flex-col h-full bg-card w-full">
      {/* Chat Header */}
      <header className="flex items-center p-3 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onClose}
        >
          <ArrowLeft />
        </Button>
        <UserAvatar src={chatAvatar} name={chatName} className="h-10 w-10" />
        <div className="ml-3">
          <h2 className="font-semibold text-lg">{chatName}</h2>
          <p className="text-sm text-muted-foreground">
            {chat.type === "group" ? `${chat.members?.length} members` : "online"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
            <Video />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
            <Phone />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Contact</DropdownMenuItem>
              <DropdownMenuItem>Search</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <UserX className="mr-2 h-4 w-4" />
                Block
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <AlertOctagon className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 bg-secondary/30">
        <div className="p-4 space-y-4">
          <Alert className="bg-accent/20 border-accent/30">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <AlertTitle className="text-sm font-semibold text-accent">End-to-end Encrypted</AlertTitle>
            <AlertDescription className="text-xs text-accent/80">
              Messages and calls are secured. No one outside of this chat, not even SecureChat, can read or listen to them.
            </AlertDescription>
          </Alert>
          {isLoading && <p>Loading messages...</p>}
          {messages?.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={{
                ...message,
                timestamp: formatTimestamp(message.timestamp)
              }} 
              sender={userDetails.get(message.senderId)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <footer className="p-3 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
          >
            <Smile />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10"
              >
                <Paperclip />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>Photo or Video</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>Document</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            placeholder="Type a message..."
            className="flex-1 rounded-full px-4"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
          >
            <Send />
          </Button>
        </form>
      </footer>
    </div>
  );
}
