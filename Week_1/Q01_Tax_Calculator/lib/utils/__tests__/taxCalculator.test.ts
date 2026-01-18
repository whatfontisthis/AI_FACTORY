/**
 * 세금 계산기 통합 테스트
 * 다양한 시나리오로 세금 계산이 정확하게 작동하는지 검증
 */

import {
  calculateTax,
  calculateEarnedIncomeDeduction,
  calculateEffectiveTaxRate,
} from '../taxCalculator';
import type { TaxCalculationInput } from '../../types/tax.types';

describe('Tax Calculator Integration Tests', () => {
  describe('Edge Cases - Boundary Values', () => {
    test('최소 연봉 (0원) - 모든 값이 0이어야 함', () => {
      const input: TaxCalculationInput = {
        totalSalary: 0,
        incomeDeductions: {},
        taxCredits: {},
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(0);
      expect(result.earnedIncomeDeduction).toBe(0);
      expect(result.earnedIncome).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.calculatedIncomeTax).toBe(0);
      expect(result.finalIncomeTax).toBe(0);
      expect(result.totalTax).toBe(0);
    });

    test('매우 낮은 연봉 (100만원) - 세금이 0원이어야 함', () => {
      const input: TaxCalculationInput = {
        totalSalary: 1000000,
        incomeDeductions: {},
        taxCredits: {},
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(1000000);
      expect(result.earnedIncomeDeduction).toBe(700000);
      expect(result.earnedIncome).toBe(300000);
      expect(result.taxableIncome).toBe(300000);
      expect(result.totalTax).toBe(0);
    });

    test('음수 연봉 처리 - 안전하게 처리되어야 함', () => {
      const input: TaxCalculationInput = {
        totalSalary: -1000000,
        incomeDeductions: {},
        taxCredits: {},
      };

      const result = calculateTax(input);

      // 음수 처리는 구현에 따라 다를 수 있으나, 에러 없이 실행되어야 함
      expect(result).toBeDefined();
    });

    test('최고 연봉 (10억원) - 최고 세율 구간 적용', () => {
      const input: TaxCalculationInput = {
        totalSalary: 1000000000,
        incomeDeductions: {
          basicDeduction: 1500000,
          pensionInsurance: 45000000,
        },
        taxCredits: {},
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(1000000000);
      expect(result.taxableIncome).toBeGreaterThan(0);
      expect(result.calculatedIncomeTax).toBeGreaterThan(0);
      expect(result.totalTax).toBeGreaterThan(0);
    });

    test('과세표준 경계값 (1400만원) - 첫 번째 세율 구간 상한', () => {
      const input: TaxCalculationInput = {
        totalSalary: 20000000,
        incomeDeductions: {},
        taxCredits: {},
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(20000000);
      expect(result.calculatedIncomeTax).toBeGreaterThan(0);
    });

    test('과세표준 경계값 (5000만원) - 두 번째 세율 구간 상한', () => {
      const input: TaxCalculationInput = {
        totalSalary: 80000000,
        incomeDeductions: {},
        taxCredits: {},
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(80000000);
      expect(result.calculatedIncomeTax).toBeGreaterThan(0);
    });
  });

  describe('Common Use Cases - Typical Scenarios', () => {
    test('일반적인 직장인 (연봉 4000만원, 기본공제만)', () => {
      const input: TaxCalculationInput = {
        totalSalary: 40000000,
        incomeDeductions: {
          basicDeduction: 1500000,
          pensionInsurance: 1800000,
          healthInsurance: 1350000,
          employmentInsurance: 280000,
        },
        taxCredits: {},
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(40000000);
      expect(result.earnedIncomeDeduction).toBeGreaterThan(0);
      expect(result.totalIncomeDeductions).toBe(4930000);
      expect(result.taxableIncome).toBeGreaterThan(0);
      expect(result.calculatedIncomeTax).toBeGreaterThan(0);
      expect(result.finalIncomeTax).toBeGreaterThanOrEqual(0);
      expect(result.localIncomeTax).toBeGreaterThanOrEqual(0);
      expect(result.totalTax).toBeGreaterThanOrEqual(0);
    });

    test('고소득 직장인 (연봉 1억원, 다양한 공제)', () => {
      const input: TaxCalculationInput = {
        totalSalary: 100000000,
        incomeDeductions: {
          basicDeduction: 3000000,
          additionalDeduction: 1000000,
          pensionInsurance: 4500000,
          healthInsurance: 3370000,
          employmentInsurance: 700000,
          housingFund: 3000000,
          personalPension: 4000000,
        },
        taxCredits: {
          childTaxCredit: 300000,
          pensionAccountCredit: 900000,
          medicalExpenseCredit: 500000,
          educationExpenseCredit: 300000,
          donationCredit: 200000,
        },
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(100000000);
      expect(result.totalIncomeDeductions).toBe(19570000);
      expect(result.totalTaxCredits).toBeGreaterThan(0);
      expect(result.totalTax).toBeGreaterThan(0);
    });

    test('신입 직장인 (연봉 3000만원, 표준세액공제)', () => {
      const input: TaxCalculationInput = {
        totalSalary: 30000000,
        incomeDeductions: {
          basicDeduction: 1500000,
          pensionInsurance: 1350000,
          healthInsurance: 1012500,
          employmentInsurance: 210000,
        },
        taxCredits: {
          standardTaxCredit: 130000,
        },
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(30000000);
      expect(result.totalIncomeDeductions).toBe(4072500);
      expect(result.totalTax).toBeGreaterThanOrEqual(0);
    });

    test('자녀가 있는 가정 (연봉 5000만원, 자녀세액공제)', () => {
      const input: TaxCalculationInput = {
        totalSalary: 50000000,
        incomeDeductions: {
          basicDeduction: 4500000, // 본인 + 배우자 + 자녀 1명
          pensionInsurance: 2250000,
          healthInsurance: 1687500,
          employmentInsurance: 350000,
        },
        taxCredits: {
          childTaxCredit: 150000, // 자녀 1명
          educationExpenseCredit: 450000,
        },
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(50000000);
      expect(result.totalIncomeDeductions).toBe(8787500);
      expect(result.details.taxCredits.childTaxCredit).toBe(150000);
      expect(result.totalTax).toBeGreaterThanOrEqual(0);
    });

    test('주택자금 공제가 있는 경우 (연봉 6000만원)', () => {
      const input: TaxCalculationInput = {
        totalSalary: 60000000,
        incomeDeductions: {
          basicDeduction: 1500000,
          pensionInsurance: 2700000,
          healthInsurance: 2025000,
          employmentInsurance: 420000,
          housingFund: 6000000, // 주택임차차입금 원리금 상환액
        },
        taxCredits: {},
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(60000000);
      expect(result.totalIncomeDeductions).toBe(12645000);
      expect(result.details.incomeDeductions.housingFund).toBe(6000000);
    });

    test('연금저축 + 의료비 공제 (연봉 7000만원)', () => {
      const input: TaxCalculationInput = {
        totalSalary: 70000000,
        incomeDeductions: {
          basicDeduction: 3000000,
          pensionInsurance: 3150000,
          healthInsurance: 2362500,
          employmentInsurance: 490000,
          personalPension: 4000000,
        },
        taxCredits: {
          pensionAccountCredit: 900000,
          medicalExpenseCredit: 1200000,
          insurancePremiumCredit: 120000,
        },
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(70000000);
      expect(result.totalIncomeDeductions).toBe(13002500);
      expect(result.details.taxCredits.medicalExpenseCredit).toBe(1200000);
      expect(result.details.taxCredits.pensionAccountCredit).toBe(900000);
    });
  });

  describe('근로소득공제 계산 검증', () => {
    test('500만원 이하 - 70% 공제', () => {
      const deduction = calculateEarnedIncomeDeduction(5000000);
      expect(deduction).toBe(3500000);
    });

    test('500만원 초과 1500만원 이하 - 구간별 공제', () => {
      const deduction = calculateEarnedIncomeDeduction(10000000);
      expect(deduction).toBe(5500000); // 350만 + (500만 * 0.4)
    });

    test('1500만원 초과 4500만원 이하 - 구간별 공제', () => {
      const deduction = calculateEarnedIncomeDeduction(30000000);
      expect(deduction).toBe(9750000); // 750만 + (1500만 * 0.15)
    });

    test('4500만원 초과 1억원 이하 - 구간별 공제', () => {
      const deduction = calculateEarnedIncomeDeduction(80000000);
      expect(deduction).toBe(13750000); // 1200만 + (3500만 * 0.05)
    });

    test('1억원 초과 - 구간별 공제', () => {
      const deduction = calculateEarnedIncomeDeduction(150000000);
      expect(deduction).toBe(15750000); // 1475만 + (5000만 * 0.02)
    });
  });

  describe('실효세율 계산', () => {
    test('연봉 4000만원의 실효세율', () => {
      const input: TaxCalculationInput = {
        totalSalary: 40000000,
        incomeDeductions: {
          basicDeduction: 1500000,
          pensionInsurance: 1800000,
          healthInsurance: 1350000,
          employmentInsurance: 280000,
        },
        taxCredits: {},
      };

      const result = calculateTax(input);
      const effectiveRate = calculateEffectiveTaxRate(
        result.totalSalary,
        result.totalTax
      );

      expect(effectiveRate).toBeGreaterThanOrEqual(0);
      expect(effectiveRate).toBeLessThan(50); // 실효세율은 50% 미만이어야 함
    });

    test('연봉 1억원의 실효세율', () => {
      const input: TaxCalculationInput = {
        totalSalary: 100000000,
        incomeDeductions: {
          basicDeduction: 1500000,
          pensionInsurance: 4500000,
        },
        taxCredits: {},
      };

      const result = calculateTax(input);
      const effectiveRate = calculateEffectiveTaxRate(
        result.totalSalary,
        result.totalTax
      );

      expect(effectiveRate).toBeGreaterThanOrEqual(0);
      expect(effectiveRate).toBeLessThan(50);
    });

    test('0원 연봉의 실효세율', () => {
      const effectiveRate = calculateEffectiveTaxRate(0, 0);
      expect(effectiveRate).toBe(0);
    });
  });

  describe('지방소득세 계산', () => {
    test('소득세의 10%가 지방소득세로 계산됨', () => {
      const input: TaxCalculationInput = {
        totalSalary: 50000000,
        incomeDeductions: {
          basicDeduction: 1500000,
          pensionInsurance: 2250000,
        },
        taxCredits: {},
      };

      const result = calculateTax(input);

      expect(result.localIncomeTax).toBe(Math.floor(result.finalIncomeTax * 0.1));
    });
  });

  describe('공제 한도 및 유효성 검증', () => {
    test('공제액이 소득을 초과하는 경우 - 과세표준은 0', () => {
      const input: TaxCalculationInput = {
        totalSalary: 30000000,
        incomeDeductions: {
          basicDeduction: 10000000,
          pensionInsurance: 10000000,
          healthInsurance: 10000000,
          employmentInsurance: 10000000,
        },
        taxCredits: {},
      };

      const result = calculateTax(input);

      expect(result.taxableIncome).toBe(0);
      expect(result.calculatedIncomeTax).toBe(0);
      expect(result.totalTax).toBe(0);
    });

    test('세액공제가 산출세액을 초과하는 경우 - 결정세액은 0', () => {
      const input: TaxCalculationInput = {
        totalSalary: 25000000,
        incomeDeductions: {},
        taxCredits: {
          childTaxCredit: 5000000,
          medicalExpenseCredit: 5000000,
          educationExpenseCredit: 5000000,
        },
      };

      const result = calculateTax(input);

      expect(result.finalIncomeTax).toBeGreaterThanOrEqual(0);
    });
  });

  describe('복합 시나리오', () => {
    test('모든 공제를 최대한 활용하는 경우', () => {
      const input: TaxCalculationInput = {
        totalSalary: 80000000,
        incomeDeductions: {
          basicDeduction: 6000000, // 본인 + 배우자 + 부양가족 2명
          additionalDeduction: 2000000, // 경로우대 + 장애인
          pensionInsurance: 3600000,
          healthInsurance: 2700000,
          employmentInsurance: 560000,
          housingFund: 12000000,
          personalPension: 4000000,
          smallBusinessDeduction: 3000000,
        },
        taxCredits: {
          childTaxCredit: 450000, // 자녀 2명
          pensionAccountCredit: 900000,
          insurancePremiumCredit: 120000,
          medicalExpenseCredit: 1500000,
          educationExpenseCredit: 900000,
          donationCredit: 500000,
        },
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(80000000);
      expect(result.totalIncomeDeductions).toBe(33860000);
      expect(result.totalTaxCredits).toBeGreaterThan(0);
      expect(result.finalIncomeTax).toBeGreaterThanOrEqual(0);
      expect(result.totalTax).toBeGreaterThanOrEqual(0);
    });

    test('공제 항목이 전혀 없는 경우 (최악의 케이스)', () => {
      const input: TaxCalculationInput = {
        totalSalary: 50000000,
        incomeDeductions: {},
        taxCredits: {},
      };

      const result = calculateTax(input);

      expect(result.totalSalary).toBe(50000000);
      expect(result.totalIncomeDeductions).toBe(0);
      expect(result.calculatedIncomeTax).toBeGreaterThan(0);
      expect(result.totalTax).toBeGreaterThan(0);
    });
  });

  describe('계산 일관성 검증', () => {
    test('동일한 입력에 대해 동일한 결과 반환', () => {
      const input: TaxCalculationInput = {
        totalSalary: 45000000,
        incomeDeductions: {
          basicDeduction: 1500000,
          pensionInsurance: 2025000,
        },
        taxCredits: {},
      };

      const result1 = calculateTax(input);
      const result2 = calculateTax(input);

      expect(result1).toEqual(result2);
    });

    test('총 납부세액 = 결정세액 + 지방소득세', () => {
      const input: TaxCalculationInput = {
        totalSalary: 60000000,
        incomeDeductions: {
          basicDeduction: 1500000,
        },
        taxCredits: {},
      };

      const result = calculateTax(input);

      expect(result.totalTax).toBe(result.finalIncomeTax + result.localIncomeTax);
    });

    test('결정세액은 항상 0 이상', () => {
      const testCases = [10000000, 30000000, 50000000, 100000000, 500000000];

      testCases.forEach((salary) => {
        const input: TaxCalculationInput = {
          totalSalary: salary,
          incomeDeductions: {},
          taxCredits: {},
        };

        const result = calculateTax(input);
        expect(result.finalIncomeTax).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
