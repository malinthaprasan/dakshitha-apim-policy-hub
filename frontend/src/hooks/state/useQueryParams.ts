import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { FilterState } from '@/lib/types';
import { paramsToFilterState, updateUrlParams } from '@/lib/utils';
import { PAGINATION_DEFAULTS } from '@/lib/constants';

interface UseQueryParamsReturn {
  filters: FilterState;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  resetFilters: () => void;
  searchParams: URLSearchParams;
}

/**
 * Hook for managing URL query parameters as React state
 */
export function useQueryParams(): UseQueryParamsReturn {
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);
  
  const filters = useMemo(() => {
    return paramsToFilterState(searchParams);
  }, [searchParams]);
  
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters: FilterState = {
      ...filters,
      ...newFilters,
      // Reset page when other filters change (except when explicitly updating page)
      page: 'page' in newFilters ? newFilters.page || 1 : 1,
    };
    
    updateUrlParams(updatedFilters, navigate, location.pathname);
  }, [filters, navigate, location.pathname]);
  
  const resetFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      search: '',
      categories: [],
      providers: [],
      platforms: [],
      page: 1,
      pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
    };
    
    updateUrlParams(defaultFilters, navigate, location.pathname);
  }, [navigate, location.pathname]);
  
  return {
    filters,
    updateFilters,
    resetFilters,
    searchParams,
  };
}
