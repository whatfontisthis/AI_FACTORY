/**
 * BMI Category classification based on WHO Asia-Pacific guidelines
 */
export enum BMICategory {
  UNDERWEIGHT = '저체중',
  NORMAL = '정상',
  OVERWEIGHT = '과체중',
  OBESE = '비만',
}

/**
 * BMI Calculation result interface
 */
export interface BMIResult {
  bmi: number;
  category: BMICategory;
  categoryRange: string;
}

/**
 * Calculate BMI (Body Mass Index) from height and weight
 *
 * @param heightInCm - Height in centimeters
 * @param weightInKg - Weight in kilograms
 * @returns BMI calculation result including value, category, and range
 * @throws Error if height or weight is invalid
 */
export function calculateBMI(heightInCm: number, weightInKg: number): BMIResult {
  // Input validation
  if (!isValidHeight(heightInCm)) {
    throw new Error('키는 50cm에서 300cm 사이여야 합니다.');
  }

  if (!isValidWeight(weightInKg)) {
    throw new Error('몸무게는 10kg에서 500kg 사이여야 합니다.');
  }

  // Convert height to meters
  const heightInMeters = heightInCm / 100;

  // Calculate BMI using the formula: weight (kg) / (height (m))^2
  const bmi = weightInKg / (heightInMeters * heightInMeters);

  // Determine category based on WHO Asia-Pacific guidelines
  const category = getBMICategory(bmi);
  const categoryRange = getCategoryRange(category);

  return {
    bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal place
    category,
    categoryRange,
  };
}

/**
 * Determine BMI category based on WHO Asia-Pacific guidelines
 *
 * @param bmi - BMI value
 * @returns BMI category
 */
export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) {
    return BMICategory.UNDERWEIGHT;
  } else if (bmi < 23) {
    return BMICategory.NORMAL;
  } else if (bmi < 25) {
    return BMICategory.OVERWEIGHT;
  } else {
    return BMICategory.OBESE;
  }
}

/**
 * Get the range description for a BMI category
 *
 * @param category - BMI category
 * @returns Range description string
 */
export function getCategoryRange(category: BMICategory): string {
  switch (category) {
    case BMICategory.UNDERWEIGHT:
      return '18.5 미만';
    case BMICategory.NORMAL:
      return '18.5 ~ 22.9';
    case BMICategory.OVERWEIGHT:
      return '23 ~ 24.9';
    case BMICategory.OBESE:
      return '25 이상';
  }
}

/**
 * Validate height input
 *
 * @param height - Height in centimeters
 * @returns true if valid, false otherwise
 */
export function isValidHeight(height: number): boolean {
  return !isNaN(height) && height > 50 && height < 300;
}

/**
 * Validate weight input
 *
 * @param weight - Weight in kilograms
 * @returns true if valid, false otherwise
 */
export function isValidWeight(weight: number): boolean {
  return !isNaN(weight) && weight > 10 && weight < 500;
}
