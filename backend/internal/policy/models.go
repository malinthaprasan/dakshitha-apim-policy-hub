package policy

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

type PolicyVersion struct {
	ID         int32
	PolicyName string
	Version    string
	IsLatest   bool

	// All metadata fields (can vary per version)
	DisplayName        string
	Provider           string
	Description        *string
	Categories         StringArray
	Tags               StringArray
	LogoPath           *string
	BannerPath         *string
	SupportedPlatforms StringArray

	// Version-specific fields
	ReleaseDate    *time.Time
	DefinitionYAML string
	IconPath       *string
	SourceType     *string
	SourceURL      *string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

// PolicyDoc represents a documentation page
type PolicyDoc struct {
	ID              int32
	PolicyVersionID int32
	Page            string
	ContentMd       string
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// StringArray is a custom type for JSONB string arrays
type StringArray []string

// Scan implements the sql.Scanner interface
func (s *StringArray) Scan(value interface{}) error {
	if value == nil {
		*s = []string{}
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		*s = []string{}
		return nil
	}

	return json.Unmarshal(bytes, s)
}

// Value implements the driver.Valuer interface
func (s StringArray) Value() (driver.Value, error) {
	if len(s) == 0 {
		return json.Marshal([]string{})
	}
	return json.Marshal(s)
}

// PolicyFilters holds filter criteria for listing policies
type PolicyFilters struct {
	Search     string
	Categories []string
	Providers  []string
	Platforms  []string
	Page       int
	PageSize   int
}

// PaginationInfo holds pagination metadata
type PaginationInfo struct {
	Page       int
	PageSize   int
	TotalItems int
	TotalPages int
}

// CalculateTotalPages calculates total pages from total items and page size
func CalculateTotalPages(totalItems, pageSize int) int {
	if pageSize == 0 {
		return 0
	}
	pages := totalItems / pageSize
	if totalItems%pageSize > 0 {
		pages++
	}
	return pages
}

// BatchPolicyRequest represents a single policy request in the batch
type BatchPolicyRequest struct {
	Name      string
	Version   string
	UseLatest bool
}

// PolicyBatchItem represents a policy item in batch response
type PolicyBatchItem struct {
	Name       string
	Version    string
	SourceType string
	SourceURL  string
	Definition map[string]interface{}
	Metadata   *PolicyVersion
}

// PolicyBatchError represents an error for a specific policy in batch response
type PolicyBatchError struct {
	Name    string
	Version string
	Error   string
}

// PolicyMetadata represents the metadata.json structure
type PolicyMetadata struct {
	DisplayName        string   `json:"displayName"`
	Provider           string   `json:"provider"`
	Description        string   `json:"description"`
	Categories         []string `json:"categories"`
	Tags               []string `json:"tags"`
	SupportedPlatforms []string `json:"supportedPlatforms"`
	LogoURL            string   `json:"logoUrl"`
	BannerURL          string   `json:"bannerUrl"`
}
