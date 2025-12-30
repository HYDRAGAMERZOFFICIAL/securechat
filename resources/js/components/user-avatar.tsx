"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

type UserAvatarProps = {
  src?: string;
  name?: string;
  className?: string;
};

export function UserAvatar({ src, name, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("ring-2 ring-background", className)}>
      <AvatarImage src={src} alt={name} className="object-cover" />
      <AvatarFallback>
        {name ? (
          name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        ) : (
          <User className="h-5 w-5" />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
