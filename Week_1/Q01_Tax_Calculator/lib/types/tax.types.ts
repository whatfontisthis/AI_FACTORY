/**
 * 2026년 연말정산 세금 계산 타입 정의
 */

/**
 * 소득공제 항목
 */
export interface IncomeDeductions {
  /** 기본공제 (본인, 배우자, 부양가족) */
  basicDeduction: number;
  /** 추가공제 (경로우대, 장애인, 부녀자, 한부모) */
  additionalDeduction: number;
  /** 연금보험료 공제 */
  pensionInsurance: number;
  /** 특별소득공제 - 건강보험료 */
  healthInsurance: number;
  /** 특별소득공제 - 고용보험료 */
  employmentInsurance: number;
  /** 주택자금 공제 (주택임차차입금, 장기주택저당차입금) */
  housingFund: number;
  /** 개인연금저축 공제 */
  personalPension: number;
  /** 소기업소상공인 공제부금 */
  smallBusinessDeduction: number;
}

/**
 * 세액공제 항목
 */
export interface TaxCredits {
  /** 근로소득세액공제 */
  earnedIncomeCredit: number;
  /** 자녀세액공제 */
  childTaxCredit: number;
  /** 연금계좌세액공제 */
  pensionAccountCredit: number;
  /** 특별세액공제 - 보장성보험료 */
  insurancePremiumCredit: number;
  /** 특별세액공제 - 의료비 */
  medicalExpenseCredit: number;
  /** 특별세액공제 - 교육비 */
  educationExpenseCredit: number;
  /** 특별세액공제 - 기부금 */
  donationCredit: number;
  /** 표준세액공제 */
  standardTaxCredit: number;
}

/**
 * 세금 계산 입력 데이터
 */
export interface TaxCalculationInput {
  /** 총 급여액 (연간) */
  totalSalary: number;
  /** 소득공제 항목 */
  incomeDeductions: Partial<IncomeDeductions>;
  /** 세액공제 항목 */
  taxCredits: Partial<TaxCredits>;
}

/**
 * 세금 계산 결과
 */
export interface TaxCalculationResult {
  /** 총 급여액 */
  totalSalary: number;
  /** 근로소득공제 */
  earnedIncomeDeduction: number;
  /** 근로소득금액 */
  earnedIncome: number;
  /** 소득공제 합계 */
  totalIncomeDeductions: number;
  /** 과세표준 */
  taxableIncome: number;
  /** 산출세액 (근로소득세) */
  calculatedIncomeTax: number;
  /** 세액공제 합계 */
  totalTaxCredits: number;
  /** 결정세액 (근로소득세) */
  finalIncomeTax: number;
  /** 지방소득세 */
  localIncomeTax: number;
  /** 총 납부세액 */
  totalTax: number;
  /** 세부 내역 */
  details: {
    incomeDeductions: IncomeDeductions;
    taxCredits: TaxCredits;
  };
}

/**
 * 세율 구간
 */
export interface TaxBracket {
  /** 최소 과세표준 */
  min: number;
  /** 최대 과세표준 (null이면 무제한) */
  max: number | null;
  /** 세율 (%) */
  rate: number;
  /** 누진공제액 */
  deduction: number;
}
