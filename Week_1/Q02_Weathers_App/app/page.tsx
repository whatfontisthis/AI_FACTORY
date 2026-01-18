'use client';

import Sidebar from '@/components/Sidebar';
import CurrentWeather from '@/components/CurrentWeather';
import WeeklyForecast from '@/components/WeeklyForecast';
import { useLocation } from '@/contexts/LocationContext';

export default function Home() {
  const { selectedLocation, selectedCoordinates } = useLocation();

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Left Sidebar - Refined glass-like border */}
      <Sidebar />
      
      {/* Main Content - Soft background for contrast */}
      <main className="flex-1 overflow-y-auto bg-[#FDFDFF] lg:bg-slate-50/30">
        <div className="p-6 lg:p-12 max-w-6xl mx-auto">
          {/* Main Weather Card & Details */}
          <CurrentWeather 
            location={selectedLocation || undefined} 
            coordinates={selectedCoordinates || undefined} 
          />
          
          {/* Weekly Forecast & Trends */}
          <WeeklyForecast 
            location={selectedLocation || undefined} 
            coordinates={selectedCoordinates || undefined} 
          />
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        .scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
