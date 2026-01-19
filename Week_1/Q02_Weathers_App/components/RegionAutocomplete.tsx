'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface Region {
  id: number;
  name: string;
  fullName: string;
  latitude: number;
  longitude: number;
}

interface ApiRegion {
  id: number;
  name_ko: string;
  name_en: string;
  province: string;
  province_en: string;
  latitude: number;
  longitude: number;
  region_type: string;
  population: number | null;
  area_sqkm: number | null;
  display_name: string;
}

interface RegionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (region: Region) => void;
  placeholder?: string;
}

export default function RegionAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "지역 검색..."
}: RegionAutocompleteProps) {
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchRegions = useCallback(async (query: string) => {
    if (query.length === 0) {
      setFilteredRegions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/regions/search?q=${encodeURIComponent(query)}&limit=8`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();

      if (data.success && data.data) {
        const regions: Region[] = data.data.map((r: ApiRegion) => ({
          id: r.id,
          name: r.name_ko,
          fullName: r.display_name,
          latitude: r.latitude,
          longitude: r.longitude,
        }));
        setFilteredRegions(regions);
        setIsOpen(regions.length > 0);
        setHighlightedIndex(-1);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Region search error:', error);
        setFilteredRegions([]);
        setIsOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchRegions(value);
    }, 200);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [value, searchRegions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredRegions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredRegions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const selectedRegion = filteredRegions[highlightedIndex];
          onSelect(selectedRegion);
          onChange(selectedRegion.name);
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInputFocus = () => {
    if (value.length > 0) {
      setIsOpen(filteredRegions.length > 0);
    }
  };

  const handleRegionClick = (region: Region) => {
    onSelect(region);
    onChange(region.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-4 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:border-blue-500 focus:shadow-xl focus:shadow-blue-50 transition-all placeholder-slate-400"
        autoComplete="off"
      />
      
      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {filteredRegions.map((region, index) => (
            <li
              key={region.id}
              onClick={() => handleRegionClick(region)}
              className={`px-5 py-3.5 cursor-pointer flex flex-col gap-0.5 border-b border-slate-50 last:border-b-0 transition-colors ${
                highlightedIndex === index ? 'bg-blue-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-bold text-slate-800">
                {region.name}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                {region.fullName}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
