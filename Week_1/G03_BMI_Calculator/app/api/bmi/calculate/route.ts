import { NextRequest, NextResponse } from 'next/server';
import { calculateBMI } from '@/lib/bmi';

/**
 * Request body interface for BMI calculation
 */
interface CalculateBMIRequest {
  height: number;
  weight: number;
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * POST /api/bmi/calculate
 *
 * Calculate BMI from height and weight
 *
 * @param request - Next.js request object
 * @returns JSON response with BMI calculation result or error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CalculateBMIRequest = await request.json();

    // Validate request body
    if (
      typeof body.height !== 'number' ||
      typeof body.weight !== 'number' ||
      isNaN(body.height) ||
      isNaN(body.weight)
    ) {
      return NextResponse.json<ErrorResponse>(
        {
          error: '잘못된 요청 형식입니다.',
          details: '키와 몸무게는 유효한 숫자여야 합니다.',
        },
        { status: 400 }
      );
    }

    // Calculate BMI
    const result = calculateBMI(body.height, body.weight);

    // Return successful response
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error) {
      return NextResponse.json<ErrorResponse>(
        {
          error: '입력값 검증 실패',
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    return NextResponse.json<ErrorResponse>(
      {
        error: '서버 오류가 발생했습니다.',
        details: '잠시 후 다시 시도해주세요.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bmi/calculate
 *
 * Get BMI categories information
 *
 * @returns JSON response with BMI categories reference
 */
export async function GET() {
  return NextResponse.json(
    {
      categories: [
        { name: '저체중', range: '18.5 미만', description: 'BMI가 18.5 미만인 경우' },
        { name: '정상', range: '18.5 ~ 22.9', description: 'BMI가 18.5 이상 23 미만인 경우' },
        { name: '과체중', range: '23 ~ 24.9', description: 'BMI가 23 이상 25 미만인 경우' },
        { name: '비만', range: '25 이상', description: 'BMI가 25 이상인 경우' },
      ],
      formula: 'BMI = 몸무게(kg) / (키(m))^2',
      reference: 'WHO Asia-Pacific guidelines',
    },
    { status: 200 }
  );
}
