/**
 * Unit tests for category-specific projections
 */

import { describe, it, expect } from 'vitest';
import { calculateCategoryProjection, calculateAllCategoryProjections, type Category } from './categoryProjections';

describe('Category Projections', () => {
  describe('calculateCategoryProjection', () => {
    it('should calculate projection for technology category', () => {
      const result = calculateCategoryProjection('technology');
      
      expect(result.category).toBe('technology');
      expect(result.categoryName).toBe('Technology');
      expect(result.temperatureRise).toBeGreaterThan(0);
      expect(result.reductionRate).toBeGreaterThan(0);
      expect(result.trajectory).toHaveLength(77); // 2024-2100
      expect(result.temperatureDistribution.length).toBeGreaterThan(0);
    });
    
    it('should calculate projection for policy category', () => {
      const result = calculateCategoryProjection('policy');
      
      expect(result.category).toBe('policy');
      expect(result.categoryName).toBe('Policy');
      expect(result.temperatureRise).toBeGreaterThan(0);
      expect(result.reductionRate).toBeGreaterThan(0);
    });
    
    it('should calculate projection for corporate category', () => {
      const result = calculateCategoryProjection('corporate');
      
      expect(result.category).toBe('corporate');
      expect(result.categoryName).toBe('Corporate');
      expect(result.temperatureRise).toBeGreaterThan(0);
      expect(result.reductionRate).toBeGreaterThan(0);
    });
    
    it('should calculate projection for socioeconomic category', () => {
      const result = calculateCategoryProjection('socioeconomic');
      
      expect(result.category).toBe('socioeconomic');
      expect(result.categoryName).toBe('Socioeconomic');
      expect(result.temperatureRise).toBeGreaterThan(0);
      expect(result.reductionRate).toBeGreaterThan(0);
    });
    
    it('should return trajectory with all required fields', () => {
      const result = calculateCategoryProjection('technology');
      const firstPoint = result.trajectory[0];
      
      expect(firstPoint).toHaveProperty('year');
      expect(firstPoint).toHaveProperty('emissions');
      expect(firstPoint).toHaveProperty('p10');
      expect(firstPoint).toHaveProperty('p25');
      expect(firstPoint).toHaveProperty('p50');
      expect(firstPoint).toHaveProperty('p75');
      expect(firstPoint).toHaveProperty('p90');
      expect(firstPoint).toHaveProperty('cumulativeEmissions');
    });
    
    it('should show different outcomes for different categories', () => {
      const tech = calculateCategoryProjection('technology');
      const policy = calculateCategoryProjection('policy');
      const corporate = calculateCategoryProjection('corporate');
      const socio = calculateCategoryProjection('socioeconomic');
      
      // Categories should produce different temperature outcomes
      const temps = [tech.temperatureRise, policy.temperatureRise, corporate.temperatureRise, socio.temperatureRise];
      const uniqueTemps = new Set(temps);
      expect(uniqueTemps.size).toBeGreaterThan(1); // At least some variation
      
      // Categories should produce different reduction rates
      const rates = [tech.reductionRate, policy.reductionRate, corporate.reductionRate, socio.reductionRate];
      const uniqueRates = new Set(rates);
      expect(uniqueRates.size).toBeGreaterThan(1); // At least some variation
    });
  });
  
  describe('calculateAllCategoryProjections', () => {
    it('should calculate projections for all categories', async () => {
      const results = await calculateAllCategoryProjections();
      
      expect(results).toHaveLength(4);
      expect(results.map(r => r.category)).toEqual([
        'technology',
        'policy',
        'corporate',
        'socioeconomic',
      ]);
    });
    
    it('should return consistent data structure for all categories', async () => {
      const results = await calculateAllCategoryProjections();
      
      results.forEach((result) => {
        expect(result).toHaveProperty('category');
        expect(result).toHaveProperty('categoryName');
        expect(result).toHaveProperty('temperatureRise');
        expect(result).toHaveProperty('reductionRate');
        expect(result).toHaveProperty('netZeroYear');
        expect(result).toHaveProperty('trajectory');
        expect(result).toHaveProperty('temperatureDistribution');
      });
    });
  });
});
