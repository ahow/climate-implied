/**
 * Metric Translation Module
 * 
 * Translates between three key decarbonization metrics:
 * 1. Emissions Reduction Rate (% per year over next decade)
 * 2. Temperature Rise (°C above pre-industrial by 2100)
 * 3. Net-Zero Year (year when emissions reach ≤5 Gt CO2e)
 */

import { ForwardProjection } from './forwardProjectionSectorSpecific';

/**
 * Metric translation result
 */
export interface MetricTranslation {
  // Primary metrics
  reductionRate: number;          // % per year (2024-2034)
  temperatureRise: number;         // °C above pre-industrial by 2100
  netZeroYear: number | null;      // Year emissions reach ≤5 Gt (null if never)
  
  // Supporting data
  emissions2024: number;           // Gt CO2e
  emissions2034: number;           // Gt CO2e
  emissions2100: number;           // Gt CO2e
  cumulativeEmissions: number;     // Gt CO2e (2024-2100)
  
  // Trajectory data for visualization
  trajectory: ForwardProjection[];
}

/**
 * Calculate 10-year emissions reduction rate
 */
export function calculateReductionRate(
  emissions2024: number,
  emissions2034: number
): number {
  // Calculate compound annual growth rate (CAGR)
  // Negative CAGR = reduction rate
  const years = 10;
  const cagr = (Math.pow(emissions2034 / emissions2024, 1 / years) - 1) * 100;
  return -cagr; // Return as positive reduction rate
}

/**
 * Find year when emissions reach net-zero threshold (≤5 Gt)
 * Extrapolates beyond trajectory end if needed
 */
export function findNetZeroYear(
  trajectory: ForwardProjection[],
  threshold: number = 5.0
): number | null {
  // Check if net-zero is reached within trajectory
  for (const point of trajectory) {
    if (point.p50 <= threshold) {
      return point.year;
    }
  }
  
  // Extrapolate beyond trajectory end
  if (trajectory.length > 0) {
    const finalPoint = trajectory[trajectory.length - 1];
    const firstPoint = trajectory[0];
    
    if (finalPoint.p50 > threshold) {
      // Calculate average annual reduction
      const yearsElapsed = finalPoint.year - firstPoint.year;
      const totalReduction = firstPoint.p50 - finalPoint.p50;
      const avgAnnualReduction = totalReduction / yearsElapsed;
      
      if (avgAnnualReduction > 0) {
        // Extrapolate linearly
        const yearsToNetZero = (finalPoint.p50 - threshold) / avgAnnualReduction;
        return Math.round(finalPoint.year + yearsToNetZero);
      }
    }
  }
  
  return null; // Never reaches net-zero (emissions increasing or flat)
}

/**
 * Calculate temperature rise from cumulative emissions using IPCC TCRE
 */
export function calculateTemperatureRise(
  cumulativeEmissions: number,
  climateSensitivity: number = 1.0
): number {
  // IPCC AR6 TCRE: 0.45°C per 1000 GtCO2
  const TCRE = 0.00045; // °C per GtCO2
  const baselineWarming = 1.1; // °C already observed (2024)
  
  const additionalWarming = cumulativeEmissions * TCRE * climateSensitivity;
  return baselineWarming + additionalWarming;
}

/**
 * Extract all three metrics from emissions trajectory
 */
export function extractMetrics(
  trajectory: ForwardProjection[]
): MetricTranslation {
  // Find key years
  const point2024 = trajectory.find(p => p.year === 2024);
  const point2034 = trajectory.find(p => p.year === 2034);
  const point2100 = trajectory.find(p => p.year === 2100);
  
  if (!point2024 || !point2034 || !point2100) {
    throw new Error('Trajectory must include years 2024, 2034, and 2100');
  }
  
  // Calculate metrics
  const reductionRate = calculateReductionRate(point2024.p50, point2034.p50);
  const netZeroYear = findNetZeroYear(trajectory);
  const temperatureRise = calculateTemperatureRise(point2100.cumulativeEmissions);
  
  return {
    reductionRate,
    temperatureRise,
    netZeroYear,
    emissions2024: point2024.p50,
    emissions2034: point2034.p50,
    emissions2100: point2100.p50,
    cumulativeEmissions: point2100.cumulativeEmissions,
    trajectory,
  };
}

/**
 * Format reduction rate for display
 */
export function formatReductionRate(rate: number): string {
  return `${rate.toFixed(2)}% per year`;
}

/**
 * Format temperature rise for display
 */
export function formatTemperatureRise(temp: number): string {
  return `${temp.toFixed(2)}°C above pre-industrial`;
}

/**
 * Format net-zero year for display
 */
export function formatNetZeroYear(year: number | null): string {
  if (year === null) {
    return 'Never (emissions remain >5 Gt)';
  }
  return `${year}`;
}

/**
 * Interpret reduction rate (qualitative assessment)
 */
export function interpretReductionRate(rate: number): {
  label: string;
  description: string;
  color: string;
} {
  if (rate >= 7.0) {
    return {
      label: 'Rapid Decarbonization',
      description: 'On track for 1.5°C pathway',
      color: 'green',
    };
  } else if (rate >= 5.0) {
    return {
      label: 'Strong Progress',
      description: 'Approaching 2°C pathway',
      color: 'blue',
    };
  } else if (rate >= 3.0) {
    return {
      label: 'Moderate Progress',
      description: 'Consistent with 2.5°C pathway',
      color: 'yellow',
    };
  } else if (rate >= 1.0) {
    return {
      label: 'Slow Progress',
      description: 'Heading toward 3°C+ warming',
      color: 'orange',
    };
  } else {
    return {
      label: 'Insufficient Action',
      description: 'Emissions declining too slowly',
      color: 'red',
    };
  }
}

/**
 * Interpret temperature rise (qualitative assessment)
 */
export function interpretTemperatureRise(temp: number): {
  label: string;
  description: string;
  color: string;
} {
  if (temp <= 1.5) {
    return {
      label: 'Paris Agreement 1.5°C Goal',
      description: 'Limiting warming to 1.5°C',
      color: 'green',
    };
  } else if (temp <= 2.0) {
    return {
      label: 'Paris Agreement 2°C Limit',
      description: 'Well below 2°C warming',
      color: 'blue',
    };
  } else if (temp <= 2.5) {
    return {
      label: 'Moderate Warming',
      description: 'Significant climate impacts',
      color: 'yellow',
    };
  } else if (temp <= 3.0) {
    return {
      label: 'High Warming',
      description: 'Severe climate impacts',
      color: 'orange',
    };
  } else {
    return {
      label: 'Dangerous Warming',
      description: 'Catastrophic climate impacts',
      color: 'red',
    };
  }
}

/**
 * Interpret net-zero year (qualitative assessment)
 */
export function interpretNetZeroYear(year: number | null): {
  label: string;
  description: string;
  color: string;
} {
  if (year === null) {
    return {
      label: 'No Net-Zero',
      description: 'Emissions never reach near-zero',
      color: 'red',
    };
  } else if (year <= 2050) {
    return {
      label: 'Early Net-Zero',
      description: 'Aligned with 1.5°C pathway',
      color: 'green',
    };
  } else if (year <= 2070) {
    return {
      label: 'Mid-Century Net-Zero',
      description: 'Consistent with 2°C pathway',
      color: 'blue',
    };
  } else if (year <= 2090) {
    return {
      label: 'Late Net-Zero',
      description: 'Delayed climate action',
      color: 'yellow',
    };
  } else {
    return {
      label: 'Very Late Net-Zero',
      description: 'Insufficient near-term action',
      color: 'orange',
    };
  }
}

/**
 * Calculate required reduction rate to achieve target temperature
 */
export function calculateRequiredReductionRate(
  currentEmissions: number,
  targetTemperature: number,
  years: number = 76 // 2024-2100
): number {
  // Work backwards from temperature to cumulative emissions
  const TCRE = 0.00045;
  const baselineWarming = 1.1;
  const allowedWarming = targetTemperature - baselineWarming;
  const allowedCumulativeEmissions = allowedWarming / TCRE;
  
  // Assume exponential decay: E(t) = E0 * exp(-r*t)
  // Cumulative = E0 * (1 - exp(-r*T)) / r
  // For small r, approximate: Cumulative ≈ E0 * T * (1 - r*T/2)
  
  // Simplified: assume linear decline for estimation
  const averageEmissions = allowedCumulativeEmissions / years;
  const finalEmissions = averageEmissions * 0.5; // Rough estimate
  
  // Calculate CAGR
  const cagr = (Math.pow(finalEmissions / currentEmissions, 1 / 10) - 1) * 100;
  return -cagr;
}

/**
 * Calculate required net-zero year to achieve target temperature
 */
export function calculateRequiredNetZeroYear(
  currentEmissions: number,
  targetTemperature: number
): number {
  // Work backwards from temperature to cumulative emissions
  const TCRE = 0.00045;
  const baselineWarming = 1.1;
  const allowedWarming = targetTemperature - baselineWarming;
  const allowedCumulativeEmissions = allowedWarming / TCRE;
  
  // Assume exponential decay to 5 Gt threshold
  // E(t) = E0 * exp(-r*t) = 5
  // Solve for t when cumulative reaches budget
  
  // Simplified: assume we need to reach net-zero when cumulative is ~80% of budget
  const netZeroThreshold = allowedCumulativeEmissions * 0.8;
  const averageEmissions = (currentEmissions + 5) / 2;
  const yearsToNetZero = netZeroThreshold / averageEmissions;
  
  return Math.round(2024 + yearsToNetZero);
}
