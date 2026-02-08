/**
 * Regional Projections Module
 * 
 * Calculates region-specific temperature projections by scaling the global model
 * based on regional emissions shares and regional-specific indicator values.
 */

import { calculateEmissionsTrajectory, calculateTemperatureDistribution, getCurrentIndicators } from './forwardProjectionSectorSpecific.js';

export type Region = 'global' | 'china' | 'us' | 'eu' | 'india';

interface RegionalData {
  name: string;
  emissionsShare: number; // % of global emissions (2024)
  renewableShare: number; // % of electricity from renewables
  evShare: number; // % of new vehicle sales that are EVs
  policyScore: number; // 0-100 policy coverage score
  gdpGrowthRate: number; // Annual GDP growth rate %
  carbonIntensity: number; // kg CO2 per $ GDP
}

/**
 * Regional data based on 2024 estimates
 * Sources: IEA, World Bank, Climate Action Tracker
 */
const REGIONAL_DATA: Record<Region, RegionalData> = {
  global: {
    name: 'Global',
    emissionsShare: 100,
    renewableShare: 30.0,
    evShare: 18.0,
    policyScore: 65,
    gdpGrowthRate: 2.8,
    carbonIntensity: 0.32,
  },
  china: {
    name: 'China',
    emissionsShare: 30.7, // ~30.7% of global emissions
    renewableShare: 33.0, // Higher than global average
    evShare: 38.0, // World leader in EV adoption
    policyScore: 55, // Moderate policy coverage
    gdpGrowthRate: 4.5, // Higher growth than global average
    carbonIntensity: 0.42, // Higher carbon intensity
  },
  us: {
    name: 'United States',
    emissionsShare: 13.5, // ~13.5% of global emissions
    renewableShare: 22.0, // Below global average
    evShare: 9.0, // Lower EV adoption
    policyScore: 70, // Strong policy framework (IRA, state policies)
    gdpGrowthRate: 2.2,
    carbonIntensity: 0.28, // Lower carbon intensity
  },
  eu: {
    name: 'European Union',
    emissionsShare: 7.8, // ~7.8% of global emissions
    renewableShare: 44.0, // World leader in renewable share
    evShare: 25.0, // High EV adoption
    policyScore: 85, // Strongest policy coverage (EU Green Deal, ETS)
    gdpGrowthRate: 1.5,
    carbonIntensity: 0.18, // Lowest carbon intensity
  },
  india: {
    name: 'India',
    emissionsShare: 7.3, // ~7.3% of global emissions
    renewableShare: 25.0,
    evShare: 6.0, // Lower EV adoption
    policyScore: 50, // Moderate policy coverage
    gdpGrowthRate: 6.5, // Highest growth rate
    carbonIntensity: 0.48, // Highest carbon intensity
  },
};

/**
 * Calculate regional-specific projection
 */
export function calculateRegionalProjection(region: Region, year: number, numSimulations: number = 10000) {
  const regionalData = REGIONAL_DATA[region];
  
  // For global, use the standard global indicators
  if (region === 'global') {
    const indicators = getCurrentIndicators();
    const trajectory = calculateEmissionsTrajectory(indicators, year, 2100, numSimulations);
    const temperatureDistribution = calculateTemperatureDistribution(trajectory, numSimulations);
    
    // Calculate median, p10, p90
    const sortedTemps = [...temperatureDistribution].sort((a, b) => a.temperature - b.temperature);
    const median = sortedTemps[Math.floor(sortedTemps.length * 0.5)]?.temperature || 2.7;
    const p10 = sortedTemps[Math.floor(sortedTemps.length * 0.1)]?.temperature || 1.8;
    const p90 = sortedTemps[Math.floor(sortedTemps.length * 0.9)]?.temperature || 3.6;
    
    // Calculate reduction rate (2024-2034)
    const emissions2024 = trajectory.find(t => t.year === year)?.emissions || 60;
    const emissions2034 = trajectory.find(t => t.year === year + 10)?.emissions || 55;
    const reductionRate = ((emissions2024 - emissions2034) / emissions2024) * 100 / 10;
    
    // Calculate net-zero year
    const netZeroPoint = trajectory.find(t => t.emissions <= 5);
    const netZeroYear = netZeroPoint?.year || 2201;
    
    return {
      region,
      regionName: regionalData.name,
      temperatureRise: median,
      p10,
      p90,
      reductionRate,
      netZeroYear,
      temperatureDistribution,
      trajectory,
    };
  }
  
  // For specific regions, adjust indicators based on regional data
  const globalIndicators = getCurrentIndicators();
  
  // "Whole world on this path" scenario: use same formula as global, but with regional input values
  // This shows what would happen if all countries matched this region's trajectory
  const regionalIndicators = {
    ...globalIndicators,
    // Use regional performance levels directly (same formula, different inputs)
    renewableGrowthRate: globalIndicators.renewableGrowthRate * (regionalData.renewableShare / 30.0),
    renewableCapacityGW: globalIndicators.renewableCapacityGW * (regionalData.renewableShare / 30.0),
    evSalesShare: regionalData.evShare / 100,
    evGrowthRate: globalIndicators.evGrowthRate * (regionalData.evShare / 18.0),
    policyCoverage: regionalData.policyScore / 100,
    policyImplementationRate: globalIndicators.policyImplementationRate * (regionalData.policyScore / 65.0),
    gdpGrowthRate: regionalData.gdpGrowthRate / 100,
    carbonIntensity: regionalData.carbonIntensity,
    carbonIntensityDeclineRate: globalIndicators.carbonIntensityDeclineRate * (0.32 / regionalData.carbonIntensity),
  };
  
  // Calculate trajectory with regional indicators
  const trajectory = calculateEmissionsTrajectory(regionalIndicators, year, 2100, numSimulations);
  
  // Scale emissions to regional share
  const scaledTrajectory = trajectory.map(point => ({
    ...point,
    emissions: point.emissions * (regionalData.emissionsShare / 100),
  }));
  
  // Calculate temperature distribution
  // Note: Temperature rise is global, not regional, so we use the global trajectory
  // but show regional contribution to understand regional impact
  const temperatureDistribution = calculateTemperatureDistribution(trajectory, numSimulations);
  
  // Calculate median, p10, p90
  const sortedTemps = [...temperatureDistribution].sort((a, b) => a.temperature - b.temperature);
  const median = sortedTemps[Math.floor(sortedTemps.length * 0.5)]?.temperature || 2.7;
  const p10 = sortedTemps[Math.floor(sortedTemps.length * 0.1)]?.temperature || 1.8;
  const p90 = sortedTemps[Math.floor(sortedTemps.length * 0.9)]?.temperature || 3.6;
  
  // Calculate reduction rate (2024-2034)
  const emissions2024 = scaledTrajectory.find(t => t.year === year)?.emissions || 60;
  const emissions2034 = scaledTrajectory.find(t => t.year === year + 10)?.emissions || 55;
  const reductionRate = ((emissions2024 - emissions2034) / emissions2024) * 100 / 10;
  
  // Calculate net-zero year
  const netZeroPoint = scaledTrajectory.find(t => t.emissions <= (5 * regionalData.emissionsShare / 100));
  const netZeroYear = netZeroPoint?.year || 2201;
  
  return {
    region,
    regionName: regionalData.name,
    temperatureRise: median,
    p10,
    p90,
    reductionRate,
    netZeroYear,
    temperatureDistribution,
    trajectory: scaledTrajectory,
    emissionsShare: regionalData.emissionsShare,
  };
}

/**
 * Get regional data for display
 */
export function getRegionalData(region: Region) {
  return REGIONAL_DATA[region];
}

/**
 * Get all available regions
 */
export function getAvailableRegions(): Region[] {
  return ['global', 'china', 'us', 'eu', 'india'];
}
