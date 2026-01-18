import { TaxBracket } from '../types/tax.types';

/**
 * 2026년 근로소득세 과세표준 및 세율
 * (소득세법 제55조)
 */
export const INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  {
    min: 0,
    max: 14_000_000,
    rate: 6,
    deduction: 0,
  },
  {
    min: 14_000_001,
    max: 50_000_000,
    rate: 15,
    deduction: 1_260_000,
  },
  {
    min: 50_000_001,
    max: 88_000_000,
    rate: 24,
    deduction: 5_760_000,
  },
  {
    min: 88_000_001,
    max: 150_000_000,
    rate: 35,
    deduction: 15_440_000,
  },
  {
    min: 150_000_001,
    max: 300_000_000,
    rate: 38,
    deduction: 19_940_000,
  },
  {
    min: 300_000_001,
    max: 500_000_000,
    rate: 40,
    deduction: 25_940_000,
  },
  {
    min: 500_000_001,
    max: 1_000_000_000,
    rate: 42,
    deduction: 35_940_000,
  },
  {
    min: 1_000_000_001,
    max: null,
    rate: 45,
    deduction: 65_940_000,
  },
];

/**
 * 지방소득세율
 * 근로소득세의 10%
 */
export const LOCAL_INCOME_TAX_RATE = 0.1;

/**
 * 인적공제 금액
 */
export const PERSONAL_DEDUCTION = {
  /** 기본공제 - 1인당 */
  BASIC_PER_PERSON: 1_500_000,
  /** 추가공제 - 경로우대 (70세 이상) */
  ELDERLY: 1_000_000,
  /** 추가공제 - 장애인 */
  DISABLED: 2_000_000,
  /** 추가공제 - 부녀자 */
  WOMAN: 500_000,
  /** 추가공제 - 한부모 */
  SINGLE_PARENT: 1_000_000,
};

/**
 * 근로소득공제 구간
 */
export const EARNED_INCOME_DEDUCTION_BRACKETS = [
  {
    min: 0,
    max: 5_000_000,
    rate: 0.7,
    base: 0,
  },
  {
    min: 5_000_001,
    max: 15_000_000,
    rate: 0.4,
    base: 3_500_000,
  },
  {
    min: 15_000_001,
    max: 45_000_000,
    rate: 0.15,
    base: 7_500_000,
  },
  {
    min: 45_000_001,
    max: 100_000_000,
    rate: 0.05,
    base: 12_000_000,
  },
  {
    min: 100_000_001,
    max: null,
    rate: 0.02,
    base: 14_750_000,
  },
];

/**
 * 근로소득세액공제
 */
export const EARNED_INCOME_TAX_CREDIT_BRACKETS = [
  {
    min: 0,
    max: 1_300_000,
    rate: 0.55,
  },
  {
    min: 1_300_001,
    max: null,
    rate: 0.3,
    maxCredit: 660_000, // 130만원 초과 시 최대 66만원
  },
];

/**
 * 자녀세액공제
 */
export const CHILD_TAX_CREDIT = {
  /** 1명 */
  ONE_CHILD: 150_000,
  /** 2명 */
  TWO_CHILDREN: 300_000,
  /** 3명 이상 - 2명 기본 + 추가 1명당 */
  ADDITIONAL_PER_CHILD: 300_000,
};

/**
 * 표준세액공제
 * 특별세액공제/특별소득공제를 신청하지 않는 경우
 */
export const STANDARD_TAX_CREDIT = 130_000;

/**
 * 연금계좌세액공제율
 */
export const PENSION_ACCOUNT_CREDIT_RATE = {
  /** 총급여 5,500만원 이하 */
  LOW_INCOME: 0.15,
  /** 총급여 5,500만원 초과 */
  HIGH_INCOME: 0.12,
};

/**
 * 연금계좌세액공제 한도
 */
export const PENSION_ACCOUNT_CREDIT_LIMIT = {
  /** 기본 한도 */
  BASIC: 4_000_000,
  /** 50세 이상 추가 한도 */
  OVER_50_ADDITIONAL: 3_000_000,
};

/**
 * 보장성보험료 세액공제율 및 한도
 */
export const INSURANCE_PREMIUM_CREDIT = {
  RATE: 0.12,
  LIMIT: 1_000_000,
};

/**
 * 의료비 세액공제율
 */
export const MEDICAL_EXPENSE_CREDIT_RATE = {
  /** 일반 의료비 */
  GENERAL: 0.15,
  /** 난임시술비 */
  INFERTILITY: 0.20,
  /** 미숙아·선천성이상아 */
  PREMATURE_BABY: 0.20,
};

/**
 * 교육비 세액공제율
 */
export const EDUCATION_EXPENSE_CREDIT_RATE = 0.15;

/**
 * 기부금 세액공제율
 */
export const DONATION_CREDIT_RATE = {
  /** 1천만원 이하 */
  UNDER_10M: 0.15,
  /** 1천만원 초과 */
  OVER_10M: 0.30,
  /** 정치자금기부금 - 10만원 이하 */
  POLITICAL_UNDER_100K: 1.0 / 9, // 110/100 역산
  /** 정치자금기부금 - 10만원 초과 */
  POLITICAL_OVER_100K: 0.15,
  /** 우리사주조합기부금 */
  EMPLOYEE_STOCK: 0.30,
};
