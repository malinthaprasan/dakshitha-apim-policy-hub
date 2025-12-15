package handlers

import (
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/wso2/policyhub/internal/http/dto"
	"github.com/wso2/policyhub/internal/http/middleware"
	"github.com/wso2/policyhub/internal/logging"
	"github.com/wso2/policyhub/internal/policy"
)

// PolicyHandler handles policy-related HTTP requests
type PolicyHandler struct {
	service *policy.Service
	logger  *logging.Logger
}

// NewPolicyHandler creates a new policy handler
func NewPolicyHandler(service *policy.Service, logger *logging.Logger) *PolicyHandler {
	return &PolicyHandler{
		service: service,
		logger:  logger,
	}
}

// ListPolicies handles GET /policies
func (h *PolicyHandler) ListPolicies(c *gin.Context) {
	filters := policy.PolicyFilters{
		Search:     c.Query("search"),
		Categories: parseCommaSeparatedValues(c, "category", "categories"),
		Providers:  parseCommaSeparatedValues(c, "provider", "providers"),
		Platforms:  parseCommaSeparatedValues(c, "platform", "platforms"),
		Page:       getIntQuery(c, "page", 1),
		PageSize:   getIntQuery(c, "pageSize", 20),
	}

	policies, pagination, err := h.service.ListPolicies(c.Request.Context(), filters)
	if err != nil {
		_ = c.Error(err)
		return
	}

	// Convert to DTOs
	items := make([]dto.PolicyDTO, 0, len(policies))
	for _, p := range policies {
		items = append(items, toPolicyDTO(p))
	}

	paginationDTO := dto.PaginationDTO{
		Page:       pagination.Page,
		PageSize:   pagination.PageSize,
		TotalItems: pagination.TotalItems,
		TotalPages: pagination.TotalPages,
	}

	middleware.SendSuccessWithPagination(c, items, paginationDTO)
}

// GetPolicySummary handles GET /policies/{name}
func (h *PolicyHandler) GetPolicySummary(c *gin.Context) {
	name := c.Param("name")

	policyVersion, err := h.service.GetPolicyWithLatestVersion(c.Request.Context(), name)
	if err != nil {
		_ = c.Error(err)
		return
	}

	policyData := toPolicyDTO(policyVersion)
	middleware.SendSuccess(c, policyData)
}

// ListPolicyVersions handles GET /policies/{name}/versions
func (h *PolicyHandler) ListPolicyVersions(c *gin.Context) {
	name := c.Param("name")
	page := getIntQuery(c, "page", 1)
	pageSize := getIntQuery(c, "pageSize", 20)

	versions, pagination, err := h.service.ListPolicyVersions(c.Request.Context(), name, page, pageSize)
	if err != nil {
		_ = c.Error(err)
		return
	}

	// Convert to DTOs
	items := make([]dto.PolicyDTO, 0, len(versions))
	for _, v := range versions {
		items = append(items, toPolicyDTO(v))
	}

	paginationDTO := dto.PaginationDTO{
		Page:       pagination.Page,
		PageSize:   pagination.PageSize,
		TotalItems: pagination.TotalItems,
		TotalPages: pagination.TotalPages,
	}

	middleware.SendSuccessWithPagination(c, items, paginationDTO)
}

// GetLatestVersion handles GET /policies/{name}/versions/latest
func (h *PolicyHandler) GetLatestVersion(c *gin.Context) {
	name := c.Param("name")

	// Get latest version
	policyVersion, err := h.service.GetLatestPolicyVersion(c.Request.Context(), name)
	if err != nil {
		_ = c.Error(err)
		return
	}

	policyData := toPolicyDTO(policyVersion)
	middleware.SendSuccess(c, policyData)
}

// GetPolicyVersionDetail handles GET /policies/{name}/versions/{version}
func (h *PolicyHandler) GetPolicyVersionDetail(c *gin.Context) {
	name := c.Param("name")
	version := c.Param("version")

	// Get version detail
	policyVersion, err := h.service.GetPolicyVersion(c.Request.Context(), name, version)
	if err != nil {
		_ = c.Error(err)
		return
	}

	policyData := toPolicyDTO(policyVersion)
	middleware.SendSuccess(c, policyData)
}

// GetPolicyDefinition handles GET /policies/{name}/versions/{version}/definition
func (h *PolicyHandler) GetPolicyDefinition(c *gin.Context) {
	name := c.Param("name")
	version := c.Param("version")

	definition, err := h.service.GetPolicyDefinition(c.Request.Context(), name, version)
	if err != nil {
		_ = c.Error(err)
		return
	}

	// Return raw YAML without envelope
	c.Data(200, "text/yaml", definition)
}

// GetPolicyForEngine handles GET /policies/{name}/versions/{version}/engine
func (h *PolicyHandler) GetPolicyForEngine(c *gin.Context) {
	name := c.Param("name")
	version := c.Param("version")

	// Get policy version (contains all needed data)
	policyVersion, err := h.service.GetPolicyVersion(c.Request.Context(), name, version)
	if err != nil {
		_ = c.Error(err)
		return
	}

	response := toPolicyWithDefinitionDTO(policyVersion)
	middleware.SendSuccess(c, response)
}

// GetAllDocs handles GET /policies/{name}/versions/{version}/docs
func (h *PolicyHandler) GetAllDocs(c *gin.Context) {
	name := c.Param("name")
	version := c.Param("version")

	docs, err := h.service.GetAllDocs(c.Request.Context(), name, version)
	if err != nil {
		_ = c.Error(err)
		return
	}

	response := toDocsAllResponseDTO(docs)
	middleware.SendSuccess(c, response)
}

// GetSingleDoc handles GET /policies/{name}/versions/{version}/docs/{page}
func (h *PolicyHandler) GetSingleDoc(c *gin.Context) {
	name := c.Param("name")
	version := c.Param("version")
	page := c.Param("page")

	content, err := h.service.GetSingleDoc(c.Request.Context(), name, version, page)
	if err != nil {
		_ = c.Error(err)
		return
	}

	response := dto.DocsSingleResponseDTO{
		Page:    page,
		Format:  "markdown",
		Content: content,
	}

	middleware.SendSuccess(c, response)
}

// GetCategories handles GET /policies/categories
func (h *PolicyHandler) GetCategories(c *gin.Context) {
	categories, err := h.service.GetDistinctCategories(c.Request.Context())
	if err != nil {
		_ = c.Error(err)
		return
	}

	middleware.SendSuccess(c, categories)
}

// GetProviders handles GET /policies/providers
func (h *PolicyHandler) GetProviders(c *gin.Context) {
	providers, err := h.service.GetDistinctProviders(c.Request.Context())
	if err != nil {
		_ = c.Error(err)
		return
	}

	middleware.SendSuccess(c, providers)
}

// GetPlatforms handles GET /policies/platforms
func (h *PolicyHandler) GetPlatforms(c *gin.Context) {
	platforms, err := h.service.GetDistinctPlatforms(c.Request.Context())
	if err != nil {
		_ = c.Error(err)
		return
	}

	middleware.SendSuccess(c, platforms)
}

// BatchGetPolicies handles POST /policies/batch
func (h *PolicyHandler) BatchGetPolicies(c *gin.Context) {
	var request dto.BatchPolicyRequestDTO
	if err := c.ShouldBindJSON(&request); err != nil {
		_ = c.Error(err)
		return
	}

	// Convert DTOs to service types
	serviceRequests := make([]policy.BatchPolicyRequest, 0, len(request.Policies))
	for _, req := range request.Policies {
		serviceRequests = append(serviceRequests, policy.BatchPolicyRequest{
			Name:      req.Name,
			Version:   req.Version,
			UseLatest: req.UseLatest,
		})
	}

	// Call service
	results, errors := h.service.BatchGetPolicies(c.Request.Context(), serviceRequests)

	// Convert results to DTOs
	responseData := make([]dto.PolicyWithDefinitionDTO, 0, len(results))
	for _, result := range results {
		// Extract the YAML definition from the batch result
		yamlStr, ok := result.Definition["yaml"].(string)
		if !ok {
			h.logger.Error("Invalid definition format in batch result",
				zap.String("name", result.Name),
				zap.String("version", result.Version))
			yamlStr = "{}"
		}

		var releaseDate *string
		if result.Metadata.ReleaseDate != nil {
			dateStr := result.Metadata.ReleaseDate.Format("2006-01-02")
			releaseDate = &dateStr
		}

		sourceType := ""
		if result.Metadata.SourceType != nil {
			sourceType = *result.Metadata.SourceType
		}

		sourceURL := ""
		if result.Metadata.SourceURL != nil {
			sourceURL = *result.Metadata.SourceURL
		}

		responseData = append(responseData, dto.PolicyWithDefinitionDTO{
			Name:        result.Name,
			Version:     result.Version,
			DisplayName: result.Metadata.DisplayName,
			Provider:    result.Metadata.Provider,
			Categories:  result.Metadata.Categories,
			ReleaseDate: releaseDate,
			IsLatest:    result.Metadata.IsLatest,
			SourceType:  sourceType,
			SourceURL:   sourceURL,
			Definition:  yamlStr,
		})
	}

	// For now, we'll ignore errors in the batch response as per the streamlined approach
	// In the future, we might want to include error handling if needed
	_ = errors

	middleware.SendSuccess(c, responseData)
}

// Helper functions

func getIntQuery(c *gin.Context, key string, defaultValue int) int {
	valueStr := c.Query(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}
	return value
}

// toPolicyDTO converts policy version to standardized DTO
func toPolicyDTO(v *policy.PolicyVersion) dto.PolicyDTO {
	desc := ""
	if v.Description != nil {
		desc = *v.Description
	}

	var releaseDate *string
	if v.ReleaseDate != nil {
		dateStr := v.ReleaseDate.Format("2006-01-02")
		releaseDate = &dateStr
	}

	logoURL := ""
	if v.LogoPath != nil {
		logoURL = *v.LogoPath
	}

	bannerURL := ""
	if v.BannerPath != nil {
		bannerURL = *v.BannerPath
	}

	iconURL := ""
	if v.IconPath != nil {
		iconURL = *v.IconPath
	}

	sourceType := ""
	if v.SourceType != nil {
		sourceType = *v.SourceType
	}

	sourceURL := ""
	if v.SourceURL != nil {
		sourceURL = *v.SourceURL
	}

	return dto.PolicyDTO{
		Name:               v.PolicyName,
		Version:            v.Version,
		DisplayName:        v.DisplayName,
		Description:        desc,
		Provider:           v.Provider,
		Categories:         v.Categories,
		Tags:               v.Tags,
		SupportedPlatforms: v.SupportedPlatforms,
		LogoURL:            logoURL,
		BannerURL:          bannerURL,
		IconURL:            iconURL,
		ReleaseDate:        releaseDate,
		IsLatest:           v.IsLatest,
		SourceType:         sourceType,
		SourceURL:          sourceURL,
	}
}

func toPolicyWithDefinitionDTO(v *policy.PolicyVersion) dto.PolicyWithDefinitionDTO {
	sourceType := ""
	if v.SourceType != nil {
		sourceType = *v.SourceType
	}

	sourceURL := ""
	if v.SourceURL != nil {
		sourceURL = *v.SourceURL
	}

	var releaseDate *string
	if v.ReleaseDate != nil {
		dateStr := v.ReleaseDate.Format("2006-01-02")
		releaseDate = &dateStr
	}

	return dto.PolicyWithDefinitionDTO{
		Name:        v.PolicyName,
		Version:     v.Version,
		DisplayName: v.DisplayName,
		Provider:    v.Provider,
		Categories:  v.Categories,
		ReleaseDate: releaseDate,
		IsLatest:    v.IsLatest,
		SourceType:  sourceType,
		SourceURL:   sourceURL,
		Definition:  v.DefinitionYAML,
	}
}

func toDocsAllResponseDTO(docs map[string]string) dto.DocsAllResponseDTO {
	var response dto.DocsAllResponseDTO

	// Define the order of pages
	pages := []string{"overview", "configuration", "examples", "faq"}

	for _, page := range pages {
		if content, ok := docs[page]; ok {
			response = append(response, dto.DocsSingleResponseDTO{
				Page:    page,
				Format:  "markdown",
				Content: content,
			})
		}
	}

	return response
}

// parseCommaSeparatedValues parses comma-separated values from query parameters
// Supports both singular and plural parameter names for backward compatibility
func parseCommaSeparatedValues(c *gin.Context, singularParam, pluralParam string) []string {
	// Try singular form first, then plural
	value := c.Query(singularParam)
	if value == "" {
		value = c.Query(pluralParam)
	}

	if value == "" {
		return nil
	}

	// Split by comma and trim whitespace
	values := strings.Split(value, ",")
	var result []string
	for _, v := range values {
		v = strings.TrimSpace(v)
		if v != "" {
			result = append(result, v)
		}
	}

	return result
}
