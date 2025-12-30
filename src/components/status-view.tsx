"use client";

import type { Status, User } from "@/lib/data";
import { users } from "@/lib/data";
import { Plus } from "lucide-react";
import { UserAvatar } from "./user-avatar";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

interface StatusViewProps {
  statuses: Status[];
  onViewStatus: (userId: string) => void;
}

const currentUser = users.find((user) => user.id === "user-2");

export function StatusView({ statuses, onViewStatus }: StatusViewProps) {
  const userStatuses = statuses.reduce((acc, status) => {
    if (!acc[status.userId]) {
      acc[status.userId] = [];
    }
    acc[status.userId].push(status);
    return acc;
  }, {} as Record<string, Status[]>);

  const allStatuses = Object.values(userStatuses).map(
    (s) => s[s.length - 1]
  );
  
  const recentUpdates = allStatuses
    .filter((status) => status.userId !== currentUser?.id)
    .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {/* My Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted">
          <div className="relative">
            <UserAvatar
              src={currentUser?.avatar}
              name={currentUser?.name}
              className="h-12 w-12"
            />
            <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center border-2 border-background">
              <Plus className="h-3 w-3" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">My status</h3>
            <p className="text-sm text-muted-foreground">Add to my status</p>
          </div>
        </div>

        {/* Recent Updates */}
        <h4 className="px-3 pt-4 pb-2 text-sm font-semibold text-muted-foreground">
          Recent updates
        </h4>
        {recentUpdates.map((status) => {
          const user = users.find((u) => u.id === status.userId);
          if (!user) return null;
          
          const allUserStatuses = userStatuses[user.id];
          const hasUnseen = allUserStatuses.some(s => !s.viewed)

          return (
            <div
              key={status.id}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted"
              onClick={() => onViewStatus(user.id)}
            >
              <div
                className={cn(
                  "p-0.5 rounded-full",
                  hasUnseen ? "bg-gradient-to-tr from-yellow-400 to-pink-500" : "bg-muted"
                )}
              >
                <div className="p-0.5 bg-background rounded-full">
                  <UserAvatar
                    src={user.avatar}
                    name={user.name}
                    className="h-12 w-12"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(status.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
