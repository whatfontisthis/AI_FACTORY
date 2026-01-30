"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/database";

interface ConversationListProps {
  currentSessionId: string;
  onSelectConversation: (sessionId: string) => void;
  onNewConversation: () => void;
  refreshTrigger?: number; // Increment to force refresh
}

export function ConversationList({
  currentSessionId,
  onSelectConversation,
  onNewConversation,
  refreshTrigger = 0,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch conversations on mount, when currentSessionId changes, or when refreshTrigger changes
  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch("/api/conversations");
        const data = await res.json();
        if (data.data) {
          setConversations(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, [currentSessionId, refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevent selecting the conversation
    
    if (!confirm("이 대화를 삭제하시겠습니까?")) return;
    
    setDeletingId(sessionId);
    try {
      const res = await fetch(`/api/conversations?session_id=${sessionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (data.success) {
        setConversations((prev) => 
          prev.filter((c) => c.session_id !== sessionId)
        );
        // If deleting current conversation, start a new one
        if (sessionId === currentSessionId) {
          onNewConversation();
        }
      } else {
        console.error("Failed to delete:", data.error);
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      alert("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-zinc-200 bg-white/50">
        <Button
          onClick={onNewConversation}
          className="w-full gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border-none rounded-xl transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="font-semibold">New Conversation</span>
        </Button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/30">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-white border border-zinc-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <MessageSquare className="w-10 h-10 mb-3 text-zinc-900" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">No History</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group flex items-center gap-1 rounded-xl transition-all duration-300 border ${
                currentSessionId === conversation.session_id
                  ? "bg-white text-zinc-900 shadow-lg border-zinc-300 scale-[1.02]"
                  : "bg-white/50 hover:bg-white text-zinc-600 hover:text-zinc-900 border-zinc-100 hover:border-zinc-200 hover:shadow-md"
              }`}
            >
              <button
                onClick={() => onSelectConversation(conversation.session_id)}
                className="flex-1 flex flex-col gap-1 px-4 py-3 text-left min-w-0"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    currentSessionId === conversation.session_id ? "bg-zinc-900" : "bg-zinc-300"
                  )} />
                  <span className="truncate font-bold text-sm tracking-tight">{conversation.title}</span>
                </div>
                <div className="flex items-center justify-between mt-1 px-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                    {new Date(conversation.updated_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-300 font-mono">
                    {new Date(conversation.updated_at).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </span>
                </div>
              </button>
              <button
                onClick={(e) => handleDelete(e, conversation.session_id)}
                disabled={deletingId === conversation.session_id}
                className={`p-3 mr-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                  currentSessionId === conversation.session_id
                    ? "hover:bg-zinc-100 text-zinc-900"
                    : "hover:bg-destructive/10 text-destructive"
                } disabled:opacity-50`}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-zinc-200 bg-zinc-50/80">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] text-center">
          v1.0.0 Stable
        </p>
      </div>
    </div>
  );
}
