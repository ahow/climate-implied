import { eq, and, gte, lte, inArray, isNull, or, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, countries, scenarios, emissionsData, 
  emissionsProbabilities, kpiMetrics, corporateCommitments,
  technologyDeployment, dataSources, simulationParameters, historicalProjections,
  type Country, type Scenario, type EmissionsData, type EmissionsProbability,
  type KpiMetric, type CorporateCommitment, type TechnologyDeployment, type HistoricalProjection
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// Countries
// ============================================================================

export async function getAllCountries(): Promise<Country[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(countries);
}

export async function getCountryByCode(isoCode: string): Promise<Country | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(countries).where(eq(countries.isoCode, isoCode)).limit(1);
  return result[0];
}

export async function getCountriesByRegion(region: string): Promise<Country[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(countries).where(eq(countries.region, region));
}

// ============================================================================
// Scenarios
// ============================================================================

export async function getAllScenarios(): Promise<Scenario[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(scenarios).orderBy(scenarios.sortOrder);
}

export async function getScenarioByCode(code: string): Promise<Scenario | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(scenarios).where(eq(scenarios.code, code)).limit(1);
  return result[0];
}

// ============================================================================
// Emissions Data
// ============================================================================

export async function getEmissionsData(params: {
  countryId?: number;
  scenarioId?: number;
  startYear?: number;
  endYear?: number;
  isHistorical?: boolean;
}): Promise<EmissionsData[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  
  if (params.countryId !== undefined) {
    if (params.countryId === null) {
      conditions.push(isNull(emissionsData.countryId));
    } else {
      conditions.push(eq(emissionsData.countryId, params.countryId));
    }
  }
  
  if (params.scenarioId !== undefined) {
    conditions.push(eq(emissionsData.scenarioId, params.scenarioId));
  }
  
  if (params.startYear !== undefined) {
    conditions.push(gte(emissionsData.year, params.startYear));
  }
  
  if (params.endYear !== undefined) {
    conditions.push(lte(emissionsData.year, params.endYear));
  }
  
  if (params.isHistorical !== undefined) {
    conditions.push(eq(emissionsData.isHistorical, params.isHistorical ? 1 : 0));
  }
  
  if (conditions.length === 0) {
    return db.select().from(emissionsData);
  }
  
  return db.select().from(emissionsData).where(and(...conditions));
}

export async function getGlobalEmissionsTimeSeries(
  scenarioId: number,
  startYear: number = 1990,
  endYear: number = 2100
): Promise<EmissionsData[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(emissionsData)
    .where(
      and(
        isNull(emissionsData.countryId),
        eq(emissionsData.scenarioId, scenarioId),
        gte(emissionsData.year, startYear),
        lte(emissionsData.year, endYear)
      )
    );
}

// ============================================================================
// Emissions Probabilities
// ============================================================================

export async function getEmissionsProbabilities(params: {
  scenarioId: number;
  countryId?: number | null;
  startYear?: number;
  endYear?: number;
}): Promise<EmissionsProbability[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(emissionsProbabilities.scenarioId, params.scenarioId)];
  
  if (params.countryId !== undefined) {
    if (params.countryId === null) {
      conditions.push(isNull(emissionsProbabilities.countryId));
    } else {
      conditions.push(eq(emissionsProbabilities.countryId, params.countryId));
    }
  }
  
  if (params.startYear !== undefined) {
    conditions.push(gte(emissionsProbabilities.year, params.startYear));
  }
  
  if (params.endYear !== undefined) {
    conditions.push(lte(emissionsProbabilities.year, params.endYear));
  }
  
  return db.select().from(emissionsProbabilities).where(and(...conditions));
}

// ============================================================================
// KPI Metrics
// ============================================================================

export async function getKPIMetrics(params: {
  countryId?: number | null;
  year?: number;
  startYear?: number;
  endYear?: number;
}): Promise<KpiMetric[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  
  if (params.countryId !== undefined) {
    if (params.countryId === null) {
      conditions.push(isNull(kpiMetrics.countryId));
    } else {
      conditions.push(eq(kpiMetrics.countryId, params.countryId));
    }
  }
  
  if (params.year !== undefined) {
    conditions.push(eq(kpiMetrics.year, params.year));
  }
  
  if (params.startYear !== undefined) {
    conditions.push(gte(kpiMetrics.year, params.startYear));
  }
  
  if (params.endYear !== undefined) {
    conditions.push(lte(kpiMetrics.year, params.endYear));
  }
  
  if (conditions.length === 0) {
    return db.select().from(kpiMetrics);
  }
  
  return db.select().from(kpiMetrics).where(and(...conditions));
}

export async function getLatestGlobalKPIs(): Promise<KpiMetric | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(kpiMetrics)
    .where(isNull(kpiMetrics.countryId))
    .orderBy(desc(kpiMetrics.year))
    .limit(1);
  
  return result[0];
}

// ============================================================================
// Corporate Commitments
// ============================================================================

export async function getCorporateCommitments(params?: {
  countryId?: number;
  sector?: string;
  hasSbtiTarget?: boolean;
}): Promise<CorporateCommitment[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (!params) {
    return db.select().from(corporateCommitments);
  }
  
  const conditions = [];
  
  if (params.countryId !== undefined) {
    conditions.push(eq(corporateCommitments.countryId, params.countryId));
  }
  
  if (params.sector !== undefined) {
    conditions.push(eq(corporateCommitments.sector, params.sector));
  }
  
  if (params.hasSbtiTarget !== undefined) {
    conditions.push(eq(corporateCommitments.hasSbtiTarget, params.hasSbtiTarget ? 1 : 0));
  }
  
  if (conditions.length === 0) {
    return db.select().from(corporateCommitments);
  }
  
  return db.select().from(corporateCommitments).where(and(...conditions));
}

export async function getCorporateCommitmentsSummary(): Promise<{
  total: number;
  withSbtiTargets: number;
  bySector: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) return { total: 0, withSbtiTargets: 0, bySector: {} };
  
  const allCommitments = await db.select().from(corporateCommitments);
  
  const summary = {
    total: allCommitments.length,
    withSbtiTargets: allCommitments.filter(c => c.hasSbtiTarget === 1).length,
    bySector: {} as Record<string, number>,
  };
  
  for (const commitment of allCommitments) {
    if (commitment.sector) {
      summary.bySector[commitment.sector] = (summary.bySector[commitment.sector] || 0) + 1;
    }
  }
  
  return summary;
}

// ============================================================================
// Technology Deployment
// ============================================================================

export async function getTechnologyDeployment(params: {
  countryId?: number | null;
  technologyType?: string;
  startYear?: number;
  endYear?: number;
}): Promise<TechnologyDeployment[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  
  if (params.countryId !== undefined) {
    if (params.countryId === null) {
      conditions.push(isNull(technologyDeployment.countryId));
    } else {
      conditions.push(eq(technologyDeployment.countryId, params.countryId));
    }
  }
  
  if (params.technologyType !== undefined) {
    conditions.push(eq(technologyDeployment.technologyType, params.technologyType));
  }
  
  if (params.startYear !== undefined) {
    conditions.push(gte(technologyDeployment.year, params.startYear));
  }
  
  if (params.endYear !== undefined) {
    conditions.push(lte(technologyDeployment.year, params.endYear));
  }
  
  if (conditions.length === 0) {
    return db.select().from(technologyDeployment);
  }
  
  return db.select().from(technologyDeployment).where(and(...conditions));
}

export async function getLatestTechnologyDeployment(): Promise<TechnologyDeployment[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Get the latest year available
  const latestYearResult = await db.select()
    .from(technologyDeployment)
    .orderBy(desc(technologyDeployment.year))
    .limit(1);
  
  if (latestYearResult.length === 0) return [];
  
  const latestYear = latestYearResult[0]?.year;
  
  if (!latestYear) return [];
  
  return db.select()
    .from(technologyDeployment)
    .where(
      and(
        eq(technologyDeployment.year, latestYear),
        isNull(technologyDeployment.countryId)
      )
    );
}


/**
 * Historical Projections - Track how temperature projections have evolved over time
 */

export async function getHistoricalTrend() {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get data-driven historical projections (scenarioId is null)
    // These show how the most likely outcome evolved as real indicators changed
    const result = await db
      .select({
        analysisDate: historicalProjections.analysisDate,
        median: historicalProjections.median,
        p10: historicalProjections.p10,
        p25: historicalProjections.p25,
        p75: historicalProjections.p75,
        p90: historicalProjections.p90,
        indicatorSnapshot: historicalProjections.indicatorSnapshot,
      })
      .from(historicalProjections)
      .where(isNull(historicalProjections.scenarioId)) // Only data-driven projections
      .orderBy(historicalProjections.analysisDate);

    return result.map((row) => ({
      analysisDate: row.analysisDate,
      median: parseFloat(row.median),
      p10: parseFloat(row.p10),
      p25: row.p25 ? parseFloat(row.p25) : null,
      p75: row.p75 ? parseFloat(row.p75) : null,
      p90: parseFloat(row.p90),
      indicators: row.indicatorSnapshot ? JSON.parse(row.indicatorSnapshot) : null,
    }));
  } catch (error) {
    console.error("[Database] Failed to get historical trend:", error);
    return [];
  }
}

export async function getHistoricalProjectionsByYear(year: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const result = await db
      .select()
      .from(historicalProjections)
      .where(
        and(
          gte(historicalProjections.analysisDate, startDate),
          lte(historicalProjections.analysisDate, endDate)
        )
      );

    return result;
  } catch (error) {
    console.error(`[Database] Failed to get projections for year ${year}:`, error);
    return [];
  }
}
