'use client';

import { useState, useEffect, useRef } from 'react';

interface Region {
  id: string;
  name: string;
  fullName: string;
}

const koreanRegions: Region[] = [
  // 서울
  { id: 'seoul', name: '서울', fullName: '서울특별시' },
  { id: 'jongno', name: '종로구', fullName: '서울특별시 종로구' },
  { id: 'jongno-gyeongbok', name: '경복궁', fullName: '서울특별시 종로구 경복궁' },
  { id: 'gwanghwamun', name: '광화문', fullName: '서울특별시 종로구 광화문' },
  { id: 'gangnam', name: '강남구', fullName: '서울특별시 강남구' },
  { id: 'gangnam-station', name: '강남역', fullName: '서울특별시 강남구 강남역' },
  { id: 'myeongdong', name: '명동', fullName: '서울특별시 중구 명동' },
  { id: 'hongdae', name: '홍대', fullName: '서울특별시 마포구 홍대' },
  { id: 'itaewon', name: '이태원', fullName: '서울특별시 용산구 이태원' },
  { id: 'dongdaemun', name: '동대문', fullName: '서울특별시 중구 동대문' },
  
  // 부산
  { id: 'busan', name: '부산', fullName: '부산광역시' },
  { id: 'haeundae', name: '해운대구', fullName: '부산광역시 해운대구' },
  { id: 'haeundae-beach', name: '해운대해수욕장', fullName: '부산광역시 해운대구 해운대해수욕장' },
  { id: 'gwangalli', name: '광안리', fullName: '부산광역시 수영구 광안리' },
  { id: 'nampo', name: '남포동', fullName: '부산광역시 중구 남포동' },
  
  // 대구
  { id: 'daegu', name: '대구', fullName: '대구광역시' },
  { id: 'seomun', name: '서문시장', fullName: '대구광역시 중구 서문시장' },
  
  // 인천
  { id: 'incheon', name: '인천', fullName: '인천광역시' },
  { id: 'songdo', name: '송도', fullName: '인천광역시 연수구 송도' },
  
  // 광주
  { id: 'gwangju', name: '광주', fullName: '광주광역시' },
  
  // 대전
  { id: 'daejeon', name: '대전', fullName: '대전광역시' },
  
  // 울산
  { id: 'ulsan', name: '울산', fullName: '울산광역시' },
  
  // 세종
  { id: 'sejong', name: '세종', fullName: '세종특별자치시' },
  
  // 경기도
  { id: 'gyeonggi', name: '경기도', fullName: '경기도' },
  { id: 'suwon', name: '수원시', fullName: '경기도 수원시' },
  { id: 'seongnam', name: '성남시', fullName: '경기도 성남시' },
  { id: 'bundang', name: '분당구', fullName: '경기도 성남시 분당구' },
  { id: 'pangyo', name: '판교', fullName: '경기도 성남시 분당구 판교' },
  { id: 'anyang', name: '안양시', fullName: '경기도 안양시' },
  { id: 'bucheon', name: '부천시', fullName: '경기도 부천시' },
  { id: 'gwangmyeong', name: '광명시', fullName: '경기도 광명시' },
  { id: 'pyeongtaek', name: '평택시', fullName: '경기도 평택시' },
  { id: 'uijeongbu', name: '의정부시', fullName: '경기도 의정부시' },
  { id: 'dongducheon', name: '동두천시', fullName: '경기도 동두천시' },
  { id: 'ansan', name: '안산시', fullName: '경기도 안산시' },
  { id: 'goyang', name: '고양시', fullName: '경기도 고양시' },
  { id: 'ilsan', name: '일산구', fullName: '경기도 고양시 일산구' },
  
  // 강원도
  { id: 'gangwon', name: '강원도', fullName: '강원도' },
  { id: 'chuncheon', name: '춘천시', fullName: '강원도 춘천시' },
  { id: 'gangneung', name: '강릉시', fullName: '강원도 강릉시' },
  { id: ' Sokcho', name: '속초시', fullName: '강원도 속초시' },
  { id: 'pyeongchang', name: '평창군', fullName: '강원도 평창군' },
  
  // 충청북도
  { id: 'chungbuk', name: '충청북도', fullName: '충청북도' },
  { id: 'cheongju', name: '청주시', fullName: '충청북도 청주시' },
  
  // 충청남도
  { id: 'chungnam', name: '충청남도', fullName: '충청남도' },
  { id: 'cheonan', name: '천안시', fullName: '충청남도 천안시' },
  
  // 전라북도
  { id: 'jeonbuk', name: '전라북도', fullName: '전라북도' },
  { id: 'jeonju', name: '전주시', fullName: '전라북도 전주시' },
  
  // 전라남도
  { id: 'jeonnam', name: '전라남도', fullName: '전라남도' },
  { id: 'mokpo', name: '목포시', fullName: '전라남도 목포시' },
  { id: 'yeosu', name: '여수시', fullName: '전라남도 여수시' },
  
  // 경상북도
  { id: 'gyeongbuk', name: '경상북도', fullName: '경상북도' },
  { id: 'pohang', name: '포항시', fullName: '경상북도 포항시' },
  { id: 'gyeongju', name: '경주시', fullName: '경상북도 경주시' },
  
  // 경상남도
  { id: 'gyeongnam', name: '경상남도', fullName: '경상남도' },
  { id: 'changwon', name: '창원시', fullName: '경상남도 창원시' },
  { id: 'jinju', name: '진주시', fullName: '경상남도 진주시' },
  
  // 제주도
  { id: 'jeju', name: '제주도', fullName: '제주특별자치도' },
  { id: 'jeju-city', name: '제주시', fullName: '제주특별자치도 제주시' },
  { id: 'seogwipo', name: '서귀포시', fullName: '제주특별자치도 서귀포시' },
  { id: 'hallasan', name: '한라산', fullName: '제주특별자치도 한라산' },
];

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
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (value.length > 0) {
      const filtered = koreanRegions.filter(region => 
        region.name.toLowerCase().includes(value.toLowerCase()) ||
        region.fullName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRegions(filtered.slice(0, 8));
      setIsOpen(filtered.length > 0);
      setHighlightedIndex(-1);
    } else {
      setFilteredRegions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [value]);

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
