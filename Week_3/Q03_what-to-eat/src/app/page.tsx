"use client";

import { useState, useEffect } from "react";
import { useWeather } from "@/hooks/useWeather";
import { WeatherCard } from "@/components/WeatherCard";
import { MoodSelector, MOOD_OPTIONS } from "@/components/MoodSelector";
import { RecommendButton } from "@/components/RecommendButton";
import { ResultCard, MenuItemCard } from "@/components/ResultCard";
import { InlineMath } from "react-katex";
import { MapPin, RefreshCw, Utensils, Info, X, Star } from "lucide-react";
import type { MoodTag, RecommendationResult } from "@/types";

const STORAGE_KEY = "lastSelectedMood";

export default function Home() {
  const { weather, loading: weatherLoading, error: weatherError } = useWeather();
  const [selectedMood, setSelectedMood] = useState<MoodTag | null>(null);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlgoInfo, setShowAlgoInfo] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as MoodTag | null;
      if (saved && MOOD_OPTIONS.some(opt => opt.value === saved)) {
        setSelectedMood(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (selectedMood) {
      try {
        localStorage.setItem(STORAGE_KEY, selectedMood);
      } catch {
        // ignore
      }
    }
  }, [selectedMood]);

  const handleRecommend = async () => {
    if (!selectedMood) return;
    setError(null);
    setLoading(true);
    setResult(null);
    
    const startTime = Date.now();
    const minLoadingTime = 1200; // 최소 1.2초 로딩
    
    try {
      const weatherParam = weather?.weather ?? "Clear";
      const moodParam = selectedMood;
      const res = await fetch(
        `/api/recommend?weather=${weatherParam}&mood=${moodParam}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "추천을 불러올 수 없어요");
      }
      const data: RecommendationResult = await res.json();
      
      // 최소 로딩 시간 보장
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "추천을 불러올 수 없어요");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setSelectedMood(null);
  };

  const selectedMoodLabel = MOOD_OPTIONS.find(m => m.value === selectedMood)?.label || "선택 안 함";

  return (
    <main className="min-h-screen bg-[#f8f9fc] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col min-h-[800px]">
        
        {/* 헤더 섹션 */}
        <header className="bg-indigo-600 p-8 pb-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-center text-3xl font-black mb-2 tracking-tight">
              오늘 뭐 먹지?
            </h1>
            <div className="flex items-center justify-center gap-2">
              <p className="text-indigo-100 text-sm font-bold opacity-90">
                날씨와 기분에 맞춘 오늘의 최적 메뉴
              </p>
              <button 
                onClick={() => setShowAlgoInfo(!showAlgoInfo)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-1.5 rounded-full transition-all group flex-shrink-0"
                title="알고리즘 설명"
              >
                <Info size={14} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>

          {showAlgoInfo && (
            <div 
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowAlgoInfo(false)}
            >
              <div 
                className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowAlgoInfo(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
                <h4 className="text-base font-black mb-5 tracking-widest text-slate-800 uppercase">Recommendation Algorithm</h4>
                <div className="bg-slate-50 p-6 rounded-xl text-left space-y-5 border border-slate-100">
                  <div className="text-sm leading-relaxed font-medium text-slate-700">
                    본 서비스는 기상 상태와 사용자의 심리 상태를 수치화하여 최적의 메뉴를 산출합니다.
                  </div>
                  <div className="py-4 px-5 bg-slate-100 rounded-lg text-center border border-slate-200">
                    <div className="text-black">
                      <InlineMath math="Score = (W \times 0.4) + (M \times 0.6)" />
                    </div>
                  </div>
                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <div className="font-black text-indigo-600 uppercase">Weather (W)</div>
                      <div className="text-slate-600">현재 기상 조건과의 일치 여부 (0 또는 1)</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-black text-indigo-600 uppercase">Mood (M)</div>
                      <div className="text-slate-600">선택한 기분 태그와의 일치 여부 (0 또는 1)</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 font-bold italic">
                    * 가중치: 기분 상태(60%) &gt; 날씨 상태(40%)
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl" />
        </header>

        {/* 날씨 정보 및 위치 카드 */}
        <div className="mx-6 -mt-6 relative z-20">
          <div className="bg-white rounded-[1.5rem] p-5 shadow-xl border border-slate-50">
            <WeatherCard
              weather={weather}
              loading={weatherLoading}
              error={weatherError}
            />
          </div>
        </div>

        {/* 메인 컨트롤 영역 */}
        <div className="flex-1 p-6 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="h-[1px] w-6 bg-slate-100" />
              <h2 className="text-center font-black text-slate-300 text-[9px] tracking-[0.3em] uppercase">현재 나의 기분</h2>
              <div className="h-[1px] w-6 bg-slate-100" />
            </div>
            
            <MoodSelector selectedMood={selectedMood} onMoodSelect={(mood) => { setSelectedMood(mood); setResult(null); }} />
          </section>

          <section className="space-y-3">
            <RecommendButton
              onClick={handleRecommend}
              loading={loading}
              disabled={!selectedMood}
            />
            
            {error && (
              <p className="text-center text-[10px] font-bold text-red-500 animate-pulse">
                ⚠️ {error}
              </p>
            )}
          </section>
        </div>

        {/* 추천 결과 영역 */}
        <div className="px-6 pb-10 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400" size={16} />
              <h3 className="font-black text-slate-800 text-base tracking-tight">당신을 위한 추천 메뉴</h3>
            </div>
            {result && !loading && (
              <button 
                onClick={reset}
                className="text-slate-300 hover:text-indigo-600 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 flex items-center justify-center min-h-[200px] bg-indigo-50/30">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="text-center space-y-1">
                  <div className="text-indigo-600 text-sm font-black">알고리즘 계산 중...</div>
                  <div className="text-slate-400 text-xs font-medium">날씨와 기분을 분석하여 최적의 메뉴를 찾고 있습니다</div>
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="grid grid-cols-3 gap-3">
              {result.items.map((item, idx) => (
                <MenuItemCard key={item.menu.id + idx} item={item} idx={idx} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px]">
              <div className="text-center space-y-2">
                <div className="text-slate-300 text-sm font-black">위에서 기분을 선택하고 추천받기를 눌러주세요</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-8 text-center text-slate-400 text-[10px] font-bold tracking-widest leading-relaxed opacity-60">
        POWERED BY INTELLIGENT MATCHING ALGORITHM<br/>
        © 2026 LUNCHMOOD APP. ALL RIGHTS RESERVED.
      </footer>
    </main>
  );
}
