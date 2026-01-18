'use client';

import { useState, useEffect } from 'react';
import { weatherService, type ForecastData } from '@/services/weather';

interface WeeklyForecastProps {
  location?: string;
  coordinates?: { lat: number; lon: number };
}

const getDayOfWeek = (dateStr: string, index: number): string => {
  if (index === 0) return '오늘';
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
};

const getWeatherIcon = (condition: string): string => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('맑') || lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
    return '☀️';
  } else if (lowerCondition.includes('구름') || lowerCondition.includes('cloud')) {
    return '☁️';
  } else if (lowerCondition.includes('비') || lowerCondition.includes('rain')) {
    return '🌧️';
  } else if (lowerCondition.includes('눈') || lowerCondition.includes('snow')) {
    return '❄️';
  } else if (lowerCondition.includes('천둥') || lowerCondition.includes('thunder')) {
    return '⛈️';
  } else if (lowerCondition.includes('안개') || lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
    return '🌫️';
  }
  return '🌤️';
};

export default function WeeklyForecast({ location = 'Seoul', coordinates }: WeeklyForecastProps) {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data: ForecastData;
        if (coordinates) {
          data = await weatherService.getForecastByCoords(coordinates.lat, coordinates.lon, 7);
        } else {
          data = await weatherService.getForecast(location, 7);
        }
        
        setForecastData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '날씨 예보를 가져올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [location, coordinates]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-32 bg-slate-100 rounded mb-6"></div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-40 w-28 bg-slate-50 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !forecastData) {
    return null;
  }

  const avgMaxTemp = Math.round(forecastData.forecast.forecastday.reduce((acc, day) => acc + day.day.maxtemp_c, 0) / forecastData.forecast.forecastday.length);
  const avgHumidity = Math.round(forecastData.forecast.forecastday.reduce((acc, day) => acc + day.day.avghumidity, 0) / forecastData.forecast.forecastday.length);

  return (
    <section className="scale-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">주간 예보</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">평균 최고 {avgMaxTemp}°</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">평균 습도 {avgHumidity}%</span>
          </div>
        </div>
      </div>
      
      {/* Scrollable List */}
      <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
        {forecastData.forecast.forecastday.map((day, index) => (
          <div
            key={index}
            className={`flex-none w-32 rounded-[2rem] p-5 text-center transition-all hover:scale-[1.05] group cursor-default ${
              index === 0 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                : 'bg-white border border-slate-100 text-slate-800 hover:border-transparent hover:shadow-xl'
            }`}
          >
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${index === 0 ? 'text-white/50' : 'text-slate-400'}`}>
              {getDayOfWeek(day.date, index)}
            </p>
            <span className="text-4xl block mb-4 drop-shadow-md group-hover:scale-110 transition-transform">
              {getWeatherIcon(day.day.condition.text)}
            </span>
            <div className="space-y-0.5">
              <p className="text-2xl font-black tracking-tighter">
                {Math.round(day.day.maxtemp_c)}°
              </p>
              <p className={`text-sm font-medium ${index === 0 ? 'text-white/40' : 'text-slate-300'}`}>
                {Math.round(day.day.mintemp_c)}°
              </p>
            </div>
            
            {day.day.daily_chance_of_rain > 0 && (
              <div className={`mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tighter ${
                index === 0 ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-500'
              }`}>
                💧 {day.day.daily_chance_of_rain}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Probability Summary Bar */}
      <div className="mt-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">강수 추세</h3>
          <p className="text-xs font-medium text-slate-400">향후 7일간 강수 확률</p>
        </div>
        <div className="flex items-end gap-2 h-12 flex-1 max-w-md">
          {forecastData.forecast.forecastday.map((day, index) => (
            <div key={index} className="flex-1 group relative">
              <div 
                className="w-full bg-blue-500 rounded-lg transition-all hover:bg-blue-600 cursor-help"
                style={{ 
                  height: `${Math.max(day.day.daily_chance_of_rain * 0.8, 8)}px`,
                  opacity: Math.max(0.2, day.day.daily_chance_of_rain / 100)
                }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                {day.day.daily_chance_of_rain}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
