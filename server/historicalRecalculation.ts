/**
 * Historical Trend Recalculation
 * 
 * Recalculates historical projections using the current sector-specific model
 * with validated weights applied to historical indicator values.
 * 
 * This ensures consistency between current and historical projections.
 */

import {
  calculateEmissionsTrajectory,
  calculateTemperatureDistribution,
  type IndicatorData,
  type ForwardProjection,
} from './forwardProjectionSectorSpecific';
import { getAllHistoricalIndicators } from './historicalIndicators';

/**
 * Convert historical indicator data to IndicatorData format
 */
function convertToIndicatorData(historicalData: ReturnType<typeof getAllHistoricalIndicators>[number]): IndicatorData {
  return {
    renewableCapacityGW: historicalData.renewableCapacityGW,
    renewableGrowthRate: historicalData.renewableGrowthRate * 100, // Convert to percentage
    renewableAcceleration: 1.0, // Estimated
    evSalesShare: historicalData.evSalesSharePct,
    evGrowthRate: historicalData.evGrowthRate * 100, // Convert to percentage
    policyCoveragePercent: historicalData.policyCoveragePct,
    policyImplementationRate: historicalData.policyImplementationRate,
    netZeroTargetsCoverage: historicalData.policyCoveragePct * 0.9, // Estimated from policy coverage
    globalGDP: historicalData.gdpTrillionUSD,
    carbonIntensity: historicalData.carbonIntensityKgPerGDP,
    carbonIntensityDeclineRate: 2.5, // Estimated average
    sbtiCompaniesPercent: historicalData.corporateTargetsPct,
    corporateImplementationRate: historicalData.corporateImplementationRate,
  };
}

/**
 * Get historical indicators with real data from authoritative sources
 */
function getHistoricalIndicatorSnapshots(): Array<{ year: number; indicators: IndicatorData }> {
  const historicalData = getAllHistoricalIndicators();
  return historicalData.map((data) => ({
    year: data.year,
    indicators: convertToIndicatorData(data),
  }));
}

// Legacy hardcoded data (replaced by real data above)
const HISTORICAL_INDICATORS_LEGACY: Array<{ year: number; indicators: IndicatorData }> = [
  {
    year: 2015,
    indicators: {
      renewableCapacityGW: 1985,
      renewableGrowthRate: 8.3,
      renewableAcceleration: 0.8,
      evSalesShare: 0.6,
      evGrowthRate: 60.0,
      policyCoveragePercent: 55,
      policyImplementationRate: 0.52,
      netZeroTargetsCoverage: 12,
      globalGDP: 75,
      carbonIntensity: 0.42,
      carbonIntensityDeclineRate: 2.1,
      sbtiCompaniesPercent: 5,
      corporateImplementationRate: 0.45,
    },
  },
  {
    year: 2016,
    indicators: {
      renewableCapacityGW: 2152,
      renewableGrowthRate: 8.4,
      renewableAcceleration: 0.9,
      evSalesShare: 0.9,
      evGrowthRate: 55.0,
      policyCoveragePercent: 58,
      policyImplementationRate: 0.53,
      netZeroTargetsCoverage: 15,
      globalGDP: 76,
      carbonIntensity: 0.41,
      carbonIntensityDeclineRate: 2.2,
      sbtiCompaniesPercent: 8,
      corporateImplementationRate: 0.48,
    },
  },
  {
    year: 2017,
    indicators: {
      renewableCapacityGW: 2334,
      renewableGrowthRate: 8.5,
      renewableAcceleration: 0.9,
      evSalesShare: 1.3,
      evGrowthRate: 54.0,
      policyCoveragePercent: 60,
      policyImplementationRate: 0.54,
      netZeroTargetsCoverage: 18,
      globalGDP: 81,
      carbonIntensity: 0.40,
      carbonIntensityDeclineRate: 2.2,
      sbtiCompaniesPercent: 10,
      corporateImplementationRate: 0.50,
    },
  },
  {
    year: 2018,
    indicators: {
      renewableCapacityGW: 2537,
      renewableGrowthRate: 8.6,
      renewableAcceleration: 1.0,
      evSalesShare: 2.1,
      evGrowthRate: 65.0,
      policyCoveragePercent: 63,
      policyImplementationRate: 0.55,
      netZeroTargetsCoverage: 22,
      globalGDP: 86,
      carbonIntensity: 0.39,
      carbonIntensityDeclineRate: 2.2,
      sbtiCompaniesPercent: 12,
      corporateImplementationRate: 0.52,
    },
  },
  {
    year: 2019,
    indicators: {
      renewableCapacityGW: 2756,
      renewableGrowthRate: 8.8,
      renewableAcceleration: 1.0,
      evSalesShare: 2.5,
      evGrowthRate: 40.0,
      policyCoveragePercent: 67,
      policyImplementationRate: 0.56,
      netZeroTargetsCoverage: 28,
      globalGDP: 88,
      carbonIntensity: 0.38,
      carbonIntensityDeclineRate: 2.3,
      sbtiCompaniesPercent: 15,
      corporateImplementationRate: 0.55,
    },
  },
  {
    year: 2020,
    indicators: {
      renewableCapacityGW: 2838,
      renewableGrowthRate: 9.0,
      renewableAcceleration: 1.1,
      evSalesShare: 4.2,
      evGrowthRate: 43.0,
      policyCoveragePercent: 70,
      policyImplementationRate: 0.58,
      netZeroTargetsCoverage: 35,
      globalGDP: 84,
      carbonIntensity: 0.37,
      carbonIntensityDeclineRate: 2.4,
      sbtiCompaniesPercent: 18,
      corporateImplementationRate: 0.58,
    },
  },
  {
    year: 2021,
    indicators: {
      renewableCapacityGW: 3064,
      renewableGrowthRate: 9.2,
      renewableAcceleration: 1.1,
      evSalesShare: 8.3,
      evGrowthRate: 108.0,
      policyCoveragePercent: 75,
      policyImplementationRate: 0.60,
      netZeroTargetsCoverage: 68,
      globalGDP: 96,
      carbonIntensity: 0.37,
      carbonIntensityDeclineRate: 2.5,
      sbtiCompaniesPercent: 22,
      corporateImplementationRate: 0.62,
    },
  },
  {
    year: 2022,
    indicators: {
      renewableCapacityGW: 3372,
      renewableGrowthRate: 9.5,
      renewableAcceleration: 1.2,
      evSalesShare: 13.0,
      evGrowthRate: 60.0,
      policyCoveragePercent: 80,
      policyImplementationRate: 0.62,
      netZeroTargetsCoverage: 80,
      globalGDP: 101,
      carbonIntensity: 0.37,
      carbonIntensityDeclineRate: 2.6,
      sbtiCompaniesPercent: 28,
      corporateImplementationRate: 0.68,
    },
  },
  {
    year: 2023,
    indicators: {
      renewableCapacityGW: 3700,
      renewableGrowthRate: 9.7,
      renewableAcceleration: 1.2,
      evSalesShare: 15.5,
      evGrowthRate: 31.0,
      policyCoveragePercent: 83,
      policyImplementationRate: 0.63,
      netZeroTargetsCoverage: 85,
      globalGDP: 103,
      carbonIntensity: 0.36,
      carbonIntensityDeclineRate: 2.7,
      sbtiCompaniesPercent: 32,
      corporateImplementationRate: 0.72,
    },
  },
  {
    year: 2024,
    indicators: {
      renewableCapacityGW: 3870,
      renewableGrowthRate: 9.8,
      renewableAcceleration: 1.2,
      evSalesShare: 18.0,
      evGrowthRate: 35.0,
      policyCoveragePercent: 85,
      policyImplementationRate: 0.65,
      netZeroTargetsCoverage: 88,
      globalGDP: 105,
      carbonIntensity: 0.36,
      carbonIntensityDeclineRate: 2.8,
      sbtiCompaniesPercent: 35,
      corporateImplementationRate: 0.7934,
    },
  },
];

/**
 * Calculate historical projections using current sector-specific model
 */
/**
 * Get full projection data for a specific historical year
 */
export function getFullProjectionForYear(targetYear: number) {
  const HISTORICAL_INDICATORS = getHistoricalIndicatorSnapshots();
  const historicalData = HISTORICAL_INDICATORS.find(({ year }) => year === targetYear);
  
  if (!historicalData) {
    return null;
  }
  
  const { year, indicators } = historicalData;
  
  // Run sector-specific projection from this historical year with 10,000 runs for full distribution
  const trajectory = calculateEmissionsTrajectory(indicators, year, 2100, 10000);
  const temperatureDistribution = calculateTemperatureDistribution(trajectory, 10000);
  
  // Extract temperature statistics
  const sortedTemps = [...temperatureDistribution].sort((a, b) => a.temperature - b.temperature);
  const median = sortedTemps[Math.floor(sortedTemps.length * 0.5)]?.temperature || 2.0;
  const p10 = sortedTemps[Math.floor(sortedTemps.length * 0.1)]?.temperature || 1.8;
  const p90 = sortedTemps[Math.floor(sortedTemps.length * 0.9)]?.temperature || 2.3;
  
  // Calculate reduction rate
  const emissionsStart = trajectory.find((p: ForwardProjection) => p.year === year)?.emissions || 60;
  const emissionsEnd = trajectory.find((p: ForwardProjection) => p.year === year + 10)?.emissions || 55;
  const reductionRate = ((emissionsStart - emissionsEnd) / emissionsStart) * 10; // Annual rate
  
  // Calculate net-zero year (extrapolate if needed)
  const netZeroPoint = trajectory.find((p: ForwardProjection) => p.emissions <= 5.0);
  let netZeroYear: number | null = null;
  
  if (netZeroPoint) {
    netZeroYear = netZeroPoint.year;
  } else {
    // Extrapolate beyond 2100
    const finalEmissions = trajectory[trajectory.length - 1].emissions;
    const firstEmissions = trajectory[0].emissions;
    const yearsElapsed = trajectory[trajectory.length - 1].year - trajectory[0].year;
    const avgAnnualReduction = (firstEmissions - finalEmissions) / yearsElapsed;
    
    if (avgAnnualReduction > 0 && finalEmissions > 5.0) {
      const yearsToNetZero = (finalEmissions - 5.0) / avgAnnualReduction;
      netZeroYear = Math.round(trajectory[trajectory.length - 1].year + yearsToNetZero);
    }
  }
  
  return {
    temperatureRise: median,
    reductionRate,
    netZeroYear,
    trajectory,
    temperatureDistribution,
    indicators,
  };
}

export function getRecalculatedHistoricalTrend() {
  const HISTORICAL_INDICATORS = getHistoricalIndicatorSnapshots();
  return HISTORICAL_INDICATORS.map(({ year, indicators }) => {
    // Run sector-specific projection from this historical year (use 10,000 simulations to match current projection)
    const trajectory = calculateEmissionsTrajectory(indicators, year, 2100, 10000);
    const temperatureDistribution = calculateTemperatureDistribution(trajectory, 10000);
    
    // Extract median temperature
    const sortedTemps = [...temperatureDistribution].sort((a, b) => a.temperature - b.temperature);
    const median = sortedTemps[Math.floor(sortedTemps.length * 0.5)]?.temperature || 2.0;
    const p10 = sortedTemps[Math.floor(sortedTemps.length * 0.1)]?.temperature || 1.8;
    const p90 = sortedTemps[Math.floor(sortedTemps.length * 0.9)]?.temperature || 2.3;
    
    // Calculate reduction rate (2024-2034)
    const emissions2024 = trajectory.find((p: ForwardProjection) => p.year === year)?.emissions || 60;
    const emissions2034 = trajectory.find((p: ForwardProjection) => p.year === year + 10)?.emissions || 55;
    const reductionRate = ((emissions2024 - emissions2034) / emissions2024) * 10; // Annual rate
    
    // Calculate net-zero year (extrapolate if needed)
    const netZeroPoint = trajectory.find((p: ForwardProjection) => p.emissions <= 5.0);
    let netZeroYear: number | null = null;
    
    if (netZeroPoint) {
      netZeroYear = netZeroPoint.year;
    } else {
      // Extrapolate beyond 2100
      const finalEmissions = trajectory[trajectory.length - 1].emissions;
      const firstEmissions = trajectory[0].emissions;
      const yearsElapsed = trajectory[trajectory.length - 1].year - trajectory[0].year;
      const avgAnnualReduction = (firstEmissions - finalEmissions) / yearsElapsed;
      
      if (avgAnnualReduction > 0 && finalEmissions > 5.0) {
        const yearsToNetZero = (finalEmissions - 5.0) / avgAnnualReduction;
        netZeroYear = trajectory[trajectory.length - 1].year + yearsToNetZero;
      }
    }
    
    return {
      analysisDate: new Date(`${year}-12-01`),
      median,
      p10,
      p25: null,
      p75: null,
      p90,
      indicators,
      // Additional metrics for toggle support
      reductionRate,
      netZeroYear,
    };
  });
}
