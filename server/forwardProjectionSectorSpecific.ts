/**
 * Sector-Specific Forward Projection Engine
 * 
 * This module calculates emissions trajectories by applying reduction factors
 * at the SECTOR LEVEL rather than globally, for accurate modeling.
 * 
 * Key Fix: Renewable energy only affects Power sector (26.9% of emissions),
 * EVs only affect Transport (14.4%), etc.
 */

/**
 * Seeded random number generator (Linear Congruential Generator)
 * Uses year-based seed to ensure reproducible results
 */
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    // LCG parameters (same as glibc)
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
}

let rng: SeededRandom | null = null;

/**
 * Initialize RNG with seed based on year
 */
function initRNG(year: number) {
  rng = new SeededRandom(year * 12345); // Use year as seed multiplier
}

/**
 * Get random number (seeded or unseeded)
 */
function random(): number {
  return rng ? rng.next() : Math.random();
}

/**
 * Generate random number from normal distribution using Box-Muller transform
 */
function randomNormal(mean: number, stdDev: number): number {
  const u1 = random();
  const u2 = random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Sectoral emissions breakdown (% of total)
 * Source: IEA Energy & Climate 2023, IPCC AR6 WGIII
 */
export const SECTOR_SHARES = {
  power: 0.269,      // 26.9% - Electricity and heat production
  transport: 0.144,  // 14.4% - Road, aviation, shipping
  industry: 0.241,   // 24.1% - Manufacturing, construction, mining
  buildings: 0.096,  // 9.6% - Residential and commercial buildings
  agriculture: 0.171, // 17.1% - Livestock, crops, land use
  other: 0.080,      // 8.0% - Waste, forestry, other
};

/**
 * Real-world indicator data structure
 */
export interface IndicatorData {
  // Renewable Energy
  renewableCapacityGW: number;
  renewableGrowthRate: number;
  renewableAcceleration: number;
  
  // Electric Vehicles
  evSalesShare: number;
  evGrowthRate: number;
  
  // Policy Momentum
  policyCoveragePercent: number;
  policyImplementationRate: number;
  netZeroTargetsCoverage: number;
  
  // Economic & Emissions
  globalGDP: number;
  carbonIntensity: number;
  carbonIntensityDeclineRate: number;
  
  // Corporate Action
  sbtiCompaniesPercent: number;
  corporateImplementationRate: number;
}

/**
 * Sector-specific emissions
 */
export interface SectorEmissions {
  power: number;
  transport: number;
  industry: number;
  buildings: number;
  agriculture: number;
  other: number;
  total: number;
}

/**
 * Forward projection output with sector breakdown
 */
export interface ForwardProjection {
  year: number;
  emissions: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  cumulativeEmissions: number;
  sectorBreakdown?: SectorEmissions; // Optional detailed breakdown
}

/**
 * Temperature probability distribution
 */
export interface TemperatureProjection {
  temperature: number;
  probability: number;
  cumulativeProbability: number;
}

/**
 * Get current real-world indicator values
 */
export function getCurrentIndicators(): IndicatorData {
  return {
    // Renewable Energy (IRENA, IEA Renewables 2024)
    renewableCapacityGW: 3870,
    renewableGrowthRate: 9.8,
    renewableAcceleration: 1.2,
    
    // Electric Vehicles (IEA Global EV Outlook 2024)
    evSalesShare: 18.0,
    evGrowthRate: 35.0,
    
    // Policy Momentum (Climate Action Tracker 2024)
    policyCoveragePercent: 85,
    policyImplementationRate: 0.65,
    netZeroTargetsCoverage: 88,
    
    // Economic & Emissions (Global Carbon Project, World Bank)
    globalGDP: 105,
    carbonIntensity: 0.36,
    carbonIntensityDeclineRate: 2.8,
    
    // Corporate Action (SBTi)
    sbtiCompaniesPercent: 35,
    corporateImplementationRate: 0.7934,
  };
}

/**
 * Project future indicator values
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
    const effectiveGrowth = growthRate * (1 + acceleration * year / 10);
    value *= (1 + effectiveGrowth / 100);
    
    if (saturationLimit && value > saturationLimit * 0.7) {
      const saturationFactor = 1 - (value / saturationLimit);
      value = currentValue + (saturationLimit - currentValue) * (1 - Math.exp(-effectiveGrowth * year / 100));
    }
  }
  
  return value;
}

/**
 * Calculate sector-specific emissions trajectory
 */
export function calculateEmissionsTrajectory(
  indicators: IndicatorData,
  startYear: number = 2024,
  endYear: number = 2100,
  runs: number = 10000
): ForwardProjection[] {
  // Initialize seeded RNG for reproducible results
  initRNG(startYear);
  
  const years = endYear - startYear + 1;
  const projections: ForwardProjection[] = [];
  
  // Baseline emissions (2024) - Climate TRACE
  // Scale by carbon intensity relative to global average (0.32 kg CO2/$GDP)
  const carbonIntensityScaling = indicators.carbonIntensity / 0.32;
  const baselineEmissions = 60.3 * carbonIntensityScaling; // GtCO2e
  
  // Baseline sector emissions
  const baselineSectors: SectorEmissions = {
    power: baselineEmissions * SECTOR_SHARES.power,       // 16.2 Gt
    transport: baselineEmissions * SECTOR_SHARES.transport, // 8.7 Gt
    industry: baselineEmissions * SECTOR_SHARES.industry,  // 14.5 Gt
    buildings: baselineEmissions * SECTOR_SHARES.buildings, // 5.8 Gt
    agriculture: baselineEmissions * SECTOR_SHARES.agriculture, // 10.3 Gt
    other: baselineEmissions * SECTOR_SHARES.other,       // 4.8 Gt
    total: baselineEmissions,
  };
  
  // Run Monte Carlo simulations
  const allSimulations: number[][] = [];
  
  for (let run = 0; run < runs; run++) {
    const simulation: number[] = [];
    let cumulativeEmissions = 0;
    
    // Sample uncertain parameters
    const renewableGrowthUncertainty = randomNormal(1.0, 0.15);
    const evAdoptionUncertainty = randomNormal(1.0, 0.20);
    const policyEffectivenessUncertainty = randomNormal(indicators.policyImplementationRate, 0.10);
    const carbonIntensityDeclineUncertainty = randomNormal(1.0, 0.12);
    const economicGrowthUncertainty = randomNormal(2.5, 0.8);
    
    for (let yearOffset = 0; yearOffset < years; yearOffset++) {
      const year = startYear + yearOffset;
      
      // Initialize sector emissions with baseline
      let powerEmissions = baselineSectors.power;
      let transportEmissions = baselineSectors.transport;
      let industryEmissions = baselineSectors.industry;
      let buildingsEmissions = baselineSectors.buildings;
      let agricultureEmissions = baselineSectors.agriculture;
      let otherEmissions = baselineSectors.other;
      
      // ========================================
      // POWER SECTOR - Renewable Energy Impact
      // ========================================
      const renewableCapacity = projectIndicator(
        indicators.renewableCapacityGW,
        indicators.renewableGrowthRate * renewableGrowthUncertainty,
        yearOffset,
        indicators.renewableAcceleration,
        50000
      );
      
      // Renewable displacement factor: 0.0002 Gt per GW (optimized via backtest, weight=1.0)
      // ONLY applied to Power sector (16.2 Gt baseline)
      const renewableDisplacementTotal = (renewableCapacity - indicators.renewableCapacityGW) * 0.0002 * 1.0;
      powerEmissions = Math.max(0, powerEmissions - renewableDisplacementTotal);
      
      // ========================================
      // TRANSPORT SECTOR - EV Impact
      // ========================================
      const evShare = Math.min(
        projectIndicator(
          indicators.evSalesShare,
          indicators.evGrowthRate * evAdoptionUncertainty,
          yearOffset,
          -0.5,
          100
        ),
        100
      );
      
      // EV displacement: 0.010 Gt per 10% fleet share (optimized via backtest, weight=1.0)
      // ONLY applied to Transport sector (8.7 Gt baseline)
      const evDisplacementTotal = (evShare - indicators.evSalesShare) / 10 * 0.010 * 1.0;
      transportEmissions = Math.max(0, transportEmissions - evDisplacementTotal);
      
      // ========================================
      // INDUSTRY SECTOR - Electrification & Efficiency
      // ========================================
      // Industrial electrification and efficiency improvements
      // Assume 0.5% annual decline in industrial emissions intensity (optimized via backtest)
      const industrialEfficiencyFactor = Math.pow(0.995, yearOffset);
      industryEmissions = baselineSectors.industry * industrialEfficiencyFactor;
      
      // ========================================
      // CORPORATE ACTION - SBTi Implementation
      // ========================================
      // Corporate targets drive sector-specific reductions (optimized via backtest, weight=1.0)
      // SBTi companies represent 35% of global emissions with 79.34% implementation rate
      const corporateReductionRate = indicators.sbtiCompaniesPercent / 100 * 
                                     indicators.corporateImplementationRate * 
                                     (yearOffset / 10) * 0.10 * 1.0;
      
      // Apply corporate reductions across sectors (SBTi targets span all sectors)
      powerEmissions = Math.max(0, powerEmissions - powerEmissions * corporateReductionRate);
      transportEmissions = Math.max(0, transportEmissions - transportEmissions * corporateReductionRate);
      industryEmissions = Math.max(0, industryEmissions - industryEmissions * corporateReductionRate);
      buildingsEmissions = Math.max(0, buildingsEmissions - buildingsEmissions * corporateReductionRate);
      agricultureEmissions = Math.max(0, agricultureEmissions - agricultureEmissions * corporateReductionRate);
      otherEmissions = Math.max(0, otherEmissions - otherEmissions * corporateReductionRate);
      
      // ========================================
      // BUILDINGS SECTOR - Heat Pump Adoption
      // ========================================
      // Heat pump and building efficiency improvements
      // Assume 0.4% annual decline in building emissions (optimized via backtest)
      const buildingEfficiencyFactor = Math.pow(0.996, yearOffset);
      buildingsEmissions = baselineSectors.buildings * buildingEfficiencyFactor;
      
      // ========================================
      // AGRICULTURE SECTOR - Methane Reduction
      // ========================================
      // Agricultural emissions relatively stable
      // Slight decline from methane reduction efforts (0.2% annual, optimized via backtest)
      const agricultureEfficiencyFactor = Math.pow(0.998, yearOffset);
      agricultureEmissions = baselineSectors.agriculture * agricultureEfficiencyFactor;
      
      // ========================================
      // POLICY IMPACT - Distributed Across Sectors
      // ========================================
      // Policy impact distributed proportionally across sectors (optimized via backtest, weight=1.0)
      const policyImpactTotal = indicators.policyCoveragePercent / 100 * 
                                policyEffectivenessUncertainty * 
                                (yearOffset / 10) * 0.10 * 1.0;
      
      // Distribute policy impact across sectors by their share
      powerEmissions = Math.max(0, powerEmissions - policyImpactTotal * SECTOR_SHARES.power);
      transportEmissions = Math.max(0, transportEmissions - policyImpactTotal * SECTOR_SHARES.transport);
      industryEmissions = Math.max(0, industryEmissions - policyImpactTotal * SECTOR_SHARES.industry);
      buildingsEmissions = Math.max(0, buildingsEmissions - policyImpactTotal * SECTOR_SHARES.buildings);
      agricultureEmissions = Math.max(0, agricultureEmissions - policyImpactTotal * SECTOR_SHARES.agriculture);
      otherEmissions = Math.max(0, otherEmissions - policyImpactTotal * SECTOR_SHARES.other);
      
      // ========================================
      // ECONOMIC GROWTH & CARBON INTENSITY
      // ========================================
      // Economic growth adds emissions, carbon intensity decline reduces them
      // Applied proportionally across all sectors
      const gdpGrowth = economicGrowthUncertainty / 100;
      const carbonIntensityDecline = indicators.carbonIntensityDeclineRate / 100 * 
                                     carbonIntensityDeclineUncertainty;
      
      const economicGrowthFactor = 1 + (gdpGrowth * yearOffset / years);
      const intensityDeclineFactor = 1 - (carbonIntensityDecline * yearOffset / years);
      const netEconomicFactor = economicGrowthFactor * intensityDeclineFactor;
      
      // Apply economic factors to all sectors
      powerEmissions *= netEconomicFactor;
      transportEmissions *= netEconomicFactor;
      industryEmissions *= netEconomicFactor;
      buildingsEmissions *= netEconomicFactor;
      agricultureEmissions *= netEconomicFactor;
      otherEmissions *= netEconomicFactor;
      
      // ========================================
      // TOTAL EMISSIONS
      // ========================================
      const yearEmissions = Math.max(
        0,
        powerEmissions +
        transportEmissions +
        industryEmissions +
        buildingsEmissions +
        agricultureEmissions +
        otherEmissions
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
 * Calculate temperature distribution from emissions trajectory
 */
export function calculateTemperatureDistribution(
  projections: ForwardProjection[],
  runs: number = 10000
): TemperatureProjection[] {
  const temperatureSamples: number[] = [];
  
  // IPCC AR6 climate parameters
  const TCRE = 0.00045; // °C per GtCO2 (0.45°C per 1000 GtCO2)
  const baselineWarming = 1.1; // °C above pre-industrial (2024)
  const ECS_mean = 3.0; // Equilibrium Climate Sensitivity
  const ECS_stddev = 0.5;
  
  for (let run = 0; run < runs; run++) {
    // Sample climate sensitivity
    const climateSensitivity = randomNormal(1.0, 0.17); // ±17% uncertainty
    
    // Get cumulative emissions by 2100
    const cumulativeEmissions = projections[projections.length - 1].cumulativeEmissions;
    
    // Calculate temperature using TCRE
    const temperatureIncrease = cumulativeEmissions * TCRE * climateSensitivity;
    const totalTemperature = baselineWarming + temperatureIncrease;
    
    temperatureSamples.push(totalTemperature);
  }
  
  // Create probability distribution
  temperatureSamples.sort((a, b) => a - b);
  
  const distribution: TemperatureProjection[] = [];
  const binSize = 0.1; // 0.1°C bins for smooth visualization
  const minTemp = Math.floor(temperatureSamples[0] * 100) / 100;
  const maxTemp = Math.ceil(temperatureSamples[temperatureSamples.length - 1] * 100) / 100;
  
  for (let temp = minTemp; temp <= maxTemp; temp += binSize) {
    const count = temperatureSamples.filter(t => t >= temp && t < temp + binSize).length;
    const probability = count / runs;
    const cumulativeProbability = temperatureSamples.filter(t => t <= temp + binSize / 2).length / runs;
    
    distribution.push({
      temperature: Math.round(temp * 100) / 100,
      probability,
      cumulativeProbability,
    });
  }
  
  return distribution;
}
