// UI limits for filter components
export const UI_LIMITS = {
  MAX_CATEGORIES_VISIBLE: 10,
  MAX_PROVIDERS_VISIBLE: 5,
  MAX_PLATFORMS_VISIBLE: 3,
} as const;

// Timing constants
export const TIMING = {
  DEBOUNCE_DELAY: 300,
  API_TIMEOUT: 10000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
