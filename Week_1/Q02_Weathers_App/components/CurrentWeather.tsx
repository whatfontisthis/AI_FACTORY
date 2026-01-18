'use client';

import { useState, useEffect } from 'react';
import { weatherService, type ForecastData } from '@/services/weather';

interface CurrentWeatherProps {
  location?: string;
  coordinates?: { lat: number; lon: number };
}

export default function CurrentWeather({ location = 'Seoul', coordinates }: CurrentWeatherProps) {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data: ForecastData;
        if (coordinates) {
          data = await weatherService.getForecastByCoords(coordinates.lat, coordinates.lon, 1);
        } else {
          data = await weatherService.getForecast(location, 1);
        }
        
        setForecastData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '날씨 정보를 가져올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location, coordinates]);

  const getUVIndexLevel = (uv: number): string => {
    if (uv <= 2) return '낮음';
    if (uv <= 5) return '보통';
    if (uv <= 7) return '높음';
    if (uv <= 10) return '매우 높음';
    return '위험';
  };

  const getWeatherEmoji = (condition: string): string => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('맑') || lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
      return '☀️';
    } else if (lowerCondition.includes('구름') || lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
      return '☁️';
    } else if (lowerCondition.includes('비') || lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
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

  if (loading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="h-48 bg-slate-100 rounded-3xl mb-4"></div>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-50 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !forecastData) {
    return (
      <div className="mb-8 p-10 bg-rose-50 rounded-3xl border border-rose-100 text-center">
        <p className="text-rose-500 font-semibold">{error || '날씨 정보를 가져올 수 없습니다.'}</p>
      </div>
    );
  }

  const current = forecastData.current;
  const today = forecastData.forecast.forecastday[0];

  return (
    <section className="mb-8 scale-in">
      {/* Premium Weather Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl shadow-blue-200 mb-8">
        {/* Subtle Decorative Circle */}
        <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-60 h-60 bg-indigo-400/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase">
                현재
              </span>
              <h2 className="text-lg font-bold text-white/90">
                {forecastData.location.name}
              </h2>
            </div>
            
            <div className="flex items-center gap-8">
              <span className="text-[7rem] leading-none select-none drop-shadow-xl">
                {getWeatherEmoji(current.condition.text)}
              </span>
              <div>
                <div className="flex items-start">
                  <span className="text-8xl font-black tracking-tighter drop-shadow-lg">
                    {Math.round(current.temp_c)}
                  </span>
                  <span className="text-4xl font-light mt-4 opacity-80">°</span>
                </div>
                <p className="text-2xl font-bold text-white/90 mt-[-5px]">
                  {current.condition.text}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-row lg:flex-col gap-8 lg:gap-6 lg:text-right border-t lg:border-t-0 border-white/10 pt-8 lg:pt-0">
            <div className="flex-1 lg:flex-none">
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1">최고 / 최저</p>
              <p className="text-3xl font-bold">
                {Math.round(today.day.maxtemp_c)}° <span className="text-white/40 mx-1">/</span> {Math.round(today.day.mintemp_c)}°
              </p>
            </div>
            <div className="flex-1 lg:flex-none">
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1">체감온도</p>
              <p className="text-3xl font-bold">{Math.round(current.feelslike_c)}°</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Horizontal Scroll Info Strip */}
      <div className="group relative">
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
          {/* Card: Humidity */}
          <div className="flex-none w-36 bg-white border border-slate-100 rounded-3xl p-5 transition-all hover:shadow-xl hover:border-transparent hover:scale-[1.02]">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl mb-4">💧</div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">습도</p>
            <p className="text-2xl font-black text-slate-800">{current.humidity}%</p>
          </div>

          {/* Card: Wind */}
          <div className="flex-none w-36 bg-white border border-slate-100 rounded-3xl p-5 transition-all hover:shadow-xl hover:border-transparent hover:scale-[1.02]">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl mb-4">💨</div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">풍속</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black text-slate-800">{current.wind_kph.toFixed(0)}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase">km/h</span>
            </div>
          </div>

          {/* Card: UV */}
          <div className="flex-none w-36 bg-white border border-slate-100 rounded-3xl p-5 transition-all hover:shadow-xl hover:border-transparent hover:scale-[1.02]">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl mb-4">☀️</div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">자외선 지수</p>
            <p className="text-2xl font-black text-slate-800">{getUVIndexLevel(current.uv)}</p>
          </div>

          {/* Card: Rain */}
          <div className="flex-none w-36 bg-white border border-slate-100 rounded-3xl p-5 transition-all hover:shadow-xl hover:border-transparent hover:scale-[1.02]">
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-xl mb-4">🌧️</div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">강수확률</p>
            <p className="text-2xl font-black text-slate-800">{today.day.daily_chance_of_rain}%</p>
          </div>

          {/* Card: Sunrise */}
          <div className="flex-none w-36 bg-white border border-slate-100 rounded-3xl p-5 transition-all hover:shadow-xl hover:border-transparent hover:scale-[1.02]">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl mb-4">🌅</div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">일출</p>
            <p className="text-xl font-black text-slate-800">{today.astro.sunrise}</p>
          </div>

          {/* Card: Sunset */}
          <div className="flex-none w-36 bg-white border border-slate-100 rounded-3xl p-5 transition-all hover:shadow-xl hover:border-transparent hover:scale-[1.02]">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl mb-4">🌇</div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">일몰</p>
            <p className="text-xl font-black text-slate-800">{today.astro.sunset}</p>
          </div>

          {/* Card: Visibility */}
          <div className="flex-none w-36 bg-white border border-slate-100 rounded-3xl p-5 transition-all hover:shadow-xl hover:border-transparent hover:scale-[1.02]">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl mb-4">👁️</div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">가시거리</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black text-slate-800">{current.vis_km}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase">km</span>
            </div>
          </div>

          {/* Card: Pressure */}
          <div className="flex-none w-36 bg-white border border-slate-100 rounded-3xl p-5 transition-all hover:shadow-xl hover:border-transparent hover:scale-[1.02]">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl mb-4">🌡️</div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">기압</p>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-black text-slate-800">{current.pressure_mb}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase">hPa</span>
            </div>
          </div>
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
