"use client";

import { useAuth, useUser } from "@/firebase";
import { ChatInterface } from "@/components/chat-interface";
import { LoginPage } from "@/components/login-page";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignOut = () => {
    auth.signOut();
  };

  if (isUserLoading) {
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
