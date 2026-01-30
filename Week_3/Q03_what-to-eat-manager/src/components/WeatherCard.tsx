"use client";

import { Sun, Cloud, CloudRain, Snowflake, MapPin } from "lucide-react";
import type { WeatherData } from "@/types";

const WEATHER_KO: Record<string, string> = {
  Clear: "맑음",
  Clouds: "흐림",
  Rain: "비",
  Snow: "눈",
  Thunderstorm: "천둥번개",
  Drizzle: "이슬비",
  Mist: "안개",
};

export interface WeatherCardProps {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
}

function getTempDescription(temp: number): string {
  if (temp < 0) return "매우 추움";
  if (temp < 10) return "추움";
  if (temp < 18) return "쌀쌀함";
  if (temp < 24) return "선선함";
  if (temp < 30) return "따뜻함";
  return "더움";
}

export function WeatherCard({ weather, loading, error }: WeatherCardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-8 w-32 bg-slate-100 animate-pulse rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-2 text-red-500 text-xs font-bold">
        날씨 정보를 불러오지 못었습니다.
      </div>
    );
  }

  if (!weather) return null;

  const label = WEATHER_KO[weather.weather] ?? weather.weather;
  const tempDesc = getTempDescription(weather.temp);

  return (
    <div className="flex flex-col space-y-4">
      {/* Location inside card */}
      <div className="flex items-center gap-1.5 text-slate-400">
        <MapPin size={12} className="text-indigo-500" />
        <span className="text-[10px] font-black tracking-widest uppercase">{weather.location || "위치 분석 중..."}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-2xl shadow-inner border border-amber-100/50">
            {weather.weather === 'Clear' ? <Sun className="w-10 h-10 text-amber-500" /> :
             weather.weather === 'Clouds' ? <Cloud className="w-10 h-10 text-slate-400" /> :
             weather.weather === 'Rain' ? <CloudRain className="w-10 h-10 text-blue-500" /> :
             weather.weather === 'Snow' ? <Snowflake className="w-10 h-10 text-sky-300" /> :
             <Sun className="w-10 h-10 text-amber-500" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-black text-slate-800">{label}</span>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-full uppercase tracking-tighter">{tempDesc}</span>
            </div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">현재 날씨 상태</div>
          </div>
        </div>
        
        <div className="text-right border-l border-slate-100 pl-6 py-1">
          <div className="flex items-start justify-end">
            <span className="text-4xl font-black text-indigo-600 tracking-tighter">{Math.round(weather.temp)}</span>
            <span className="text-xl font-black text-indigo-400 mt-1">°</span>
          </div>
          <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Celsius</div>
        </div>
      </div>
    </div>
  );
}
