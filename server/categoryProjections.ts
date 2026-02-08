/**
 * Category-Specific Projections
 * 
 * This module generates projections showing the impact of each individual
 * reduction factor category (Technology, Policy, Corporate, Socioeconomic).
 * 
 * Each projection isolates one category by setting its weight to 1.0 while
 * setting all others to 0, allowing users to see "what if only technology improved?"
 * or "what if only policy strengthened?"
 */

import { calculateEmissionsTrajectory, calculateTemperatureDistribution, getCurrentIndicators, type IndicatorData } from "./forwardProjectionSectorSpecific";
import { calculateTemperatureRise, findNetZeroYear, calculateReductionRate } from "./metricTranslations";
import { getSocioeconomicIndicators, calculateSocioeconomicScore } from "./socioeconomicIndicators";

export type Category = 'technology' | 'policy' | 'corporate' | 'socioeconomic';

interface CategoryProjectionResult {
  category: Category;
  categoryName: string;
  temperatureRise: number;
  reductionRate: number;
  netZeroYear: number | null;
  trajectory: Array<{
    year: number;
    emissions: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    cumulativeEmissions: number;
  }>;
  temperatureDistribution: Array<{ temperature: number; probability: number }>;
}

/**
 * Calculate projection for a specific category in isolation
 */
export function calculateCategoryProjection(
  category: Category,
  year: number = 2024
): CategoryProjectionResult {
  // Get current indicators
  const indicators = getCurrentIndicators();
  
  // Modify indicator weights based on selected category
  // Set selected category's indicators to maximum impact, others to baseline
  const modifiedIndicators: IndicatorData = {
    ...indicators,
    // Technology indicators
    renewableCapacityGW: category === 'technology' ? 5000 : indicators.renewableCapacityGW,
    evSalesShare: category === 'technology' ? 50 : indicators.evSalesShare,
    // Policy indicators  
    policyCoveragePercent: category === 'policy' ? 100 : (category === 'socioeconomic' ? indicators.policyCoveragePercent * 1.3 : indicators.policyCoveragePercent),
    policyImplementationRate: category === 'policy' ? 1.0 : (category === 'socioeconomic' ? indicators.policyImplementationRate * 1.3 : indicators.policyImplementationRate),
    // Corporate indicators
    sbtiCompaniesPercent: category === 'corporate' ? 80 : indicators.sbtiCompaniesPercent,
    corporateImplementationRate: category === 'corporate' ? 1.0 : (category === 'socioeconomic' ? indicators.corporateImplementationRate * 1.2 : indicators.corporateImplementationRate),
    // Socioeconomic indicators (affects carbon intensity and behavior change)
    carbonIntensity: category === 'socioeconomic' ? indicators.carbonIntensity * 0.85 : indicators.carbonIntensity,
  };
  
  // Calculate projection with modified indicators
  const projections = calculateEmissionsTrajectory(modifiedIndicators, year, 2100, 1000);
  const temperatureDistribution = calculateTemperatureDistribution(projections, year);
  
  // Get trajectory with percentiles
  const trajectory = projections.map((p) => ({
    year: p.year,
    emissions: p.emissions,
    p10: p.p10,
    p25: p.p25,
    p50: p.p50,
    p75: p.p75,
    p90: p.p90,
    cumulativeEmissions: p.cumulativeEmissions,
  }));
  
  // Calculate metrics
  const emissions2024 = projections[0].emissions;
  const emissions2034 = projections[10].emissions;
  const emissions2100 = projections[projections.length - 1].emissions;
  
  // Calculate temperature rise from distribution median (same method as main projection)
  const sortedTemps = [...temperatureDistribution].sort((a, b) => a.temperature - b.temperature);
  const temperatureRise = sortedTemps[Math.floor(sortedTemps.length * 0.5)]?.temperature || 2.7;
  
  const reductionRate = calculateReductionRate(emissions2024, emissions2034);
  const netZeroYear = findNetZeroYear(projections);
  
  // Map category to display name
  const categoryNames: Record<Category, string> = {
    technology: 'Technology',
    policy: 'Policy',
    corporate: 'Corporate',
    socioeconomic: 'Socioeconomic',
  };
  
  return {
    category,
    categoryName: categoryNames[category],
    temperatureRise,
    reductionRate,
    netZeroYear,
    trajectory,
    temperatureDistribution,
  };
}

/**
 * Calculate projections for all categories
 */
export async function calculateAllCategoryProjections(
  year: number = 2024
): Promise<CategoryProjectionResult[]> {
  const categories: Category[] = ['technology', 'policy', 'corporate', 'socioeconomic'];
  
  const projections = await Promise.all(
    categories.map(category => calculateCategoryProjection(category, year))
  );
  
  return projections;
}
