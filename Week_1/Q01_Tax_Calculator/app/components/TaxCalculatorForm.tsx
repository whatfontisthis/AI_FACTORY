'use client';

import { useState } from 'react';
import { TaxCalculationResult } from './TaxResultDisplay';

interface TaxCalculatorFormProps {
  onCalculate: (result: TaxCalculationResult) => void;
}

export default function TaxCalculatorForm({ onCalculate }: TaxCalculatorFormProps) {
  const [salary, setSalary] = useState('');

  const calculateTax = (annualSalary: number): TaxCalculationResult => {
    const monthlyBase = annualSalary / 12;
    const monthlyPension = Math.min(monthlyBase * 0.045, 590000);
    const nationalPension = monthlyPension * 12;
    const monthlyHealth = monthlyBase * 0.03545;
    const healthInsurance = monthlyHealth * 12;
    const longTermCare = healthInsurance * 0.1295;
    const employmentInsurance = annualSalary * 0.009;
    const taxableIncome = annualSalary - nationalPension - 1500000;

    let incomeTax = 0;
    if (taxableIncome <= 14000000) {
      incomeTax = taxableIncome * 0.06;
    } else if (taxableIncome <= 50000000) {
      incomeTax = 840000 + (taxableIncome - 14000000) * 0.15;
    } else if (taxableIncome <= 88000000) {
      incomeTax = 6240000 + (taxableIncome - 50000000) * 0.24;
    } else if (taxableIncome <= 150000000) {
      incomeTax = 15360000 + (taxableIncome - 88000000) * 0.35;
    } else {
      incomeTax = 37060000 + (taxableIncome - 150000000) * 0.38;
    }

    const localIncomeTax = incomeTax * 0.1;
    const totalTax = incomeTax + localIncomeTax;
    const totalDeduction = totalTax + nationalPension + healthInsurance + longTermCare + employmentInsurance;
    const netIncome = annualSalary - totalDeduction;
    const monthlyRefund = (totalDeduction * 0.05) / 12;

    return {
      annualSalary,
      totalTax,
      totalDeduction,
      monthlyRefund,
      netIncome,
      incomeTax,
      localIncomeTax,
      nationalPension,
      healthInsurance,
      longTermCare,
      employmentInsurance,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numSalary = parseInt(salary.replace(/,/g, ''), 10);
    if (!isNaN(numSalary) && numSalary > 0) {
      const result = calculateTax(numSalary);
      onCalculate(result);
    }
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    if (/^\d*$/.test(value)) {
      const formatted = value ? parseInt(value, 10).toLocaleString('ko-KR') : '';
      setSalary(formatted);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5]" style={{ padding: '24px', borderWidth: '1px' }}>
      <h2 className="text-[16px] font-bold text-[#111111] mb-5 leading-[1.5] text-left">
        연봉 입력
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="salary" className="block text-[14px] text-[#666666] mb-2 leading-[1.5] text-left">
            연봉 (세전)
          </label>
          <div className="relative">
            <input
              type="text"
              id="salary"
              value={salary}
              onChange={handleSalaryChange}
              placeholder="50,000,000"
              className="w-full px-4 py-3 pr-12 text-[16px] text-[#111111] bg-[#FFFFFF] border border-[#E5E5E5] leading-[1.5] focus:outline-none focus:border-[#0070F3] transition-all duration-200"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#999999]">
              원
            </span>
          </div>
          <p className="text-[13px] text-[#999999] mt-1.5 leading-[1.5] text-left">
            연간 총 급여액을 입력해주세요
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="submit"
            className="w-full px-6 py-3 bg-[#111111] text-white text-[16px] font-medium leading-[1.5] transition-opacity duration-200 hover:opacity-80"
            style={{ borderRadius: '4px' }}
          >
            계산하기
          </button>
          <button
            type="button"
            onClick={() => setSalary('')}
            className="w-full px-6 py-3 border border-[#E5E5E5] text-[#666666] text-[16px] leading-[1.5] transition-colors duration-200 hover:bg-[#F7F7F7] hover:border-[#111111]"
            style={{ borderRadius: '4px', borderWidth: '1px' }}
          >
            초기화
          </button>
        </div>
      </form>

      {/* Quick Amount Buttons */}
      <div className="mt-5 pt-5 border-t border-[#E5E5E5]">
        <p className="text-[13px] text-[#999999] mb-3 text-left">빠른 입력</p>
        <div className="grid grid-cols-2 gap-2">
          {[3000, 4000, 5000, 6000, 7000, 8000, 10000, 15000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSalary((amount * 10000).toLocaleString('ko-KR'));
              }}
              className="px-3 py-2 text-[14px] text-[#666666] bg-[#FFFFFF] border border-[#E5E5E5] transition-all duration-200 hover:bg-[#F7F7F7] hover:text-[#111111]"
              style={{ borderWidth: '1px' }}
            >
              {amount >= 10000 ? `${amount / 10000}억` : `${amount / 1000}천만`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
