
"use client";

import type { Message, User } from "@/lib/data";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import { Check, CheckCheck } from "lucide-react";
import { useUser } from "@/firebase";

interface MessageBubbleProps {
  message: Message;
  sender?: Partial<User>;
}

export function MessageBubble({ message, sender }: MessageBubbleProps) {
  const { user: currentUser } = useUser();
  const isCurrentUser = message.senderId === currentUser?.uid;

  const renderStatus = () => {
    if (!isCurrentUser) return null;

    const className = "h-4 w-4 ml-1.5 flex-shrink-0";
    if (message.status === "read") {
      return <CheckCheck className={cn(className, "text-blue-500")} />;
    }
    if (message.status === "delivered") {
      return <CheckCheck className={cn(className, "text-muted-foreground")} />;
    }
    return <Check className={cn(className, "text-muted-foreground")} />;
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 max-w-[75%]",
        isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {!isCurrentUser && (
        <UserAvatar
          src={sender?.avatar}
          name={sender?.name}
          className="h-8 w-8"
        />
      )}
      <div
        className={cn(
          "rounded-xl px-4 py-2",
          isCurrentUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none border"
        )}
      >
        {!isCurrentUser && sender && (
          <p className="text-xs font-semibold text-primary mb-1">
            {sender.name}
          </p>
        )}
        <p className="text-base whitespace-pre-wrap break-words">{message.text}</p>
        <div className="flex items-center justify-end mt-1">
          <span className="text-xs text-muted-foreground/80">
            {message.timestamp}
          </span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}

    