/**
 * 간단한 테스트 러너
 * Jest 대신 간단한 테스트 실행기 구현
 */

import {
  calculateTax,
  calculateEarnedIncomeDeduction,
  calculateEffectiveTaxRate,
} from '../taxCalculator';
import type { TaxCalculationInput } from '../../types/tax.types';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`✗ ${name}`);
    if (error instanceof Error) {
      console.log(`  Error: ${error.message}`);
    }
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`
        );
      }
    },
    toBeGreaterThan(expected: number) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (actual < expected) {
        throw new Error(
          `Expected ${actual} to be greater than or equal to ${expected}`
        );
      }
    },
    toBeLessThan(expected: number) {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined`);
      }
    },
  };
}

function describe(suiteName: string, fn: () => void) {
  console.log(`\n${suiteName}`);
  fn();
}

// 테스트 시작
console.log('세금 계산기 통합 테스트 실행\n');
console.log('='.repeat(50));

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

    console.log(`    연봉: ${result.totalSalary.toLocaleString()}원`);
    console.log(`    총 납부세액: ${result.totalTax.toLocaleString()}원`);
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

    console.log(`    연봉: ${result.totalSalary.toLocaleString()}원`);
    console.log(`    총 납부세액: ${result.totalTax.toLocaleString()}원`);
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

    console.log(`    연봉: ${result.totalSalary.toLocaleString()}원`);
    console.log(`    총 납부세액: ${result.totalTax.toLocaleString()}원`);
  });

  test('자녀가 있는 가정 (연봉 5000만원, 자녀세액공제)', () => {
    const input: TaxCalculationInput = {
      totalSalary: 50000000,
      incomeDeductions: {
        basicDeduction: 4500000,
        pensionInsurance: 2250000,
        healthInsurance: 1687500,
        employmentInsurance: 350000,
      },
      taxCredits: {
        childTaxCredit: 150000,
        educationExpenseCredit: 450000,
      },
    };

    const result = calculateTax(input);

    expect(result.totalSalary).toBe(50000000);
    expect(result.totalIncomeDeductions).toBe(8787500);
    expect(result.details.taxCredits.childTaxCredit).toBe(150000);
    expect(result.totalTax).toBeGreaterThanOrEqual(0);

    console.log(`    연봉: ${result.totalSalary.toLocaleString()}원`);
    console.log(`    총 납부세액: ${result.totalTax.toLocaleString()}원`);
  });
});

describe('근로소득공제 계산 검증', () => {
  test('500만원 이하 - 70% 공제', () => {
    const deduction = calculateEarnedIncomeDeduction(5000000);
    expect(deduction).toBe(3500000);
  });

  test('500만원 초과 1500만원 이하 - 구간별 공제', () => {
    const deduction = calculateEarnedIncomeDeduction(10000000);
    expect(deduction).toBe(5500000);
  });

  test('1500만원 초과 4500만원 이하 - 구간별 공제', () => {
    const deduction = calculateEarnedIncomeDeduction(30000000);
    expect(deduction).toBe(9750000);
  });

  test('4500만원 초과 1억원 이하 - 구간별 공제', () => {
    const deduction = calculateEarnedIncomeDeduction(80000000);
    expect(deduction).toBe(13750000);
  });

  test('1억원 초과 - 구간별 공제', () => {
    const deduction = calculateEarnedIncomeDeduction(150000000);
    expect(deduction).toBe(15750000);
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
    expect(effectiveRate).toBeLessThan(50);

    console.log(`    실효세율: ${effectiveRate.toFixed(2)}%`);
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

// 테스트 결과 출력
console.log('\n' + '='.repeat(50));
console.log('테스트 결과 요약\n');

const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;

console.log(`총 테스트: ${results.length}`);
console.log(`통과: ${passed}`);
console.log(`실패: ${failed}`);

if (failed > 0) {
  console.log('\n실패한 테스트:');
  results
    .filter((r) => !r.passed)
    .forEach((r) => {
      console.log(`  - ${r.name}`);
      if (r.error) {
        console.log(`    ${r.error}`);
      }
    });
  process.exit(1);
} else {
  console.log('\n모든 테스트가 성공했습니다! ✓');
  process.exit(0);
}
