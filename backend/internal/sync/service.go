package sync

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/wso2/policyhub/internal/errs"
	"github.com/wso2/policyhub/internal/logging"
	"github.com/wso2/policyhub/internal/policy"
	"github.com/wso2/policyhub/internal/validation"
	"go.uber.org/zap"
	"gopkg.in/yaml.v3"
)

// Service handles policy synchronization
type Service struct {
	policyService *policy.Service
	logger        *logging.Logger
	httpClient    *http.Client
}

// NewService creates a new sync service
func NewService(policyService *policy.Service, logger *logging.Logger) *Service {
	return &Service{
		policyService: policyService,
		logger:        logger,
		httpClient: &http.Client{
			Timeout: policy.HTTPTimeout,
		},
	}
}

// Validate validates the sync request
func (r *SyncRequest) Validate() *errs.AppError {
	// Check required fields
	if r.PolicyName == "" {
		return errs.NewValidationError("policy name is required", nil)
	}
	if r.Version == "" {
		return errs.NewValidationError("version is required", nil)
	}
	if r.SourceType == "" {
		return errs.NewValidationError("source type is required", nil)
	}
	if r.SourceURL == "" {
		return errs.NewValidationError("source URL is required", nil)
	}
	if r.DefinitionURL == "" {
		return errs.NewValidationError("definition URL is required", nil)
	}
	if r.Metadata == nil {
		return errs.NewValidationError("metadata is required", nil)
	}

	// Validate policy name
	if err := validation.ValidatePolicyName(r.PolicyName); err != nil {
		return err
	}

	// Validate version
	if err := validation.ValidateVersion(r.Version); err != nil {
		return err
	}

	// Validate URLs
	if err := validation.ValidateURL(r.SourceURL); err != nil {
		return errs.NewValidationError("invalid source URL", map[string]any{"error": err.Message})
	}
	if err := validation.ValidateURL(r.DefinitionURL); err != nil {
		return errs.NewValidationError("invalid definition URL", map[string]any{"error": err.Message})
	}

	// Validate metadata
	if err := validation.ValidateDescription(r.Metadata.Description); err != nil {
		return err
	}

	if err := validation.ValidateCategories(r.Metadata.Categories); err != nil {
		return err
	}

	if err := validation.ValidatePlatforms(r.Metadata.SupportedPlatforms); err != nil {
		return err
	}

	if err := validation.ValidateTags(r.Metadata.Tags); err != nil {
		return err
	}

	return nil
}

// SyncPolicy synchronizes a policy from a remote source
func (s *Service) SyncPolicy(ctx context.Context, req *SyncRequest) (*SyncResult, error) {
	startTime := time.Now()

	s.logger.Info("Policy synchronization started",
		zap.String("policy", req.PolicyName),
		zap.String("version", req.Version),
		zap.String("source_url", req.SourceURL),
		zap.Int("docs_count", len(req.Documentation)),
		zap.Bool("has_assets", req.AssetsBaseURL != ""))

	// Validate request
	if err := req.Validate(); err != nil {
		s.logger.Warn("Policy sync validation failed",
			zap.String("policy", req.PolicyName),
			zap.String("version", req.Version),
			zap.String("error", err.Message))
		return nil, err
	}

	// Get metadata (inline only)
	metadata := req.Metadata

	// Validate metadata matches request

	// Fetch policy definition
	definition, err := s.fetchPolicyDefinition(req.DefinitionURL)
	if err != nil {
		return nil, err
	}

	policyVersion, err := s.createPolicyVersion(ctx, req.PolicyName, req.Version, metadata, definition, req)
	if err != nil {
		return nil, err
	}

	// Sync documentation
	if len(req.Documentation) > 0 {
		if err := s.syncDocs(ctx, policyVersion.ID, req.Documentation, req.PolicyName, req.Version, req.AssetsBaseURL); err != nil {
			s.logger.Warn("Failed to sync docs", zap.Error(err))
			// Don't fail the entire sync if docs fail
		}
	}

	if req.AssetsBaseURL != "" {
		s.logger.Debug("Asset URLs stored directly from metadata", zap.String("policy", req.PolicyName), zap.String("version", req.Version))
	}

	duration := time.Since(startTime)
	if duration > 30*time.Second {
		s.logger.Warn("Slow policy sync detected",
			zap.String("policy", req.PolicyName),
			zap.String("version", req.Version),
			zap.Duration("duration", duration),
			zap.Int("docs_count", len(req.Documentation)),
			zap.Bool("has_assets", req.AssetsBaseURL != ""))
	}

	s.logger.Info("Policy sync completed successfully",
		zap.String("policy", req.PolicyName),
		zap.String("version", req.Version),
		zap.Duration("duration", time.Since(startTime)),
		zap.Int("docs_synced", len(req.Documentation)),
		zap.Bool("asset_urls_stored", req.AssetsBaseURL != ""))

	return &SyncResult{
		PolicyName: req.PolicyName,
		Version:    req.Version,
		Status:     "synced",
	}, nil
}

// fetchPolicyDefinition fetches policy-definition.yml as YAML
func (s *Service) fetchPolicyDefinition(url string) (string, error) {
	s.logger.Debug("Fetching policy definition", zap.String("url", url))

	resp, err := s.httpClient.Get(url)
	if err != nil {
		return "", errs.SyncFetchFailed(url, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", errs.SyncFetchFailed(url, fmt.Errorf("status code %d", resp.StatusCode))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", errs.SyncFetchFailed(url, err)
	}

	// Validate YAML format
	var yamlData interface{}
	if err := yaml.Unmarshal(body, &yamlData); err != nil {
		return "", errs.NewValidationError("invalid policy definition YAML", map[string]any{"error": err.Error()})
	}

	// Return YAML as string for storage
	return string(body), nil
}

// createPolicyVersion creates a new policy version
func (s *Service) createPolicyVersion(
	ctx context.Context,
	policyName string,
	version string,
	metadata *policy.PolicyMetadata,
	definition string,
	req *SyncRequest,
) (*policy.PolicyVersion, error) {
	policyVersion := &policy.PolicyVersion{
		PolicyName:         policyName,
		Version:            version,
		IsLatest:           true, // New version is latest by default
		DisplayName:        metadata.DisplayName,
		Provider:           metadata.Provider,
		Categories:         metadata.Categories,
		Tags:               metadata.Tags,
		SupportedPlatforms: metadata.SupportedPlatforms,
		DefinitionYAML:     definition,
	}

	// Set source information from sync request
	if req.SourceType != "" {
		policyVersion.SourceType = &req.SourceType
	}
	if req.SourceURL != "" {
		policyVersion.SourceURL = &req.SourceURL
	}

	desc := metadata.Description
	policyVersion.Description = &desc

	// Set release date to now
	now := time.Now()
	policyVersion.ReleaseDate = &now

	// Set icon path if provided
	if metadata.LogoURL != "" {
		policyVersion.IconPath = &metadata.LogoURL
		// Also set logo path for backward compatibility
		policyVersion.LogoPath = &metadata.LogoURL
	}

	// Set banner path if provided
	if metadata.BannerURL != "" {
		policyVersion.BannerPath = &metadata.BannerURL
	}

	return s.policyService.CreatePolicyVersion(ctx, policyVersion)
}

// syncDocs synchronizes documentation files
func (s *Service) syncDocs(ctx context.Context, versionID int32, documentation map[string]string, policyName, version, assetsBaseURL string) error {
	for docType, docPath := range documentation {
		content, err := s.fetchMarkdown(docPath)
		if err != nil {
			s.logger.Debug("Doc page not found", zap.String("docType", docType), zap.String("path", docPath), zap.Error(err))
			continue // Skip missing docs
		}

		// Rewrite image references
		content = s.rewriteImageReferences(content, assetsBaseURL)

		doc := &policy.PolicyDoc{
			PolicyVersionID: versionID,
			Page:            docType,
			ContentMd:       content,
		}

		if _, err := s.policyService.UpsertPolicyDoc(ctx, doc); err != nil {
			return err
		}

		s.logger.Debug("Synced doc page", zap.String("docType", docType))
	}

	return nil
}

// fetchMarkdown fetches markdown content from a URL
func (s *Service) fetchMarkdown(url string) (string, error) {
	resp, err := s.httpClient.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("status code %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}

// rewriteImageReferences rewrites relative image paths to absolute asset URLs
func (s *Service) rewriteImageReferences(markdown, assetsBaseURL string) string {
	if assetsBaseURL == "" {
		return markdown
	}

	// Replace patterns like ![alt](images/foo.png) with ![alt](https://cdn.example.com/assets/images/foo.png)
	pattern := regexp.MustCompile(`!\[(.*?)\]\((images/.*?)\)`)
	baseURL := strings.TrimSuffix(assetsBaseURL, "/")
	return pattern.ReplaceAllString(markdown, fmt.Sprintf("![$1](%s/$2)", baseURL))
}
