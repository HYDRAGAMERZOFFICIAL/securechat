"use client";

import type { Call, User } from "@/lib/data";
import { users } from "@/lib/data";
import {
  Phone,
  Video,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
} from "lucide-react";
import { UserAvatar } from "./user-avatar";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

interface CallsViewProps {
  calls: Call[];
}

const getParticipant = (participantIds: string[]): User | undefined => {
  const currentUserId = "user-2";
  const otherUserId = participantIds.find((id) => id !== currentUserId);
  return users.find((user) => user.id === otherUserId);
};

export function CallsView({ calls }: CallsViewProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {calls.map((call) => {
          const participant = getParticipant(call.participantIds);
          if (!participant) return null;

          const isMissed = call.status === "missed";
          const Icon =
            call.type === "video" ? Video : call.status === "incoming" ? PhoneIncoming : PhoneOutgoing;

          return (
            <div
              key={call.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted"
              )}
            >
              <UserAvatar
                src={participant.avatar}
                name={participant.name}
                className="h-12 w-12"
              />
              <div className="flex-1">
                <h3
                  className={cn(
                    "font-semibold",
                    isMissed && "text-destructive"
                  )}
                >
                  {participant.name}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {call.status === "missed" ? (
                    <PhoneMissed
                      className={cn("h-4 w-4", isMissed && "text-destructive")}
                    />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span>{call.direction === 'outgoing' ? 'Outgoing' : 'Incoming'}</span>
                </div>
              </div>
              <div className="text-right">
                {call.type === "video" ? (
                  <Video className="h-5 w-5 text-primary" />
                ) : (
                  <Phone className="h-5 w-5 text-primary" />
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {call.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
