import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '@/lib/types';

interface UseAsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseAsyncDataOptions {
  immediate?: boolean;
  cacheKey?: string; // Optional cache key for request deduplication
}

// Global request cache to handle React.StrictMode double-mounting
const requestCache = new Map<string, Promise<any>>();

/**
 * Hook for managing async data fetching with loading and error states
 * Includes global request deduplication to prevent duplicate calls even in StrictMode
 */
export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncDataOptions = { immediate: true }
): UseAsyncDataState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseAsyncDataState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mountedRef = useRef(true);
  const asyncFunctionRef = useRef(asyncFunction);
  
  // Update ref when function changes
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    const cacheKey = options.cacheKey || JSON.stringify(deps);
    
    // Check if there's an ongoing request for this cache key
    const cachedRequest = requestCache.get(cacheKey);
    if (cachedRequest) {
      // Wait for the cached request and update state
      try {
        const result = await cachedRequest;
        if (mountedRef.current) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (error) {
        if (mountedRef.current) {
          const apiError = error instanceof ApiError 
            ? error 
            : new ApiError(500, 'UNKNOWN_ERROR', 'An unexpected error occurred');
          setState({ data: null, loading: false, error: apiError });
        }
      }
      return;
    }

    // Start new request
    if (!mountedRef.current) return;
    setState(prev => ({ ...prev, loading: true, error: null }));

    const requestPromise = asyncFunctionRef.current();
    
    // Cache the request
    requestCache.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null });
      }
    } catch (error) {
      if (mountedRef.current) {
        const apiError = error instanceof ApiError 
          ? error 
          : new ApiError(500, 'UNKNOWN_ERROR', 'An unexpected error occurred');
        
        setState({ data: null, loading: false, error: apiError });
      }
      throw error; // Re-throw so cached promise resolves with error
    } finally {
      // Clear cache after a short delay to allow for StrictMode double-mounting
      setTimeout(() => {
        requestCache.delete(cacheKey);
      }, 100);
    }
  }, [options.cacheKey, JSON.stringify(deps)]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return {
    ...state,
    refetch: execute,
  };
}
