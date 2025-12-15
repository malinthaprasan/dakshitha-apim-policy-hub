import { FilterState, PoliciesListParams } from './types';
import { PAGINATION_DEFAULTS } from './constants';

/**
 * Converts filter state to API query parameters
 */
export function filterStateToParams(filters: FilterState): PoliciesListParams {
  const params: PoliciesListParams = {};

  if (filters.search.trim()) {
    params.search = filters.search.trim();
  }

  if (filters.categories.length > 0) {
    params.categories = filters.categories;
  }

  if (filters.providers.length > 0) {
    params.providers = filters.providers;
  }

  if (filters.platforms.length > 0) {
    params.platforms = filters.platforms;
  }

  if (filters.page > 1) {
    params.page = filters.page;
  }

  if (filters.pageSize !== PAGINATION_DEFAULTS.PAGE_SIZE) {
    params.pageSize = filters.pageSize;
  }

  return params;
}

/**
 * Converts URL search params to filter state
 */
export function paramsToFilterState(searchParams: URLSearchParams): FilterState {
  const parseArrayParam = (param: string | null): string[] => {
    if (!param) return [];
    return param.split(',').filter(item => item.trim());
  };

  return {
    search: searchParams.get('search') || '',
    categories: parseArrayParam(searchParams.get('categories')),
    providers: parseArrayParam(searchParams.get('providers')),
    platforms: parseArrayParam(searchParams.get('platforms')),
    page: parseInt(searchParams.get('page') || '1', 10),
    pageSize: parseInt(searchParams.get('pageSize') || PAGINATION_DEFAULTS.PAGE_SIZE.toString(), 10),
  };
}

/**
 * Updates URL search params from filter state
 */
export function updateUrlParams(filters: FilterState, navigate: (path: string) => void, currentPath: string) {
  const params = new URLSearchParams();
  
  if (filters.search.trim()) {
    params.set('search', filters.search.trim());
  }
  
  if (filters.categories.length > 0) {
    params.set('categories', filters.categories.join(','));
  }
  
  if (filters.providers.length > 0) {
    params.set('providers', filters.providers.join(','));
  }
  
  if (filters.platforms.length > 0) {
    params.set('platforms', filters.platforms.join(','));
  }
  
  if (filters.page > 1) {
    params.set('page', filters.page.toString());
  }
  
  if (filters.pageSize !== PAGINATION_DEFAULTS.PAGE_SIZE) {
    params.set('pageSize', filters.pageSize.toString());
  }

  const queryString = params.toString();
  const newPath = queryString ? `${currentPath}?${queryString}` : currentPath;
  navigate(newPath);
}

/**
 * Formats a date string for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Checks if a version is the latest version
 */
export function isLatestVersion(version: string, latestVersion?: string): boolean {
  return latestVersion ? version === latestVersion : false;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Creates a copy button handler for code blocks
 */
export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => false);
  }
  
  // Fallback for older browsers
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return Promise.resolve(successful);
  } catch {
    return Promise.resolve(false);
  }
}

/**
 * Generate a route path for navigation
 */
export function generateRoute(template: string, params: Record<string, string>): string {
  let path = template;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, encodeURIComponent(value));
  });
  return path;
}

// Route generators
export const routes = {
  policyDetail: (policyName: string) => generateRoute('/policies/:name', { name: policyName }),
  policyVersion: (policyName: string, version: string) => generateRoute('/policies/:name/versions/:version', { name: policyName, version }),
};
