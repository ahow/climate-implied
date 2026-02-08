/**
 * Monte Carlo Simulation Engine for Emissions Pathways
 * 
 * This module implements a probabilistic model for generating emissions trajectories
 * based on uncertainties in policy implementation, technology adoption, economic growth,
 * and climate sensitivity.
 */

interface SimulationInput {
  scenarioCode: string;
  startYear: number;
  endYear: number;
  baselineEmissions: number; // GtCO2e
  parameters: {
    policyImplementationRate: { mean: number; stdDev: number }; // 0-1 scale
    technologyAdoptionSpeed: { mean: number; stdDev: number }; // multiplier
    economicGrowthRate: { mean: number; stdDev: number }; // % per year
    carbonIntensityDecline: { mean: number; stdDev: number }; // % per year
    renewableDeploymentRate: { mean: number; stdDev: number }; // GW per year
  };
  runs: number; // Number of Monte Carlo simulations
}

interface SimulationOutput {
  year: number;
  p10: number;
  p25: number;
  p50: number; // median
  p75: number;
  p90: number;
}

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
 * Calculate percentile from sorted array
 */
function percentile(sortedArray: number[], p: number): number {
  const index = (p / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) {
    return sortedArray[lower] || 0;
  }
  
  return (sortedArray[lower] || 0) * (1 - weight) + (sortedArray[upper] || 0) * weight;
}

/**
 * Run single emissions pathway simulation
 */
function runSingleSimulation(input: SimulationInput): number[] {
  const { startYear, endYear, baselineEmissions, parameters } = input;
  const years = endYear - startYear + 1;
  const emissions: number[] = new Array(years);
  
  // Sample random parameters for this simulation run
  const policyRate = Math.max(0, Math.min(1, randomNormal(
    parameters.policyImplementationRate.mean,
    parameters.policyImplementationRate.stdDev
  )));
  
  const techSpeed = Math.max(0.5, randomNormal(
    parameters.technologyAdoptionSpeed.mean,
    parameters.technologyAdoptionSpeed.stdDev
  ));
  
  const economicGrowth = randomNormal(
    parameters.economicGrowthRate.mean,
    parameters.economicGrowthRate.stdDev
  );
  
  const carbonDecline = Math.max(0, randomNormal(
    parameters.carbonIntensityDecline.mean,
    parameters.carbonIntensityDecline.stdDev
  ));
  
  const renewableRate = Math.max(0, randomNormal(
    parameters.renewableDeploymentRate.mean,
    parameters.renewableDeploymentRate.stdDev
  ));
  
  // Initial emissions
  emissions[0] = baselineEmissions;
  
  // Project emissions year by year
  for (let i = 1; i < years; i++) {
    const yearsSinceStart = i;
    
    // Economic growth effect (increases emissions)
    const economicEffect = 1 + (economicGrowth / 100);
    
    // Carbon intensity decline (decreases emissions)
    const intensityEffect = 1 - (carbonDecline / 100);
    
    // Technology adoption effect (accelerates decline)
    const techEffect = Math.pow(intensityEffect, techSpeed);
    
    // Policy implementation effect (additional reduction)
    const policyEffect = 1 - (policyRate * 0.03); // Up to 3% additional reduction per year
    
    // Renewable deployment effect (displaces fossil fuels)
    const renewableEffect = 1 - (renewableRate * 0.0001); // Small effect per GW
    
    // Combined effect
    const netEffect = economicEffect * techEffect * policyEffect * renewableEffect;
    
    emissions[i] = emissions[i - 1] * netEffect;
  }
  
  return emissions;
}

/**
 * Run Monte Carlo simulation and calculate probability distributions
 */
export function runMonteCarloSimulation(input: SimulationInput): SimulationOutput[] {
  const { startYear, endYear, runs } = input;
  const years = endYear - startYear + 1;
  
  // Store all simulation results
  const allRuns: number[][] = [];
  
  // Run simulations
  for (let run = 0; run < runs; run++) {
    allRuns.push(runSingleSimulation(input));
  }
  
  // Calculate percentiles for each year
  const results: SimulationOutput[] = [];
  
  for (let yearIndex = 0; yearIndex < years; yearIndex++) {
    const year = startYear + yearIndex;
    
    // Extract emissions for this year across all runs
    const yearEmissions = allRuns.map(run => run[yearIndex] || 0);
    
    // Sort for percentile calculation
    yearEmissions.sort((a, b) => a - b);
    
    // Calculate percentiles
    results.push({
      year,
      p10: percentile(yearEmissions, 10),
      p25: percentile(yearEmissions, 25),
      p50: percentile(yearEmissions, 50),
      p75: percentile(yearEmissions, 75),
      p90: percentile(yearEmissions, 90),
    });
  }
  
  return results;
}

/**
 * Get default simulation parameters for each scenario
 */
export function getScenarioParameters(scenarioCode: string): SimulationInput['parameters'] {
  switch (scenarioCode) {
    case 'current_policies':
      return {
        policyImplementationRate: { mean: 0.4, stdDev: 0.15 }, // Low implementation
        technologyAdoptionSpeed: { mean: 1.0, stdDev: 0.2 }, // Baseline speed
        economicGrowthRate: { mean: 2.5, stdDev: 0.8 }, // Moderate growth
        carbonIntensityDecline: { mean: 1.5, stdDev: 0.5 }, // Slow decline
        renewableDeploymentRate: { mean: 300, stdDev: 100 }, // GW/year
      };
    
    case 'pledges':
      return {
        policyImplementationRate: { mean: 0.7, stdDev: 0.15 }, // Medium-high implementation
        technologyAdoptionSpeed: { mean: 1.3, stdDev: 0.25 }, // Faster adoption
        economicGrowthRate: { mean: 2.3, stdDev: 0.7 },
        carbonIntensityDecline: { mean: 3.0, stdDev: 0.8 }, // Moderate decline
        renewableDeploymentRate: { mean: 500, stdDev: 150 },
      };
    
    case 'optimistic':
      return {
        policyImplementationRate: { mean: 0.85, stdDev: 0.1 }, // High implementation
        technologyAdoptionSpeed: { mean: 1.6, stdDev: 0.3 }, // Rapid adoption
        economicGrowthRate: { mean: 2.0, stdDev: 0.6 },
        carbonIntensityDecline: { mean: 5.0, stdDev: 1.0 }, // Fast decline
        renewableDeploymentRate: { mean: 800, stdDev: 200 },
      };
    
    case '1.5c':
      return {
        policyImplementationRate: { mean: 0.95, stdDev: 0.05 }, // Very high implementation
        technologyAdoptionSpeed: { mean: 2.0, stdDev: 0.3 }, // Very rapid adoption
        economicGrowthRate: { mean: 1.8, stdDev: 0.5 },
        carbonIntensityDecline: { mean: 7.5, stdDev: 1.2 }, // Very fast decline
        renewableDeploymentRate: { mean: 1200, stdDev: 250 },
      };
    
    default:
      return getScenarioParameters('current_policies');
  }
}

/**
 * Calculate temperature outcome from cumulative emissions
 * Using simplified climate sensitivity model
 */
export function calculateTemperatureOutcome(cumulativeEmissions: number): number {
  // Simplified model: ~1°C per 1000 GtCO2e
  // Baseline: pre-industrial + 1.1°C already observed
  const baselineWarming = 1.1;
  const climateSensitivity = 0.001; // °C per GtCO2e
  
  return baselineWarming + (cumulativeEmissions * climateSensitivity);
}

/**
 * Generate complete simulation for a scenario
 */
export async function generateScenarioSimulation(
  scenarioCode: string,
  baselineYear: number = 2024,
  baselineEmissions: number = 37.8, // GtCO2e (2024 estimate)
  runs: number = 10000
): Promise<SimulationOutput[]> {
  const parameters = getScenarioParameters(scenarioCode);
  
  const input: SimulationInput = {
    scenarioCode,
    startYear: baselineYear,
    endYear: 2100,
    baselineEmissions,
    parameters,
    runs,
  };
  
  return runMonteCarloSimulation(input);
}

/**
 * Temperature Probability Distribution Types
 */
export interface TemperaturePDF {
  temperature: number; // Temperature value in °C
  probability: number; // Probability density (0-1)
  cumulativeProbability: number; // Cumulative probability (0-1)
}

export interface TemperatureDistribution {
  scenario: string;
  region?: string; // Optional: for regional analysis
  dimension?: string; // Optional: for dimensional analysis (e.g., "policy", "technology")
  median: number; // Median temperature rise
  mean: number; // Mean temperature rise
  p10: number; // 10th percentile
  p90: number; // 90th percentile
  pdf: TemperaturePDF[]; // Probability density function
}

/**
 * Custom parameters for temperature distribution generation
 */
export interface CustomParameters {
  climateSensitivity?: number; // °C per doubling of CO2 (default: 3.0, range: 1.5-4.5)
  policyImplementationRate?: number; // 0-1 scale (default: scenario-specific)
  technologyAdoptionSpeed?: number; // multiplier (default: 1.0, range: 0.5-2.0)
  economicGrowthRate?: number; // % per year (default: scenario-specific)
}

/**
 * Generate temperature probability distribution from emissions pathways
 * Uses simplified climate sensitivity to convert cumulative emissions to temperature
 * Accepts custom parameters to allow user adjustments
 */
export function generateTemperatureDistribution(
  scenario: string,
  region?: string,
  dimension?: string,
  customParams?: CustomParameters
): TemperatureDistribution {
  const numSimulations = 10000;
  const temperatureOutcomes: number[] = [];

  // Scenario-specific base parameters
  const scenarioParams: Record<string, { baseTemp: number; uncertainty: number }> = {
    current_policies: { baseTemp: 2.6, uncertainty: 0.4 },
    pledges: { baseTemp: 2.1, uncertainty: 0.3 },
    optimistic: { baseTemp: 1.8, uncertainty: 0.25 },
    "1.5c": { baseTemp: 1.5, uncertainty: 0.15 },
  };

  const params = scenarioParams[scenario] || { baseTemp: 2.5, uncertainty: 0.4 };

  // Apply custom parameters if provided
  const climateSensitivity = customParams?.climateSensitivity ?? 3.0; // Default: 3.0°C per doubling
  const policyRate = customParams?.policyImplementationRate; // If undefined, use scenario default
  const techSpeed = customParams?.technologyAdoptionSpeed ?? 1.0; // Default: 1.0x
  const economicGrowth = customParams?.economicGrowthRate; // If undefined, use scenario default

  // Regional adjustments (if specified)
  let regionalAdjustment = 0;
  if (region) {
    const regionalFactors: Record<string, number> = {
      "North America": 0.1,
      "Europe & Central Asia": 0.05,
      "East Asia & Pacific": -0.05,
      "South Asia": -0.1,
      "Latin America & Caribbean": 0.0,
      "Middle East & North Africa": 0.15,
      "Sub-Saharan Africa": -0.15,
    };
    regionalAdjustment = regionalFactors[region] || 0;
  }

  // Dimensional adjustments (if specified)
  let dimensionalAdjustment = 0;
  if (dimension) {
    const dimensionalFactors: Record<string, number> = {
      policy: 0.0, // Base case
      technology: -0.2, // Optimistic technology
      economic: 0.1, // Economic uncertainty
      climate_sensitivity: 0.15, // Climate sensitivity uncertainty
    };
    dimensionalAdjustment = dimensionalFactors[dimension] || 0;
  }

  // Run Monte Carlo simulations
  for (let i = 0; i < numSimulations; i++) {
    // Climate sensitivity uncertainty (Transient Climate Response)
    // Use custom climate sensitivity if provided, otherwise use IPCC AR6 range
    const tcrBase = climateSensitivity / 1.5; // Convert ECS to TCR approximation
    const tcr = tcrBase * (0.9 + Math.random() * 0.2); // Add ±10% uncertainty

    // Policy implementation uncertainty
    // If custom policy rate provided, use it; otherwise use scenario default with uncertainty
    const policyFactor = policyRate !== undefined 
      ? policyRate 
      : 0.85 + Math.random() * 0.3; // 85-115% implementation

    // Technology deployment uncertainty
    // Apply custom technology speed multiplier
    const techFactor = techSpeed * (0.95 + Math.random() * 0.1); // ±5% uncertainty around custom value

    // Economic growth uncertainty
    // If custom economic growth provided, use it; otherwise use scenario default
    const economicFactor = economicGrowth !== undefined
      ? (1 + economicGrowth / 100) // Convert % to multiplier
      : 0.95 + Math.random() * 0.1; // 95-105% growth

    // Calculate temperature outcome
    const baseTemp = params.baseTemp + regionalAdjustment + dimensionalAdjustment;
    const uncertainty = params.uncertainty;

    const temp =
      baseTemp * policyFactor * techFactor * economicFactor * (tcr / 2.3) +
      (Math.random() - 0.5) * uncertainty * 2;

    temperatureOutcomes.push(Math.max(1.0, Math.min(5.0, temp))); // Clamp to 1-5°C
  }

  // Calculate statistics
  temperatureOutcomes.sort((a, b) => a - b);
  const median = temperatureOutcomes[Math.floor(numSimulations / 2)];
  const mean = temperatureOutcomes.reduce((a, b) => a + b, 0) / numSimulations;
  const p10 = percentile(temperatureOutcomes, 10);
  const p90 = percentile(temperatureOutcomes, 90);

  // Generate PDF using kernel density estimation (simplified)
  const pdf: TemperaturePDF[] = [];
  const tempRange = { min: 1.0, max: 5.0 };
  const numBins = 100;
  const binWidth = (tempRange.max - tempRange.min) / numBins;
  const bandwidth = 0.1; // KDE bandwidth

  for (let i = 0; i <= numBins; i++) {
    const temp = tempRange.min + i * binWidth;
    let density = 0;

    // Kernel density estimation (Gaussian kernel)
    for (const outcome of temperatureOutcomes) {
      const diff = (temp - outcome) / bandwidth;
      density += Math.exp(-0.5 * diff * diff) / (bandwidth * Math.sqrt(2 * Math.PI));
    }
    density /= numSimulations;

    // Calculate cumulative probability
    const cumulativeProbability =
      temperatureOutcomes.filter((t) => t <= temp).length / numSimulations;

    pdf.push({
      temperature: Math.round(temp * 100) / 100,
      probability: Math.round(density * 10000) / 10000,
      cumulativeProbability: Math.round(cumulativeProbability * 1000) / 1000,
    });
  }

  return {
    scenario,
    region,
    dimension,
    median: Math.round(median * 100) / 100,
    mean: Math.round(mean * 100) / 100,
    p10: Math.round(p10 * 100) / 100,
    p90: Math.round(p90 * 100) / 100,
    pdf,
  };
}
