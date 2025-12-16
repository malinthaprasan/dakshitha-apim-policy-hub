package policy

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"sync"

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

// ResolvePolicies retrieves multiple policies in a single request using bulk optimization
func (s *Service) ResolvePolicies(ctx context.Context, requests []ResolvePolicyRequest) ([]PolicyResolveItem, []PolicyResolveError) {
	// Group requests by strategy for bulk processing
	strategyGroups := s.groupRequestsByStrategy(requests)

	// Process each strategy group in parallel
	resultsChan := make(chan []PolicyResolveItem, 4)
	errorsChan := make(chan []PolicyResolveError, 4)

	var wg sync.WaitGroup

	// Process exact versions
	if len(strategyGroups["exact"]) > 0 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			results, errs := s.bulkGetExact(ctx, strategyGroups["exact"])
			resultsChan <- results
			errorsChan <- errs
		}()
	}

	// Process latest patch versions
	if len(strategyGroups["latest_patch"]) > 0 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			results, errs := s.bulkGetLatestPatch(ctx, strategyGroups["latest_patch"])
			resultsChan <- results
			errorsChan <- errs
		}()
	}

	// Process latest minor versions
	if len(strategyGroups["latest_minor"]) > 0 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			results, errs := s.bulkGetLatestMinor(ctx, strategyGroups["latest_minor"])
			resultsChan <- results
			errorsChan <- errs
		}()
	}

	// Process latest major versions
	if len(strategyGroups["latest_major"]) > 0 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			results, errs := s.bulkGetLatestMajor(ctx, strategyGroups["latest_major"])
			resultsChan <- results
			errorsChan <- errs
		}()
	}

	// Close channels after all goroutines complete
	go func() {
		wg.Wait()
		close(resultsChan)
		close(errorsChan)
	}()

	// Collect results
	var allResults []PolicyResolveItem
	var allErrors []PolicyResolveError

	for results := range resultsChan {
		allResults = append(allResults, results...)
	}

	for errors := range errorsChan {
		allErrors = append(allErrors, errors...)
	}

	return allResults, allErrors
}

// getPolicyByStrategy retrieves a policy version based on the specified strategy
func (s *Service) getPolicyByStrategy(ctx context.Context, name, strategy, baseVersion string) (*PolicyVersion, error) {
	switch strategy {
	case "exact":
		if baseVersion == "" {
			return nil, errs.NewValidationError("baseVersion is required for exact strategy", map[string]any{
				"policyName": name,
				"strategy":   strategy,
			})
		}
		return s.repo.GetPolicyVersionByExact(ctx, name, baseVersion)

	case "latest_patch":
		if baseVersion == "" {
			return nil, errs.NewValidationError("baseVersion is required for latest_patch strategy", map[string]any{
				"policyName": name,
				"strategy":   strategy,
			})
		}
		major, minor, err := s.parseMajorMinor(baseVersion)
		if err != nil {
			return nil, errs.NewValidationError("invalid baseVersion format for latest_patch", map[string]any{
				"policyName":  name,
				"baseVersion": baseVersion,
				"error":       err.Error(),
			})
		}
		return s.repo.GetPolicyVersionByLatestPatch(ctx, name, major, minor)

	case "latest_minor":
		if baseVersion == "" {
			return nil, errs.NewValidationError("baseVersion is required for latest_minor strategy", map[string]any{
				"policyName": name,
				"strategy":   strategy,
			})
		}
		major, err := s.parseMajor(baseVersion)
		if err != nil {
			return nil, errs.NewValidationError("invalid baseVersion format for latest_minor", map[string]any{
				"policyName":  name,
				"baseVersion": baseVersion,
				"error":       err.Error(),
			})
		}
		return s.repo.GetPolicyVersionByLatestMinor(ctx, name, major)

	case "latest_major":
		return s.repo.GetPolicyVersionByLatestMajor(ctx, name)

	default:
		return nil, errs.NewValidationError("invalid retrieval strategy", map[string]any{
			"policyName": name,
			"strategy":   strategy,
		})
	}
}

// parseMajorMinor parses a version string like "1.2" into major and minor integers
func (s *Service) parseMajorMinor(version string) (int32, int32, error) {
	parts := strings.Split(version, ".")
	if len(parts) != 2 {
		return 0, 0, fmt.Errorf("version must be in format 'major.minor', got: %s", version)
	}

	major, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, 0, fmt.Errorf("invalid major version: %s", parts[0])
	}

	minor, err := strconv.Atoi(parts[1])
	if err != nil {
		return 0, 0, fmt.Errorf("invalid minor version: %s", parts[1])
	}

	return int32(major), int32(minor), nil
}

// parseMajor parses a version string like "1" into major integer
func (s *Service) parseMajor(version string) (int32, error) {
	major, err := strconv.Atoi(version)
	if err != nil {
		return 0, fmt.Errorf("invalid major version: %s", version)
	}

	return int32(major), nil
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

// groupRequestsByStrategy groups batch requests by their retrieval strategy
func (s *Service) groupRequestsByStrategy(requests []ResolvePolicyRequest) map[string][]ResolvePolicyRequest {
	groups := map[string][]ResolvePolicyRequest{
		"exact":        {},
		"latest_patch": {},
		"latest_minor": {},
		"latest_major": {},
	}

	for _, req := range requests {
		if _, exists := groups[req.RetrievalStrategy]; exists {
			groups[req.RetrievalStrategy] = append(groups[req.RetrievalStrategy], req)
		}
	}

	return groups
}

// bulkGetExact processes exact version requests in bulk
func (s *Service) bulkGetExact(ctx context.Context, requests []ResolvePolicyRequest) ([]PolicyResolveItem, []PolicyResolveError) {
	// Convert to repository format
	repoRequests := make([]ExactVersionRequest, 0, len(requests))
	for _, req := range requests {
		repoRequests = append(repoRequests, ExactVersionRequest{
			Name:    req.Name,
			Version: req.BaseVersion,
		})
	}

	// Bulk fetch from database
	policyVersions, err := s.repo.BulkGetPolicyVersionsByExact(ctx, repoRequests)
	if err != nil {
		// Convert to errors for all requests
		errors := make([]PolicyResolveError, 0, len(requests))
		for _, req := range requests {
			errors = append(errors, PolicyResolveError{
				Name:    req.Name,
				Version: req.BaseVersion,
				Error:   "Failed to fetch policy version",
			})
		}
		return []PolicyResolveItem{}, errors
	}

	return s.convertToResolveItems(policyVersions), []PolicyResolveError{}
}

// bulkGetLatestPatch processes latest patch version requests in bulk
func (s *Service) bulkGetLatestPatch(ctx context.Context, requests []ResolvePolicyRequest) ([]PolicyResolveItem, []PolicyResolveError) {
	var validRequests []PatchVersionRequest
	var errors []PolicyResolveError

	// Parse base versions and validate
	for _, req := range requests {
		major, minor, err := s.parseMajorMinor(req.BaseVersion)
		if err != nil {
			errors = append(errors, PolicyResolveError{
				Name:    req.Name,
				Version: req.BaseVersion,
				Error:   fmt.Sprintf("Invalid baseVersion format: %s", err.Error()),
			})
			continue
		}

		validRequests = append(validRequests, PatchVersionRequest{
			Name:         req.Name,
			MajorVersion: major,
			MinorVersion: minor,
		})
	}

	if len(validRequests) == 0 {
		return []PolicyResolveItem{}, errors
	}

	// Bulk fetch from database
	policyVersions, err := s.repo.BulkGetPolicyVersionsByLatestPatch(ctx, validRequests)
	if err != nil {
		// Add database errors for valid requests
		for _, req := range validRequests {
			errors = append(errors, PolicyResolveError{
				Name:    req.Name,
				Version: fmt.Sprintf("%d.%d", req.MajorVersion, req.MinorVersion),
				Error:   "Failed to fetch latest patch version",
			})
		}
		return []PolicyResolveItem{}, errors
	}

	return s.convertToResolveItems(policyVersions), errors
}

// bulkGetLatestMinor processes latest minor version requests in bulk
func (s *Service) bulkGetLatestMinor(ctx context.Context, requests []ResolvePolicyRequest) ([]PolicyResolveItem, []PolicyResolveError) {
	var validRequests []MinorVersionRequest
	var errors []PolicyResolveError

	// Parse base versions and validate
	for _, req := range requests {
		major, err := s.parseMajor(req.BaseVersion)
		if err != nil {
			errors = append(errors, PolicyResolveError{
				Name:    req.Name,
				Version: req.BaseVersion,
				Error:   fmt.Sprintf("Invalid baseVersion format: %s", err.Error()),
			})
			continue
		}

		validRequests = append(validRequests, MinorVersionRequest{
			Name:         req.Name,
			MajorVersion: major,
		})
	}

	if len(validRequests) == 0 {
		return []PolicyResolveItem{}, errors
	}

	// Bulk fetch from database
	policyVersions, err := s.repo.BulkGetPolicyVersionsByLatestMinor(ctx, validRequests)
	if err != nil {
		// Add database errors for valid requests
		for _, req := range validRequests {
			errors = append(errors, PolicyResolveError{
				Name:    req.Name,
				Version: fmt.Sprintf("%d", req.MajorVersion),
				Error:   "Failed to fetch latest minor version",
			})
		}
		return []PolicyResolveItem{}, errors
	}

	return s.convertToResolveItems(policyVersions), errors
}

// bulkGetLatestMajor processes latest major version requests in bulk
func (s *Service) bulkGetLatestMajor(ctx context.Context, requests []ResolvePolicyRequest) ([]PolicyResolveItem, []PolicyResolveError) {
	// Extract policy names
	policyNames := make([]string, 0, len(requests))
	for _, req := range requests {
		policyNames = append(policyNames, req.Name)
	}

	// Bulk fetch from database
	policyVersions, err := s.repo.BulkGetPolicyVersionsByLatestMajor(ctx, policyNames)
	if err != nil {
		// Convert to errors for all requests
		errors := make([]PolicyResolveError, 0, len(requests))
		for _, req := range requests {
			errors = append(errors, PolicyResolveError{
				Name:    req.Name,
				Version: "",
				Error:   "Failed to fetch latest major version",
			})
		}
		return []PolicyResolveItem{}, errors
	}

	return s.convertToResolveItems(policyVersions), []PolicyResolveError{}
}

// convertToResolveItems converts PolicyVersion slice to PolicyResolveItem slice
func (s *Service) convertToResolveItems(policyVersions []*PolicyVersion) []PolicyResolveItem {
	items := make([]PolicyResolveItem, 0, len(policyVersions))

	for _, pv := range policyVersions {
		// Use the raw YAML definition for consistency with other endpoints
		definition := map[string]interface{}{
			"yaml": pv.DefinitionYAML,
		}

		// Determine source type and URL
		sourceType := "filesystem"
		sourceURL := ""
		if pv.SourceType != nil {
			sourceType = *pv.SourceType
		}
		if pv.SourceURL != nil {
			sourceURL = *pv.SourceURL
		}

		items = append(items, PolicyResolveItem{
			Name:       pv.PolicyName,
			Version:    pv.Version,
			SourceType: sourceType,
			SourceURL:  sourceURL,
			Definition: definition,
			Metadata:   pv,
		})
	}

	return items
}
