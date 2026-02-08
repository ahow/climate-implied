import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { generateScenarioSimulation, generateTemperatureDistribution } from "./simulation";
import { generateForwardProjection, getCurrentIndicators } from "./forwardProjection";
import { calculateEmissionsTrajectory as calculateSectorSpecificTrajectory, calculateTemperatureDistribution as calculateSectorSpecificTemperature, getCurrentIndicators as getSectorSpecificIndicators } from "./forwardProjectionSectorSpecific";
import { generateSectoralProjections, getCurrentSectoralBreakdown, getSectorIndicators } from "./sectoralDecomposition";
import { extractMetrics, formatReductionRate, formatTemperatureRise, formatNetZeroYear, interpretReductionRate, interpretTemperatureRise, interpretNetZeroYear } from "./metricTranslations";
import { calculateCategoryProjection, calculateAllCategoryProjections, type Category } from "./categoryProjections";
import { getRecalculatedHistoricalTrend, getFullProjectionForYear } from "./historicalRecalculation";
import { calculateRegionalProjection, getRegionalData, getAvailableRegions, type Region } from "./regionalProjections";
import { getCachedProjection, setCachedProjection, generateIndicatorHash } from "./projectionCache";

export const appRouter = router({
  system: systemRouter,
  
  // Sectoral decomposition
  sectors: router({    projections: publicProcedure.query(async () => {
      return generateSectoralProjections();
    }),
    
    breakdown: publicProcedure.query(async () => {
      return getCurrentSectoralBreakdown();
    }),
    
    indicators: publicProcedure.query(async () => {
      return getSectorIndicators();
    }),
  }),
  
  // Regional projections
  regional: router({
    getProjection: publicProcedure
      .input(z.object({
        region: z.enum(['global', 'china', 'us', 'eu', 'india']),
        year: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const year = input.year || 2024;
        
        // Check cache first
        const indicators = getSectorSpecificIndicators();
        const indicatorHash = generateIndicatorHash(indicators);
        const cacheParams = {
          year,
          region: input.region,
          category: 'all',
          indicatorHash,
        };
        
        const cached = await getCachedProjection(cacheParams);
        if (cached) {
          console.log(`[Cache] Using cached projection for region: ${input.region}`);
          return cached;
        }
        
        console.log(`[Cache] Cache miss for region: ${input.region}, calculating...`);
        const result = await calculateRegionalProjection(input.region as Region, year);
        
        // Store in cache (add indicators for cache compatibility)
        await setCachedProjection(cacheParams, { ...result, indicators });
        
        return result;
      }),
    
    getData: publicProcedure
      .input(z.object({
        region: z.enum(['global', 'china', 'us', 'eu', 'india']),
      }))
      .query(({ input }) => {
        return getRegionalData(input.region as Region);
      }),
    
    getAvailable: publicProcedure.query(() => {
      return getAvailableRegions();
    }),
  }),
  
  // Category-specific projections
  category: router({
    getProjection: publicProcedure
      .input(z.object({
        category: z.enum(['technology', 'policy', 'corporate', 'socioeconomic']),
        year: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const year = input.year || 2024;
        
        // Check cache first
        const indicators = getSectorSpecificIndicators();
        const indicatorHash = generateIndicatorHash(indicators);
        const cacheParams = {
          year,
          region: 'global',
          category: input.category,
          indicatorHash,
        };
        
        const cached = await getCachedProjection(cacheParams);
        if (cached) {
          console.log(`[Cache] Using cached projection for category: ${input.category}`);
          return cached;
        }
        
        console.log(`[Cache] Cache miss for category: ${input.category}, calculating...`);
        const result = await calculateCategoryProjection(input.category as Category, year);
        
        // Store in cache (add indicators for cache compatibility)
        await setCachedProjection(cacheParams, { ...result, indicators });
        
        return result;
      }),
    
    getAll: publicProcedure
      .input(z.object({
        year: z.number().optional(),
      }))
      .query(({ input }) => {
        return calculateAllCategoryProjections(input.year);
      }),
  }),

  // Metric translations
  metrics: router({
    // Extract all three metrics from current projection
    current: publicProcedure.query(async () => {
      const indicators = getSectorSpecificIndicators();
      const trajectory = calculateSectorSpecificTrajectory(indicators, 2024, 2100, 10000);
      const metrics = extractMetrics(trajectory);
      
      return {
        ...metrics,
        formatted: {
          reductionRate: formatReductionRate(metrics.reductionRate),
          temperatureRise: formatTemperatureRise(metrics.temperatureRise),
          netZeroYear: formatNetZeroYear(metrics.netZeroYear),
        },
        interpretation: {
          reductionRate: interpretReductionRate(metrics.reductionRate),
          temperatureRise: interpretTemperatureRise(metrics.temperatureRise),
          netZeroYear: interpretNetZeroYear(metrics.netZeroYear),
        },
      };
    }),
  }),
  
  // Forward projection (data-driven, most likely trajectory)
  projection: router({
    // Sector-specific projection (NEW - optimized via backtest calibration)
    sectorSpecific: publicProcedure.query(async () => {
      const indicators = getSectorSpecificIndicators();
      
      // Check cache first
      const indicatorHash = generateIndicatorHash(indicators);
      const cacheParams = {
        year: 2024,
        region: 'global',
        category: 'all',
        indicatorHash,
      };
      
      const cached = await getCachedProjection(cacheParams);
      if (cached) {
        console.log('[Cache] Using cached projection for sectorSpecific');
        return cached;
      }
      
      console.log('[Cache] Cache miss, calculating projection...');
      const trajectory = calculateSectorSpecificTrajectory(indicators, 2024, 2100, 10000);
      const temperatureDistribution = calculateSectorSpecificTemperature(trajectory, 10000);
      
      // Calculate median temperature from cumulative distribution (where cumulative probability crosses 0.5)
      const sortedTemps = [...temperatureDistribution].sort((a, b) => a.temperature - b.temperature);
      const medianPoint = sortedTemps.find((point: any) => point.cumulativeProbability >= 0.5);
      const temperatureRise = medianPoint?.temperature || 2.7;
      
      // Calculate reduction rate and net-zero year from trajectory
      const metrics = extractMetrics(trajectory);
      
      const result = {
        trajectory,
        temperatureDistribution,
        indicators,
        temperatureRise,
        reductionRate: metrics.reductionRate,
        netZeroYear: metrics.netZeroYear,
      };
      
      // Store in cache for future requests
      await setCachedProjection(cacheParams, result);
      
      return result;
    }),
    
    // Legacy global projection (kept for comparison)
    forward: publicProcedure
      .input(
        z.object({
          climateSensitivity: z.number().min(1.5).max(4.5).optional(),
          renewableAcceleration: z.number().min(0).max(3).optional(),
          policyEffectiveness: z.number().min(0).max(1).optional(),
          economicGrowth: z.number().min(0).max(5).optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return generateForwardProjection(input || undefined);
      }),
    
    indicators: publicProcedure.query(async () => {
      return getCurrentIndicators();
    }),
  }),
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Countries and regions
  countries: router({
    list: publicProcedure.query(async () => {
      return db.getAllCountries();
    }),
    
    byCode: publicProcedure
      .input(z.object({ isoCode: z.string() }))
      .query(async ({ input }) => {
        return db.getCountryByCode(input.isoCode);
      }),
    
    byRegion: publicProcedure
      .input(z.object({ region: z.string() }))
      .query(async ({ input }) => {
        return db.getCountriesByRegion(input.region);
      }),
  }),

  // Scenarios
  scenarios: router({
    list: publicProcedure.query(async () => {
      return db.getAllScenarios();
    }),
    
    byCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return db.getScenarioByCode(input.code);
      }),
  }),

  // Emissions data and trajectories
  emissions: router({
    timeSeries: publicProcedure
      .input(z.object({
        scenarioId: z.number(),
        countryId: z.number().optional().nullable(),
        startYear: z.number().optional(),
        endYear: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getEmissionsData({
          scenarioId: input.scenarioId,
          countryId: input.countryId ?? undefined,
          startYear: input.startYear,
          endYear: input.endYear,
        });
      }),
    
    globalTimeSeries: publicProcedure
      .input(z.object({
        scenarioId: z.number(),
        startYear: z.number().optional(),
        endYear: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getGlobalEmissionsTimeSeries(
          input.scenarioId,
          input.startYear,
          input.endYear
        );
      }),
    
    probabilities: publicProcedure
      .input(z.object({
        scenarioId: z.number(),
        countryId: z.number().optional().nullable(),
        startYear: z.number().optional(),
        endYear: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getEmissionsProbabilities({
          scenarioId: input.scenarioId,
          countryId: input.countryId,
          startYear: input.startYear,
          endYear: input.endYear,
        });
      }),
    
    // Generate simulation on demand
    generateSimulation: publicProcedure
      .input(z.object({
        scenarioCode: z.string(),
        baselineYear: z.number().optional(),
        baselineEmissions: z.number().optional(),
        runs: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return generateScenarioSimulation(
          input.scenarioCode,
          input.baselineYear,
          input.baselineEmissions,
          input.runs
        );
      }),
  }),

  // KPI metrics
  kpis: router({
    global: publicProcedure
      .input(z.object({
        year: z.number().optional(),
        startYear: z.number().optional(),
        endYear: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getKPIMetrics({
          countryId: null,
          year: input.year,
          startYear: input.startYear,
          endYear: input.endYear,
        });
      }),
    
    latest: publicProcedure.query(async () => {
      return db.getLatestGlobalKPIs();
    }),
    
    byCountry: publicProcedure
      .input(z.object({
        countryId: z.number(),
        year: z.number().optional(),
        startYear: z.number().optional(),
        endYear: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getKPIMetrics({
          countryId: input.countryId,
          year: input.year,
          startYear: input.startYear,
          endYear: input.endYear,
        });
      }),
  }),

  // Corporate commitments
  corporate: router({
    commitments: publicProcedure
      .input(z.object({
        countryId: z.number().optional(),
        sector: z.string().optional(),
        hasSbtiTarget: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return db.getCorporateCommitments(input);
      }),
    
    summary: publicProcedure.query(async () => {
      return db.getCorporateCommitmentsSummary();
    }),
  }),

  // Historical trends
  historical: router({
    getTrend: publicProcedure.query(async () => {
      return db.getHistoricalTrend();
    }),

    getRecalculatedTrend: publicProcedure.query(async () => {
      return getRecalculatedHistoricalTrend();
    }),

    getIndicatorTimeseries: publicProcedure.query(async () => {
      const { getHistoricalIndicatorTimeseries } = await import('./historicalIndicators');
      return getHistoricalIndicatorTimeseries();
    }),

    getByYear: publicProcedure
      .input(z.object({ year: z.number() }))
      .query(async ({ input }) => {
        return db.getHistoricalProjectionsByYear(input.year);
      }),

    getProjectionForYear: publicProcedure
      .input(z.object({ year: z.number() }))
      .query(async ({ input }) => {
        return getFullProjectionForYear(input.year);
      }),
  }),

  // Temperature probability distributions
  temperature: router({
    distribution: publicProcedure
      .input(
        z.object({
          scenario: z.string(),
          region: z.string().optional(),
          dimension: z.string().optional(),
          customParams: z.object({
            climateSensitivity: z.number().min(1.5).max(4.5).optional(),
            policyImplementationRate: z.number().min(0).max(1).optional(),
            technologyAdoptionSpeed: z.number().min(0.5).max(2.0).optional(),
            economicGrowthRate: z.number().min(0).max(5).optional(),
          }).optional(),
        })
      )
      .query(async ({ input }) => {
        return generateTemperatureDistribution(
          input.scenario, 
          input.region, 
          input.dimension,
          input.customParams
        );
      }),

    multipleDistributions: publicProcedure
      .input(
        z.object({
          comparisons: z.array(
            z.object({
              scenario: z.string(),
              region: z.string().optional(),
              dimension: z.string().optional(),
              label: z.string(), // Display label for this comparison
            })
          ),
          customParams: z.object({
            climateSensitivity: z.number().min(1.5).max(4.5).optional(),
            policyImplementationRate: z.number().min(0).max(1).optional(),
            technologyAdoptionSpeed: z.number().min(0.5).max(2.0).optional(),
            economicGrowthRate: z.number().min(0).max(5).optional(),
          }).optional(),
        })
      )
      .query(async ({ input }) => {
        const distributions = input.comparisons.map((comp) => ({
          ...generateTemperatureDistribution(
            comp.scenario, 
            comp.region, 
            comp.dimension,
            input.customParams
          ),
          label: comp.label,
        }));
        return distributions;
      }),
  }),

  // Technology deployment
  technology: router({
    deployment: publicProcedure
      .input(z.object({
        countryId: z.number().optional().nullable(),
        technologyType: z.string().optional(),
        startYear: z.number().optional(),
        endYear: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getTechnologyDeployment({
          countryId: input.countryId,
          technologyType: input.technologyType,
          startYear: input.startYear,
          endYear: input.endYear,
        });
      }),
    
    latest: publicProcedure.query(async () => {
      return db.getLatestTechnologyDeployment();
    }),
  }),
});

export type AppRouter = typeof appRouter;
