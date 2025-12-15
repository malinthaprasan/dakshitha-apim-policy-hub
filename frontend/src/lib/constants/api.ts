// API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
} as const;

// Route constants
export const ROUTES = {
  HOME: '/',
  POLICIES: '/policies',
  POLICY_DETAIL: '/policies/:name',
  POLICY_VERSION: '/policies/:name/versions/:version',
  CUSTOM_POLICY_GUIDE: '/custom-policy-guide',
  ABOUT: '/about',
} as const;
