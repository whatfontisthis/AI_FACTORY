'use client';

import { useState } from 'react';
import TaxCalculatorForm from './components/TaxCalculatorForm';
import TaxResultDisplay, { TaxCalculationResult } from './components/TaxResultDisplay';

export default function Home() {
  const [result, setResult] = useState<TaxCalculationResult | null>(null);

  const handleCalculate = (calculatedResult: TaxCalculationResult) => {
    setResult(calculatedResult);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="w-full max-w-[1100px] mx-auto px-6 pt-6 pb-12">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Left: Input Form */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="mb-5 text-left">
              <h1 className="text-[32px] font-bold text-[#111111] mb-1 leading-[1.5]">
                세금 계산기
              </h1>
              <p className="text-[16px] text-[#666666] leading-[1.5]">
                연봉을 입력하면 예상 세금과 실수령액을 계산합니다
              </p>
            </div>
            <TaxCalculatorForm onCalculate={handleCalculate} />
          </div>

          {/* Right: Results */}
          <div>
            <TaxResultDisplay result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
