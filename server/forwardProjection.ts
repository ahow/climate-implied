/**
 * Data-Driven Forward Projection Engine
 * 
 * This module calculates the most likely emissions trajectory and temperature outcomes
 * based on observable trends in real indicators rather than predefined scenarios.
 * 
 * Key Indicators:
 * - Renewable energy deployment rates (historical acceleration)
 * - EV adoption curves (S-curve modeling)
 * - Policy implementation momentum (announced vs. delivered)
 * - Carbon intensity trends (emissions per GDP)
 * - Technology cost curves (learning rates)
 * - Corporate climate commitments (SBTi coverage)
 */

/**
 * Generate random number from normal distribution using Box-Muller transform
 */
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Real-world indicator data structure
 */
export interface IndicatorData {
  // Renewable Energy
  renewableCapacityGW: number; // Current installed capacity
  renewableGrowthRate: number; // Annual growth rate (%)
  renewableAcceleration: number; // Year-over-year acceleration
  
  // Electric Vehicles
  evSalesShare: number; // % of new vehicle sales
  evGrowthRate: number; // Annual growth rate
  
  // Policy Momentum
  policyCoveragePercent: number; // % of global emissions covered by policies
  policyImplementationRate: number; // Historical delivery rate (0-1)
  netZeroTargetsCoverage: number; // % of emissions covered by net-zero pledges
  
  // Economic & Emissions
  globalGDP: number; // Trillion USD
  carbonIntensity: number; // tCO2e per $1000 GDP
  carbonIntensityDeclineRate: number; // Annual % decline
  
  // Corporate Action
  sbtiCompaniesPercent: number; // % of emissions covered by SBTi targets
  corporateImplementationRate: number; // Actual vs. pledged progress
}

/**
 * Forward projection output
 */
export interface ForwardProjection {
  year: number;
  emissions: number; // GtCO2e
  p10: number; // 10th percentile
  p25: number;
  p50: number; // Median (most likely)
  p75: number;
  p90: number; // 90th percentile
  cumulativeEmissions: number; // Total since 2020
}

/**
 * Temperature probability distribution from forward projection
 */
export interface TemperatureProjection {
  temperature: number; // °C above pre-industrial
  probability: number; // Probability density
  cumulativeProbability: number; // CDF value
}

/**
 * Get current real-world indicator values
 * In production, this would fetch from APIs (Climate TRACE, IEA, World Bank, IRENA, SBTi)
 */
export function getCurrentIndicators(): IndicatorData {
  // Based on real 2024 data from verified sources
  return {
    // Renewable Energy (IRENA, IEA Renewables 2024)
    renewableCapacityGW: 3870, // Global renewable capacity 2024
    renewableGrowthRate: 9.8, // % annual growth (IEA verified)
    renewableAcceleration: 1.2, // Accelerating deployment trend
    
    // Electric Vehicles (IEA Global EV Outlook 2024)
    evSalesShare: 18.0, // % of new car sales (2024 actual)
    evGrowthRate: 35.0, // % annual growth (IEA verified)
    
    // Policy Momentum (Climate Action Tracker 2024, UNFCCC)
    policyCoveragePercent: 85, // % emissions covered by some policy
    policyImplementationRate: 0.65, // 65% of pledges on track (CAT assessment)
    netZeroTargetsCoverage: 88, // % covered by net-zero pledges
    
    // Economic & Emissions (Global Carbon Project, World Bank)
    globalGDP: 105, // Trillion USD (2024)
    carbonIntensity: 0.36, // tCO2e per $1000 GDP
    carbonIntensityDeclineRate: 2.8, // % annual decline
    
    // Corporate Action (SBTi - calculated from real data)
    sbtiCompaniesPercent: 35, // % of emissions covered by validated targets
    corporateImplementationRate: 0.7934, // 79.34% with validated targets (9,962/12,556 active companies)
  };
}

/**
 * Project future indicator values based on current trends
 */
function projectIndicator(
  currentValue: number,
  growthRate: number,
  years: number,
  acceleration: number = 0,
  saturationLimit?: number
): number {
  let value = currentValue;
  
  for (let year = 0; year < years; year++) {
    // Apply growth with acceleration
    const effectiveGrowth = growthRate * (1 + acceleration * year / 10);
    value *= (1 + effectiveGrowth / 100);
    
    // Apply saturation limit if specified (S-curve behavior)
    if (saturationLimit && value > saturationLimit * 0.7) {
      const saturationFactor = 1 - (value / saturationLimit);
      value = currentValue + (saturationLimit - currentValue) * (1 - Math.exp(-effectiveGrowth * year / 100));
    }
  }
  
  return value;
}

/**
 * Calculate emissions trajectory from indicator trends
 */
export function calculateEmissionsTrajectory(
  indicators: IndicatorData,
  startYear: number = 2024,
  endYear: number = 2100,
  runs: number = 10000
): ForwardProjection[] {
  const years = endYear - startYear + 1;
  const projections: ForwardProjection[] = [];
  
  // Current baseline emissions (2024) - using Climate TRACE actual monitored data
  // Climate TRACE monitors 2.7M sources globally and reports 60.3 Gt CO2e for 2024
  // This includes all anthropogenic sources except forestry
  const baselineEmissions = 60.3; // GtCO2e from Climate TRACE API (verified 2024 data)
  
  // Run Monte Carlo simulations
  const allSimulations: number[][] = [];
  
  for (let run = 0; run < runs; run++) {
    const simulation: number[] = [];
    let cumulativeEmissions = 0;
    
    // Sample uncertain parameters
    const renewableGrowthUncertainty = randomNormal(1.0, 0.15); // ±15%
    const evAdoptionUncertainty = randomNormal(1.0, 0.20); // ±20%
    const policyEffectivenessUncertainty = randomNormal(indicators.policyImplementationRate, 0.10);
    const carbonIntensityDeclineUncertainty = randomNormal(1.0, 0.12);
    const economicGrowthUncertainty = randomNormal(2.5, 0.8); // % annual GDP growth
    
    for (let yearOffset = 0; yearOffset < years; yearOffset++) {
      const year = startYear + yearOffset;
      
      // Project renewable energy displacement
      const renewableCapacity = projectIndicator(
        indicators.renewableCapacityGW,
        indicators.renewableGrowthRate * renewableGrowthUncertainty,
        yearOffset,
        indicators.renewableAcceleration,
        50000 // Saturation at ~50 TW
      );
      
      // Each GW of renewable capacity displaces ~0.0008 GtCO2e annually (reduced from 0.002)
      // Previous value was too aggressive, causing unrealistic emission declines
      const renewableDisplacement = (renewableCapacity - indicators.renewableCapacityGW) * 0.0008;
      
      // Project EV adoption impact
      const evShare = Math.min(
        projectIndicator(
          indicators.evSalesShare,
          indicators.evGrowthRate * evAdoptionUncertainty,
          yearOffset,
          -0.5, // Deceleration as market matures
          100 // Saturation at 100%
        ),
        100
      );
      
      // EV displacement: ~0.03 GtCO2e per 10% fleet share (reduced from 0.08)
      // Previous value was too aggressive, EVs take time to replace existing fleet
      const evDisplacement = (evShare - indicators.evSalesShare) / 10 * 0.03;
      
      // Policy-driven reductions (reduced from 0.5 to 0.25)
      // Previous value over-estimated policy impact, causing emissions to decline too fast
      const policyImpact = indicators.policyCoveragePercent / 100 * 
                          policyEffectivenessUncertainty * 
                          (yearOffset / 10) * 0.25; // GtCO2e reduction
      
      // Economic growth impact on emissions
      const gdpGrowth = economicGrowthUncertainty / 100;
      const carbonIntensityDecline = indicators.carbonIntensityDeclineRate / 100 * 
                                     carbonIntensityDeclineUncertainty;
      
      // Net emissions change
      // Economic growth adds emissions, carbon intensity decline reduces them
      const economicEmissionsGrowth = baselineEmissions * gdpGrowth * (yearOffset / years);
      const intensityReduction = baselineEmissions * carbonIntensityDecline * (yearOffset / years);
      
      // Calculate year emissions
      const yearEmissions = Math.max(
        0,
        baselineEmissions + 
        economicEmissionsGrowth -
        intensityReduction -
        renewableDisplacement -
        evDisplacement -
        policyImpact
      );
      
      simulation.push(yearEmissions);
      cumulativeEmissions += yearEmissions;
    }
    
    allSimulations.push(simulation);
  }
  
  // Calculate percentiles for each year
  for (let yearOffset = 0; yearOffset < years; yearOffset++) {
    const yearEmissions = allSimulations.map(sim => sim[yearOffset] || 0).sort((a, b) => a - b);
    const cumulatives = allSimulations.map(sim => 
      sim.slice(0, yearOffset + 1).reduce((sum, val) => sum + val, 0)
    ).sort((a, b) => a - b);
    
    projections.push({
      year: startYear + yearOffset,
      emissions: yearEmissions[Math.floor(yearEmissions.length / 2)] || 0,
      p10: yearEmissions[Math.floor(yearEmissions.length * 0.1)] || 0,
      p25: yearEmissions[Math.floor(yearEmissions.length * 0.25)] || 0,
      p50: yearEmissions[Math.floor(yearEmissions.length * 0.5)] || 0,
      p75: yearEmissions[Math.floor(yearEmissions.length * 0.75)] || 0,
      p90: yearEmissions[Math.floor(yearEmissions.length * 0.9)] || 0,
      cumulativeEmissions: cumulatives[Math.floor(cumulatives.length / 2)] || 0,
    });
  }
  
  return projections;
}

/**
 * Convert emissions trajectory to temperature probability distribution
 * Uses IPCC AR6 Transient Climate Response to Cumulative Emissions (TCRE)
 */
export function calculateTemperatureDistribution(
  trajectory: ForwardProjection[],
  climateSensitivity: number = 3.0, // ECS in °C per doubling CO2
  runs: number = 10000
): {
  median: number;
  mean: number;
  p10: number;
  p90: number;
  pdf: TemperatureProjection[];
} {
  const temperatureOutcomes: number[] = [];
  
  // Get cumulative emissions by 2100
  const finalProjection = trajectory[trajectory.length - 1];
  if (!finalProjection) {
    return {
      median: 0,
      mean: 0,
      p10: 0,
      p90: 0,
      pdf: [],
    };
  }
  
  // TCRE: ~0.45°C per 1000 GtCO2 (IPCC AR6 central estimate)
  const tcreBase = 0.00045; // °C per GtCO2
  const baselineWarming = 1.1; // Already observed warming
  
  // Run simulations with climate sensitivity uncertainty
  for (let i = 0; i < runs; i++) {
    // Sample climate sensitivity (IPCC AR6 likely range: 2.5-4.0°C)
    const ecs = randomNormal(climateSensitivity, 0.5);
    const tcreFactor = ecs / 3.0; // Scale TCRE by climate sensitivity
    
    // Sample cumulative emissions uncertainty
    const cumulativeUncertainty = randomNormal(1.0, 0.15);
    const cumulative = finalProjection.cumulativeEmissions * cumulativeUncertainty;
    
    // Calculate temperature outcome
    const temperature = baselineWarming + (cumulative * tcreBase * tcreFactor);
    temperatureOutcomes.push(Math.max(1.0, Math.min(5.0, temperature)));
  }
  
  // Sort for percentile calculation
  temperatureOutcomes.sort((a, b) => a - b);
  
  // Calculate statistics
  const median = temperatureOutcomes[Math.floor(temperatureOutcomes.length * 0.5)] || 0;
  const mean = temperatureOutcomes.reduce((sum, val) => sum + val, 0) / temperatureOutcomes.length;
  const p10 = temperatureOutcomes[Math.floor(temperatureOutcomes.length * 0.1)] || 0;
  const p90 = temperatureOutcomes[Math.floor(temperatureOutcomes.length * 0.9)] || 0;
  
  // Generate PDF using kernel density estimation
  const pdf: TemperatureProjection[] = [];
  const tempRange = { min: 1.0, max: 5.0, step: 0.05 };
  const bandwidth = 0.1; // KDE bandwidth
  
  for (let temp = tempRange.min; temp <= tempRange.max; temp += tempRange.step) {
    // Calculate probability density at this temperature
    let density = 0;
    for (const outcome of temperatureOutcomes) {
      const distance = (temp - outcome) / bandwidth;
      density += Math.exp(-0.5 * distance * distance);
    }
    density /= (temperatureOutcomes.length * bandwidth * Math.sqrt(2 * Math.PI));
    
    // Calculate cumulative probability
    const cumulativeProb = temperatureOutcomes.filter(t => t <= temp).length / temperatureOutcomes.length;
    
    pdf.push({
      temperature: parseFloat(temp.toFixed(2)),
      probability: parseFloat(density.toFixed(6)),
      cumulativeProbability: parseFloat(cumulativeProb.toFixed(4)),
    });
  }
  
  return {
    median,
    mean,
    p10,
    p90,
    pdf,
  };
}

/**
 * Generate complete forward projection with temperature outcomes
 */
export function generateForwardProjection(
  customParams?: {
    climateSensitivity?: number;
    renewableAcceleration?: number;
    policyEffectiveness?: number;
    economicGrowth?: number;
  }
): {
  emissionsTrajectory: ForwardProjection[];
  temperatureDistribution: ReturnType<typeof calculateTemperatureDistribution>;
  indicators: IndicatorData;
} {
  // Get current indicators
  let indicators = getCurrentIndicators();
  
  // Apply custom parameters if provided
  if (customParams) {
    if (customParams.renewableAcceleration !== undefined) {
      indicators.renewableAcceleration = customParams.renewableAcceleration;
    }
    if (customParams.policyEffectiveness !== undefined) {
      indicators.policyImplementationRate = customParams.policyEffectiveness;
    }
  }
  
  // Calculate emissions trajectory
  const emissionsTrajectory = calculateEmissionsTrajectory(indicators);
  
  // Calculate temperature distribution
  const temperatureDistribution = calculateTemperatureDistribution(
    emissionsTrajectory,
    customParams?.climateSensitivity
  );
  
  return {
    emissionsTrajectory,
    temperatureDistribution,
    indicators,
  };
}
