package policy

import (
	"context"
	"encoding/json"

	"go.uber.org/zap"

	"github.com/wso2/policyhub/internal/errs"
	"github.com/wso2/policyhub/internal/logging"
)

// Service implements business logic for policies
type Service struct {
	repo   Repository
	logger *logging.Logger
}

// NewService creates a new policy service
func NewService(repo Repository, logger *logging.Logger) *Service {
	return &Service{
		repo:   repo,
		logger: logger,
	}
}

// ListPolicies retrieves a paginated list of policies with smart fallback to older versions
func (s *Service) ListPolicies(ctx context.Context, filters PolicyFilters) ([]*PolicyVersion, *PaginationInfo, error) {
	// Validate and set defaults
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PageSize < MinPageSize || filters.PageSize > MaxPageSize {
		filters.PageSize = DefaultPageSize
	}

	// Database handles smart version selection AND pagination efficiently
	policies, err := s.repo.ListPolicies(ctx, filters)
	if err != nil {
		return nil, nil, errs.SanitizeDatabaseError("listing policies")
	}

	// Count unique policies for pagination
	total, err := s.repo.CountPolicies(ctx, filters)
	if err != nil {
		return nil, nil, errs.SanitizeDatabaseError("counting policies")
	}

	pagination := &PaginationInfo{
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalItems: total,
		TotalPages: CalculateTotalPages(total, filters.PageSize),
	}

	return policies, pagination, nil
}

// GetPolicyByName retrieves the latest policy version by name (Policy alias for PolicyVersion)
func (s *Service) GetPolicyByName(ctx context.Context, name string) (*PolicyVersion, error) {
	policyVersion, err := s.repo.GetLatestPolicyVersion(ctx, name)
	if err != nil {
		return nil, errs.PolicyNotFound(name)
	}
	return policyVersion, nil
}

// GetPolicyWithLatestVersion retrieves the latest policy version (contains all policy data)
func (s *Service) GetPolicyWithLatestVersion(ctx context.Context, name string) (*PolicyVersion, error) {
	latestVersion, err := s.repo.GetLatestPolicyVersion(ctx, name)
	if err != nil {
		return nil, errs.PolicyVersionNotFound(name, "latest")
	}

	return latestVersion, nil
}

// ListPolicyVersions retrieves versions for a policy
func (s *Service) ListPolicyVersions(ctx context.Context, name string, page, pageSize int) ([]*PolicyVersion, *PaginationInfo, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < MinPageSize || pageSize > MaxPageSize {
		pageSize = DefaultPageSize
	}

	versions, err := s.repo.ListPolicyVersions(ctx, name, page, pageSize)
	if err != nil {
		return nil, nil, errs.NewDatabaseError("Failed to list versions", map[string]any{"error": err.Error()})
	}

	total, err := s.repo.CountPolicyVersions(ctx, name)
	if err != nil {
		return nil, nil, errs.NewDatabaseError("Failed to count versions", map[string]any{"error": err.Error()})
	}

	pagination := &PaginationInfo{
		Page:       page,
		PageSize:   pageSize,
		TotalItems: total,
		TotalPages: CalculateTotalPages(total, pageSize),
	}

	return versions, pagination, nil
}

// GetPolicyVersion retrieves a specific policy version
func (s *Service) GetPolicyVersion(ctx context.Context, name, version string) (*PolicyVersion, error) {
	policyVersion, err := s.repo.GetPolicyVersion(ctx, name, version)
	if err != nil {
		return nil, errs.PolicyVersionNotFound(name, version)
	}

	return policyVersion, nil
}

// GetLatestPolicyVersion retrieves the latest version of a policy
func (s *Service) GetLatestPolicyVersion(ctx context.Context, name string) (*PolicyVersion, error) {
	latestVersion, err := s.repo.GetLatestPolicyVersion(ctx, name)
	if err != nil {
		return nil, errs.PolicyVersionNotFound(name, "latest")
	}

	return latestVersion, nil
}

// GetPolicyDefinition retrieves the raw policy definition JSON
func (s *Service) GetPolicyDefinition(ctx context.Context, name, version string) (json.RawMessage, error) {
	policyVersion, err := s.GetPolicyVersion(ctx, name, version)
	if err != nil {
		return nil, err
	}

	return []byte(policyVersion.DefinitionYAML), nil
}

// GetAllDocs retrieves all documentation pages for a version
func (s *Service) GetAllDocs(ctx context.Context, name, version string) (map[string]string, error) {
	policyVersion, err := s.GetPolicyVersion(ctx, name, version)
	if err != nil {
		return nil, err
	}

	docs, err := s.repo.ListPolicyDocs(ctx, policyVersion.ID)
	if err != nil {
		return nil, errs.NewDatabaseError("Failed to retrieve docs", map[string]any{"error": err.Error()})
	}

	result := make(map[string]string)
	for _, doc := range docs {
		result[doc.Page] = doc.ContentMd
	}

	return result, nil
}

// GetSingleDoc retrieves a single documentation page
func (s *Service) GetSingleDoc(ctx context.Context, name, version, page string) (string, error) {
	policyVersion, err := s.GetPolicyVersion(ctx, name, version)
	if err != nil {
		return "", err
	}

	doc, err := s.repo.GetPolicyDoc(ctx, policyVersion.ID, page)
	if err != nil {
		return "", errs.DocNotFound(name, version, page)
	}

	return doc.ContentMd, nil
}

// CreatePolicyVersion creates a new policy version
func (s *Service) CreatePolicyVersion(ctx context.Context, version *PolicyVersion) (*PolicyVersion, error) {
	s.logger.Info("Creating policy version",
		zap.String("policyName", version.PolicyName),
		zap.String("version", version.Version))

	// Validate asset URLs for security
	if err := s.validateAssetURLs(version); err != nil {
		s.logger.Warn("Policy version creation failed - asset URL validation",
			zap.String("policyName", version.PolicyName),
			zap.String("version", version.Version),
			zap.Error(err))
		return nil, err
	}

	// IsLatest will be determined atomically in the repository based on semantic versioning

	// Attempt to create the version - database unique constraint will prevent duplicates
	created, err := s.repo.CreatePolicyVersion(ctx, version)
	if err != nil {
		// Check if this is a unique constraint violation
		if errs.IsUniqueConstraintError(err) {
			s.logger.Info("Policy version creation skipped - version already exists",
				zap.String("policyName", version.PolicyName),
				zap.String("version", version.Version))
			return nil, errs.NewConflictError(errs.CodeValidationError, "Policy version already exists", map[string]any{
				"policyName": version.PolicyName,
				"version":    version.Version,
			})
		}
		s.logger.Error("Policy version creation failed - database error",
			zap.String("policyName", version.PolicyName),
			zap.String("version", version.Version),
			zap.Error(err))
		return nil, errs.SanitizeDatabaseError("creating policy version")
	}

	s.logger.Info("Policy version created successfully",
		zap.String("policyName", version.PolicyName),
		zap.String("version", version.Version),
		zap.Int32("id", created.ID))

	return created, nil
}

// UpsertPolicyDoc creates or updates a documentation page
func (s *Service) UpsertPolicyDoc(ctx context.Context, doc *PolicyDoc) (*PolicyDoc, error) {
	upserted, err := s.repo.UpsertPolicyDoc(ctx, doc)
	if err != nil {
		return nil, errs.NewDatabaseError("Failed to upsert doc", map[string]any{"error": err.Error()})
	}

	return upserted, nil
}

// GetDistinctCategories retrieves all unique categories from policies
func (s *Service) GetDistinctCategories(ctx context.Context) ([]string, error) {
	categories, err := s.repo.GetDistinctCategories(ctx)
	if err != nil {
		return nil, errs.NewDatabaseError("Failed to get distinct categories", map[string]any{"error": err.Error()})
	}

	return categories, nil
}

// GetDistinctProviders retrieves all unique providers from policies
func (s *Service) GetDistinctProviders(ctx context.Context) ([]string, error) {
	providers, err := s.repo.GetDistinctProviders(ctx)
	if err != nil {
		return nil, errs.NewDatabaseError("Failed to get distinct providers", map[string]any{"error": err.Error()})
	}

	return providers, nil
}

// GetDistinctPlatforms retrieves all unique platforms from policies
func (s *Service) GetDistinctPlatforms(ctx context.Context) ([]string, error) {
	platforms, err := s.repo.GetDistinctPlatforms(ctx)
	if err != nil {
		return nil, errs.NewDatabaseError("Failed to get distinct platforms", map[string]any{"error": err.Error()})
	}

	return platforms, nil
}

// BatchGetPolicies retrieves multiple policies in a single request
func (s *Service) BatchGetPolicies(ctx context.Context, requests []BatchPolicyRequest) ([]PolicyBatchItem, []PolicyBatchError) {
	var results []PolicyBatchItem
	var errors []PolicyBatchError

	for _, req := range requests {
		var policyVersion *PolicyVersion
		var err error

		// Determine which version to retrieve
		if req.UseLatest || req.Version == "" {
			policyVersion, err = s.GetLatestPolicyVersion(ctx, req.Name)
		} else {
			policyVersion, err = s.GetPolicyVersion(ctx, req.Name, req.Version)
		}

		if err != nil {
			errors = append(errors, PolicyBatchError{
				Name:    req.Name,
				Version: req.Version,
				Error:   "Policy version not found",
			})
			continue
		}

		// Use the raw YAML definition for consistency with other endpoints
		definition := map[string]interface{}{
			"yaml": policyVersion.DefinitionYAML,
		}

		// Determine source type and URL
		sourceType := "filesystem"
		sourceURL := ""
		if policyVersion.SourceType != nil {
			sourceType = *policyVersion.SourceType
		}
		if policyVersion.SourceURL != nil {
			sourceURL = *policyVersion.SourceURL
		}

		results = append(results, PolicyBatchItem{
			Name:       policyVersion.PolicyName,
			Version:    policyVersion.Version,
			SourceType: sourceType,
			SourceURL:  sourceURL,
			Definition: definition,
			Metadata:   policyVersion,
		})
	}

	return results, errors
}

// validateAssetURLs validates that asset URLs are properly formatted
func (s *Service) validateAssetURLs(version *PolicyVersion) error {
	urls := []*string{version.LogoPath, version.BannerPath, version.IconPath}

	for _, urlPtr := range urls {
		if urlPtr != nil && *urlPtr != "" {
			// Basic validation - ensure it's not empty and looks like a URL
			urlStr := *urlPtr
			if len(urlStr) > 2048 {
				return errs.NewValidationError("Asset URL is too long", map[string]any{
					"url": urlStr,
				})
			}
			// Could add more URL validation here if needed
		}
	}

	return nil
}
