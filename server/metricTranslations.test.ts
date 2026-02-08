import { describe, it, expect } from 'vitest';
import {
  calculateReductionRate,
  findNetZeroYear,
  calculateTemperatureRise,
  extractMetrics,
  formatReductionRate,
  formatTemperatureRise,
  formatNetZeroYear,
  interpretReductionRate,
  interpretTemperatureRise,
  interpretNetZeroYear,
} from './metricTranslations';
import type { ForwardProjection } from './forwardProjectionSectorSpecific';

describe('Metric Translations', () => {
  describe('calculateReductionRate', () => {
    it('should calculate reduction rate correctly for declining emissions', () => {
      const rate = calculateReductionRate(60.0, 54.0); // 10% decline over 10 years
      expect(rate).toBeCloseTo(1.0, 1); // ~1% per year
    });

    it('should return negative rate for increasing emissions', () => {
      const rate = calculateReductionRate(60.0, 66.0); // 10% increase
      expect(rate).toBeLessThan(0);
    });

    it('should return zero for stable emissions', () => {
      const rate = calculateReductionRate(60.0, 60.0);
      expect(rate).toBeCloseTo(0, 1);
    });

    it('should handle rapid decarbonization', () => {
      const rate = calculateReductionRate(60.0, 30.0); // 50% decline
      expect(rate).toBeGreaterThan(5); // >5% per year
    });
  });

  describe('findNetZeroYear', () => {
    it('should find year when emissions reach threshold', () => {
      const trajectory: ForwardProjection[] = [
        { year: 2024, emissions: 60, p50: 60, p10: 55, p25: 57, p75: 63, p90: 65, cumulativeEmissions: 60 },
        { year: 2030, emissions: 40, p50: 40, p10: 35, p25: 37, p75: 43, p90: 45, cumulativeEmissions: 300 },
        { year: 2040, emissions: 20, p50: 20, p10: 15, p25: 17, p75: 23, p90: 25, cumulativeEmissions: 600 },
        { year: 2050, emissions: 4, p50: 4, p10: 2, p25: 3, p75: 5, p90: 6, cumulativeEmissions: 900 },
      ];

      const netZeroYear = findNetZeroYear(trajectory, 5.0);
      expect(netZeroYear).toBe(2050);
    });

    it('should return null if never reaches threshold', () => {
      const trajectory: ForwardProjection[] = [
        { year: 2024, emissions: 60, p50: 60, p10: 55, p25: 57, p75: 63, p90: 65, cumulativeEmissions: 60 },
        { year: 2100, emissions: 30, p50: 30, p10: 25, p25: 27, p75: 33, p90: 35, cumulativeEmissions: 3000 },
      ];

      const netZeroYear = findNetZeroYear(trajectory, 5.0);
      expect(netZeroYear).toBeNull();
    });

    it('should use custom threshold', () => {
      const trajectory: ForwardProjection[] = [
        { year: 2024, emissions: 60, p50: 60, p10: 55, p25: 57, p75: 63, p90: 65, cumulativeEmissions: 60 },
        { year: 2050, emissions: 8, p50: 8, p10: 6, p25: 7, p75: 9, p90: 10, cumulativeEmissions: 900 },
      ];

      const netZeroYear = findNetZeroYear(trajectory, 10.0);
      expect(netZeroYear).toBe(2050);
    });
  });

  describe('calculateTemperatureRise', () => {
    it('should calculate temperature using IPCC TCRE', () => {
      // 1000 GtCO2 should add 0.45°C to baseline 1.1°C
      const temp = calculateTemperatureRise(1000, 1.0);
      expect(temp).toBeCloseTo(1.55, 1); // 1.1 + 0.45
    });

    it('should account for climate sensitivity', () => {
      const tempLow = calculateTemperatureRise(1000, 0.8);
      const tempHigh = calculateTemperatureRise(1000, 1.2);
      
      expect(tempLow).toBeLessThan(tempHigh);
      expect(tempLow).toBeCloseTo(1.46, 1); // 1.1 + (0.45 * 0.8)
      expect(tempHigh).toBeCloseTo(1.64, 1); // 1.1 + (0.45 * 1.2)
    });

    it('should handle zero emissions', () => {
      const temp = calculateTemperatureRise(0, 1.0);
      expect(temp).toBeCloseTo(1.1, 1); // Just baseline
    });

    it('should match IPCC SSP scenarios approximately', () => {
      // SSP2-4.5: ~2000 GtCO2 cumulative → ~2.0-2.5°C
      const temp = calculateTemperatureRise(2000, 1.0);
      expect(temp).toBeGreaterThan(1.8);
      expect(temp).toBeLessThan(2.2);
    });
  });

  describe('extractMetrics', () => {
    it('should extract all three metrics from trajectory', () => {
      const trajectory: ForwardProjection[] = [
        { year: 2024, emissions: 60, p50: 60, p10: 55, p25: 57, p75: 63, p90: 65, cumulativeEmissions: 60 },
        { year: 2034, emissions: 54, p50: 54, p10: 50, p25: 52, p75: 56, p90: 58, cumulativeEmissions: 570 },
        { year: 2050, emissions: 4, p50: 4, p10: 2, p25: 3, p75: 5, p90: 6, cumulativeEmissions: 1200 },
        { year: 2100, emissions: 1, p50: 1, p10: 0.5, p25: 0.8, p75: 1.2, p90: 1.5, cumulativeEmissions: 2000 },
      ];

      const metrics = extractMetrics(trajectory);

      expect(metrics.reductionRate).toBeGreaterThan(0);
      expect(metrics.temperatureRise).toBeGreaterThan(1.1);
      expect(metrics.netZeroYear).toBe(2050);
      expect(metrics.emissions2024).toBe(60);
      expect(metrics.emissions2034).toBe(54);
      expect(metrics.emissions2100).toBe(1);
      expect(metrics.cumulativeEmissions).toBe(2000);
    });

    it('should throw error if required years missing', () => {
      const trajectory: ForwardProjection[] = [
        { year: 2024, emissions: 60, p50: 60, p10: 55, p25: 57, p75: 63, p90: 65, cumulativeEmissions: 60 },
      ];

      expect(() => extractMetrics(trajectory)).toThrow();
    });
  });

  describe('formatReductionRate', () => {
    it('should format reduction rate with one decimal', () => {
      expect(formatReductionRate(3.456)).toBe('3.5% per year');
      expect(formatReductionRate(7.0)).toBe('7.0% per year');
      expect(formatReductionRate(0.8)).toBe('0.8% per year');
    });
  });

  describe('formatTemperatureRise', () => {
    it('should format temperature with one decimal', () => {
      expect(formatTemperatureRise(2.456)).toBe('2.5°C above pre-industrial');
      expect(formatTemperatureRise(1.5)).toBe('1.5°C above pre-industrial');
    });
  });

  describe('formatNetZeroYear', () => {
    it('should format year as string', () => {
      expect(formatNetZeroYear(2050)).toBe('2050');
      expect(formatNetZeroYear(2070)).toBe('2070');
    });

    it('should handle null (never reaches net-zero)', () => {
      expect(formatNetZeroYear(null)).toBe('Never (emissions remain >5 Gt)');
    });
  });

  describe('interpretReductionRate', () => {
    it('should classify rapid decarbonization', () => {
      const result = interpretReductionRate(7.5);
      expect(result.label).toBe('Rapid Decarbonization');
      expect(result.color).toBe('green');
    });

    it('should classify strong progress', () => {
      const result = interpretReductionRate(5.5);
      expect(result.label).toBe('Strong Progress');
      expect(result.color).toBe('blue');
    });

    it('should classify moderate progress', () => {
      const result = interpretReductionRate(3.5);
      expect(result.label).toBe('Moderate Progress');
      expect(result.color).toBe('yellow');
    });

    it('should classify slow progress', () => {
      const result = interpretReductionRate(1.5);
      expect(result.label).toBe('Slow Progress');
      expect(result.color).toBe('orange');
    });

    it('should classify insufficient action', () => {
      const result = interpretReductionRate(0.5);
      expect(result.label).toBe('Insufficient Action');
      expect(result.color).toBe('red');
    });
  });

  describe('interpretTemperatureRise', () => {
    it('should classify 1.5°C goal', () => {
      const result = interpretTemperatureRise(1.5);
      expect(result.label).toBe('Paris Agreement 1.5°C Goal');
      expect(result.color).toBe('green');
    });

    it('should classify 2°C limit', () => {
      const result = interpretTemperatureRise(1.8);
      expect(result.label).toBe('Paris Agreement 2°C Limit');
      expect(result.color).toBe('blue');
    });

    it('should classify moderate warming', () => {
      const result = interpretTemperatureRise(2.3);
      expect(result.label).toBe('Moderate Warming');
      expect(result.color).toBe('yellow');
    });

    it('should classify high warming', () => {
      const result = interpretTemperatureRise(2.8);
      expect(result.label).toBe('High Warming');
      expect(result.color).toBe('orange');
    });

    it('should classify dangerous warming', () => {
      const result = interpretTemperatureRise(3.5);
      expect(result.label).toBe('Dangerous Warming');
      expect(result.color).toBe('red');
    });
  });

  describe('interpretNetZeroYear', () => {
    it('should classify early net-zero', () => {
      const result = interpretNetZeroYear(2045);
      expect(result.label).toBe('Early Net-Zero');
      expect(result.color).toBe('green');
    });

    it('should classify mid-century net-zero', () => {
      const result = interpretNetZeroYear(2060);
      expect(result.label).toBe('Mid-Century Net-Zero');
      expect(result.color).toBe('blue');
    });

    it('should classify late net-zero', () => {
      const result = interpretNetZeroYear(2080);
      expect(result.label).toBe('Late Net-Zero');
      expect(result.color).toBe('yellow');
    });

    it('should classify very late net-zero', () => {
      const result = interpretNetZeroYear(2095);
      expect(result.label).toBe('Very Late Net-Zero');
      expect(result.color).toBe('orange');
    });

    it('should classify never reaching net-zero', () => {
      const result = interpretNetZeroYear(null);
      expect(result.label).toBe('No Net-Zero');
      expect(result.color).toBe('red');
    });
  });

  describe('Integration: Real-world scenarios', () => {
    it('should produce consistent metrics for 1.5°C pathway', () => {
      // Rapid decarbonization: 60 Gt → 30 Gt by 2034, net-zero by 2050
      const trajectory: ForwardProjection[] = [
        { year: 2024, emissions: 60, p50: 60, p10: 55, p25: 57, p75: 63, p90: 65, cumulativeEmissions: 60 },
        { year: 2034, emissions: 30, p50: 30, p10: 28, p25: 29, p75: 31, p90: 32, cumulativeEmissions: 450 },
        { year: 2050, emissions: 3, p50: 3, p10: 2, p25: 2.5, p75: 3.5, p90: 4, cumulativeEmissions: 900 },
        { year: 2100, emissions: 0, p50: 0, p10: 0, p25: 0, p75: 0, p90: 0, cumulativeEmissions: 1000 },
      ];

      const metrics = extractMetrics(trajectory);

      expect(metrics.reductionRate).toBeGreaterThan(5); // Strong/Rapid
      expect(metrics.temperatureRise).toBeLessThan(1.7); // Close to 1.5°C
      expect(metrics.netZeroYear).toBe(2050);
      // Reduction rate should be classified as strong progress or rapid
      const interpretation = interpretReductionRate(metrics.reductionRate);
      expect(['Rapid Decarbonization', 'Strong Progress']).toContain(interpretation.label);
      expect(interpretTemperatureRise(metrics.temperatureRise).color).toMatch(/green|blue/);
    });

    it('should produce consistent metrics for current policies (3°C pathway)', () => {
      // Slow decline: 60 Gt → 55 Gt by 2034, never reaches net-zero
      const trajectory: ForwardProjection[] = [
        { year: 2024, emissions: 60, p50: 60, p10: 55, p25: 57, p75: 63, p90: 65, cumulativeEmissions: 60 },
        { year: 2034, emissions: 55, p50: 55, p10: 52, p25: 53, p75: 57, p90: 59, cumulativeEmissions: 575 },
        { year: 2050, emissions: 45, p50: 45, p10: 42, p25: 43, p75: 47, p90: 49, cumulativeEmissions: 1300 },
        { year: 2100, emissions: 25, p50: 25, p10: 22, p25: 23, p75: 27, p90: 29, cumulativeEmissions: 3500 },
      ];

      const metrics = extractMetrics(trajectory);

      expect(metrics.reductionRate).toBeLessThan(1.5); // Slow
      expect(metrics.temperatureRise).toBeGreaterThan(2.5); // High warming
      expect(metrics.netZeroYear).toBeNull();
      expect(interpretReductionRate(metrics.reductionRate).color).toMatch(/orange|red/);
      expect(interpretTemperatureRise(metrics.temperatureRise).color).toMatch(/orange|red/);
    });
  });
});
