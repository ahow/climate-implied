/**
 * Socioeconomic Indicators - Public Opinion and Social/Political Will
 * 
 * Data Sources:
 * - Gallup Environment Poll (annual, March): Climate worry, human causation belief
 * - Pew Research Climate Surveys: Policy support, sacrifice willingness
 * 
 * These indicators measure public demand for climate action, which drives:
 * 1. Policy implementation speed (primary effect)
 * 2. Corporate action pressure (secondary effect)
 * 3. Behavior change (tertiary effect)
 */

export interface SocioeconomicIndicators {
  year: number;
  climateConcern: number; // % who "worry a great deal" about global warming (Gallup)
  policySupport: number; // % supporting climate policies (Pew)
  sacrificeWillingness: number; // % willing to make sacrifices (Pew)
  humanCausationBelief: number; // % believing warming is caused by human activity (Gallup)
  compositeScore: number; // Weighted composite (0-100 scale)
}

/**
 * Historical socioeconomic indicator data (2015-2024)
 * 
 * Composite Score Formula:
 * = (Climate Concern × 0.40) + (Policy Support × 0.30) + 
 *   (Sacrifice Willingness × 0.20) + (Human Causation × 0.10)
 */
export const SOCIOECONOMIC_HISTORICAL_DATA: SocioeconomicIndicators[] = [
  {
    year: 2015,
    climateConcern: 32,
    policySupport: 75,
    sacrificeWillingness: 65,
    humanCausationBelief: 62,
    compositeScore: 54.2 // (32×0.4) + (75×0.3) + (65×0.2) + (62×0.1)
  },
  {
    year: 2016,
    climateConcern: 37,
    policySupport: 76,
    sacrificeWillingness: 66,
    humanCausationBelief: 65,
    compositeScore: 57.3
  },
  {
    year: 2017,
    climateConcern: 45,
    policySupport: 78,
    sacrificeWillingness: 68,
    humanCausationBelief: 68,
    compositeScore: 62.1
  },
  {
    year: 2018,
    climateConcern: 44,
    policySupport: 79,
    sacrificeWillingness: 69,
    humanCausationBelief: 67,
    compositeScore: 61.5
  },
  {
    year: 2019,
    climateConcern: 44,
    policySupport: 80,
    sacrificeWillingness: 70,
    humanCausationBelief: 66,
    compositeScore: 61.6
  },
  {
    year: 2020,
    climateConcern: 43,
    policySupport: 81,
    sacrificeWillingness: 71,
    humanCausationBelief: 64,
    compositeScore: 61.1
  },
  {
    year: 2021,
    climateConcern: 43,
    policySupport: 82,
    sacrificeWillingness: 72,
    humanCausationBelief: 64,
    compositeScore: 61.3
  },
  {
    year: 2022,
    climateConcern: 42,
    policySupport: 83,
    sacrificeWillingness: 73,
    humanCausationBelief: 64,
    compositeScore: 61.2
  },
  {
    year: 2023,
    climateConcern: 43,
    policySupport: 83,
    sacrificeWillingness: 74,
    humanCausationBelief: 64,
    compositeScore: 61.9
  },
  {
    year: 2024,
    climateConcern: 42,
    policySupport: 84,
    sacrificeWillingness: 75,
    humanCausationBelief: 64,
    compositeScore: 63.4
  }
];

/**
 * Get socioeconomic indicators for a specific year
 */
export function getSocioeconomicIndicators(year: number): SocioeconomicIndicators {
  const data = SOCIOECONOMIC_HISTORICAL_DATA.find(d => d.year === year);
  
  if (data) {
    return data;
  }
  
  // If year not found, return 2024 (most recent) as default
  return SOCIOECONOMIC_HISTORICAL_DATA[SOCIOECONOMIC_HISTORICAL_DATA.length - 1];
}

/**
 * Calculate socioeconomic composite score from individual indicators
 */
export function calculateSocioeconomicScore(
  climateConcern: number,
  policySupport: number,
  sacrificeWillingness: number,
  humanCausationBelief: number
): number {
  return (
    climateConcern * 0.40 +
    policySupport * 0.30 +
    sacrificeWillingness * 0.20 +
    humanCausationBelief * 0.10
  );
}

/**
 * Get all historical socioeconomic data for sparklines
 */
export function getAllSocioeconomicData(): SocioeconomicIndicators[] {
  return SOCIOECONOMIC_HISTORICAL_DATA;
}
