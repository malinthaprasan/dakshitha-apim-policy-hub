import { createContext, useContext, useState, useCallback, useRef, useMemo, ReactNode } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Policy } from '@/lib/types';
import { TIMING } from '@/lib/constants';

interface AppDataState {
  categories: string[];
  providers: string[];
  platforms: string[];
  totalPolicies: number;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Cache for policy versions to avoid redundant API calls
interface PolicyVersionCache {
  [policyName: string]: {
    versions: Policy[];
    timestamp: number;
  };
}

interface AppDataContextValue extends AppDataState {
  refresh: () => Promise<void>;
  ensureLoaded: () => Promise<void>;
  getVersionsCache: (policyName: string) => Policy[] | null;
  setVersionsCache: (policyName: string, versions: Policy[]) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

// Cache duration: 5 minutes
const CACHE_DURATION = TIMING.CACHE_DURATION;

interface AppDataProviderProps {
  children: ReactNode;
}

export function AppDataProvider({ children }: AppDataProviderProps) {
  const [state, setState] = useState<AppDataState>({
    categories: [],
    providers: [],
    platforms: [],
    totalPolicies: 0,
    loading: false,
    error: null,
    initialized: false,
  });

  const [versionCache, setVersionCache] = useState<PolicyVersionCache>({});

  // Track ongoing load request to prevent duplicates
  const loadingPromiseRef = useRef<Promise<void> | null>(null);

  const loadData = useCallback(async () => {
    if (state.initialized && !state.loading) {
      return; // Already loaded, skip
    }

    // If already loading, return existing promise
    if (loadingPromiseRef.current) {
      return loadingPromiseRef.current;
    }

    const loadPromise = (async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Load all shared data in parallel
        const [categoriesRes, providersRes, platformsRes, policiesRes] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getProviders(),
          apiClient.getPlatforms(),
          apiClient.listPolicies({ pageSize: 1 }), // Minimal data to get total count
        ]);

        setState({
          categories: categoriesRes.data ?? [],
          providers: providersRes.data ?? [],
          platforms: platformsRes.data ?? [],
          totalPolicies: policiesRes.meta.pagination.totalItems,
          loading: false,
          error: null,
          initialized: true,
        });
      } catch (err) {
        console.error('Failed to load app data:', err);
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load data',
          initialized: true,
        }));
      } finally {
        loadingPromiseRef.current = null;
      }
    })();

    loadingPromiseRef.current = loadPromise;
    return loadPromise;
  }, [state.initialized, state.loading]);

  // Lazy load function - only loads when explicitly called
  const ensureLoaded = useCallback(async () => {
    if (!state.initialized) {
      await loadData();
    }
  }, [state.initialized, loadData]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, initialized: false }));
    await loadData();
  }, [loadData]);

  // Version cache management - no useCallback needed for simple setState wrappers
  const getVersionsCache = useCallback((policyName: string): Policy[] | null => {
    const cached = versionCache[policyName];
    if (!cached) return null;
    
    // Check if cache is still valid
    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      return null; // Cache expired
    }
    
    return cached.versions;
  }, [versionCache]);

  const setVersionsCacheInternal = useCallback((policyName: string, versions: Policy[]) => {
    setVersionCache(prev => ({
      ...prev,
      [policyName]: {
        versions,
        timestamp: Date.now(),
      },
    }));
  }, []);

  const value = useMemo<AppDataContextValue>(() => ({
    ...state,
    refresh,
    ensureLoaded,
    getVersionsCache,
    setVersionsCache: setVersionsCacheInternal,
  }), [state, refresh, ensureLoaded, getVersionsCache, setVersionsCacheInternal]);

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}
