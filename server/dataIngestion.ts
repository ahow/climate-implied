/**
 * Data Ingestion Module
 * 
 * Handles fetching and processing data from multiple global sources:
 * - World Bank indicators (CO2 emissions, GDP, population, renewable energy)
 * - Simulated data for corporate commitments and technology deployment
 * 
 * Note: This module provides the foundation for real-time data integration.
 * Additional API integrations can be added as needed.
 */

import { callDataApi } from "./_core/dataApi";

export interface EmissionsDataPoint {
  countryCode: string;
  year: number;
  emissions: number; // MtCO2
  source: string;
}

export interface RenewableEnergyData {
  countryCode: string;
  year: number;
  renewableShare: number; // % of total energy
  source: string;
}

export interface CountryData {
  isoCode: string;
  name: string;
  region: string;
  incomeGroup: string;
  population?: number;
  gdp?: number;
}

/**
 * Fetch CO2 emissions data from World Bank
 */
export async function fetchWorldBankEmissions(
  startYear: number = 1990,
  endYear: number = 2023
): Promise<EmissionsDataPoint[]> {
  try {
    // World Bank indicator for CO2 emissions (kt)
    const indicatorCode = "EN.ATM.CO2E.KT";
    
    const response = await callDataApi("DataBank/indicator_data", {
      query: {
        indicatorCode,
        startYear: startYear.toString(),
        endYear: endYear.toString(),
      },
    }) as any;

    const data: EmissionsDataPoint[] = [];
    
    if (response && Array.isArray(response.data)) {
      for (const item of response.data) {
        if (item.countryCode && item.year && item.value != null) {
          data.push({
            countryCode: item.countryCode,
            year: parseInt(item.year),
            emissions: parseFloat(item.value) / 1000, // Convert kt to Mt
            source: "World Bank",
          });
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching World Bank emissions data:", error);
    return [];
  }
}

/**
 * Fetch renewable energy data from World Bank
 */
export async function fetchRenewableEnergyData(
  startYear: number = 2000,
  endYear: number = 2023
): Promise<RenewableEnergyData[]> {
  try {
    // World Bank indicator for renewable energy consumption (% of total)
    const indicatorCode = "EG.FEC.RNEW.ZS";
    
    const response = await callDataApi("DataBank/indicator_data", {
      query: {
        indicatorCode,
        startYear: startYear.toString(),
        endYear: endYear.toString(),
      },
    }) as any;

    const data: RenewableEnergyData[] = [];
    
    if (response && Array.isArray(response.data)) {
      for (const item of response.data) {
        if (item.countryCode && item.year && item.value != null) {
          data.push({
            countryCode: item.countryCode,
            year: parseInt(item.year),
            renewableShare: parseFloat(item.value),
            source: "World Bank",
          });
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching renewable energy data:", error);
    return [];
  }
}

/**
 * Fetch country list with metadata from World Bank
 */
export async function fetchCountryList(): Promise<CountryData[]> {
  try {
    const response = await callDataApi("DataBank/country_list", {
      query: {
        pageSize: 300, // Get all countries
      },
    }) as any;

    const countries: CountryData[] = [];
    
    if (response && Array.isArray(response.data)) {
      for (const item of response.data) {
        if (item.id && item.name) {
          countries.push({
            isoCode: item.id, // World Bank uses ISO3 codes
            name: item.name,
            region: item.region?.value || "Unknown",
            incomeGroup: item.incomeLevel?.value || "Unknown",
          });
        }
      }
    }
    
    return countries;
  } catch (error) {
    console.error("Error fetching country list:", error);
    return [];
  }
}

/**
 * Fetch GDP data from World Bank
 */
export async function fetchGDPData(year: number = 2023): Promise<Map<string, number>> {
  try {
    const indicatorCode = "NY.GDP.MKTP.CD"; // GDP (current US$)
    
    const response = await callDataApi("DataBank/indicator_data", {
      query: {
        indicatorCode,
        startYear: year.toString(),
        endYear: year.toString(),
      },
    }) as any;

    const gdpMap = new Map<string, number>();
    
    if (response && Array.isArray(response.data)) {
      for (const item of response.data) {
        if (item.countryCode && item.value != null) {
          gdpMap.set(item.countryCode, parseFloat(item.value));
        }
      }
    }
    
    return gdpMap;
  } catch (error) {
    console.error("Error fetching GDP data:", error);
    return new Map();
  }
}

/**
 * Fetch population data from World Bank
 */
export async function fetchPopulationData(year: number = 2023): Promise<Map<string, number>> {
  try {
    const indicatorCode = "SP.POP.TOTL"; // Population, total
    
    const response = await callDataApi("DataBank/indicator_data", {
      query: {
        indicatorCode,
        startYear: year.toString(),
        endYear: year.toString(),
      },
    }) as any;

    const popMap = new Map<string, number>();
    
    if (response && Array.isArray(response.data)) {
      for (const item of response.data) {
        if (item.countryCode && item.value != null) {
          popMap.set(item.countryCode, parseFloat(item.value));
        }
      }
    }
    
    return popMap;
  } catch (error) {
    console.error("Error fetching population data:", error);
    return new Map();
  }
}

/**
 * Generate synthetic corporate commitments data
 * In production, this would integrate with SBTi and Climate Action 100+ APIs
 */
export function generateCorporateCommitmentsData() {
  const sectors = [
    "Energy", "Transportation", "Manufacturing", "Technology", 
    "Finance", "Retail", "Agriculture", "Construction"
  ];
  
  const companies = [
    "Global Energy Corp", "TransWorld Logistics", "MegaManufacturing Inc",
    "TechGiant Systems", "Universal Bank Group", "RetailChain International",
    "AgriFood Solutions", "BuildCo Construction"
  ];
  
  return companies.map((company, index) => ({
    companyName: company,
    sector: sectors[index % sectors.length],
    hasSbtiTarget: Math.random() > 0.3 ? 1 : 0,
    sbtiTargetType: Math.random() > 0.5 ? "net-zero" : "near-term",
    ca100Assessment: ["leading", "aligned", "aligning", "not aligned"][Math.floor(Math.random() * 4)],
    baselineEmissions: 5 + Math.random() * 45, // 5-50 MtCO2e
    targetYear: 2030 + Math.floor(Math.random() * 21), // 2030-2050
    targetReduction: 40 + Math.random() * 60, // 40-100%
    currentProgress: Math.random() * 70, // 0-70%
  }));
}

/**
 * Generate synthetic technology deployment data
 * In production, this would integrate with IEA and IRENA APIs
 */
export function generateTechnologyDeploymentData() {
  const technologies = [
    { type: "solar", unit: "GW", baseCapacity: 1000 },
    { type: "wind", unit: "GW", baseCapacity: 800 },
    { type: "ev", unit: "million_units", baseCapacity: 25 },
    { type: "battery_storage", unit: "GW", baseCapacity: 150 },
  ];
  
  const data: any[] = [];
  const startYear = 2015;
  const endYear = 2024;
  
  for (const tech of technologies) {
    for (let year = startYear; year <= endYear; year++) {
      const yearsFromStart = year - startYear;
      const growthFactor = Math.pow(1.2, yearsFromStart); // 20% annual growth
      
      data.push({
        year,
        technologyType: tech.type,
        capacity: tech.baseCapacity * growthFactor * (0.9 + Math.random() * 0.2),
        capacityUnit: tech.unit,
        annualAdditions: tech.baseCapacity * 0.15 * growthFactor * (0.8 + Math.random() * 0.4),
        cumulativeInvestment: tech.baseCapacity * 2 * growthFactor,
      });
    }
  }
  
  return data;
}

/**
 * Calculate global KPI metrics from emissions and renewable data
 */
export function calculateKPIMetrics(
  emissionsData: EmissionsDataPoint[],
  renewableData: RenewableEnergyData[],
  year: number
): {
  decarbonizationRate: number;
  renewableEnergyShare: number;
  carbonPricingCoverage: number;
  projectedWarming: number;
} {
  // Filter data for the specified year
  const yearEmissions = emissionsData.filter(d => d.year === year);
  const prevYearEmissions = emissionsData.filter(d => d.year === year - 1);
  
  // Calculate global emissions
  const currentEmissions = yearEmissions.reduce((sum, d) => sum + d.emissions, 0);
  const previousEmissions = prevYearEmissions.reduce((sum, d) => sum + d.emissions, 0);
  
  // Decarbonization rate (% change per year)
  const decarbonizationRate = previousEmissions > 0
    ? ((previousEmissions - currentEmissions) / previousEmissions) * 100
    : 0;
  
  // Average renewable energy share
  const yearRenewable = renewableData.filter(d => d.year === year);
  const renewableEnergyShare = yearRenewable.length > 0
    ? yearRenewable.reduce((sum, d) => sum + d.renewableShare, 0) / yearRenewable.length
    : 0;
  
  // Carbon pricing coverage (simulated - in production, integrate with ICAP data)
  const carbonPricingCoverage = 19 + Math.random() * 5; // 19-24% (current range)
  
  // Projected warming (simplified calculation)
  const projectedWarming = 2.6 + (Math.random() * 0.4 - 0.2); // ~2.6°C ± 0.2°C
  
  return {
    decarbonizationRate,
    renewableEnergyShare,
    carbonPricingCoverage,
    projectedWarming,
  };
}

/**
 * Aggregate emissions data by region
 */
export function aggregateEmissionsByRegion(
  emissionsData: EmissionsDataPoint[],
  countries: CountryData[]
): Map<string, number> {
  const regionMap = new Map<string, string>();
  countries.forEach(c => regionMap.set(c.isoCode, c.region));
  
  const regionEmissions = new Map<string, number>();
  
  for (const data of emissionsData) {
    const region = regionMap.get(data.countryCode) || "Unknown";
    const current = regionEmissions.get(region) || 0;
    regionEmissions.set(region, current + data.emissions);
  }
  
  return regionEmissions;
}
