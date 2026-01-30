"use client";

import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import { motion } from "framer-motion";

interface MessageItemProps {
  role: "user" | "assistant";
  content: string;
}

/**
 * Individual message component with Zen Light styling
 */
export function MessageItem({ role, content }: MessageItemProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-start gap-3 p-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all",
          isUser 
            ? "bg-zinc-800 border border-zinc-700" 
            : "bg-white border border-zinc-200"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-zinc-100" />
        ) : (
          <Bot className="w-5 h-5 text-zinc-600" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-5 py-3 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] relative group",
          isUser
            ? "bg-white border border-zinc-200 text-zinc-800 rounded-tr-none"
            : "bg-zinc-100/80 text-zinc-700 rounded-tl-none border border-zinc-200/50"
        )}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed font-normal">{content}</p>
        
        <span className={cn(
          "absolute -bottom-5 text-[10px] opacity-0 group-hover:opacity-40 transition-opacity font-medium uppercase tracking-wider text-zinc-500",
          isUser ? "right-0" : "left-0"
        )}>
          {isUser ? "You" : "AI"}
        </span>
      </div>
    </motion.div>
  );
}
