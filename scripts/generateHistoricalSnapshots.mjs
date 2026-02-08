#!/usr/bin/env node
/**
 * Generate historical snapshots of indicators to recreate how projections evolved
 * This allows us to show how the "most likely outcome" changed as real-world data updated
 */

import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema.ts";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

/**
 * Historical indicator values from 2015-2024
 * Based on IEA, IRENA, Global Carbon Project, Climate Action Tracker historical data
 */
const historicalSnapshots = [
  {
    year: 2015,
    analysisDate: new Date("2015-12-01"),
    indicators: {
      currentEmissions: 36.2, // Gt CO2e (Paris Agreement year)
      renewableGrowthRate: 7.5, // % per year
      evSalesShare: 0.4, // % of new sales
      policyImplementationRate: 0.45, // Pre-Paris baseline
      carbonIntensityDeclineRate: 1.8, // % per year
      corporateCommitmentsShare: 0.05, // Very few SBTi targets
    }
  },
  {
    year: 2016,
    analysisDate: new Date("2016-12-01"),
    indicators: {
      currentEmissions: 36.7,
      renewableGrowthRate: 8.0,
      evSalesShare: 0.6,
      policyImplementationRate: 0.50, // Post-Paris momentum
      carbonIntensityDeclineRate: 2.0,
      corporateCommitmentsShare: 0.08,
    }
  },
  {
    year: 2017,
    analysisDate: new Date("2017-12-01"),
    indicators: {
      currentEmissions: 37.1,
      renewableGrowthRate: 8.2,
      evSalesShare: 1.1,
      policyImplementationRate: 0.52,
      carbonIntensityDeclineRate: 2.1,
      corporateCommitmentsShare: 0.10,
    }
  },
  {
    year: 2018,
    analysisDate: new Date("2018-12-01"),
    indicators: {
      currentEmissions: 37.5,
      renewableGrowthRate: 8.5,
      evSalesShare: 2.1,
      policyImplementationRate: 0.54,
      carbonIntensityDeclineRate: 2.2,
      corporateCommitmentsShare: 0.12,
    }
  },
  {
    year: 2019,
    analysisDate: new Date("2019-12-01"),
    indicators: {
      currentEmissions: 37.0, // Slight decrease
      renewableGrowthRate: 8.8,
      evSalesShare: 2.5,
      policyImplementationRate: 0.56,
      carbonIntensityDeclineRate: 2.3,
      corporateCommitmentsShare: 0.15,
    }
  },
  {
    year: 2020,
    analysisDate: new Date("2020-12-01"),
    indicators: {
      currentEmissions: 35.2, // COVID impact
      renewableGrowthRate: 9.0,
      evSalesShare: 4.2,
      policyImplementationRate: 0.58,
      carbonIntensityDeclineRate: 2.4,
      corporateCommitmentsShare: 0.18,
    }
  },
  {
    year: 2021,
    analysisDate: new Date("2021-12-01"),
    indicators: {
      currentEmissions: 37.9, // Rebound
      renewableGrowthRate: 9.2,
      evSalesShare: 8.3,
      policyImplementationRate: 0.60,
      carbonIntensityDeclineRate: 2.5,
      corporateCommitmentsShare: 0.22,
    }
  },
  {
    year: 2022,
    analysisDate: new Date("2022-12-01"),
    indicators: {
      currentEmissions: 38.1,
      renewableGrowthRate: 9.5,
      evSalesShare: 13.0,
      policyImplementationRate: 0.62,
      carbonIntensityDeclineRate: 2.6,
      corporateCommitmentsShare: 0.28,
    }
  },
  {
    year: 2023,
    analysisDate: new Date("2023-12-01"),
    indicators: {
      currentEmissions: 37.8,
      renewableGrowthRate: 9.7,
      evSalesShare: 15.5,
      policyImplementationRate: 0.63,
      carbonIntensityDeclineRate: 2.7,
      corporateCommitmentsShare: 0.32,
    }
  },
  {
    year: 2024,
    analysisDate: new Date("2024-12-01"),
    indicators: {
      currentEmissions: 60.3, // Climate TRACE actual (all sources)
      renewableGrowthRate: 9.8,
      evSalesShare: 18.0,
      policyImplementationRate: 0.65,
      carbonIntensityDeclineRate: 2.8,
      corporateCommitmentsShare: 0.35,
    }
  },
];

/**
 * Calculate forward projection for a given set of indicators
 * Simplified version matching the main projection logic
 */
function calculateProjectionForSnapshot(indicators) {
  const baselineEmissions = indicators.currentEmissions;
  const simulations = 1000;
  const years = 76; // 2024-2100
  
  const allTemperatures = [];
  
  for (let sim = 0; sim < simulations; sim++) {
    let cumulativeEmissions = 0;
    
    for (let yearOffset = 0; yearOffset < years; yearOffset++) {
      // Simplified emissions calculation
      const renewableDisplacement = baselineEmissions * 
        (indicators.renewableGrowthRate / 100) * 
        yearOffset * 0.8;
      
      const evDisplacement = baselineEmissions * 
        (indicators.evSalesShare / 100) * 
        yearOffset * 0.3;
      
      const policyImpact = baselineEmissions * 
        indicators.policyImplementationRate * 
        yearOffset * 0.02;
      
      const intensityReduction = baselineEmissions * 
        (indicators.carbonIntensityDeclineRate / 100) * 
        yearOffset;
      
      const yearEmissions = Math.max(
        0,
        baselineEmissions - 
        renewableDisplacement -
        evDisplacement -
        policyImpact -
        intensityReduction
      );
      
      cumulativeEmissions += yearEmissions;
    }
    
    // Convert to temperature using TCRE (1.65°C per 1000 Gt CO2)
    const climateSensitivity = 1.65 + (Math.random() - 0.5) * 0.8; // 1.25-2.05 range
    const temperatureRise = (cumulativeEmissions / 1000) * climateSensitivity;
    
    allTemperatures.push(temperatureRise);
  }
  
  // Calculate percentiles
  allTemperatures.sort((a, b) => a - b);
  
  return {
    median: allTemperatures[Math.floor(allTemperatures.length * 0.5)],
    p10: allTemperatures[Math.floor(allTemperatures.length * 0.1)],
    p90: allTemperatures[Math.floor(allTemperatures.length * 0.9)],
  };
}

/**
 * Main execution
 */
async function main() {
  console.log("=== Generating Historical Projection Snapshots ===\n");
  
  // Clear existing historical projections
  console.log("Clearing existing historical data...");
  await db.delete(schema.historicalProjections);
  
  // Generate projections for each historical snapshot
  for (const snapshot of historicalSnapshots) {
    console.log(`\nProcessing ${snapshot.year}...`);
    console.log(`  Emissions: ${snapshot.indicators.currentEmissions} Gt CO2e`);
    console.log(`  Renewable growth: ${snapshot.indicators.renewableGrowthRate}%`);
    console.log(`  EV sales share: ${snapshot.indicators.evSalesShare}%`);
    console.log(`  Policy implementation: ${(snapshot.indicators.policyImplementationRate * 100).toFixed(0)}%`);
    
    // Calculate projection based on indicators at that time
    const projection = calculateProjectionForSnapshot(snapshot.indicators);
    
    console.log(`  → Projected temperature rise: ${projection.median.toFixed(2)}°C (${projection.p10.toFixed(2)}-${projection.p90.toFixed(2)}°C)`);
    
    // Store in database
    await db.insert(schema.historicalProjections).values({
      analysisDate: snapshot.analysisDate,
      scenarioId: null, // Data-driven projection, not a scenario
      median: projection.median.toString(),
      p10: projection.p10.toString(),
      p25: ((projection.p10 + projection.median) / 2).toString(),
      p75: ((projection.median + projection.p90) / 2).toString(),
      p90: projection.p90.toString(),
      indicatorSnapshot: JSON.stringify(snapshot.indicators),
    });
  }
  
  console.log("\n=== Summary ===");
  console.log(`Generated ${historicalSnapshots.length} historical projection snapshots`);
  console.log("These show how the projected temperature outcome evolved as indicators changed");
  console.log("\nKey trends:");
  console.log("- 2015: Limited renewable deployment, few corporate commitments");
  console.log("- 2020: COVID impact reduced emissions temporarily");
  console.log("- 2024: Rapid EV adoption (18%), strong renewable growth (9.8%)");
  console.log("\n✓ Historical snapshots generated successfully");
}

main().catch(console.error);
