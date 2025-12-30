"use client";

import { useAuth } from "@/components/auth-context";
import { ChatInterface } from "@/components/chat-interface";
import { LoginPage } from "@/components/login-page";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isLoading, logout } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <ChatInterface onSignOut={handleSignOut} />;
}
