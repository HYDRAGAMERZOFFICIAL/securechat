
"use client";

import { useState, useMemo } from "react";
import {
  MessageCircle,
  History,
  Phone,
  Search,
  MoreVertical,
  Users,
  MessageSquarePlus,
  Laptop,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

import { calls, type Chat, type User, type Status } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/user-avatar";
import { ChatList } from "@/components/chat-list";
import { ChatView } from "@/components/chat-view";
import { StatusView } from "@/components/status-view";
import { CallsView } from "@/components/calls-view";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusViewer } from "@/components/status-viewer";
import { Badge } from "@/components/ui/badge";
import { NewChatView } from "./new-chat-view";
import { NewGroupView } from "./new-group-view";
import { LinkedDevicesView } from "./linked-devices-view";

type View = "chats" | "status" | "calls" | "new-chat" | "new-group" | "linked-devices";

export function ChatInterface({
  onSignOut,
}: {
  onSignOut: () => void;
}) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  const [view, setView] = useState<View>("chats");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [viewingStatus, setViewingStatus] = useState<Status[] | null>(null);

  const chatsQuery = useMemoFirebase(
    () =>
      currentUser
        ? query(
            collection(firestore, "chats"),
            where("members", "array-contains", currentUser.uid)
          )
        : null,
    [firestore, currentUser]
  );
  const { data: chats, isLoading: isLoadingChats } = useCollection<Chat>(chatsQuery);

  const usersQuery = useMemoFirebase(() => query(collection(firestore, "users")), [firestore]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  const selectedChat = chats?.find((c) => c.id === selectedChatId);

  const totalUnreadCount = useMemo(() => {
    if (!chats) return 0;
    return chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
  }, [chats]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChatId(chat.id);
    setView("chats");
    setViewingStatus(null);
    if (chat.unreadCount > 0) {
        const chatRef = doc(firestore, "chats", chat.id);
        updateDoc(chatRef, { unreadCount: 0 });
    }
  };

  const handleSelectNewUser = async (user: User) => {
    if (!currentUser) return;

    // Check if a chat with this user already exists
    const q = query(
      collection(firestore, "chats"),
      where("type", "==", "private"),
      where("members", "in", [[currentUser.uid, user.id], [user.id, currentUser.uid]])
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Existing chat found
      setSelectedChatId(querySnapshot.docs[0].id);
    } else {
      // No existing chat, create a new one
      const newChatData = {
        type: 'private',
        name: user.username,
        avatar: user.profilePicture,
        members: [user.id, currentUser.uid],
        unreadCount: 0,
        lastMessage: null,
        lastMessageTimestamp: null,
      };
      const docRef = await addDoc(collection(firestore, "chats"), newChatData);
      setSelectedChatId(docRef.id);
    }
    setView("chats");
  };

  const handleCreateGroup = (group: Omit<Chat, 'id' | 'messages' | 'unreadCount'>) => {
    addDocumentNonBlocking(collection(firestore, "chats"), {
      ...group,
      unreadCount: 0,
    }).then(docRef => {
        if (docRef) {
          setSelectedChatId(docRef.id);
          setView('chats');
        }
    });
  };

  const handleSendMessage = (text: string) => {
    if (!selectedChatId || !currentUser) return;

    const messagesCol = collection(firestore, "chats", selectedChatId, "messages");
    addDocumentNonBlocking(messagesCol, {
      senderId: currentUser.uid,
      text: text,
      timestamp: serverTimestamp(),
      status: "sent",
    });

    const chatRef = doc(firestore, "chats", selectedChatId);
    updateDoc(chatRef, {
        lastMessage: text,
        lastMessageTimestamp: serverTimestamp(),
        unreadCount: (selectedChat?.unreadCount || 0) + 1
    });
  };
  
  const handleViewStatus = (userId: string) => {
    // This uses mock data, needs to be updated with Firestore data
    // const userStatuses = statuses.filter(s => s.userId === userId);
    // setViewingStatus(userStatuses);
  }
  
  const handleCloseStatus = () => {
    setViewingStatus(null);
  }

  const NavButton = ({
    id,
    icon,
    tooltip,
    badgeCount
  }: {
    id: View;
    icon: React.ReactNode;
    tooltip: string;
    badgeCount?: number;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full h-10 w-10 relative",
              view === id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
            onClick={() => {
              setView(id);
              setSelectedChatId(null);
            }}
          >
            {icon}
             {badgeCount && badgeCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                  {badgeCount}
                </Badge>
              )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderSidebarContent = () => {
     if (view === 'new-chat') {
      return <NewChatView users={users || []} onSelectUser={handleSelectNewUser} onClose={() => setView('chats')} />
    }
    if (view === 'new-group') {
      return <NewGroupView users={users || []} onCreateGroup={handleCreateGroup} onClose={() => setView('chats')} />
    }
    if (view === 'linked-devices') {
      return <LinkedDevicesView onClose={() => setView('chats')} />
    }
    return (
      <>
        {/* Sidebar Header */}
        <header className="p-3 border-b border-border flex items-center justify-between bg-card">
          <UserAvatar
            src={currentUser?.photoURL ?? undefined}
            name={currentUser?.displayName ?? undefined}
            className="h-10 w-10"
          />
          <div className="flex items-center gap-1">
            <NavButton id="chats" icon={<MessageCircle />} tooltip="Chats" badgeCount={totalUnreadCount} />
            <NavButton id="status" icon={<History />} tooltip="Status" />
            <NavButton id="calls" icon={<Phone />} tooltip="Calls" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 text-muted-foreground"
                >
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setView('new-chat')}>
                  <MessageSquarePlus className="mr-2 h-4 w-4" /> New Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('new-group')}>
                  <Users className="mr-2 h-4 w-4" /> New Group
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setView('linked-devices')}>
                  <Laptop className="mr-2 h-4 w-4" /> Linked Devices
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Search Bar */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={
                view === "chats"
                  ? "Search chats..."
                  : view === "status"
                  ? "Search statuses..."
                  : "Search calls..."
              }
              className="pl-10 bg-background"
            />
          </div>
        </div>

        {/* Content */}
        {view === "chats" && (
          <ChatList
            chats={chats || []}
            selectedChat={selectedChat || null}
            onSelectChat={handleSelectChat}
            isLoading={isLoadingChats}
          />
        )}
        {view === "status" && <StatusView statuses={[]} onViewStatus={handleViewStatus}/>}
        {view === "calls" && <CallsView calls={calls} />}
      </>
    );
  }

  const allUsers = useMemo(() => {
    const userMap = new Map<string, User>();
    if (users) {
      users.forEach(user => userMap.set(user.id, user));
    }
    // Add current user if not in the list
    if (currentUser && !userMap.has(currentUser.uid)) {
      userMap.set(currentUser.uid, {
        id: currentUser.uid,
        username: currentUser.displayName!,
        profilePicture: currentUser.photoURL!,
        name: currentUser.displayName!,
        avatar: currentUser.photoURL!,
        online: true,
      });
    }
    return userMap;
  }, [users, currentUser]);

  const selectedChatWithData = useMemo(() => {
    if (!selectedChat) return null;
    
    const otherMemberIds = selectedChat.members.filter(m => m !== currentUser?.uid);
    let chatName = selectedChat.name;
    let chatAvatar = selectedChat.avatar;

    if (selectedChat.type === 'private' && otherMemberIds.length > 0) {
        const otherUser = allUsers.get(otherMemberIds[0]);
        if (otherUser) {
            chatName = otherUser.username;
            chatAvatar = otherUser.profilePicture!;
        }
    }
    
    return { ...selectedChat, name: chatName, avatar: chatAvatar };
  }, [selectedChat, allUsers, currentUser]);

  if (viewingStatus) {
    return <StatusViewer statuses={viewingStatus} onClose={handleCloseStatus} />
  }

  return (
    <div className="flex w-full h-screen">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r border-border transition-all duration-300 bg-card",
          (selectedChatId && view === 'chats') ? "w-full md:w-[30%] md:max-w-sm" : "w-full",
          !(selectedChatId && view === 'chats') && "md:w-full",
          (selectedChatId && view === 'chats') && "hidden md:flex",

        )}
      >
        {renderSidebarContent()}
      </div>

      {/* Main Chat View */}
      <div
        className={cn(
          "flex-1 bg-secondary/50 transition-all duration-300",
          (selectedChatId && view === 'chats') ? "flex" : "hidden md:flex"
        )}
      >
        {selectedChatWithData && view === 'chats' ? (
          <ChatView
            chat={selectedChatWithData}
            onClose={() => setSelectedChatId(null)}
            onSendMessage={handleSendMessage}
            allUsers={allUsers}
          />
        ) : (
          <div className="flex-col items-center justify-center h-full text-center hidden md:flex">
            <MessageCircle className="h-24 w-24 text-muted-foreground/50" />
            <h2 className="mt-4 text-2xl font-semibold text-muted-foreground">
              SecureChat for Web
            </h2>
            <p className="mt-2 text-muted-foreground">
              Select a chat to start messaging or make a call.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
