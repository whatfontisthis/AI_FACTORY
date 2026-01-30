"use client";

import { useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

/**
 * Message input component with auto-resizing textarea
 * - Enter to send (Shift+Enter for newline)
 * - Disabled during loading
 * - Send button with icon
 */
export function MessageInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Focus textarea on mount and after loading completes
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Refocus textarea when loading completes (AI finished responding)
  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSubmit();
        // Keep focus on textarea after sending
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSubmit = () => {
    if (!isLoading && value.trim()) {
      onSubmit();
      // Keep focus on textarea after sending
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  return (
    <div className="border-t border-zinc-100 bg-white/40 backdrop-blur-xl p-6">
      <div className="max-w-4xl mx-auto">
        <div
          className={cn(
            "flex items-end gap-2 bg-white rounded-2xl p-2 transition-all duration-200 border border-zinc-200",
            "focus-within:ring-4 focus-within:ring-zinc-100 focus-within:border-zinc-300 shadow-sm"
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={isLoading}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent px-4 py-3",
              "text-[15px] placeholder:text-zinc-400 text-zinc-800",
              "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              "max-h-[200px] scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent"
            )}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !value.trim()}
            size="icon"
            className="flex-shrink-0 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4 text-white" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
