/**
 * Historical Indicators Data (2015-2024)
 * Compiled from authoritative sources: IRENA, IEA, Climate Action Tracker, World Bank, SBTi
 */

export interface HistoricalIndicatorData {
  year: number;
  renewableCapacityGW: number;
  renewableGrowthRate: number;
  evSalesSharePct: number;
  evGrowthRate: number;
  policyCoveragePct: number;
  policyImplementationRate: number;
  gdpTrillionUSD: number;
  carbonIntensityKgPerGDP: number;
  corporateTargetsPct: number;
  corporateImplementationRate: number;
  climateConcernPct: number;
  policySupportPct: number;
  sacrificeWillingnessPct: number;
  humanCausationPct: number;
}

/**
 * Historical indicator data (2015-2024) from multiple authoritative sources
 */
export const HISTORICAL_INDICATORS: HistoricalIndicatorData[] = [
  {
    year: 2015,
    renewableCapacityGW: 1985,
    renewableGrowthRate: 0.088,
    evSalesSharePct: 0.6,
    evGrowthRate: 0.70,
    policyCoveragePct: 45,
    policyImplementationRate: 0.35,
    gdpTrillionUSD: 75.8,
    carbonIntensityKgPerGDP: 0.45,
    corporateTargetsPct: 2,
    corporateImplementationRate: 0.45,
    climateConcernPct: 32,
    policySupportPct: 75,
    sacrificeWillingnessPct: 65,
    humanCausationPct: 62,
  },
  {
    year: 2016,
    renewableCapacityGW: 2152,
    renewableGrowthRate: 0.084,
    evSalesSharePct: 0.8,
    evGrowthRate: 0.60,
    policyCoveragePct: 52,
    policyImplementationRate: 0.38,
    gdpTrillionUSD: 76.4,
    carbonIntensityKgPerGDP: 0.44,
    corporateTargetsPct: 4,
    corporateImplementationRate: 0.48,
    climateConcernPct: 37,
    policySupportPct: 76,
    sacrificeWillingnessPct: 66,
    humanCausationPct: 65,
  },
  {
    year: 2017,
    renewableCapacityGW: 2295,
    renewableGrowthRate: 0.066,
    evSalesSharePct: 1.1,
    evGrowthRate: 0.54,
    policyCoveragePct: 58,
    policyImplementationRate: 0.42,
    gdpTrillionUSD: 81.0,
    carbonIntensityKgPerGDP: 0.43,
    corporateTargetsPct: 7,
    corporateImplementationRate: 0.52,
    climateConcernPct: 45,
    policySupportPct: 78,
    sacrificeWillingnessPct: 68,
    humanCausationPct: 68,
  },
  {
    year: 2018,
    renewableCapacityGW: 2480,
    renewableGrowthRate: 0.081,
    evSalesSharePct: 2.1,
    evGrowthRate: 0.72,
    policyCoveragePct: 62,
    policyImplementationRate: 0.45,
    gdpTrillionUSD: 86.6,
    carbonIntensityKgPerGDP: 0.42,
    corporateTargetsPct: 11,
    corporateImplementationRate: 0.56,
    climateConcernPct: 44,
    policySupportPct: 79,
    sacrificeWillingnessPct: 69,
    humanCausationPct: 67,
  },
  {
    year: 2019,
    renewableCapacityGW: 2659,
    renewableGrowthRate: 0.072,
    evSalesSharePct: 2.5,
    evGrowthRate: 0.40,
    policyCoveragePct: 67,
    policyImplementationRate: 0.48,
    gdpTrillionUSD: 87.8,
    carbonIntensityKgPerGDP: 0.41,
    corporateTargetsPct: 16,
    corporateImplementationRate: 0.60,
    climateConcernPct: 44,
    policySupportPct: 80,
    sacrificeWillingnessPct: 70,
    humanCausationPct: 66,
  },
  {
    year: 2020,
    renewableCapacityGW: 2838,
    renewableGrowthRate: 0.067,
    evSalesSharePct: 4.2,
    evGrowthRate: 0.41,
    policyCoveragePct: 72,
    policyImplementationRate: 0.52,
    gdpTrillionUSD: 84.7,
    carbonIntensityKgPerGDP: 0.39,
    corporateTargetsPct: 22,
    corporateImplementationRate: 0.65,
    climateConcernPct: 43,
    policySupportPct: 81,
    sacrificeWillingnessPct: 71,
    humanCausationPct: 64,
  },
  {
    year: 2021,
    renewableCapacityGW: 3087,
    renewableGrowthRate: 0.088,
    evSalesSharePct: 8.6,
    evGrowthRate: 1.08,
    policyCoveragePct: 78,
    policyImplementationRate: 0.58,
    gdpTrillionUSD: 96.1,
    carbonIntensityKgPerGDP: 0.40,
    corporateTargetsPct: 28,
    corporateImplementationRate: 0.70,
    climateConcernPct: 43,
    policySupportPct: 82,
    sacrificeWillingnessPct: 72,
    humanCausationPct: 64,
  },
  {
    year: 2022,
    renewableCapacityGW: 3382,
    renewableGrowthRate: 0.096,
    evSalesSharePct: 13.8,
    evGrowthRate: 0.68,
    policyCoveragePct: 82,
    policyImplementationRate: 0.62,
    gdpTrillionUSD: 101.6,
    carbonIntensityKgPerGDP: 0.38,
    corporateTargetsPct: 32,
    corporateImplementationRate: 0.75,
    climateConcernPct: 42,
    policySupportPct: 83,
    sacrificeWillingnessPct: 73,
    humanCausationPct: 64,
  },
  {
    year: 2023,
    renewableCapacityGW: 3870,
    renewableGrowthRate: 0.144,
    evSalesSharePct: 17.8,
    evGrowthRate: 0.35,
    policyCoveragePct: 85,
    policyImplementationRate: 0.65,
    gdpTrillionUSD: 105.0,
    carbonIntensityKgPerGDP: 0.37,
    corporateTargetsPct: 35,
    corporateImplementationRate: 0.79,
    climateConcernPct: 43,
    policySupportPct: 83,
    sacrificeWillingnessPct: 74,
    humanCausationPct: 64,
  },
  {
    year: 2024,
    renewableCapacityGW: 4455,
    renewableGrowthRate: 0.151,
    evSalesSharePct: 20.5,
    evGrowthRate: 0.25,
    policyCoveragePct: 87,
    policyImplementationRate: 0.67,
    gdpTrillionUSD: 108.5,
    carbonIntensityKgPerGDP: 0.36,
    corporateTargetsPct: 38,
    corporateImplementationRate: 0.82,
    climateConcernPct: 42,
    policySupportPct: 84,
    sacrificeWillingnessPct: 75,
    humanCausationPct: 64,
  },
];

/**
 * Get historical indicators for a specific year
 */
export function getHistoricalIndicators(year: number): HistoricalIndicatorData | null {
  return HISTORICAL_INDICATORS.find((d) => d.year === year) || null;
}

/**
 * Get all historical indicators
 */
export function getAllHistoricalIndicators(): HistoricalIndicatorData[] {
  return HISTORICAL_INDICATORS;
}

/**
 * Get historical indicator timeseries for charts
 */
export function getHistoricalIndicatorTimeseries(): HistoricalIndicatorData[] {
  return HISTORICAL_INDICATORS;
}
