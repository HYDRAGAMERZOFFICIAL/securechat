"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Status, User } from "@/lib/data";
import { users } from "@/lib/data";
import { UserAvatar } from "./user-avatar";
import { Progress } from "./ui/progress";

interface StatusViewerProps {
  statuses: Status[];
  onClose: () => void;
}

export function StatusViewer({ statuses, onClose }: StatusViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const progressTimerRef = useRef<NodeJS.Timeout>();

  const allUsersWithStatus = users.filter(user => statuses.some(s => s.userId === user.id));
  
  const currentUserId = allUsersWithStatus[currentUserIndex]?.id;
  const userStatuses = statuses.filter(s => s.userId === currentUserId);
  const currentStatus = userStatuses[currentStatusIndex];

  const user = users.find((u) => u.id === currentStatus?.userId);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setProgress(0);
  };

  const goToNextStatus = () => {
    resetTimer();
    if (currentStatusIndex < userStatuses.length - 1) {
      setCurrentStatusIndex(currentStatusIndex + 1);
    } else if (currentUserIndex < allUsersWithStatus.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStatusIndex(0);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!currentStatus) return;

    const duration = currentStatus.duration * 1000;
    
    timerRef.current = setTimeout(goToNextStatus, duration);

    const startTime = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const newProgress = (elapsedTime / duration) * 100;
      if (newProgress <= 100) {
        setProgress(newProgress);
      } else {
        clearInterval(progressTimerRef.current);
      }
    }, 50);

    return () => {
      resetTimer();
    };
  }, [currentStatus, currentUserIndex, currentStatusIndex]);

  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetTimer();
    if (currentStatusIndex > 0) {
      setCurrentStatusIndex(currentStatusIndex - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
      setCurrentStatusIndex(statuses.filter(s => s.userId === allUsersWithStatus[currentUserIndex-1].id).length - 1);
    }
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToNextStatus();
  };
  
  if (!user || !currentStatus) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative w-full h-full max-w-lg max-h-screen flex flex-col items-center justify-center">
        {/* Navigation */}
        <button onClick={handlePrevClick} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white p-2 bg-black/20 rounded-full">
            <ChevronLeft size={24} />
        </button>
        <button onClick={handleNextClick} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white p-2 bg-black/20 rounded-full">
            <ChevronRight size={24} />
        </button>
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20">
          <div className="flex items-center gap-2 mb-2">
            {userStatuses.map((_, index) => (
              <Progress
                key={index}
                value={index < currentStatusIndex ? 100 : (index === currentStatusIndex ? progress : 0)}
                className="h-1 flex-1"
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar src={user.avatar} name={user.name} className="h-10 w-10" />
              <div>
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-xs text-neutral-300">{new Date(currentStatus.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <img
          src={currentStatus.imageUrl}
          alt={`Status from ${user.name}`}
          className="object-contain max-w-full max-h-full rounded-lg"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < rect.width / 3) {
              handlePrevClick(e);
            } else {
              handleNextClick(e);
            }
          }}
        />
      </div>
    </div>
  );
}
