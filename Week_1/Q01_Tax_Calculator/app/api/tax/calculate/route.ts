import { NextRequest, NextResponse } from 'next/server';
import {
  calculateTax,
  validateTaxCalculationInput,
} from '@/lib/services/tax-calculator.service';
import { TaxCalculationInput } from '@/lib/types/tax.types';

/**
 * POST /api/tax/calculate
 * 2026년 연말정산 세금 계산 API
 */
export async function POST(request: NextRequest) {
  try {
    const body: TaxCalculationInput = await request.json();

    // 입력값 검증
    const validation = validateTaxCalculationInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // 세금 계산
    const result = calculateTax(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Tax calculation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tax/calculate
 * API 정보 반환
 */
export async function GET() {
  return NextResponse.json({
    name: '2026년 연말정산 세금 계산 API',
    version: '1.0.0',
    description: '근로소득세 및 지방소득세 계산',
    endpoints: {
      POST: {
        path: '/api/tax/calculate',
        description: '세금 계산',
        requestBody: {
          totalSalary: 'number - 총급여액 (연간)',
          incomeDeductions: {
            basicDeduction: 'number - 기본공제',
            additionalDeduction: 'number - 추가공제',
            pensionInsurance: 'number - 연금보험료',
            healthInsurance: 'number - 건강보험료',
            employmentInsurance: 'number - 고용보험료',
            housingFund: 'number - 주택자금',
            personalPension: 'number - 개인연금저축',
            smallBusinessDeduction: 'number - 소기업소상공인공제',
          },
          taxCredits: {
            childTaxCredit: 'number - 자녀세액공제',
            pensionAccountCredit: 'number - 연금계좌세액공제',
            insurancePremiumCredit: 'number - 보장성보험료',
            medicalExpenseCredit: 'number - 의료비',
            educationExpenseCredit: 'number - 교육비',
            donationCredit: 'number - 기부금',
          },
        },
      },
    },
  });
}
