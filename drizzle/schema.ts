import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, index, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Historical temperature projections table
 * Stores past probability distributions to track how projections have evolved over time
 */
export const historicalProjections = mysqlTable("historical_projections", {
  id: int("id").autoincrement().primaryKey(),
  analysisDate: timestamp("analysis_date").notNull(), // When this projection was made
  scenarioId: int("scenario_id"), // Optional: null for data-driven projections
  median: varchar("median", { length: 20 }).notNull(), // Median temperature projection
  p10: varchar("p10", { length: 20 }).notNull(), // 10th percentile
  p25: varchar("p25", { length: 20 }), // 25th percentile
  p75: varchar("p75", { length: 20 }), // 75th percentile
  p90: varchar("p90", { length: 20 }).notNull(), // 90th percentile
  indicatorSnapshot: text("indicator_snapshot"), // JSON of indicator values at analysis date
  dataSource: text("data_source"), // Source of emissions data used
  methodology: text("methodology"), // Methodology version/notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type HistoricalProjection = typeof historicalProjections.$inferSelect;
export type InsertHistoricalProjection = typeof historicalProjections.$inferInsert;

/**
 * Countries table for geographic filtering
 */
export const countries = mysqlTable("countries", {
  id: int("id").autoincrement().primaryKey(),
  isoCode: varchar("isoCode", { length: 3 }).notNull().unique(), // ISO 3166-1 alpha-3
  name: varchar("name", { length: 255 }).notNull(),
  region: varchar("region", { length: 100 }).notNull(), // e.g., "Asia", "Europe", "Africa"
  incomeGroup: varchar("incomeGroup", { length: 50 }), // World Bank income classification
  population: decimal("population", { precision: 15, scale: 0 }), // Latest population
  gdp: decimal("gdp", { precision: 20, scale: 2 }), // Latest GDP in USD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  isoCodeIdx: uniqueIndex("isoCode_idx").on(table.isoCode),
  regionIdx: index("region_idx").on(table.region),
}));

export type Country = typeof countries.$inferSelect;
export type InsertCountry = typeof countries.$inferInsert;

/**
 * Emission scenarios (Current Policies, Pledges & Targets, Optimistic, 1.5°C Compatible)
 */
export const scenarios = mysqlTable("scenarios", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // e.g., "current_policies", "pledges", "optimistic", "1.5c"
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 50 }).notNull(), // Color for visualization (hex or OKLCH)
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex("code_idx").on(table.code),
}));

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = typeof scenarios.$inferInsert;

/**
 * Historical and projected emissions data
 */
export const emissionsData = mysqlTable("emissionsData", {
  id: int("id").autoincrement().primaryKey(),
  countryId: int("countryId").references(() => countries.id),
  scenarioId: int("scenarioId").references(() => scenarios.id),
  year: int("year").notNull(),
  emissions: decimal("emissions", { precision: 15, scale: 3 }).notNull(), // GtCO2e
  isHistorical: int("isHistorical").notNull().default(0),
  isProjected: int("isProjected").notNull().default(0),
  dataSource: varchar("dataSource", { length: 255 }), // e.g., "Global Carbon Project", "IEA"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  countryYearIdx: index("country_year_idx").on(table.countryId, table.year),
  scenarioYearIdx: index("scenario_year_idx").on(table.scenarioId, table.year),
  yearIdx: index("year_idx").on(table.year),
}));

export type EmissionsData = typeof emissionsData.$inferSelect;
export type InsertEmissionsData = typeof emissionsData.$inferInsert;

/**
 * Probability distributions for emissions pathways (from Monte Carlo simulation)
 */
export const emissionsProbabilities = mysqlTable("emissionsProbabilities", {
  id: int("id").autoincrement().primaryKey(),
  scenarioId: int("scenarioId").notNull().references(() => scenarios.id),
  countryId: int("countryId").references(() => countries.id), // null for global
  year: int("year").notNull(),
  p10: decimal("p10", { precision: 15, scale: 3 }).notNull(), // 10th percentile
  p25: decimal("p25", { precision: 15, scale: 3 }).notNull(), // 25th percentile
  p50: decimal("p50", { precision: 15, scale: 3 }).notNull(), // 50th percentile (median)
  p75: decimal("p75", { precision: 15, scale: 3 }).notNull(), // 75th percentile
  p90: decimal("p90", { precision: 15, scale: 3 }).notNull(), // 90th percentile
  simulationRuns: int("simulationRuns").notNull().default(10000),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  scenarioYearIdx: index("scenario_year_prob_idx").on(table.scenarioId, table.year),
  countryScenarioIdx: index("country_scenario_idx").on(table.countryId, table.scenarioId),
}));

export type EmissionsProbability = typeof emissionsProbabilities.$inferSelect;
export type InsertEmissionsProbability = typeof emissionsProbabilities.$inferInsert;

/**
 * Key Performance Indicators (KPIs) tracking
 */
export const kpiMetrics = mysqlTable("kpiMetrics", {
  id: int("id").autoincrement().primaryKey(),
  countryId: int("countryId").references(() => countries.id), // null for global
  year: int("year").notNull(),
  decarbonizationRate: decimal("decarbonizationRate", { precision: 8, scale: 4 }), // % per year
  renewableEnergyShare: decimal("renewableEnergyShare", { precision: 8, scale: 4 }), // % of total energy
  carbonPricingCoverage: decimal("carbonPricingCoverage", { precision: 8, scale: 4 }), // % of emissions covered
  projectedWarming: decimal("projectedWarming", { precision: 5, scale: 3 }), // °C above pre-industrial
  fossilFuelSubsidies: decimal("fossilFuelSubsidies", { precision: 15, scale: 2 }), // USD billions
  climateFunding: decimal("climateFunding", { precision: 15, scale: 2 }), // USD billions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  countryYearKpiIdx: index("country_year_kpi_idx").on(table.countryId, table.year),
  yearKpiIdx: index("year_kpi_idx").on(table.year),
}));

export type KpiMetric = typeof kpiMetrics.$inferSelect;
export type InsertKpiMetric = typeof kpiMetrics.$inferInsert;

/**
 * Corporate climate commitments (SBTi, Climate Action 100+)
 */
export const corporateCommitments = mysqlTable("corporateCommitments", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  countryId: int("countryId").references(() => countries.id),
  sector: varchar("sector", { length: 100 }).notNull(),
  hasSbtiTarget: int("hasSbtiTarget").notNull().default(0),
  sbtiTargetType: varchar("sbtiTargetType", { length: 100 }), // "near-term", "long-term", "net-zero"
  sbtiValidationDate: timestamp("sbtiValidationDate"),
  ca100Assessment: varchar("ca100Assessment", { length: 50 }), // "leading", "aligned", "aligning", "not aligned"
  baselineEmissions: decimal("baselineEmissions", { precision: 15, scale: 3 }), // MtCO2e
  targetYear: int("targetYear"),
  targetReduction: decimal("targetReduction", { precision: 8, scale: 4 }), // % reduction
  currentProgress: decimal("currentProgress", { precision: 8, scale: 4 }), // % achieved
  dataSource: varchar("dataSource", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  companyIdx: index("company_idx").on(table.companyName),
  sectorIdx: index("sector_idx").on(table.sector),
  countryIdx: index("country_commit_idx").on(table.countryId),
}));

export type CorporateCommitment = typeof corporateCommitments.$inferSelect;
export type InsertCorporateCommitment = typeof corporateCommitments.$inferInsert;

/**
 * Technology deployment tracking (renewables, EVs, storage)
 */
export const technologyDeployment = mysqlTable("technologyDeployment", {
  id: int("id").autoincrement().primaryKey(),
  countryId: int("countryId").references(() => countries.id), // null for global
  year: int("year").notNull(),
  technologyType: varchar("technologyType", { length: 100 }).notNull(), // "solar", "wind", "ev", "battery_storage"
  capacity: decimal("capacity", { precision: 15, scale: 3 }), // GW for energy, millions for EVs
  capacityUnit: varchar("capacityUnit", { length: 50 }).notNull(), // "GW", "million_units"
  annualAdditions: decimal("annualAdditions", { precision: 15, scale: 3 }), // New capacity added
  cumulativeInvestment: decimal("cumulativeInvestment", { precision: 20, scale: 2 }), // USD billions
  dataSource: varchar("dataSource", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  countryTechYearIdx: index("country_tech_year_idx").on(table.countryId, table.technologyType, table.year),
  techYearIdx: index("tech_year_idx").on(table.technologyType, table.year),
}));

export type TechnologyDeployment = typeof technologyDeployment.$inferSelect;
export type InsertTechnologyDeployment = typeof technologyDeployment.$inferInsert;

/**
 * Data sources and refresh schedules
 */
export const dataSources = mysqlTable("dataSources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  url: varchar("url", { length: 512 }),
  dataType: varchar("dataType", { length: 100 }).notNull(), // "emissions", "kpi", "corporate", "technology"
  refreshFrequency: mysqlEnum("refreshFrequency", ["daily", "weekly", "monthly", "annual"]).notNull(),
  lastRefreshed: timestamp("lastRefreshed"),
  nextRefresh: timestamp("nextRefresh"),
  isActive: int("isActive").notNull().default(1),
  apiEndpoint: varchar("apiEndpoint", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: uniqueIndex("name_source_idx").on(table.name),
  dataTypeIdx: index("data_type_idx").on(table.dataType),
}));

export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = typeof dataSources.$inferInsert;

/**
 * Simulation parameters for Monte Carlo engine
 */
export const simulationParameters = mysqlTable("simulationParameters", {
  id: int("id").autoincrement().primaryKey(),
  scenarioId: int("scenarioId").notNull().references(() => scenarios.id),
  parameterName: varchar("parameterName", { length: 100 }).notNull(),
  parameterType: varchar("parameterType", { length: 50 }).notNull(), // "policy", "technology", "economic", "climate"
  meanValue: decimal("meanValue", { precision: 15, scale: 6 }).notNull(),
  stdDeviation: decimal("stdDeviation", { precision: 15, scale: 6 }).notNull(),
  minValue: decimal("minValue", { precision: 15, scale: 6 }),
  maxValue: decimal("maxValue", { precision: 15, scale: 6 }),
  distributionType: varchar("distributionType", { length: 50 }).notNull().default("normal"), // "normal", "lognormal", "uniform"
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  scenarioParamIdx: index("scenario_param_idx").on(table.scenarioId, table.parameterName),
}));

export type SimulationParameter = typeof simulationParameters.$inferSelect;
export type InsertSimulationParameter = typeof simulationParameters.$inferInsert;

/**
 * Projection cache table to store pre-calculated Monte Carlo results
 * Avoids recalculating projections on every page load
 */
export const projectionCache = mysqlTable("projection_cache", {
  id: int("id").autoincrement().primaryKey(),
  cacheKey: varchar("cache_key", { length: 255 }).notNull().unique(), // Hash of input parameters
  year: int("year").notNull(), // Analysis year (e.g., 2024)
  region: varchar("region", { length: 50 }).notNull(), // "global", "china", "us", "eu", "india"
  category: varchar("category", { length: 50 }).notNull(), // "all", "technology", "policy", "corporate", "socioeconomic"
  indicatorHash: varchar("indicator_hash", { length: 64 }).notNull(), // Hash of indicator values
  temperatureRise: decimal("temperature_rise", { precision: 5, scale: 2 }).notNull(),
  reductionRate: decimal("reduction_rate", { precision: 8, scale: 4 }).notNull(),
  netZeroYear: int("net_zero_year"),
  distributionData: text("distribution_data").notNull(), // JSON of temperature distribution
  trajectoryData: text("trajectory_data").notNull(), // JSON of emissions trajectory
  indicatorsData: text("indicators_data").notNull(), // JSON of indicator values
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  cacheKeyIdx: uniqueIndex("cache_key_idx").on(table.cacheKey),
  yearRegionIdx: index("year_region_idx").on(table.year, table.region),
  indicatorHashIdx: index("indicator_hash_idx").on(table.indicatorHash),
}));

export type ProjectionCache = typeof projectionCache.$inferSelect;
export type InsertProjectionCache = typeof projectionCache.$inferInsert;
