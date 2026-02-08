/**
 * Sectoral Decomposition Module
 * 
 * This module implements sector-specific emissions projections using Climate TRACE data.
 * Each sector has its own indicators and projection logic, which are then aggregated
 * to produce the overall global emissions trajectory.
 */

interface SectorIndicators {
  // Power sector
  renewableShare: number; // % of electricity from renewables
  coalPhaseOutRate: number; // Annual % reduction in coal capacity
  
  // Transport sector
  evSalesShare: number; // % of new vehicle sales that are electric
  aviationEfficiency: number; // % annual improvement in fuel efficiency
  
  // Industry sector
  greenSteelAdoption: number; // % of steel production using green methods
  electrificationRate: number; // % of industrial processes electrified
  
  // Buildings sector
  heatPumpDeployment: number; // Annual heat pump installations (millions)
  efficiencyStandards: number; // % improvement in building efficiency
  
  // Agriculture sector
  methaneReduction: number; // % reduction in agricultural methane
  sustainablePractices: number; // % of farmland using sustainable methods
}

interface SectorEmissions {
  sector: string;
  emissions: number; // Gt CO2e
  share: number; // % of total
}

interface SectorProjection {
  year: number;
  power: number;
  transport: number;
  industry: number;
  buildings: number;
  agriculture: number;
  other: number;
  total: number;
}

/**
 * Fetch sector-level emissions from Climate TRACE API
 */
export async function fetchSectoralEmissions(year: number = 2024): Promise<SectorEmissions[]> {
  // Using authoritative default sectoral breakdown from IEA/IPCC
  // Climate TRACE API integration for sector-level data can be added when endpoint is confirmed
  return getDefaultSectoralEmissions();
  
  /* Climate TRACE API integration - to be enabled when endpoint is confirmed
  try {
    const response = await fetch(
      `https://api.climatetrace.org/v7/country/emissions/aggregates?since=${year}&to=${year}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`Climate TRACE API returned ${response.status}, using default sectoral breakdown`);
      return getDefaultSectoralEmissions();
    }

    const data = await response.json();
    
    // Parse Climate TRACE response to extract sector emissions
    // Climate TRACE uses 10 sectors - we'll map to our 6 main categories
    const sectorMapping: Record<string, string> = {
      'power': 'power',
      'electricity-generation': 'power',
      'transportation': 'transport',
      'road-transportation': 'transport',
      'aviation': 'transport',
      'shipping': 'transport',
      'manufacturing': 'industry',
      'mineral-extraction': 'industry',
      'industrial-processes': 'industry',
      'buildings': 'buildings',
      'agriculture': 'agriculture',
      'forestry-and-land-use': 'other',
      'waste': 'other',
    };

    const sectorTotals: Record<string, number> = {
      power: 0,
      transport: 0,
      industry: 0,
      buildings: 0,
      agriculture: 0,
      other: 0,
    };

    // Aggregate emissions by our sector categories
    if (data.totals && data.totals.summaries) {
      for (const summary of data.totals.summaries) {
        const mappedSector = sectorMapping[summary.sector] || 'other';
        sectorTotals[mappedSector] += summary.emissions_quantity || 0;
      }
    }

    const total = Object.values(sectorTotals).reduce((sum, val) => sum + val, 0);

    return Object.entries(sectorTotals).map(([sector, emissions]) => ({
      sector,
      emissions: emissions / 1e9, // Convert to Gt CO2e
      share: total > 0 ? (emissions / total) * 100 : 0,
    }));
  } catch (error) {
    console.error('Error fetching sectoral emissions:', error);
    return getDefaultSectoralEmissions();
  }
  */
}

/**
 * Default sectoral emissions based on recent global data
 * Source: IEA, IPCC AR6 estimates
 */
function getDefaultSectoralEmissions(): SectorEmissions[] {
  return [
    { sector: 'power', emissions: 16.2, share: 26.9 }, // Electricity & heat
    { sector: 'transport', emissions: 8.7, share: 14.4 }, // All transport
    { sector: 'industry', emissions: 14.5, share: 24.1 }, // Manufacturing & construction
    { sector: 'buildings', emissions: 5.8, share: 9.6 }, // Residential & commercial
    { sector: 'agriculture', emissions: 10.3, share: 17.1 }, // Agriculture & land use
    { sector: 'other', emissions: 4.8, share: 8.0 }, // Waste & other
  ];
}

/**
 * Get current sector-specific indicators
 * These drive the projection for each sector
 */
export async function getSectorIndicators(): Promise<SectorIndicators> {
  // In a full implementation, these would be fetched from various APIs
  // For now, using recent real-world values
  return {
    // Power sector (Source: IRENA, IEA)
    renewableShare: 29.5, // 2024 global renewable electricity share
    coalPhaseOutRate: 3.2, // Annual decline in coal capacity
    
    // Transport (Source: IEA, BloombergNEF)
    evSalesShare: 18.0, // 2024 global EV sales share
    aviationEfficiency: 1.5, // Annual fuel efficiency improvement
    
    // Industry (Source: IEA, Material Economics)
    greenSteelAdoption: 2.5, // Green hydrogen steel production
    electrificationRate: 25.0, // Industrial electrification level
    
    // Buildings (Source: IEA)
    heatPumpDeployment: 15.0, // Million units per year
    efficiencyStandards: 2.0, // Annual efficiency improvement
    
    // Agriculture (Source: FAO, IPCC)
    methaneReduction: 5.0, // Methane reduction from baseline
    sustainablePractices: 15.0, // Sustainable agriculture adoption
  };
}

/**
 * Project emissions for the power sector
 */
function projectPowerSector(
  baselineEmissions: number,
  indicators: SectorIndicators,
  year: number
): number {
  const yearsFromNow = year - 2024;
  
  // Renewable growth follows logistic curve
  const renewableGrowthRate = 0.09; // 9% annual growth
  const renewableSaturation = 85; // Maximum practical renewable share
  
  const futureRenewableShare = Math.min(
    renewableSaturation,
    indicators.renewableShare * Math.pow(1 + renewableGrowthRate, yearsFromNow)
  );
  
  // Coal phase-out accelerates renewable displacement
  const coalReduction = 1 - Math.pow(1 - indicators.coalPhaseOutRate / 100, yearsFromNow);
  
  // Emissions reduction from renewable growth and coal phase-out
  const emissionsReduction = (futureRenewableShare - indicators.renewableShare) / 100 * 0.7 + coalReduction * 0.3;
  
  return baselineEmissions * (1 - emissionsReduction);
}

/**
 * Project emissions for the transport sector
 */
function projectTransportSector(
  baselineEmissions: number,
  indicators: SectorIndicators,
  year: number
): number {
  const yearsFromNow = year - 2024;
  
  // EV adoption follows S-curve
  const evGrowthRate = 0.25; // 25% annual growth in EV sales
  const evSaturation = 95; // Maximum EV market share
  
  const futureEVShare = Math.min(
    evSaturation,
    indicators.evSalesShare * Math.pow(1 + evGrowthRate, yearsFromNow)
  );
  
  // Fleet turnover: ~7% of fleet replaced annually
  const fleetTurnoverRate = 0.07;
  const evFleetShare = futureEVShare * fleetTurnoverRate * yearsFromNow;
  
  // Aviation efficiency improvements
  const aviationReduction = 1 - Math.pow(1 - indicators.aviationEfficiency / 100, yearsFromNow);
  
  // Road transport is 75% of sector, aviation 12%, shipping 11%, other 2%
  const roadReduction = Math.min(0.8, evFleetShare / 100) * 0.75;
  const aviationReductionTotal = aviationReduction * 0.12;
  
  const totalReduction = roadReduction + aviationReductionTotal;
  
  return baselineEmissions * (1 - totalReduction);
}

/**
 * Project emissions for the industry sector
 */
function projectIndustrySector(
  baselineEmissions: number,
  indicators: SectorIndicators,
  year: number
): number {
  const yearsFromNow = year - 2024;
  
  // Green steel and cement adoption (steel is ~7% of industrial emissions, cement ~7%)
  const greenMaterialsGrowth = 0.15; // 15% annual growth
  const futureGreenShare = Math.min(
    50, // Maximum practical share by 2100
    indicators.greenSteelAdoption * Math.pow(1 + greenMaterialsGrowth, yearsFromNow)
  );
  
  // Industrial electrification
  const electrificationGrowth = 0.03; // 3% annual increase
  const futureElectrification = Math.min(
    70,
    indicators.electrificationRate + electrificationGrowth * yearsFromNow * 100
  );
  
  // Heavy industry (steel, cement, chemicals) is ~40% of industrial emissions
  const heavyIndustryReduction = (futureGreenShare - indicators.greenSteelAdoption) / 100 * 0.4;
  const electrificationReduction = (futureElectrification - indicators.electrificationRate) / 100 * 0.3;
  
  const totalReduction = heavyIndustryReduction + electrificationReduction;
  
  return baselineEmissions * (1 - totalReduction);
}

/**
 * Project emissions for the buildings sector
 */
function projectBuildingsSector(
  baselineEmissions: number,
  indicators: SectorIndicators,
  year: number
): number {
  const yearsFromNow = year - 2024;
  
  // Heat pump deployment (replaces fossil fuel heating)
  const heatPumpGrowth = 0.12; // 12% annual growth
  const futureHeatPumps = indicators.heatPumpDeployment * Math.pow(1 + heatPumpGrowth, yearsFromNow);
  
  // Heating is ~50% of building emissions
  // Each million heat pumps reduces ~0.003 Gt CO2e
  const heatingReduction = Math.min(0.5, (futureHeatPumps - indicators.heatPumpDeployment) * 0.003 / baselineEmissions);
  
  // Efficiency standards
  const efficiencyReduction = 1 - Math.pow(1 - indicators.efficiencyStandards / 100, yearsFromNow);
  const efficiencyImpact = efficiencyReduction * 0.3; // Efficiency affects 30% of emissions
  
  const totalReduction = heatingReduction + efficiencyImpact;
  
  return baselineEmissions * (1 - totalReduction);
}

/**
 * Project emissions for the agriculture sector
 */
function projectAgricultureSector(
  baselineEmissions: number,
  indicators: SectorIndicators,
  year: number
): number {
  const yearsFromNow = year - 2024;
  
  // Methane reduction (livestock, rice cultivation)
  const methaneGrowth = 0.02; // 2% annual improvement
  const futureMethaneReduction = Math.min(
    40, // Maximum practical reduction
    indicators.methaneReduction + methaneGrowth * yearsFromNow * 100
  );
  
  // Sustainable practices (soil carbon, reduced tillage, etc.)
  const sustainableGrowth = 0.04; // 4% annual growth
  const futureSustainableShare = Math.min(
    60,
    indicators.sustainablePractices + sustainableGrowth * yearsFromNow * 100
  );
  
  // Methane is ~40% of agricultural emissions
  const methaneImpact = (futureMethaneReduction - indicators.methaneReduction) / 100 * 0.4;
  
  // Sustainable practices affect ~30% of emissions
  const sustainableImpact = (futureSustainableShare - indicators.sustainablePractices) / 100 * 0.3;
  
  const totalReduction = methaneImpact + sustainableImpact;
  
  return baselineEmissions * (1 - totalReduction);
}

/**
 * Project emissions for other sectors (waste, etc.)
 */
function projectOtherSector(
  baselineEmissions: number,
  year: number
): number {
  const yearsFromNow = year - 2024;
  
  // Waste sector improvements (landfill gas capture, waste-to-energy)
  const wasteReductionRate = 0.02; // 2% annual reduction
  const reduction = 1 - Math.pow(1 - wasteReductionRate, yearsFromNow);
  
  return baselineEmissions * (1 - reduction);
}

/**
 * Generate sectoral emissions projections from 2024 to 2100
 */
export async function generateSectoralProjections(): Promise<SectorProjection[]> {
  const baselineEmissions = await fetchSectoralEmissions(2024);
  const indicators = await getSectorIndicators();
  
  const projections: SectorProjection[] = [];
  
  for (let year = 2024; year <= 2100; year += 5) {
    const powerEmissions = projectPowerSector(
      baselineEmissions.find(s => s.sector === 'power')?.emissions || 16.2,
      indicators,
      year
    );
    
    const transportEmissions = projectTransportSector(
      baselineEmissions.find(s => s.sector === 'transport')?.emissions || 8.7,
      indicators,
      year
    );
    
    const industryEmissions = projectIndustrySector(
      baselineEmissions.find(s => s.sector === 'industry')?.emissions || 14.5,
      indicators,
      year
    );
    
    const buildingsEmissions = projectBuildingsSector(
      baselineEmissions.find(s => s.sector === 'buildings')?.emissions || 5.8,
      indicators,
      year
    );
    
    const agricultureEmissions = projectAgricultureSector(
      baselineEmissions.find(s => s.sector === 'agriculture')?.emissions || 10.3,
      indicators,
      year
    );
    
    const otherEmissions = projectOtherSector(
      baselineEmissions.find(s => s.sector === 'other')?.emissions || 4.8,
      year
    );
    
    const total = powerEmissions + transportEmissions + industryEmissions + 
                  buildingsEmissions + agricultureEmissions + otherEmissions;
    
    projections.push({
      year,
      power: powerEmissions,
      transport: transportEmissions,
      industry: industryEmissions,
      buildings: buildingsEmissions,
      agriculture: agricultureEmissions,
      other: otherEmissions,
      total,
    });
  }
  
  return projections;
}

/**
 * Get current sectoral breakdown for display
 */
export async function getCurrentSectoralBreakdown(): Promise<SectorEmissions[]> {
  return await fetchSectoralEmissions(2024);
}
