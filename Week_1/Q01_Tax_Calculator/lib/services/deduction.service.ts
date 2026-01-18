import { EARNED_INCOME_DEDUCTION_BRACKETS } from '../constants/tax.constants';
import { IncomeDeductions } from '../types/tax.types';

/**
 * 근로소득공제 계산
 * 총급여에 따라 공제율이 다름
 */
export function calculateEarnedIncomeDeduction(totalSalary: number): number {
  for (const bracket of EARNED_INCOME_DEDUCTION_BRACKETS) {
    if (totalSalary >= bracket.min && (bracket.max === null || totalSalary <= bracket.max)) {
      const excessAmount = totalSalary - bracket.min;
      return Math.floor(bracket.base + excessAmount * bracket.rate);
    }
  }
  return 0;
}

/**
 * 근로소득금액 계산
 * 근로소득금액 = 총급여 - 근로소득공제
 */
export function calculateEarnedIncome(totalSalary: number): number {
  const deduction = calculateEarnedIncomeDeduction(totalSalary);
  return Math.max(0, totalSalary - deduction);
}

/**
 * 소득공제 합계 계산
 */
export function calculateTotalIncomeDeductions(deductions: Partial<IncomeDeductions>): number {
  const {
    basicDeduction = 0,
    additionalDeduction = 0,
    pensionInsurance = 0,
    healthInsurance = 0,
    employmentInsurance = 0,
    housingFund = 0,
    personalPension = 0,
    smallBusinessDeduction = 0,
  } = deductions;

  return (
    basicDeduction +
    additionalDeduction +
    pensionInsurance +
    healthInsurance +
    employmentInsurance +
    housingFund +
    personalPension +
    smallBusinessDeduction
  );
}

/**
 * 소득공제 항목 기본값 채우기
 */
export function fillIncomeDeductionsDefaults(
  deductions: Partial<IncomeDeductions>
): IncomeDeductions {
  return {
    basicDeduction: deductions.basicDeduction ?? 0,
    additionalDeduction: deductions.additionalDeduction ?? 0,
    pensionInsurance: deductions.pensionInsurance ?? 0,
    healthInsurance: deductions.healthInsurance ?? 0,
    employmentInsurance: deductions.employmentInsurance ?? 0,
    housingFund: deductions.housingFund ?? 0,
    personalPension: deductions.personalPension ?? 0,
    smallBusinessDeduction: deductions.smallBusinessDeduction ?? 0,
  };
}

/**
 * 과세표준 계산
 * 과세표준 = 근로소득금액 - 소득공제 합계
 */
export function calculateTaxableIncome(
  earnedIncome: number,
  totalDeductions: number
): number {
  return Math.max(0, earnedIncome - totalDeductions);
}
