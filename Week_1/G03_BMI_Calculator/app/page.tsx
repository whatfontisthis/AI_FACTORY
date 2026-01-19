'use client';

import { useState, useEffect, useCallback } from 'react';
import { calculateBMI, BMICategory } from '@/lib/bmi';

export default function Home() {
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('65');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  // BMI 계산 함수 (클라이언트에서 직접 계산)
  const calculateBMIValue = useCallback((heightValue: string, weightValue: string, immediate: boolean = false) => {
    setError('');

    const heightNum = parseFloat(heightValue);
    const weightNum = parseFloat(weightValue);

    if (!heightValue || !weightValue || isNaN(heightNum) || isNaN(weightNum)) {
      setBmi(null);
      setCategory('');
      return;
    }

    if (heightNum <= 0 || weightNum <= 0) {
      setError('키와 몸무게는 0보다 큰 값이어야 합니다.');
      setBmi(null);
      setCategory('');
      return;
    }

    try {
      // 클라이언트에서 직접 BMI 계산 (더 빠른 반응)
      const result = calculateBMI(heightNum, weightNum);
      setBmi(result.bmi);
      setCategory(result.category);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'BMI 계산 중 오류가 발생했습니다.';
      setError(errorMessage);
      setBmi(null);
      setCategory('');
    }
  }, []);

  // 초기 로드 시 BMI 계산
  useEffect(() => {
    calculateBMIValue(height, weight, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 숫자 입력 필드 변경 시 디바운싱 적용 (타이핑 중 불필요한 계산 방지)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateBMIValue(height, weight);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [height, weight, calculateBMIValue]);

  // 슬라이더 변경 핸들러 (즉시 계산)
  const handleSliderChange = useCallback((type: 'height' | 'weight', value: string) => {
    if (type === 'height') {
      setHeight(value);
    } else {
      setWeight(value);
    }
    // 슬라이더는 즉시 계산
    const newHeight = type === 'height' ? value : height;
    const newWeight = type === 'weight' ? value : weight;
    calculateBMIValue(newHeight, newWeight, true);
  }, [height, weight, calculateBMIValue]);

  const resetForm = () => {
    setHeight('170');
    setWeight('65');
    setError('');
    // 초기화 후 BMI 재계산
    setTimeout(() => {
      calculateBMIValue('170', '65', true);
    }, 0);
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName) {
      case '저체중': return 'text-blue-600 bg-blue-50 border-blue-100';
      case '정상': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case '과체중': return 'text-orange-600 bg-orange-50 border-orange-100';
      case '비만': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const getCategoryImage = (categoryName: string) => {
    switch (categoryName) {
      case '저체중': return '/01_thin.jpeg';
      case '정상': return '/02_normal.jpeg';
      case '과체중': return '/03_fat.jpeg';
      case '비만': return '/04_obese.jpeg';
      default: return '/02_normal.jpeg';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-4xl space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            BMI 측정기
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            당신의 건강 상태를 확인하는 가장 쉬운 방법. <br className="hidden sm:block" />
            키와 몸무게만 입력하면 즉시 결과를 확인할 수 있습니다.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Input Section */}
          <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10 flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] min-h-[600px]">
            <div className="flex-1 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">정보 입력</h2>
                <button
                  onClick={resetForm}
                  className="text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors"
                >
                  초기화
                </button>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm animate-fade-in font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-10">
                {/* Height Input & Scale */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end ml-1">
                    <label htmlFor="height" className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                      키 (cm)
                    </label>
                    <span className="text-2xl font-black text-blue-600">{height || '0'} <span className="text-sm text-slate-400 font-bold">cm</span></span>
                  </div>
                  <div className="space-y-6">
                    <input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="예: 172"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-xl text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-500 transition-all outline-none"
                    />
                    <input
                      type="range"
                      min="100"
                      max="220"
                      step="0.1"
                      value={height || '170'}
                      onChange={(e) => handleSliderChange('height', e.target.value)}
                      onInput={(e) => handleSliderChange('height', (e.target as HTMLInputElement).value)}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between px-1">
                      <span className="text-[10px] font-bold text-slate-300">100cm</span>
                      <span className="text-[10px] font-bold text-slate-300">220cm</span>
                    </div>
                  </div>
                </div>

                {/* Weight Input & Scale */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end ml-1">
                    <label htmlFor="weight" className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                      몸무게 (kg)
                    </label>
                    <span className="text-2xl font-black text-indigo-600">{weight || '0'} <span className="text-sm text-slate-400 font-bold">kg</span></span>
                  </div>
                  <div className="space-y-6">
                    <input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="예: 68"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-xl text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-500 transition-all outline-none"
                    />
                    <input
                      type="range"
                      min="30"
                      max="150"
                      step="0.1"
                      value={weight || '65'}
                      onChange={(e) => handleSliderChange('weight', e.target.value)}
                      onInput={(e) => handleSliderChange('weight', (e.target as HTMLInputElement).value)}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between px-1">
                      <span className="text-[10px] font-bold text-slate-300">30kg</span>
                      <span className="text-[10px] font-bold text-slate-300">150kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-50">
              <p className="text-xs text-slate-400 leading-relaxed text-center font-medium">
                입력하신 데이터는 로컬에서 처리되며 서버에 저장되지 않습니다.
              </p>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10 flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] min-h-[600px]">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">측정 결과</h2>

            <div className="flex-1 flex flex-col justify-center">
              {bmi !== null ? (
                <div className="space-y-10 animate-fade-in w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-8">
                    <div className="space-y-6 text-center sm:text-left">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">나의 BMI 지수</p>
                        <div className="text-7xl font-black text-slate-900 tracking-tighter">
                          {bmi.toFixed(1)}
                        </div>
                      </div>
                      
                      <div className={`inline-flex items-center px-6 py-2.5 rounded-full border-2 text-base font-black ${getCategoryColor(category)}`}>
                        {category}
                      </div>
                    </div>

                    <div className="relative group shrink-0">
                      <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
                      <img
                        src={getCategoryImage(category)}
                        alt={category}
                        className="relative w-36 h-48 object-cover rounded-3xl shadow-2xl ring-4 ring-white"
                      />
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">BMI 카테고리 기준</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                        <span className="text-xs font-bold text-blue-600 mb-1">저체중</span>
                        <span className="text-sm font-black text-blue-900">18.5 미만</span>
                      </div>
                      <div className="flex flex-col p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                        <span className="text-xs font-bold text-emerald-600 mb-1">정상</span>
                        <span className="text-sm font-black text-emerald-900">18.5 ~ 22.9</span>
                      </div>
                      <div className="flex flex-col p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50">
                        <span className="text-xs font-bold text-orange-600 mb-1">과체중</span>
                        <span className="text-sm font-black text-orange-900">23 ~ 24.9</span>
                      </div>
                      <div className="flex flex-col p-4 rounded-2xl bg-rose-50/50 border border-rose-100/50">
                        <span className="text-xs font-bold text-rose-600 mb-1">비만</span>
                        <span className="text-sm font-black text-rose-900">25 이상</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300 space-y-6 animate-pulse">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center shadow-inner">
                    <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-slate-400">데이터를 입력해주세요</p>
                    <p className="text-sm text-slate-300 font-medium">좌측에서 키와 몸무게를 조절해보세요</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
