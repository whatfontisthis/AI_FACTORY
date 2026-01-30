"use client";

import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { LoadingIndicator } from "./LoadingIndicator";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import type { Message as AIMessage } from "@ai-sdk/react";

interface MessageListProps {
  messages: AIMessage[];
  isLoading: boolean;
}

/**
 * Message list component that renders all chat messages
 * - Auto-scrolls to bottom on new messages
 * - Shows empty state when no messages
 * - Shows loading indicator when AI is responding
 */
export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or when loading
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium mb-2">대화를 시작하세요</h3>
        <p className="text-sm text-center max-w-sm">
          아래 입력창에 메시지를 입력하면 AI가 답변합니다.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent"
      )}
    >
      <div className="max-w-3xl mx-auto">
        {messages
          .filter((message) => message.role === "user" || message.role === "assistant")
          .map((message) => (
            <MessageItem
              key={message.id}
              role={message.role as "user" | "assistant"}
              content={message.content}
            />
          ))}
        {isLoading && <LoadingIndicator />}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}
