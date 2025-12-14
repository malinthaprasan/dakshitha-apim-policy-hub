import { useState, useEffect } from 'react';
import { useAppData } from '@/contexts/AppDataContext';

export interface StatsData {
  totalPolicies: number;
  totalCategories: number;
  totalPlatforms: number;
  totalProviders: number;
}

export interface UseStatsDataReturn {
  stats: StatsData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch statistics data for the About page
 * Uses shared data from AppDataContext and fetches total policies count
 */
export function useStatsData(): UseStatsDataReturn {
  const { categories, platforms, providers, totalPolicies, loading: appDataLoading, error: appDataError, ensureLoaded } = useAppData();
  const [stats, setStats] = useState<StatsData | null>(null);

  // Ensure data is loaded when this hook is used
  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  useEffect(() => {
    // Wait for app data to load
    if (appDataLoading) {
      return;
    }

    // Use data from context - no additional API calls needed
    setStats({
      totalPolicies,
      totalCategories: categories.length,
      totalPlatforms: platforms.length,
      totalProviders: providers.length,
    });
  }, [categories, platforms, providers, totalPolicies, appDataLoading]);

  return {
    stats,
    loading: appDataLoading,
    error: appDataError,
  };
}
