"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ConversationList } from "./ConversationList";
import { getOrCreateSessionId, createNewSession } from "@/lib/session";
import { Button } from "@/app/components/ui/Button";
import { Menu, X } from "lucide-react";

interface ChatContainerProps {
  sessionId?: string;
}

/**
 * Main chat container component
 * - Manages chat state using Vercel AI SDK useChat hook
 * - Handles session management
 * - Coordinates child components
 */
export function ChatContainer({ sessionId: initialSessionId }: ChatContainerProps) {
  const [sessionId, setSessionId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationRefresh, setConversationRefresh] = useState(0);
  const hasCreatedConversation = useRef(false);
  const isSubmitting = useRef(false); // Prevent double submission

  // Initialize session ID on client-side
  useEffect(() => {
    const id = initialSessionId || getOrCreateSessionId();
    setSessionId(id);
    setIsInitialized(true);
  }, [initialSessionId]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    error,
  } = useChat({
    api: "/api/chat",
    body: {
      session_id: sessionId,
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Reset submission lock when loading completes
  useEffect(() => {
    if (!isLoading) {
      isSubmitting.current = false;
    }
  }, [isLoading]);

  // Handle input change wrapper
  const handleChange = useCallback(
    (value: string) => {
      handleInputChange({
        target: { value },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    },
    [handleInputChange]
  );

  // Handle form submit wrapper
  const handleFormSubmit = useCallback(async () => {
    // Prevent double submission
    if (!input.trim() || isLoading || isSubmitting.current) return;
    
    isSubmitting.current = true;
    const userContent = input.trim();

    // 1. Create conversation entry FIRST if it's the first message
    if (!hasCreatedConversation.current) {
      hasCreatedConversation.current = true;
      const title = userContent.slice(0, 50);
      
      try {
        const convRes = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, title }),
        });
        const convData = await convRes.json();
        console.log("[DEBUG] Create conversation result:", convData);
        
        // Trigger conversation list refresh
        if (!convData.error) {
          setConversationRefresh((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    }

    // 2. Save user message to Supabase and WAIT for it to complete
    try {
      const msgRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: userContent,
          role: "user",
          session_id: sessionId,
        }),
      });
      const msgData = await msgRes.json();
      console.log("[DEBUG] Save user message result:", msgData);
      
      if (msgData.error) {
        console.error("[ERROR] Failed to save user message:", msgData.error);
      }
    } catch (error) {
      console.error("[ERROR] Network error saving user message:", error);
    }
    
    // 3. Finally submit to AI
    handleSubmit(new Event("submit") as unknown as React.FormEvent);
    
    // Reset submission lock after a short delay
    setTimeout(() => {
      isSubmitting.current = false;
    }, 500);
  }, [input, isLoading, handleSubmit, sessionId]);

  // Start new conversation
  const handleNewChat = useCallback(() => {
    const newSessionId = createNewSession();
    setSessionId(newSessionId);
    setMessages([]);
    hasCreatedConversation.current = false;
    setSidebarOpen(false);
  }, [setMessages]);

  // Select existing conversation
  const handleSelectConversation = useCallback(async (selectedSessionId: string) => {
    setSessionId(selectedSessionId);
    hasCreatedConversation.current = true; // Already exists in DB
    
    // Load messages for this session
    try {
      const res = await fetch(`/api/messages?session_id=${selectedSessionId}`);
      const data = await res.json();
      
      console.log("[DEBUG] Load messages - session_id:", selectedSessionId);
      console.log("[DEBUG] Load messages - raw response:", data);
      
      if (data.data) {
        console.log("[DEBUG] Messages count:", data.data.length);
        console.log("[DEBUG] Messages roles:", data.data.map((m: { role: string }) => m.role));
        
        const mappedMessages = data.data.map((m: { id: string; role: string; content: string }) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }));
        
        console.log("[DEBUG] Mapped messages:", mappedMessages);
        setMessages(mappedMessages);
      }
    } catch (error) {
      console.error("[ERROR] Failed to load messages:", error);
    }
    
    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("chat_session_id", selectedSessionId);
    }
    
    setSidebarOpen(false);
  }, [setMessages]);

  // Loading skeleton while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-full bg-background">
        <div className="flex-1 flex flex-col">
          <header className="border-b px-4 py-3">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div className="h-6 w-32 bg-secondary rounded animate-pulse" />
              <div className="h-8 w-24 bg-secondary rounded animate-pulse" />
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="border-t p-4">
            <div className="max-w-3xl mx-auto h-12 bg-secondary rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 w-72 transition-all duration-300 ease-in-out md:relative md:translate-x-0 glass-sidebar m-0 md:m-4 md:mr-0 md:rounded-2xl`}
      >
        <ConversationList
          currentSessionId={sessionId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewChat}
          refreshTrigger={conversationRefresh}
        />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-white/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 m-0 md:m-4 relative glass md:rounded-2xl overflow-hidden">
        {/* Header */}
        <header className="border-b border-zinc-100 px-6 py-4 bg-white/40 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden hover:bg-zinc-100"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                  Intelligent Chat
                </h1>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-widest">
                  gemini-3-flash-preview
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Error display */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm text-center">
            오류가 발생했습니다: {error.message}
          </div>
        )}

        {/* Message list */}
        <MessageList messages={messages} isLoading={isLoading} />

        {/* Message input */}
        <MessageInput
          value={input}
          onChange={handleChange}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
