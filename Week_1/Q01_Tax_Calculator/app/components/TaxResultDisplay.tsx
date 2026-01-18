'use client';

export interface TaxCalculationResult {
  annualSalary: number;
  totalTax: number;
  totalDeduction: number;
  monthlyRefund: number;
  netIncome: number;
  incomeTax: number;
  localIncomeTax: number;
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
}

interface TaxResultDisplayProps {
  result?: TaxCalculationResult | null;
}

export default function TaxResultDisplay({ result }: TaxResultDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(amount)) + '원';
  };

  const formatMonthly = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(amount / 12)) + '원';
  };

  if (!result) {
    return (
      <div className="pt-[96px]">
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] min-h-[300px] flex flex-col items-center justify-center text-center" style={{ padding: '24px', borderWidth: '1px' }}>
        <div className="w-12 h-12 bg-[#F7F7F7] flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-[16px] font-medium text-[#111111] mb-1">
          세금 계산 결과
        </h3>
        <p className="text-[14px] text-[#999999] max-w-[280px] leading-[1.5]">
          왼쪽에서 연봉을 입력하고 계산하기 버튼을 눌러주세요
        </p>
      </div>
      </div>
    );
  }

  const socialInsuranceTotal = 
    result.nationalPension + 
    result.healthInsurance + 
    result.longTermCare + 
    result.employmentInsurance;

  return (
    <div className="pt-[96px] space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Net Income Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5]" style={{ padding: '24px', borderWidth: '1px' }}>
          <p className="text-[13px] text-[#999999] mb-2 leading-[1.5] text-left">연간 실수령액</p>
          <p className="text-[28px] font-bold text-[#0070F3] leading-[1.2] mb-1 text-left">
            {formatCurrency(result.netIncome)}
          </p>
          <p className="text-[14px] text-[#666666] leading-[1.5] text-left">
            월 {formatMonthly(result.netIncome)}
          </p>
        </div>

        {/* Total Deduction Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5]" style={{ padding: '24px', borderWidth: '1px' }}>
          <p className="text-[13px] text-[#999999] mb-2 leading-[1.5] text-left">총 공제액</p>
          <p className="text-[28px] font-bold text-[#111111] leading-[1.2] mb-1 text-left">
            {formatCurrency(result.totalDeduction)}
          </p>
          <p className="text-[14px] text-[#666666] leading-[1.5] text-left">
            월 {formatMonthly(result.totalDeduction)}
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tax Details */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5]" style={{ padding: '24px', borderWidth: '1px' }}>
          <h3 className="text-[15px] font-bold text-[#111111] mb-4 leading-[1.5] text-left">
            세금
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#666666] leading-[1.5]">소득세</span>
              <span className="text-[14px] font-medium text-[#111111] leading-[1.5]">
                {formatCurrency(result.incomeTax)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#666666] leading-[1.5]">지방소득세</span>
              <span className="text-[14px] font-medium text-[#111111] leading-[1.5]">
                {formatCurrency(result.localIncomeTax)}
              </span>
            </div>
            <div className="border-t border-[#E5E5E5] pt-2.5 mt-2.5 flex justify-between items-center">
              <span className="text-[14px] font-bold text-[#111111] leading-[1.5]">합계</span>
              <span className="text-[15px] font-bold text-[#111111] leading-[1.5]">
                {formatCurrency(result.totalTax)}
              </span>
            </div>
          </div>
        </div>

        {/* Social Insurance Details */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5]" style={{ padding: '24px', borderWidth: '1px' }}>
          <h3 className="text-[15px] font-bold text-[#111111] mb-4 leading-[1.5] text-left">
            4대보험
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#666666] leading-[1.5]">국민연금</span>
              <span className="text-[14px] font-medium text-[#111111] leading-[1.5]">
                {formatCurrency(result.nationalPension)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#666666] leading-[1.5]">건강보험</span>
              <span className="text-[14px] font-medium text-[#111111] leading-[1.5]">
                {formatCurrency(result.healthInsurance)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#666666] leading-[1.5]">장기요양보험</span>
              <span className="text-[14px] font-medium text-[#111111] leading-[1.5]">
                {formatCurrency(result.longTermCare)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#666666] leading-[1.5]">고용보험</span>
              <span className="text-[14px] font-medium text-[#111111] leading-[1.5]">
                {formatCurrency(result.employmentInsurance)}
              </span>
            </div>
            <div className="border-t border-[#E5E5E5] pt-2.5 mt-2.5 flex justify-between items-center">
              <span className="text-[14px] font-bold text-[#111111] leading-[1.5]">합계</span>
              <span className="text-[15px] font-bold text-[#111111] leading-[1.5]">
                {formatCurrency(socialInsuranceTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5]" style={{ padding: '24px', borderWidth: '1px' }}>
        <h3 className="text-[15px] font-bold text-[#111111] mb-4 leading-[1.5] text-left">
          월별 상세 내역
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5]">
                <th className="text-left text-[13px] text-[#999999] font-medium pb-2.5 leading-[1.5]">항목</th>
                <th className="text-right text-[13px] text-[#999999] font-medium pb-2.5 leading-[1.5]">연간</th>
                <th className="text-right text-[13px] text-[#999999] font-medium pb-2.5 leading-[1.5]">월간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              <tr>
                <td className="text-[14px] text-[#666666] py-2.5 leading-[1.5]">총 급여</td>
                <td className="text-[14px] text-[#111111] text-right py-2.5 leading-[1.5]">
                  {formatCurrency(result.annualSalary)}
                </td>
                <td className="text-[14px] text-[#111111] text-right py-2.5 leading-[1.5]">
                  {formatMonthly(result.annualSalary)}
                </td>
              </tr>
              <tr>
                <td className="text-[14px] text-[#666666] py-2.5 leading-[1.5]">세금</td>
                <td className="text-[14px] text-[#666666] text-right py-2.5 leading-[1.5]">
                  -{formatCurrency(result.totalTax)}
                </td>
                <td className="text-[14px] text-[#666666] text-right py-2.5 leading-[1.5]">
                  -{formatMonthly(result.totalTax)}
                </td>
              </tr>
              <tr>
                <td className="text-[14px] text-[#666666] py-2.5 leading-[1.5]">4대보험</td>
                <td className="text-[14px] text-[#666666] text-right py-2.5 leading-[1.5]">
                  -{formatCurrency(socialInsuranceTotal)}
                </td>
                <td className="text-[14px] text-[#666666] text-right py-2.5 leading-[1.5]">
                  -{formatMonthly(socialInsuranceTotal)}
                </td>
              </tr>
              <tr>
                <td className="text-[14px] font-bold text-[#111111] py-2.5 leading-[1.5]">실수령액</td>
                <td className="text-[14px] font-bold text-[#0070F3] text-right py-2.5 leading-[1.5]">
                  {formatCurrency(result.netIncome)}
                </td>
                <td className="text-[14px] font-bold text-[#0070F3] text-right py-2.5 leading-[1.5]">
                  {formatMonthly(result.netIncome)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-[#F7F7F7] border border-[#E5E5E5]" style={{ padding: '20px', borderWidth: '1px' }}>
        <p className="text-[13px] text-[#666666] leading-[1.5] text-left">
          계산 결과는 2024년 세법 기준 예상치이며, 실제 금액은 개인 상황에 따라 달라질 수 있습니다. 
          정확한 금액은 국세청 홈택스에서 확인하세요.
        </p>
      </div>
    </div>
  );
}
