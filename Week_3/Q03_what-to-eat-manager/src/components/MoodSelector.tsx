"use client";

import { Smile, Meh, Frown } from "lucide-react";
import type { MoodTag } from "@/types";

export const MOOD_OPTIONS: { value: MoodTag; icon: React.ReactNode; label: string; color: string }[] = [
  { 
    value: "happy", 
    icon: <Smile className="w-8 h-8" />, 
    label: "기쁨", 
    color: "bg-yellow-50 text-yellow-600 border-yellow-200" 
  },
  { 
    value: "normal", 
    icon: <Meh className="w-8 h-8" />, 
    label: "보통", 
    color: "bg-slate-50 text-slate-600 border-slate-200" 
  },
  { 
    value: "stress", 
    icon: <Frown className="w-8 h-8" />, 
    label: "스트레스", 
    color: "bg-red-50 text-red-600 border-red-200" 
  },
];

export interface MoodSelectorProps {
  selectedMood: MoodTag | null;
  onMoodSelect: (mood: MoodTag) => void;
}

export function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {MOOD_OPTIONS.map((item) => {
        const isSelected = selectedMood === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onMoodSelect(item.value)}
            className={`flex flex-col items-center gap-3 p-5 rounded-[1.5rem] border-2 transition-all duration-500 group ${
              isSelected
                ? `${item.color} scale-105 shadow-xl shadow-current/5 border-current ring-4 ring-current/5`
                : "bg-white text-slate-300 border-slate-100 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-400"
            }`}
          >
            <div className={`transition-transform duration-500 ${isSelected ? "animate-bounce" : "group-hover:scale-110"}`}>
              {item.icon}
            </div>
            <span className={`text-xs font-black tracking-widest ${isSelected ? "" : "text-slate-400"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
