"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, RefreshCw } from "lucide-react";
import type { RecommendationResult } from "@/types";

export interface ResultCardProps {
  result: RecommendationResult | null;
  onRetry: () => void;
}

function getCategoryFlagUrl(category: string): string {
  const flagMap: Record<string, string> = {
    "한식": "https://flagcdn.com/w20/kr.png",
    "중식": "https://flagcdn.com/w20/cn.png",
    "일식": "https://flagcdn.com/w20/jp.png",
    "양식": "https://flagcdn.com/w20/eu.png",
    "분식": "https://flagcdn.com/w20/kr.png",
  };
  return flagMap[category] || "";
}

export function MenuItemCard({ item, idx }: { item: RecommendationResult["items"][0], idx: number }) {
  const [imgError, setImgError] = useState(false);
  const { menu, score, weather_match, mood_match } = item;

  const handleCardClick = () => {
    const searchUrl = `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(menu.name)}&channel=user`;
    window.open(searchUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div 
      onClick={handleCardClick}
      className="flex flex-col bg-white border border-indigo-50 rounded-[1.5rem] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group overflow-hidden border-t-4 border-t-indigo-500 cursor-pointer active:scale-95"
    >
      <div className="p-4 flex flex-col items-center text-center space-y-3 flex-1">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-indigo-600 font-black text-sm">{idx + 1}.</span>
            <span className="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">{menu.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="relative w-5 h-3 rounded overflow-hidden border border-slate-200 shadow-sm">
              <Image
                src={getCategoryFlagUrl(menu.category)}
                alt={menu.category}
                fill
                className="object-cover"
                sizes="20px"
                unoptimized
              />
            </div>
            <span className="text-[9px] font-medium text-slate-500">매칭률 {(score * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="w-full flex justify-center pt-1">
          <span className="whitespace-nowrap inline-block px-4 text-[9px] font-black text-slate-800 bg-amber-400 py-1.5 rounded-full opacity-90 group-hover:opacity-100 group-hover:bg-amber-500 transition-all shadow-md">
            최저가 구매하기 ›
          </span>
        </div>
      </div>
      
      <div className="relative h-28 w-full overflow-hidden bg-slate-50 border-t border-slate-50">
        {!imgError ? (
          <Image
            src={menu.image_url}
            alt={menu.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, 300px"
            unoptimized={menu.image_url.startsWith("/")}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-200 text-[8px] font-black">
            NO IMAGE
          </div>
        )}
      </div>
    </div>
  );
}

export function ResultCard({ result, onRetry }: ResultCardProps) {
  if (!result) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Star className="text-amber-400 fill-amber-400" size={16} />
          <h3 className="font-black text-slate-800 text-base tracking-tight">당신을 위한 추천 메뉴</h3>
        </div>
        <button 
          onClick={onRetry}
          className="text-slate-300 hover:text-indigo-600 transition-colors"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {result.items.map((item, idx) => (
          <MenuItemCard key={item.menu.id + idx} item={item} idx={idx} />
        ))}
      </div>
    </section>
  );
}
