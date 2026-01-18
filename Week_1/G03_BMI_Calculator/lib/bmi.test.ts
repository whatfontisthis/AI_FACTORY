import { describe, it, expect } from '@jest/globals';
import {
  calculateBMI,
  getBMICategory,
  getCategoryRange,
  isValidHeight,
  isValidWeight,
  BMICategory,
} from './bmi';

describe('BMI Calculation', () => {
  describe('calculateBMI', () => {
    it('should calculate BMI correctly for normal values', () => {
      const result = calculateBMI(170, 65);
      expect(result.bmi).toBe(22.5);
      expect(result.category).toBe(BMICategory.NORMAL);
    });

    it('should calculate BMI for underweight case', () => {
      const result = calculateBMI(170, 50);
      expect(result.bmi).toBe(17.3);
      expect(result.category).toBe(BMICategory.UNDERWEIGHT);
    });

    it('should calculate BMI for overweight case', () => {
      const result = calculateBMI(170, 70);
      expect(result.bmi).toBe(24.2);
      expect(result.category).toBe(BMICategory.OVERWEIGHT);
    });

    it('should calculate BMI for obese case', () => {
      const result = calculateBMI(170, 75);
      expect(result.bmi).toBe(25.9);
      expect(result.category).toBe(BMICategory.OBESE);
    });

    it('should round BMI to 1 decimal place', () => {
      const result = calculateBMI(175, 68);
      expect(result.bmi).toBe(22.2);
      expect(result.bmi.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
    });

    it('should throw error for invalid height (too low)', () => {
      expect(() => calculateBMI(30, 65)).toThrow('키는 50cm에서 300cm 사이여야 합니다.');
    });

    it('should throw error for invalid height (too high)', () => {
      expect(() => calculateBMI(350, 65)).toThrow('키는 50cm에서 300cm 사이여야 합니다.');
    });

    it('should throw error for invalid weight (too low)', () => {
      expect(() => calculateBMI(170, 5)).toThrow('몸무게는 10kg에서 500kg 사이여야 합니다.');
    });

    it('should throw error for invalid weight (too high)', () => {
      expect(() => calculateBMI(170, 600)).toThrow('몸무게는 10kg에서 500kg 사이여야 합니다.');
    });

    it('should include category range in result', () => {
      const result = calculateBMI(170, 65);
      expect(result.categoryRange).toBe('18.5 ~ 22.9');
    });
  });

  describe('getBMICategory', () => {
    it('should return UNDERWEIGHT for BMI < 18.5', () => {
      expect(getBMICategory(18.0)).toBe(BMICategory.UNDERWEIGHT);
      expect(getBMICategory(15.0)).toBe(BMICategory.UNDERWEIGHT);
    });

    it('should return NORMAL for BMI 18.5 - 22.9', () => {
      expect(getBMICategory(18.5)).toBe(BMICategory.NORMAL);
      expect(getBMICategory(20.0)).toBe(BMICategory.NORMAL);
      expect(getBMICategory(22.9)).toBe(BMICategory.NORMAL);
    });

    it('should return OVERWEIGHT for BMI 23 - 24.9', () => {
      expect(getBMICategory(23.0)).toBe(BMICategory.OVERWEIGHT);
      expect(getBMICategory(24.0)).toBe(BMICategory.OVERWEIGHT);
      expect(getBMICategory(24.9)).toBe(BMICategory.OVERWEIGHT);
    });

    it('should return OBESE for BMI >= 25', () => {
      expect(getBMICategory(25.0)).toBe(BMICategory.OBESE);
      expect(getBMICategory(30.0)).toBe(BMICategory.OBESE);
      expect(getBMICategory(35.0)).toBe(BMICategory.OBESE);
    });

    it('should handle boundary values correctly', () => {
      expect(getBMICategory(18.49)).toBe(BMICategory.UNDERWEIGHT);
      expect(getBMICategory(18.5)).toBe(BMICategory.NORMAL);
      expect(getBMICategory(22.99)).toBe(BMICategory.NORMAL);
      expect(getBMICategory(23.0)).toBe(BMICategory.OVERWEIGHT);
      expect(getBMICategory(24.99)).toBe(BMICategory.OVERWEIGHT);
      expect(getBMICategory(25.0)).toBe(BMICategory.OBESE);
    });
  });

  describe('getCategoryRange', () => {
    it('should return correct range for UNDERWEIGHT', () => {
      expect(getCategoryRange(BMICategory.UNDERWEIGHT)).toBe('18.5 미만');
    });

    it('should return correct range for NORMAL', () => {
      expect(getCategoryRange(BMICategory.NORMAL)).toBe('18.5 ~ 22.9');
    });

    it('should return correct range for OVERWEIGHT', () => {
      expect(getCategoryRange(BMICategory.OVERWEIGHT)).toBe('23 ~ 24.9');
    });

    it('should return correct range for OBESE', () => {
      expect(getCategoryRange(BMICategory.OBESE)).toBe('25 이상');
    });
  });

  describe('isValidHeight', () => {
    it('should return true for valid heights', () => {
      expect(isValidHeight(100)).toBe(true);
      expect(isValidHeight(170)).toBe(true);
      expect(isValidHeight(200)).toBe(true);
    });

    it('should return false for heights below minimum', () => {
      expect(isValidHeight(50)).toBe(false);
      expect(isValidHeight(30)).toBe(false);
    });

    it('should return false for heights above maximum', () => {
      expect(isValidHeight(300)).toBe(false);
      expect(isValidHeight(350)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isValidHeight(NaN)).toBe(false);
    });

    it('should handle boundary values', () => {
      expect(isValidHeight(50)).toBe(false);
      expect(isValidHeight(51)).toBe(true);
      expect(isValidHeight(299)).toBe(true);
      expect(isValidHeight(300)).toBe(false);
    });
  });

  describe('isValidWeight', () => {
    it('should return true for valid weights', () => {
      expect(isValidWeight(50)).toBe(true);
      expect(isValidWeight(70)).toBe(true);
      expect(isValidWeight(100)).toBe(true);
    });

    it('should return false for weights below minimum', () => {
      expect(isValidWeight(10)).toBe(false);
      expect(isValidWeight(5)).toBe(false);
    });

    it('should return false for weights above maximum', () => {
      expect(isValidWeight(500)).toBe(false);
      expect(isValidWeight(600)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isValidWeight(NaN)).toBe(false);
    });

    it('should handle boundary values', () => {
      expect(isValidWeight(10)).toBe(false);
      expect(isValidWeight(11)).toBe(true);
      expect(isValidWeight(499)).toBe(true);
      expect(isValidWeight(500)).toBe(false);
    });
  });
});
