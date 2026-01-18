import {
  EARNED_INCOME_TAX_CREDIT_BRACKETS,
  STANDARD_TAX_CREDIT,
} from '../constants/tax.constants';
import { TaxCredits } from '../types/tax.types';

/**
 * 근로소득세액공제 계산
 * 산출세액에 따라 공제율이 다름
 */
export function calculateEarnedIncomeTaxCredit(calculatedTax: number): number {
  for (const bracket of EARNED_INCOME_TAX_CREDIT_BRACKETS) {
    if (
      calculatedTax >= bracket.min &&
      (bracket.max === null || calculatedTax <= bracket.max)
    ) {
      const credit = Math.floor(calculatedTax * bracket.rate);

      // 최대 공제액 제한이 있는 경우
      if (bracket.maxCredit !== undefined) {
        const excessAmount = calculatedTax - bracket.min;
        const additionalCredit = Math.floor(excessAmount * bracket.rate);
        const previousBracketCredit = Math.floor(bracket.min * 0.55); // 이전 구간 최대 공제액
        return Math.min(previousBracketCredit + additionalCredit, bracket.maxCredit);
      }

      return credit;
    }
  }
  return 0;
}

/**
 * 세액공제 합계 계산
 */
export function calculateTotalTaxCredits(credits: Partial<TaxCredits>): number {
  const {
    earnedIncomeCredit = 0,
    childTaxCredit = 0,
    pensionAccountCredit = 0,
    insurancePremiumCredit = 0,
    medicalExpenseCredit = 0,
    educationExpenseCredit = 0,
    donationCredit = 0,
    standardTaxCredit = 0,
  } = credits;

  return (
    earnedIncomeCredit +
    childTaxCredit +
    pensionAccountCredit +
    insurancePremiumCredit +
    medicalExpenseCredit +
    educationExpenseCredit +
    donationCredit +
    standardTaxCredit
  );
}

/**
 * 세액공제 항목 기본값 채우기
 */
export function fillTaxCreditsDefaults(credits: Partial<TaxCredits>): TaxCredits {
  return {
    earnedIncomeCredit: credits.earnedIncomeCredit ?? 0,
    childTaxCredit: credits.childTaxCredit ?? 0,
    pensionAccountCredit: credits.pensionAccountCredit ?? 0,
    insurancePremiumCredit: credits.insurancePremiumCredit ?? 0,
    medicalExpenseCredit: credits.medicalExpenseCredit ?? 0,
    educationExpenseCredit: credits.educationExpenseCredit ?? 0,
    donationCredit: credits.donationCredit ?? 0,
    standardTaxCredit: credits.standardTaxCredit ?? 0,
  };
}

/**
 * 표준세액공제 적용 여부 확인
 * 특별세액공제를 신청하지 않은 경우 자동 적용
 */
export function shouldApplyStandardTaxCredit(credits: Partial<TaxCredits>): boolean {
  const hasSpecialCredit =
    (credits.insurancePremiumCredit ?? 0) > 0 ||
    (credits.medicalExpenseCredit ?? 0) > 0 ||
    (credits.educationExpenseCredit ?? 0) > 0 ||
    (credits.donationCredit ?? 0) > 0;

  return !hasSpecialCredit;
}

/**
 * 표준세액공제 자동 적용
 */
export function applyStandardTaxCreditIfNeeded(
  credits: Partial<TaxCredits>
): Partial<TaxCredits> {
  if (shouldApplyStandardTaxCredit(credits) && !credits.standardTaxCredit) {
    return {
      ...credits,
      standardTaxCredit: STANDARD_TAX_CREDIT,
    };
  }
  return credits;
}

/**
 * 결정세액 계산
 * 결정세액 = 산출세액 - 세액공제
 * 음수가 되지 않도록 처리
 */
export function calculateFinalTax(
  calculatedTax: number,
  totalTaxCredits: number
): number {
  return Math.max(0, calculatedTax - totalTaxCredits);
}
