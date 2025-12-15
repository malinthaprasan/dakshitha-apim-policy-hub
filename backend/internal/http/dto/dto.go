package dto

import "time"

// BaseResponse is the standard API response envelope
type BaseResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Error   *ErrorDTO   `json:"error"`
	Meta    MetaDTO     `json:"meta"`
}

// PaginatedResponse is the API response envelope for paginated results
type PaginatedResponse struct {
	Success bool             `json:"success"`
	Data    interface{}      `json:"data"`
	Error   *ErrorDTO        `json:"error"`
	Meta    PaginatedMetaDTO `json:"meta"`
}

// ErrorDTO represents an error in the response
type ErrorDTO struct {
	Code    string         `json:"code"`
	Message string         `json:"message"`
	Details map[string]any `json:"details,omitempty"`
}

// MetaDTO contains response metadata
type MetaDTO struct {
	TraceID   string    `json:"trace_id"`
	Timestamp time.Time `json:"timestamp"`
	RequestID string    `json:"request_id"`
}

// PaginatedMetaDTO contains response metadata with pagination
type PaginatedMetaDTO struct {
	TraceID    string        `json:"trace_id"`
	Timestamp  time.Time     `json:"timestamp"`
	RequestID  string        `json:"request_id"`
	Pagination PaginationDTO `json:"pagination"`
}

// PaginationDTO contains pagination information
type PaginationDTO struct {
	Page       int `json:"page"`
	PageSize   int `json:"pageSize"`
	TotalItems int `json:"totalItems"`
	TotalPages int `json:"totalPages"`
}

// DocsAllResponseDTO contains all documentation pages as an array
type DocsAllResponseDTO []DocsSingleResponseDTO

// DocsSingleResponseDTO represents a single documentation page
type DocsSingleResponseDTO struct {
	Page    string `json:"page"`
	Format  string `json:"format"`
	Content string `json:"content"`
}

// PolicyMetadataDTO represents policy metadata
type PolicyMetadataDTO struct {
	DisplayName        string   `json:"displayName" binding:"required"`
	Provider           string   `json:"provider" binding:"required"`
	Description        string   `json:"description"`
	Categories         []string `json:"categories"`
	Tags               []string `json:"tags"`
	SupportedPlatforms []string `json:"supportedPlatforms"`
	LogoURL            string   `json:"logoUrl"`
	BannerURL          string   `json:"bannerUrl"`
}

// SyncRequestDTO represents the sync request payload
type SyncRequestDTO struct {
	PolicyName    string            `json:"policyName" binding:"required"`
	Version       string            `json:"version" binding:"required"`
	SourceType    string            `json:"sourceType" binding:"required"`
	SourceURL     string            `json:"sourceUrl" binding:"required"`
	DefinitionURL string            `json:"definitionUrl" binding:"required"`
	Metadata      PolicyMetadataDTO `json:"metadata" binding:"required"`
	Documentation map[string]string `json:"documentation"`
	AssetsBaseURL string            `json:"assetsBaseUrl"`
}

// SyncResponseDTO represents the sync response payload
type SyncResponseDTO struct {
	PolicyName string `json:"policyName"`
	Version    string `json:"version"`
	Status     string `json:"status"`
}

// HealthResponseDTO represents health check response
type HealthResponseDTO struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
}

// BatchPolicyRequestDTO represents a batch policy retrieval request
type BatchPolicyRequestDTO struct {
	Policies []PolicyRequestItemDTO `json:"policies" binding:"required,min=1"`
}

// PolicyRequestItemDTO represents a single policy request in the batch
type PolicyRequestItemDTO struct {
	Name      string `json:"name" binding:"required"`
	Version   string `json:"version,omitempty"`
	UseLatest bool   `json:"useLatest,omitempty"`
}

// PolicyBatchItemDTO represents a policy item in the batch response
type PolicyBatchItemDTO struct {
	Name       string                 `json:"name"`
	Version    string                 `json:"version"`
	SourceType string                 `json:"sourceType"`
	SourceURL  string                 `json:"sourceUrl"`
	Definition map[string]interface{} `json:"definition"`
	Metadata   PolicyMetadataDTO      `json:"metadata"`
}

// PolicyErrorDTO represents an error for a specific policy in batch response
type PolicyErrorDTO struct {
	Name    string `json:"name"`
	Version string `json:"version,omitempty"`
	Error   string `json:"error"`
}

// PolicyDTO represents the standardized policy object
// Used across all GET endpoints for consistent response structure
type PolicyDTO struct {
	Name               string   `json:"name"`
	Version            string   `json:"version"`
	DisplayName        string   `json:"displayName"`
	Description        string   `json:"description,omitempty"`
	Provider           string   `json:"provider"`
	Categories         []string `json:"categories"`
	Tags               []string `json:"tags"`
	SupportedPlatforms []string `json:"supportedPlatforms"`
	LogoURL            string   `json:"logoUrl,omitempty"`
	BannerURL          string   `json:"bannerUrl,omitempty"`
	IconURL            string   `json:"iconUrl,omitempty"`
	ReleaseDate        *string  `json:"releaseDate,omitempty"`
	IsLatest           bool     `json:"isLatest"`
	SourceType         string   `json:"sourceType,omitempty"`
	SourceURL          string   `json:"sourceUrl,omitempty"`
}

// PolicyWithDefinitionDTO represents a streamlined policy object for engine/batch operations
// Includes definition but excludes unnecessary metadata fields
type PolicyWithDefinitionDTO struct {
	Name        string   `json:"name"`
	Version     string   `json:"version"`
	DisplayName string   `json:"displayName"`
	Provider    string   `json:"provider"`
	Categories  []string `json:"categories"`
	ReleaseDate *string  `json:"releaseDate,omitempty"`
	IsLatest    bool     `json:"isLatest"`
	SourceType  string   `json:"sourceType,omitempty"`
	SourceURL   string   `json:"sourceUrl,omitempty"`
	Definition  string   `json:"definition"`
}
