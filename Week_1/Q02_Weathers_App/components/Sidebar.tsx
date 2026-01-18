'use client';

import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLocation } from '@/contexts/LocationContext';
import RegionAutocomplete from './RegionAutocomplete';

export default function Sidebar() {
  const [searchValue, setSearchValue] = useState('');
  const { location, error, isLoading, getCurrentLocation } = useGeolocation();
  const { setLocation, setCoordinates, selectedLocation, selectedCoordinates } = useLocation();

  const handleRegionSelect = (region: any) => {
    setLocation(region.fullName);
    setSearchValue('');
  };

  useEffect(() => {
    if (location) {
      setCoordinates({ lat: location.latitude, lon: location.longitude });
    }
  }, [location, setCoordinates]);

  const popularRegions = [
    { name: '서울', fullName: '서울특별시' },
    { name: '부산', fullName: '부산광역시' },
    { name: '제주', fullName: '제주특별자치도' },
    { name: '강릉', fullName: '강원도 강릉시' },
    { name: '대구', fullName: '대구광역시' },
    { name: '인천', fullName: '인천광역시' },
  ];

  // IP 기반 위치에서 도시명이 있으면 표시
  const currentDisplay = selectedLocation || 
    (location?.city ? location.city : 
    (selectedCoordinates ? `${selectedCoordinates.lat.toFixed(2)}, ${selectedCoordinates.lon.toFixed(2)}` : '서울'));

  return (
    <aside className="w-full lg:w-80 lg:min-w-80 bg-white lg:h-screen p-8 lg:border-r border-slate-100 lg:overflow-y-auto flex flex-col">
      {/* Logo Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-xl">🌤️</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            날씨
          </h1>
        </div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest ml-13">
          실시간 업데이트
        </p>
      </div>

      {/* Current Location Badge */}
      <div className="mb-8 group">
        <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">현재 위치</p>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all group-hover:bg-white group-hover:shadow-md group-hover:border-transparent">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-base font-semibold text-slate-700 truncate">{currentDisplay}</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">지역 검색</p>
        <div className="relative">
          <RegionAutocomplete
            value={searchValue}
            onChange={setSearchValue}
            onSelect={handleRegionSelect}
            placeholder="도시 검색..."
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={getCurrentLocation}
        disabled={isLoading}
        className="w-full px-6 py-4 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {isLoading ? '위치 확인 중...' : '현재 위치'}
      </button>

      {error && (
        <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-semibold text-amber-700 mb-2">📍 위치 서비스 사용 불가</p>
          <p className="text-xs font-medium text-amber-600 mb-2">{error.message}</p>
          {error.code === 2 && (
            <div className="text-xs text-amber-600 space-y-1">
              <p>• macOS 시스템 설정에서 위치 서비스를 확인해주세요</p>
              <p>• 또는 아래에서 지역을 직접 선택해주세요</p>
            </div>
          )}
          {error.code !== 2 && (
            <p className="text-xs text-amber-500 mt-2">아래에서 지역을 선택해주세요.</p>
          )}
        </div>
      )}

      {/* Quick Picks */}
      <div className="mt-10">
        <h3 className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-wider">빠른 선택</h3>
        <div className="grid grid-cols-3 gap-2">
          {popularRegions.map((region) => (
            <button
              key={region.name}
              onClick={() => setLocation(region.fullName)}
              className="px-2 py-2.5 text-xs font-bold bg-white border border-slate-100 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all hover:shadow-sm active:scale-95"
            >
              {region.name}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8">
        {/* Data Source Info */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            데이터 제공: <span className="text-slate-600 font-bold">Open-Meteo</span>
            <br />
            <span className="text-[9px] text-slate-400">실시간 날씨 및 예보 데이터 (API 키 불필요)</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
