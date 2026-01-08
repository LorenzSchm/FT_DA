type CacheEntry<T> = {
  data: T;
  timestamp: number;
  key: string;
};

const CACHE_DURATION = 60 * 1000;
const cache = new Map<string, CacheEntry<any>>();
const backgroundRefetchPromises = new Map<string, Promise<any>>();

function generateCacheKey(
  endpoint: string,
  params?: Record<string, any>,
): string {
  const paramString = params
    ? Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
        .join("|")
    : "";
  return `${endpoint}${paramString ? `|${paramString}` : ""}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry<any>): boolean {
  const now = Date.now();
  return now - entry.timestamp < CACHE_DURATION;
}

/**
 * Get cached data if available and valid
 */
export function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (isCacheValid(entry)) {
    return entry.data as T;
  }

  // Cache expired, remove it
  cache.delete(key);
  return null;
}

/**
 * Set cached data with timestamp
 */
export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    key,
  });
}

/**
 * Invalidate cache for a specific key or all keys matching a pattern
 */
export function invalidateCache(keyPattern?: string): void {
  if (!keyPattern) {
    cache.clear();
    return;
  }

  // Remove all entries whose key includes the pattern
  for (const key of cache.keys()) {
    if (key.includes(keyPattern)) {
      cache.delete(key);
    }
  }
}

/**
 * Cached fetch wrapper that handles caching and background refetching
 */
export async function cachedFetch<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  params?: Record<string, any>,
): Promise<T> {
  const cacheKey = generateCacheKey(endpoint, params);

  // Check cache first
  const cached = getCachedData<T>(cacheKey);
  if (cached !== null) {
    // Cache is valid, return immediately
    // Trigger background refetch if cache is about to expire (optional optimization)
    const entry = cache.get(cacheKey);
    if (entry) {
      const timeUntilExpiry = CACHE_DURATION - (Date.now() - entry.timestamp);
      // If cache expires in less than 10 seconds, start background refetch
      if (timeUntilExpiry < 10000 && !backgroundRefetchPromises.has(cacheKey)) {
        // Start background refetch without awaiting
        backgroundRefetchPromises.set(
          cacheKey,
          fetchFn()
            .then((data) => {
              setCachedData(cacheKey, data);
              backgroundRefetchPromises.delete(cacheKey);
              return data;
            })
            .catch((error) => {
              backgroundRefetchPromises.delete(cacheKey);
              console.warn(`Background refetch failed for ${cacheKey}:`, error);
              throw error;
            }),
        );
      }
    }
    return cached;
  }

  const existingRefetch = backgroundRefetchPromises.get(cacheKey);
  if (existingRefetch) {
    return existingRefetch;
  }

  try {
    const data = await fetchFn();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    const staleEntry = cache.get(cacheKey);
    if (staleEntry) {
      console.warn(`Fetch failed, returning stale cache for ${cacheKey}`);
      return staleEntry.data as T;
    }
    throw error;
  }
}
