"use client";

import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  className?: string;
}

/**
 * Loading indicator component that displays typing animation
 * Shows 3 bouncing dots with "AI가 답변을 작성 중입니다..." text
 */
export function LoadingIndicator({ className }: LoadingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4",
        className
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
        <svg
          className="w-5 h-5 text-secondary-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.573.097a9.042 9.042 0 01-3.124 0l-.573-.097c-1.717-.293-2.3-2.379-1.067-3.61L16 15.3"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-tl-none px-4 py-3">
          <div className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full bg-current animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-current animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-current animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          AI가 답변을 작성 중입니다...
        </span>
      </div>
    </div>
  );
}
