// Base response types
export interface BaseResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error?: ErrorObject;
  meta: ResponseMeta;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error?: ErrorObject;
  meta: PaginatedResponseMeta;
}

export interface ResponseMeta {
  trace_id: string;
  timestamp: string;
  request_id: string;
}

export interface PaginatedResponseMeta extends ResponseMeta {
  pagination: PaginationMeta;
}

export interface ErrorObject {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Unified Policy type - matches API spec Policy schema
export interface Policy {
  name: string;
  version: string;
  displayName: string;
  description?: string;
  provider: string;
  categories?: string[];
  tags?: string[];
  supportedPlatforms?: string[];
  logoUrl?: string;
  bannerUrl?: string;
  iconUrl?: string;
  releaseDate?: string;
  isLatest: boolean;
  sourceType?: string;
  sourceUrl?: string;
}

// Type aliases for backward compatibility and semantic clarity

// Use Policy type directly everywhere instead of aliases

export interface PolicyEngineResponse {
  name: string;
  version: string;
  displayName: string;
  description?: string;
  provider: string;
  supportedPlatforms?: string[];
  definition: Record<string, unknown>;
  srcUrls?: {
    definition?: string;
    metadata?: string;
    docsBase?: string;
    assetsBase?: string;
  };
}

// Documentation types
export type DocsPageName = 'overview' | 'configuration' | 'examples' | 'faq';

export interface DocsSingleResponse {
  page: DocsPageName;
  format: 'markdown';
  content: string;
}

export type DocsAllResponse = DocsSingleResponse[];

// API request parameters
export interface PoliciesListParams {
  search?: string;
  category?: string;
  categories?: string[];
  provider?: string;
  providers?: string[];
  platform?: string;
  platforms?: string[];
  page?: number;
  pageSize?: number;
}

export interface PolicyVersionsParams {
  page?: number;
  pageSize?: number;
}

// UI state types
export interface FilterState {
  search: string;
  categories: string[];
  providers: string[];
  platforms: string[];
  page: number;
  pageSize: number;
}

export type ViewMode = 'grid' | 'list';

export interface PolicyCardProps {
  policy: Policy;
  viewMode?: ViewMode;
}

export interface PolicyHeaderProps {
  summary: Policy;
  versionDetail?: Policy;
}

export interface VersionSelectorProps {
  versions: Policy[];
  currentVersion: string;
  latestVersion?: string;
  onChange: (version: string) => void;
}

export interface DocsTabViewProps {
  policyName: string;
  version: string;
  initialPage?: DocsPageName;
}

// Error types
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
