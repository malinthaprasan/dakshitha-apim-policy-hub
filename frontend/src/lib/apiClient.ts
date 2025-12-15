import { 
  BaseResponse, 
  PaginatedResponse, 
  Policy, 
  DocsSingleResponse, 
  DocsAllResponse,
  PoliciesListParams, 
  PolicyVersionsParams,
  ApiError,
  DocsPageName 
} from './types';
import { API_CONFIG, TIMING } from './constants';
// Helper utilities can be added here if needed

/**
 * Central API client for Policy Hub backend
 */
class PolicyHubApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = TIMING.API_TIMEOUT;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetchWithError<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.error?.code || 'HTTP_ERROR',
          errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.error?.details
        );
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(408, 'TIMEOUT', 'Request timed out');
        }
        throw new ApiError(0, 'NETWORK_ERROR', error.message);
      }
      
      throw new ApiError(0, 'UNKNOWN_ERROR', 'An unexpected error occurred');
    }
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: any): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          // Convert array to comma-separated string for API spec compliance
          searchParams.append(key, value.join(','));
        } else if (!Array.isArray(value)) {
          searchParams.append(key, String(value));
        }
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<BaseResponse<{ status: string; timestamp: string }>> {
    return this.fetchWithError('/health');
  }

  /**
   * List all policies with filtering and pagination
   */
  async listPolicies(params: PoliciesListParams = {}): Promise<PaginatedResponse<Policy[]>> {
    const queryString = this.buildQueryString(params);
    return this.fetchWithError(`/policies${queryString}`);
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<BaseResponse<string[]>> {
    return this.fetchWithError('/policies/categories');
  }

  /**
   * Get all available providers
   */
  async getProviders(): Promise<BaseResponse<string[]>> {
    return this.fetchWithError('/policies/providers');
  }

  /**
   * Get all available platforms
   */
  async getPlatforms(): Promise<BaseResponse<string[]>> {
    return this.fetchWithError('/policies/platforms');
  }

  /**
   * Get policy summary with latest version
   */
  async getPolicySummary(name: string): Promise<BaseResponse<Policy>> {
    const encodedName = encodeURIComponent(name);
    return this.fetchWithError(`/policies/${encodedName}`);
  }

  /**
   * List policy versions
   */
  async listPolicyVersions(
    name: string, 
    params: PolicyVersionsParams = {}
  ): Promise<PaginatedResponse<Policy[]>> {
    const encodedName = encodeURIComponent(name);
    const queryString = this.buildQueryString(params);
    return this.fetchWithError(`/policies/${encodedName}/versions${queryString}`);
  }

  /**
   * Get latest policy version
   */
  async getLatestVersion(name: string): Promise<BaseResponse<Policy>> {
    const encodedName = encodeURIComponent(name);
    return this.fetchWithError(`/policies/${encodedName}/versions/latest`);
  }

  /**
   * Get policy version metadata
   */
  async getPolicyVersionDetail(
    name: string, 
    version: string
  ): Promise<BaseResponse<Policy>> {
    const encodedName = encodeURIComponent(name);
    const encodedVersion = encodeURIComponent(version);
    return this.fetchWithError(`/policies/${encodedName}/versions/${encodedVersion}`);
  }

  /**
   * Get raw policy definition YAML
   */
  async getPolicyDefinition(
    name: string, 
    version: string
  ): Promise<string> {
    const encodedName = encodeURIComponent(name);
    const encodedVersion = encodeURIComponent(version);
    const url = `${this.baseUrl}/policies/${encodedName}/versions/${encodedVersion}/definition`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/yaml',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new ApiError(response.status, 'HTTP_ERROR', `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(408, 'TIMEOUT', 'Request timed out');
        }
        throw new ApiError(0, 'NETWORK_ERROR', error.message);
      }
      
      throw new ApiError(0, 'UNKNOWN_ERROR', 'An unexpected error occurred');
    }
  }

  /**
   * Get all documentation pages for a policy version
   */
  async getAllDocs(
    name: string, 
    version: string
  ): Promise<BaseResponse<DocsAllResponse>> {
    const encodedName = encodeURIComponent(name);
    const encodedVersion = encodeURIComponent(version);
    return this.fetchWithError(`/policies/${encodedName}/versions/${encodedVersion}/docs`);
  }

  /**
   * Get a single documentation page
   */
  async getSingleDoc(
    name: string, 
    version: string, 
    page: DocsPageName
  ): Promise<BaseResponse<DocsSingleResponse>> {
    const encodedName = encodeURIComponent(name);
    const encodedVersion = encodeURIComponent(version);
    return this.fetchWithError(`/policies/${encodedName}/versions/${encodedVersion}/docs/${page}`);
  }

  /**
   * Get asset URL for policy-specific assets
   */
  getAssetUrl(policy: string, version: string, file: string): string {
    const encodedPolicy = encodeURIComponent(policy);
    const encodedVersion = encodeURIComponent(version);
    const encodedFile = encodeURIComponent(file);
    return `${this.baseUrl}/assets/${encodedPolicy}/${encodedVersion}/${encodedFile}`;
  }

  /**
   * Get global asset URL
   */
  getGlobalAssetUrl(filename: string): string {
    const encodedFilename = encodeURIComponent(filename);
    return `${this.baseUrl}/assets/global/${encodedFilename}`;
  }

  /**
   * Prefetch multiple policies for better performance
   */
  async prefetchPolicies(names: string[]): Promise<void> {
    const promises = names.map(name => 
      this.getPolicySummary(name).catch(() => null) // Ignore errors for prefetch
    );
    await Promise.all(promises);
  }
}

// Export singleton instance
export const apiClient = new PolicyHubApiClient();

// Export class for testing or custom instances
export { PolicyHubApiClient };
