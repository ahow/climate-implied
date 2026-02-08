/**
 * Projection Cache Module
 * 
 * Caches pre-calculated Monte Carlo simulation results to reduce loading time
 * from 18 seconds to <1 second for repeated queries.
 */

import { getDb } from "./db";
import { projectionCache } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

interface CachedProjection {
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
  temperatureDistribution: Array<{
    temperature: number;
    probability: number;
    cumulativeProbability?: number;
  }>;
  indicators: any;
}

/**
 * Generate cache key from input parameters
 */
export function generateCacheKey(params: {
  year: number;
  region: string;
  category: string;
  indicatorHash: string;
}): string {
  const keyString = `${params.year}-${params.region}-${params.category}-${params.indicatorHash}`;
  return crypto.createHash('sha256').update(keyString).digest('hex');
}

/**
 * Generate hash of indicator values to detect when data changes
 */
export function generateIndicatorHash(indicators: any): string {
  const indicatorString = JSON.stringify(indicators, Object.keys(indicators).sort());
  return crypto.createHash('sha256').update(indicatorString).digest('hex');
}

/**
 * Get cached projection if available and fresh
 */
export async function getCachedProjection(params: {
  year: number;
  region: string;
  category: string;
  indicatorHash: string;
}): Promise<CachedProjection | null> {
  const cacheKey = generateCacheKey(params);
  
  try {
    const db = await getDb();
    if (!db) return null;
    
    const cached = await db.select()
      .from(projectionCache)
      .where(
        and(
          eq(projectionCache.cacheKey, cacheKey),
          eq(projectionCache.indicatorHash, params.indicatorHash)
        )
      )
      .limit(1);
    
    if (cached.length === 0) {
      return null;
    }
    
    const entry = cached[0];
    
    // Parse JSON data
    const trajectory = JSON.parse(entry.trajectoryData);
    const temperatureDistribution = JSON.parse(entry.distributionData);
    const indicators = JSON.parse(entry.indicatorsData);
    
    return {
      temperatureRise: parseFloat(entry.temperatureRise as any),
      reductionRate: parseFloat(entry.reductionRate as any),
      netZeroYear: entry.netZeroYear,
      trajectory,
      temperatureDistribution,
      indicators,
    };
  } catch (error) {
    console.error('[Cache] Error retrieving cached projection:', error);
    return null;
  }
}

/**
 * Store projection in cache
 */
export async function setCachedProjection(
  params: {
    year: number;
    region: string;
    category: string;
    indicatorHash: string;
  },
  projection: CachedProjection
): Promise<void> {
  const cacheKey = generateCacheKey(params);
  
  try {
    const db = await getDb();
    if (!db) return;
    
    // Delete existing cache entry if it exists
    await db.delete(projectionCache)
      .where(eq(projectionCache.cacheKey, cacheKey));
    
    // Insert new cache entry
    await db.insert(projectionCache).values({
      cacheKey,
      year: params.year,
      region: params.region,
      category: params.category,
      indicatorHash: params.indicatorHash,
      temperatureRise: projection.temperatureRise.toString(),
      reductionRate: projection.reductionRate.toString(),
      netZeroYear: projection.netZeroYear ?? null,
      distributionData: JSON.stringify(projection.temperatureDistribution),
      trajectoryData: JSON.stringify(projection.trajectory),
      indicatorsData: JSON.stringify(projection.indicators),
    } as any);
    
    console.log('[Cache] Stored projection:', { cacheKey, year: params.year, region: params.region, category: params.category });
  } catch (error) {
    console.error('[Cache] Error storing projection:', error);
  }
}

/**
 * Invalidate cache for specific parameters
 */
export async function invalidateCache(params?: {
  year?: number;
  region?: string;
  category?: string;
}): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    
    if (!params) {
      // Clear all cache
      await db.delete(projectionCache);
      console.log('[Cache] Cleared all cached projections');
      return;
    }
    
    const conditions = [];
    if (params.year) conditions.push(eq(projectionCache.year, params.year));
    if (params.region) conditions.push(eq(projectionCache.region, params.region));
    if (params.category) conditions.push(eq(projectionCache.category, params.category));
    
    if (conditions.length > 0) {
      await db.delete(projectionCache).where(and(...conditions));
      console.log('[Cache] Invalidated cache:', params);
    }
  } catch (error) {
    console.error('[Cache] Error invalidating cache:', error);
  }
}
