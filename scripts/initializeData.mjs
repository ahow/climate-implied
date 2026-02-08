#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * Populates the database with initial data:
 * - Countries
 * - Scenarios
 * - Simulated emissions data
 * - KPI metrics
 * - Corporate commitments
 * - Technology deployment data
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { countries, scenarios, kpiMetrics, corporateCommitments, technologyDeployment } from "../drizzle/schema.ts";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function initializeCountries() {
  console.log("Initializing countries...");
  
  const countryData = [
    { isoCode: "WLD", name: "World", region: "Global", incomeGroup: "All" },
    { isoCode: "USA", name: "United States", region: "North America", incomeGroup: "High income" },
    { isoCode: "CHN", name: "China", region: "East Asia & Pacific", incomeGroup: "Upper middle income" },
    { isoCode: "IND", name: "India", region: "South Asia", incomeGroup: "Lower middle income" },
    { isoCode: "DEU", name: "Germany", region: "Europe & Central Asia", incomeGroup: "High income" },
    { isoCode: "GBR", name: "United Kingdom", region: "Europe & Central Asia", incomeGroup: "High income" },
    { isoCode: "JPN", name: "Japan", region: "East Asia & Pacific", incomeGroup: "High income" },
    { isoCode: "BRA", name: "Brazil", region: "Latin America & Caribbean", incomeGroup: "Upper middle income" },
    { isoCode: "AUS", name: "Australia", region: "East Asia & Pacific", incomeGroup: "High income" },
    { isoCode: "CAN", name: "Canada", region: "North America", incomeGroup: "High income" },
  ];

  for (const country of countryData) {
    await db.insert(countries).values(country).onDuplicateKeyUpdate({ set: { name: country.name } });
  }

  console.log(`✓ Initialized ${countryData.length} countries`);
}

async function initializeScenarios() {
  console.log("Initializing scenarios...");
  
  const scenarioData = [
    {
      code: "current_policies",
      name: "Current Policies",
      description: "Continuation of existing policies without additional climate action",
      color: "oklch(0.60 0.18 210)",
      targetYear: 2100,
      targetEmissions: "15000",
      projectedWarming: "2.6",
      sortOrder: 1,
    },
    {
      code: "pledges",
      name: "Pledges & Targets",
      description: "All announced pledges and NDCs are fully implemented",
      color: "oklch(0.65 0.16 160)",
      targetYear: 2100,
      targetEmissions: "5000",
      projectedWarming: "2.1",
      sortOrder: 2,
    },
    {
      code: "optimistic",
      name: "Optimistic",
      description: "Accelerated climate action with rapid technology deployment",
      color: "oklch(0.70 0.18 50)",
      targetYear: 2100,
      targetEmissions: "2000",
      projectedWarming: "1.8",
      sortOrder: 3,
    },
    {
      code: "1.5c",
      name: "1.5°C Compatible",
      description: "Pathway consistent with limiting warming to 1.5°C",
      color: "oklch(0.55 0.20 25)",
      targetYear: 2100,
      targetEmissions: "0",
      projectedWarming: "1.5",
      sortOrder: 4,
    },
  ];

  for (const scenario of scenarioData) {
    await db.insert(scenarios).values(scenario).onDuplicateKeyUpdate({ set: { name: scenario.name } });
  }

  console.log(`✓ Initialized ${scenarioData.length} scenarios`);
}

async function initializeKPIMetrics() {
  console.log("Initializing KPI metrics...");
  
  const currentYear = 2024;
  const kpiData = {
    countryId: null,
    year: currentYear,
    decarbonizationRate: "1.2", // % per year
    renewableEnergyShare: "29.5", // % of total energy
    carbonPricingCoverage: "19.3", // % of emissions
    projectedWarming: "2.6", // °C
    dataSource: "Simulated",
  };

  await db.insert(kpiMetrics).values(kpiData);

  console.log("✓ Initialized KPI metrics for 2024");
}

async function initializeCorporateCommitments() {
  console.log("Initializing corporate commitments...");
  
  const commitmentsData = [
    {
      companyName: "Global Energy Corp",
      sector: "Energy",
      countryId: null,
      hasSbtiTarget: 1,
      sbtiTargetType: "net-zero",
      ca100Assessment: "leading",
      baselineEmissions: "45.5",
      targetYear: 2050,
      targetReduction: "100",
      currentProgress: "35.2",
      dataSource: "Simulated",
    },
    {
      companyName: "TransWorld Logistics",
      sector: "Transportation",
      countryId: null,
      hasSbtiTarget: 1,
      sbtiTargetType: "near-term",
      ca100Assessment: "aligned",
      baselineEmissions: "28.3",
      targetYear: 2030,
      targetReduction: "50",
      currentProgress: "42.8",
      dataSource: "Simulated",
    },
    {
      companyName: "MegaManufacturing Inc",
      sector: "Manufacturing",
      countryId: null,
      hasSbtiTarget: 1,
      sbtiTargetType: "net-zero",
      ca100Assessment: "aligning",
      baselineEmissions: "38.7",
      targetYear: 2045,
      targetReduction: "90",
      currentProgress: "28.5",
      dataSource: "Simulated",
    },
    {
      companyName: "TechGiant Systems",
      sector: "Technology",
      countryId: null,
      hasSbtiTarget: 1,
      sbtiTargetType: "net-zero",
      ca100Assessment: "leading",
      baselineEmissions: "12.4",
      targetYear: 2040,
      targetReduction: "100",
      currentProgress: "58.3",
      dataSource: "Simulated",
    },
    {
      companyName: "Universal Bank Group",
      sector: "Finance",
      countryId: null,
      hasSbtiTarget: 0,
      sbtiTargetType: null,
      ca100Assessment: "not aligned",
      baselineEmissions: "8.2",
      targetYear: 2050,
      targetReduction: "40",
      currentProgress: "15.7",
      dataSource: "Simulated",
    },
  ];

  for (const commitment of commitmentsData) {
    await db.insert(corporateCommitments).values(commitment);
  }

  console.log(`✓ Initialized ${commitmentsData.length} corporate commitments`);
}

async function initializeTechnologyDeployment() {
  console.log("Initializing technology deployment data...");
  
  const technologies = [
    { type: "solar", unit: "GW", baseCapacity: 1000 },
    { type: "wind", unit: "GW", baseCapacity: 800 },
    { type: "ev", unit: "million_units", baseCapacity: 25 },
    { type: "battery_storage", unit: "GW", baseCapacity: 150 },
  ];
  
  const startYear = 2015;
  const endYear = 2024;
  let count = 0;
  
  for (const tech of technologies) {
    for (let year = startYear; year <= endYear; year++) {
      const yearsFromStart = year - startYear;
      const growthFactor = Math.pow(1.2, yearsFromStart); // 20% annual growth
      
      const capacity = tech.baseCapacity * growthFactor * (0.9 + Math.random() * 0.2);
      const annualAdditions = tech.baseCapacity * 0.15 * growthFactor * (0.8 + Math.random() * 0.4);
      
      await db.insert(technologyDeployment).values({
        countryId: null,
        year,
        technologyType: tech.type,
        capacity: capacity.toFixed(3),
        capacityUnit: tech.unit,
        annualAdditions: annualAdditions.toFixed(3),
        cumulativeInvestment: (capacity * 2).toFixed(2),
        dataSource: "Simulated",
      });
      
      count++;
    }
  }

  console.log(`✓ Initialized ${count} technology deployment records`);
}

async function main() {
  console.log("Starting database initialization...\n");

  try {
    await initializeCountries();
    await initializeScenarios();
    await initializeKPIMetrics();
    await initializeCorporateCommitments();
    await initializeTechnologyDeployment();

    console.log("\n✓ Database initialization completed successfully!");
  } catch (error) {
    console.error("\n✗ Error during initialization:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
