import { createHash } from 'crypto';
import { getDb } from './db.js';
import { projectionCache } from '../drizzle/schema.js';
import { eq, and } from 'drizzle-orm';

/**
 * Generate cache key from projection parameters
 */
export function generateCacheKey(
  year: number,
  region: string,
  category: string,
  indicators: Record<string, any>
): string {
  const indicatorHash = hashIndicators(indicators);
  return `${year}-${region}-${category}-${indicatorHash}`;
}

/**
 * Hash indicator values to detect changes
 */
export function hashIndicators(indicators: Record<string, any>): string {
  const sorted = Object.keys(indicators)
    .sort()
    .reduce((acc, key) => {
      acc[key] = indicators[key];
      return acc;
    }, {} as Record<string, any>);
  
  const str = JSON.stringify(sorted);
  return createHash('sha256').update(str).digest('hex').substring(0, 16);
}

/**
 * Get cached projection if available
 */
export async function getCachedProjection(
  year: number,
  region: string,
  category: string,
  indicators: Record<string, any>
) {
  const db = await getDb();
  if (!db) return null;
  
  const cacheKey = generateCacheKey(year, region, category, indicators);
  
  const cached = await db
    .select()
    .from(projectionCache)
    .where(eq(projectionCache.cacheKey, cacheKey))
    .limit(1);
  
  if (cached.length === 0) {
    return null;
  }
  
  const result = cached[0];
  
  return {
    temperatureRise: parseFloat(result.temperatureRise),
    reductionRate: parseFloat(result.reductionRate),
    netZeroYear: result.netZeroYear,
    temperatureDistribution: JSON.parse(result.distributionData),
    trajectory: JSON.parse(result.trajectoryData),
  };
}

/**
 * Store projection in cache
 */
export async function cacheProjection(
  year: number,
  region: string,
  category: string,
  indicators: Record<string, any>,
  projection: {
    temperatureRise: number;
    reductionRate: number;
    netZeroYear: number | null;
    temperatureDistribution: any[];
    trajectory: any[];
  }
) {
  const db = await getDb();
  if (!db) return;
  
  const cacheKey = generateCacheKey(year, region, category, indicators);
  const indicatorHash = hashIndicators(indicators);
  
  // Upsert (insert or update if exists)
  await db
    .insert(projectionCache)
    .values({
      cacheKey,
      year,
      region,
      category,
      indicatorHash,
      temperatureRise: projection.temperatureRise.toString(),
      reductionRate: projection.reductionRate.toString(),
      netZeroYear: projection.netZeroYear,
      distributionData: JSON.stringify(projection.temperatureDistribution),
      trajectoryData: JSON.stringify(projection.trajectory),
    })
    .onDuplicateKeyUpdate({
      set: {
        temperatureRise: projection.temperatureRise.toString(),
        reductionRate: projection.reductionRate.toString(),
        netZeroYear: projection.netZeroYear,
        distributionData: JSON.stringify(projection.temperatureDistribution),
        trajectoryData: JSON.stringify(projection.trajectory),
        updatedAt: new Date(),
      },
    });
}

/**
 * Invalidate cache for specific year/region/category
 */
export async function invalidateCache(
  year?: number,
  region?: string,
  category?: string
) {
  const db = await getDb();
  if (!db) return;
  
  if (!year && !region && !category) {
    // Clear all cache
    await db.delete(projectionCache);
    return;
  }
  
  const conditions = [];
  if (year) conditions.push(eq(projectionCache.year, year));
  if (region) conditions.push(eq(projectionCache.region, region));
  if (category) conditions.push(eq(projectionCache.category, category));
  
  if (conditions.length > 0) {
    await db.delete(projectionCache).where(and(...conditions));
  }
}
