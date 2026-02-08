import { describe, it, expect } from 'vitest';
import { calculateCategoryProjection } from './categoryProjections.js';

describe('Temperature Precision and Category Projection Tests', () => {
  describe('Category Projection Data Consistency', () => {
    it('should have consistent temperature values between metric and distribution for Corporate category', () => {
      const result = calculateCategoryProjection('corporate', 2024);
      
      // Calculate median from distribution
      const sortedTemps = [...result.temperatureDistribution].sort((a, b) => a.temperature - b.temperature);
      const medianFromDist = sortedTemps[Math.floor(sortedTemps.length * 0.5)]?.temperature;
      
      // The temperatureRise should match the median from distribution
      expect(result.temperatureRise).toBe(medianFromDist);
      
      // Temperature should be reasonable (not 23.45°C!)
      expect(result.temperatureRise).toBeGreaterThan(1.5);
      expect(result.temperatureRise).toBeLessThan(5.0);
    });
    
    it('should have consistent temperature values for all categories', () => {
      const categories = ['technology', 'policy', 'corporate', 'socioeconomic'] as const;
      
      categories.forEach(category => {
        const result = calculateCategoryProjection(category, 2024);
        
        // Calculate median from distribution
        const sortedTemps = [...result.temperatureDistribution].sort((a, b) => a.temperature - b.temperature);
        const medianFromDist = sortedTemps[Math.floor(sortedTemps.length * 0.5)]?.temperature;
        
        // The temperatureRise should match the median from distribution
        expect(result.temperatureRise).toBe(medianFromDist);
        
        // Temperature should be reasonable
        expect(result.temperatureRise).toBeGreaterThan(1.5);
        expect(result.temperatureRise).toBeLessThan(5.0);
        
        // Should have 2 decimal precision
        const tempStr = result.temperatureRise.toString();
        const decimalPart = tempStr.split('.')[1];
        if (decimalPart) {
          expect(decimalPart.length).toBeLessThanOrEqual(2);
        }
      });
    });
    
    it('should return different values for different categories', () => {
      const corporate = calculateCategoryProjection('corporate', 2024);
      const technology = calculateCategoryProjection('technology', 2024);
      const policy = calculateCategoryProjection('policy', 2024);
      
      // Different categories should have different values
      expect(corporate.temperatureRise).not.toBe(technology.temperatureRise);
      expect(corporate.temperatureRise).not.toBe(policy.temperatureRise);
      expect(technology.temperatureRise).not.toBe(policy.temperatureRise);
    });
    
    it('should have temperature distribution with 2 decimal precision', () => {
      const result = calculateCategoryProjection('corporate', 2024);
      
      // Check that temperature distribution has values
      expect(result.temperatureDistribution.length).toBeGreaterThan(0);
      
      // Check a sample of temperatures have 2 decimal places
      const sampleTemps = result.temperatureDistribution.slice(0, 20);
      sampleTemps.forEach(item => {
        const tempStr = item.temperature.toString();
        const decimalPart = tempStr.split('.')[1];
        
        // Should have exactly 2 decimal places or be a whole number
        if (decimalPart) {
          expect(decimalPart.length).toBeLessThanOrEqual(2);
        }
        
        // Temperature should be a reasonable value (not NaN or Infinity)
        expect(item.temperature).toBeGreaterThan(0);
        expect(item.temperature).toBeLessThan(10);
        expect(Number.isFinite(item.temperature)).toBe(true);
      });
    });
  });
});
