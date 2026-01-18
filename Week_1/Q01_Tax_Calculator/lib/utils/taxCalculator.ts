/**
 * 2026년 연말정산 세금 계산 유틸리티
 * 대한민국 소득세법에 기반한 세금 계산
 */

import type {
  TaxCalculationInput,
  TaxCalculationResult,
  TaxBracket,
  IncomeDeductions,
  TaxCredits,
} from '../types/tax.types';

/**
 * 2026년 소득세 과세표준 구간
 */
const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 14000000, rate: 6, deduction: 0 },
  { min: 14000001, max: 50000000, rate: 15, deduction: 1260000 },
  { min: 50000001, max: 88000000, rate: 24, deduction: 5760000 },
  { min: 88000001, max: 150000000, rate: 35, deduction: 15440000 },
  { min: 150000001, max: 300000000, rate: 38, deduction: 19940000 },
  { min: 300000001, max: 500000000, rate: 40, deduction: 25940000 },
  { min: 500000001, max: 1000000000, rate: 42, deduction: 35940000 },
  { min: 1000000001, max: null, rate: 45, deduction: 65940000 },
];

/**
 * 근로소득공제 계산
 * @param totalSalary 총 급여액
 * @returns 근로소득공제액
 */
export function calculateEarnedIncomeDeduction(totalSalary: number): number {
  if (totalSalary <= 5000000) {
    return totalSalary * 0.7;
  } else if (totalSalary <= 15000000) {
    return 3500000 + (totalSalary - 5000000) * 0.4;
  } else if (totalSalary <= 45000000) {
    return 7500000 + (totalSalary - 15000000) * 0.15;
  } else if (totalSalary <= 100000000) {
    return 12000000 + (totalSalary - 45000000) * 0.05;
  } else {
    return 14750000 + (totalSalary - 100000000) * 0.02;
  }
}

/**
 * 소득공제 항목 합계 계산
 * @param deductions 소득공제 항목
 * @returns 소득공제 합계
 */
function sumIncomeDeductions(deductions: Partial<IncomeDeductions>): number {
  return (
    (deductions.basicDeduction || 0) +
    (deductions.additionalDeduction || 0) +
    (deductions.pensionInsurance || 0) +
    (deductions.healthInsurance || 0) +
    (deductions.employmentInsurance || 0) +
    (deductions.housingFund || 0) +
    (deductions.personalPension || 0) +
    (deductions.smallBusinessDeduction || 0)
  );
}

/**
 * 과세표준에 따른 산출세액 계산
 * @param taxableIncome 과세표준
 * @returns 산출세액
 */
function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  const bracket = TAX_BRACKETS.find(
    (b) => taxableIncome >= b.min && (b.max === null || taxableIncome <= b.max)
  );

  if (!bracket) return 0;

  return Math.floor((taxableIncome * bracket.rate) / 100 - bracket.deduction);
}

/**
 * 근로소득세액공제 계산
 * @param calculatedTax 산출세액
 * @returns 근로소득세액공제
 */
function calculateEarnedIncomeTaxCredit(calculatedTax: number): number {
  if (calculatedTax <= 1300000) {
    return Math.min(calculatedTax * 0.55, 740000);
  } else {
    const baseCredit = 715000;
    const excessAmount = calculatedTax - 1300000;
    const additionalCredit = excessAmount * 0.3;
    return Math.max(baseCredit - additionalCredit, 660000);
  }
}

/**
 * 세액공제 항목 합계 계산
 * @param credits 세액공제 항목
 * @param calculatedIncomeTax 산출세액 (근로소득세액공제 계산용)
 * @returns 세액공제 합계
 */
function sumTaxCredits(
  credits: Partial<TaxCredits>,
  calculatedIncomeTax: number
): number {
  const earnedIncomeCredit = calculateEarnedIncomeTaxCredit(calculatedIncomeTax);

  return (
    earnedIncomeCredit +
    (credits.childTaxCredit || 0) +
    (credits.pensionAccountCredit || 0) +
    (credits.insurancePremiumCredit || 0) +
    (credits.medicalExpenseCredit || 0) +
    (credits.educationExpenseCredit || 0) +
    (credits.donationCredit || 0) +
    (credits.standardTaxCredit || 0)
  );
}

/**
 * 세금 계산 메인 함수
 * @param input 세금 계산 입력 데이터
 * @returns 세금 계산 결과
 */
export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  // 1. 근로소득공제 계산
  const earnedIncomeDeduction = calculateEarnedIncomeDeduction(input.totalSalary);

  // 2. 근로소득금액 계산
  const earnedIncome = input.totalSalary - earnedIncomeDeduction;

  // 3. 소득공제 합계
  const totalIncomeDeductions = sumIncomeDeductions(input.incomeDeductions);

  // 4. 과세표준 계산 (음수 방지)
  const taxableIncome = Math.max(0, earnedIncome - totalIncomeDeductions);

  // 5. 산출세액 계산
  const calculatedIncomeTax = calculateIncomeTax(taxableIncome);

  // 6. 세액공제 합계 계산
  const totalTaxCredits = sumTaxCredits(input.taxCredits, calculatedIncomeTax);

  // 7. 결정세액 계산 (음수 방지)
  const finalIncomeTax = Math.max(0, calculatedIncomeTax - totalTaxCredits);

  // 8. 지방소득세 계산 (소득세의 10%)
  const localIncomeTax = Math.floor(finalIncomeTax * 0.1);

  // 9. 총 납부세액
  const totalTax = finalIncomeTax + localIncomeTax;

  // 세부 내역 구성
  const fullIncomeDeductions: IncomeDeductions = {
    basicDeduction: input.incomeDeductions.basicDeduction || 0,
    additionalDeduction: input.incomeDeductions.additionalDeduction || 0,
    pensionInsurance: input.incomeDeductions.pensionInsurance || 0,
    healthInsurance: input.incomeDeductions.healthInsurance || 0,
    employmentInsurance: input.incomeDeductions.employmentInsurance || 0,
    housingFund: input.incomeDeductions.housingFund || 0,
    personalPension: input.incomeDeductions.personalPension || 0,
    smallBusinessDeduction: input.incomeDeductions.smallBusinessDeduction || 0,
  };

  const fullTaxCredits: TaxCredits = {
    earnedIncomeCredit: calculateEarnedIncomeTaxCredit(calculatedIncomeTax),
    childTaxCredit: input.taxCredits.childTaxCredit || 0,
    pensionAccountCredit: input.taxCredits.pensionAccountCredit || 0,
    insurancePremiumCredit: input.taxCredits.insurancePremiumCredit || 0,
    medicalExpenseCredit: input.taxCredits.medicalExpenseCredit || 0,
    educationExpenseCredit: input.taxCredits.educationExpenseCredit || 0,
    donationCredit: input.taxCredits.donationCredit || 0,
    standardTaxCredit: input.taxCredits.standardTaxCredit || 0,
  };

  return {
    totalSalary: input.totalSalary,
    earnedIncomeDeduction,
    earnedIncome,
    totalIncomeDeductions,
    taxableIncome,
    calculatedIncomeTax,
    totalTaxCredits,
    finalIncomeTax,
    localIncomeTax,
    totalTax,
    details: {
      incomeDeductions: fullIncomeDeductions,
      taxCredits: fullTaxCredits,
    },
  };
}

/**
 * 실효세율 계산
 * @param totalSalary 총 급여액
 * @param totalTax 총 납부세액
 * @returns 실효세율 (%)
 */
export function calculateEffectiveTaxRate(
  totalSalary: number,
  totalTax: number
): number {
  if (totalSalary === 0) return 0;
  return (totalTax / totalSalary) * 100;
}
