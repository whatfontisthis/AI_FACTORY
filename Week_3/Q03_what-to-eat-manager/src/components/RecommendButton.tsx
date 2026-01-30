"use client";

import { Utensils, RefreshCw } from "lucide-react";

export interface RecommendButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

export function RecommendButton({
  onClick,
  loading,
  disabled,
}: RecommendButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-6 rounded-[1.5rem] font-black text-white shadow-2xl flex items-center justify-center gap-3 transition-all duration-500 active:scale-[0.98] ${
        !disabled && !loading 
          ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200" 
          : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
      }`}
    >
      {loading ? (
        <RefreshCw className="animate-spin" size={24} />
      ) : (
        <Utensils size={24} />
      )}
      <span className="text-lg tracking-tight">
        {loading ? "메뉴를 분석하고 있어요..." : "최적의 메뉴 3가지 추천받기"}
      </span>
    </button>
  );
}
