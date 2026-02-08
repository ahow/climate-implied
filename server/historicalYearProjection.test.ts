/**
 * Tests for Historical Year Projection Functionality
 * 
 * Verifies that the year selector "time travel" feature works correctly,
 * allowing users to view historical projections from 2015-2024.
 */

import { describe, it, expect } from 'vitest';
import { getFullProjectionForYear } from './historicalRecalculation';

describe('Historical Year Projection', () => {
  describe('getFullProjectionForYear', () => {
    it('should return null for years without historical data', () => {
      const result = getFullProjectionForYear(2010);
      expect(result).toBeNull();
      
      const result2025 = getFullProjectionForYear(2025);
      expect(result2025).toBeNull();
    });

    it('should return projection data for 2015', () => {
      const result = getFullProjectionForYear(2015);
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('temperatureRise');
      expect(result).toHaveProperty('reductionRate');
      expect(result).toHaveProperty('netZeroYear');
      expect(result).toHaveProperty('trajectory');
      expect(result).toHaveProperty('temperatureDistribution');
      expect(result).toHaveProperty('indicators');
    });

    it('should return projection data for 2020', () => {
      const result = getFullProjectionForYear(2020);
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('temperatureRise');
      expect(result).toHaveProperty('reductionRate');
      expect(result).toHaveProperty('netZeroYear');
      expect(result).toHaveProperty('trajectory');
      expect(result).toHaveProperty('temperatureDistribution');
      expect(result).toHaveProperty('indicators');
    });

    it('should return projection data for 2024', () => {
      const result = getFullProjectionForYear(2024);
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('temperatureRise');
      expect(result).toHaveProperty('reductionRate');
      expect(result).toHaveProperty('netZeroYear');
      expect(result).toHaveProperty('trajectory');
      expect(result).toHaveProperty('temperatureDistribution');
      expect(result).toHaveProperty('indicators');
    });

    it('should have valid temperature rise values', () => {
      const result2015 = getFullProjectionForYear(2015);
      const result2024 = getFullProjectionForYear(2024);
      
      expect(result2015?.temperatureRise).toBeGreaterThan(0);
      expect(result2015?.temperatureRise).toBeLessThan(10);
      
      expect(result2024?.temperatureRise).toBeGreaterThan(0);
      expect(result2024?.temperatureRise).toBeLessThan(10);
    });

    it('should have valid reduction rate values', () => {
      const result2015 = getFullProjectionForYear(2015);
      const result2024 = getFullProjectionForYear(2024);
      
      expect(result2015?.reductionRate).toBeGreaterThan(-10);
      expect(result2015?.reductionRate).toBeLessThan(20);
      
      expect(result2024?.reductionRate).toBeGreaterThan(-10);
      expect(result2024?.reductionRate).toBeLessThan(20);
    });

    it('should have trajectory data covering 2024-2100', () => {
      const result = getFullProjectionForYear(2020);
      
      expect(result?.trajectory).toBeDefined();
      expect(result?.trajectory.length).toBeGreaterThan(0);
      
      const firstYear = result?.trajectory[0]?.year;
      const lastYear = result?.trajectory[result.trajectory.length - 1]?.year;
      
      expect(firstYear).toBe(2020);
      expect(lastYear).toBe(2100);
    });

    it('should have temperature distribution data', () => {
      const result = getFullProjectionForYear(2020);
      
      expect(result?.temperatureDistribution).toBeDefined();
      expect(result?.temperatureDistribution.length).toBeGreaterThan(0);
      
      // Check that probabilities sum to approximately 1
      const totalProbability = result?.temperatureDistribution.reduce(
        (sum, point) => sum + point.probability,
        0
      );
      expect(totalProbability).toBeCloseTo(1.0, 1);
    });

    it('should show improving projections over time (2015 vs 2024)', () => {
      const result2015 = getFullProjectionForYear(2015);
      const result2024 = getFullProjectionForYear(2024);
      
      // 2024 should have better (lower) temperature rise than 2015 projection
      // due to improved renewable deployment, EV adoption, and policy coverage
      expect(result2024?.temperatureRise).toBeLessThan(result2015?.temperatureRise!);
    });

    it('should have valid indicator data', () => {
      const result = getFullProjectionForYear(2020);
      
      expect(result?.indicators).toBeDefined();
      expect(result?.indicators.renewableCapacityGW).toBeGreaterThan(0);
      expect(result?.indicators.evSalesShare).toBeGreaterThanOrEqual(0);
      expect(result?.indicators.policyCoveragePercent).toBeGreaterThan(0);
      expect(result?.indicators.globalGDP).toBeGreaterThan(0);
      expect(result?.indicators.carbonIntensity).toBeGreaterThan(0);
    });

    it('should have consistent data structure across all years', () => {
      const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
      
      years.forEach(year => {
        const result = getFullProjectionForYear(year);
        
        expect(result).not.toBeNull();
        expect(typeof result?.temperatureRise).toBe('number');
        expect(typeof result?.reductionRate).toBe('number');
        expect(Array.isArray(result?.trajectory)).toBe(true);
        expect(Array.isArray(result?.temperatureDistribution)).toBe(true);
        expect(typeof result?.indicators).toBe('object');
      });
    });
  });
});
