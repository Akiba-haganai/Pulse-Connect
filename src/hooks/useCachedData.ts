import { useState, useEffect } from 'react';

interface CacheConfig {
  key: string;
  ttl: number; // Time-to-live in milliseconds
}

export function useCachedData<T>(config: CacheConfig, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(() => {
    // 1. Synchronously try to read from local storage right away during initialization
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(config.key);
      if (item) {
        const parsed = JSON.parse(item);
        // Ensure data hasn't expired yet
        if (Date.now() < parsed.expiry) {
          return parsed.value;
        }
      }
    } catch (e) {
      console.warn(`Cache read failed for key: ${config.key}`, e);
    }
    return null;
  });

  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    async function syncData() {
      try {
        const freshValue = await fetcher();
        setData(freshValue);
        
        // 2. Write to cache with expiration timestamp
        const cachePayload = {
          value: freshValue,
          expiry: Date.now() + config.ttl
        };
        window.localStorage.setItem(config.key, JSON.stringify(cachePayload));
      } catch (err) {
        console.error(`Background data sync failed for key: ${config.key}`, err);
      } finally {
        setLoading(false);
      }
    }

    // Always fetch in the background to update the cache silently
    syncData();
  }, [config.key, config.ttl]);

  return { data, loading };
}