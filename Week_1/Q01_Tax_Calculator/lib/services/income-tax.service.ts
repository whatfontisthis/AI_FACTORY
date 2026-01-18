import { INCOME_TAX_BRACKETS_2026, LOCAL_INCOME_TAX_RATE } from '../constants/tax.constants';

/**
 * 과세표준에 따른 산출세액(근로소득세) 계산
 * 누진세율 적용
 */
export function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) {
    return 0;
  }

  // 해당하는 세율 구간 찾기
  for (const bracket of INCOME_TAX_BRACKETS_2026) {
    if (
      taxableIncome >= bracket.min &&
      (bracket.max === null || taxableIncome <= bracket.max)
    ) {
      // 산출세액 = 과세표준 × 세율 - 누진공제액
      const tax = Math.floor(taxableIncome * (bracket.rate / 100) - bracket.deduction);
      return Math.max(0, tax);
    }
  }

  return 0;
}

/**
 * 지방소득세 계산
 * 지방소득세 = 결정세액(근로소득세) × 10%
 */
export function calculateLocalIncomeTax(finalIncomeTax: number): number {
  return Math.floor(finalIncomeTax * LOCAL_INCOME_TAX_RATE);
}

/**
 * 총 납부세액 계산
 * 총 납부세액 = 결정세액(근로소득세) + 지방소득세
 */
export function calculateTotalTax(finalIncomeTax: number, localIncomeTax: number): number {
  return finalIncomeTax + localIncomeTax;
}
