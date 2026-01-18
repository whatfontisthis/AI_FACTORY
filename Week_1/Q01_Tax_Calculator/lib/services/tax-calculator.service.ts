import { TaxCalculationInput, TaxCalculationResult } from '../types/tax.types';
import {
  calculateEarnedIncomeDeduction,
  calculateEarnedIncome,
  calculateTotalIncomeDeductions,
  calculateTaxableIncome,
  fillIncomeDeductionsDefaults,
} from './deduction.service';
import {
  calculateEarnedIncomeTaxCredit,
  calculateTotalTaxCredits,
  fillTaxCreditsDefaults,
  applyStandardTaxCreditIfNeeded,
  calculateFinalTax,
} from './tax-credit.service';
import {
  calculateIncomeTax,
  calculateLocalIncomeTax,
  calculateTotalTax,
} from './income-tax.service';

/**
 * 2026년 연말정산 세금 계산 메인 함수
 *
 * 계산 순서:
 * 1. 총급여 → 근로소득공제 → 근로소득금액
 * 2. 근로소득금액 - 소득공제 → 과세표준
 * 3. 과세표준 → 산출세액 (근로소득세)
 * 4. 산출세액 - 세액공제 → 결정세액 (근로소득세)
 * 5. 결정세액 × 10% → 지방소득세
 * 6. 결정세액 + 지방소득세 → 총 납부세액
 */
export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const { totalSalary, incomeDeductions, taxCredits } = input;

  // 1단계: 근로소득공제 및 근로소득금액 계산
  const earnedIncomeDeduction = calculateEarnedIncomeDeduction(totalSalary);
  const earnedIncome = calculateEarnedIncome(totalSalary);

  // 2단계: 소득공제 합계 및 과세표준 계산
  const filledIncomeDeductions = fillIncomeDeductionsDefaults(incomeDeductions);
  const totalIncomeDeductions = calculateTotalIncomeDeductions(filledIncomeDeductions);
  const taxableIncome = calculateTaxableIncome(earnedIncome, totalIncomeDeductions);

  // 3단계: 산출세액 계산
  const calculatedIncomeTax = calculateIncomeTax(taxableIncome);

  // 4단계: 세액공제 계산
  let processedTaxCredits = applyStandardTaxCreditIfNeeded(taxCredits);

  // 근로소득세액공제 자동 계산 (입력되지 않은 경우)
  if (!processedTaxCredits.earnedIncomeCredit) {
    processedTaxCredits = {
      ...processedTaxCredits,
      earnedIncomeCredit: calculateEarnedIncomeTaxCredit(calculatedIncomeTax),
    };
  }

  const filledTaxCredits = fillTaxCreditsDefaults(processedTaxCredits);
  const totalTaxCredits = calculateTotalTaxCredits(filledTaxCredits);

  // 5단계: 결정세액 계산
  const finalIncomeTax = calculateFinalTax(calculatedIncomeTax, totalTaxCredits);

  // 6단계: 지방소득세 계산
  const localIncomeTax = calculateLocalIncomeTax(finalIncomeTax);

  // 7단계: 총 납부세액 계산
  const totalTax = calculateTotalTax(finalIncomeTax, localIncomeTax);

  return {
    totalSalary,
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
      incomeDeductions: filledIncomeDeductions,
      taxCredits: filledTaxCredits,
    },
  };
}

/**
 * 세금 계산 입력값 검증
 */
export function validateTaxCalculationInput(input: TaxCalculationInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 총급여 검증
  if (input.totalSalary < 0) {
    errors.push('총급여는 0 이상이어야 합니다.');
  }

  // 소득공제 항목 검증
  const deductions = input.incomeDeductions;
  Object.entries(deductions).forEach(([key, value]) => {
    if (typeof value === 'number' && value < 0) {
      errors.push(`소득공제 항목 ${key}는 0 이상이어야 합니다.`);
    }
  });

  // 세액공제 항목 검증
  const credits = input.taxCredits;
  Object.entries(credits).forEach(([key, value]) => {
    if (typeof value === 'number' && value < 0) {
      errors.push(`세액공제 항목 ${key}는 0 이상이어야 합니다.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
