package handlers

import (
	"github.com/gin-gonic/gin"

	"github.com/wso2/policyhub/internal/errs"
	"github.com/wso2/policyhub/internal/http/dto"
	"github.com/wso2/policyhub/internal/http/middleware"
	"github.com/wso2/policyhub/internal/logging"
	"github.com/wso2/policyhub/internal/policy"
	"github.com/wso2/policyhub/internal/sync"
)

// SyncHandler handles sync operations
type SyncHandler struct {
	syncService *sync.Service
	logger      *logging.Logger
}

// NewSyncHandler creates a new sync handler
func NewSyncHandler(syncService *sync.Service, logger *logging.Logger) *SyncHandler {
	return &SyncHandler{
		syncService: syncService,
		logger:      logger,
	}
}

// Sync handles POST /sync
func (h *SyncHandler) Sync(c *gin.Context) {
	var req dto.SyncRequestDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(err)
		return
	}

	// Validate documentation types
	if req.Documentation != nil {
		validDocTypes := policy.ValidDocTypes()
		for docType := range req.Documentation {
			if !validDocTypes[docType] {
				_ = c.Error(errs.NewValidationError("invalid documentation type", map[string]any{
					"docType":    docType,
					"validTypes": policy.ValidDocTypeStrings(),
				}))
				return
			}
		}
	}

	// Convert DTO to sync request
	syncReq := &sync.SyncRequest{
		PolicyName:    req.PolicyName,
		Version:       req.Version,
		SourceType:    req.SourceType,
		SourceURL:     req.SourceURL,
		DefinitionURL: req.DefinitionURL,
		Metadata: &policy.PolicyMetadata{
			DisplayName:        req.Metadata.DisplayName,
			Provider:           req.Metadata.Provider,
			Description:        req.Metadata.Description,
			Categories:         req.Metadata.Categories,
			Tags:               req.Metadata.Tags,
			SupportedPlatforms: req.Metadata.SupportedPlatforms,
			LogoURL:            req.Metadata.LogoURL,
			BannerURL:          req.Metadata.BannerURL,
		},
		Documentation: req.Documentation,
		AssetsBaseURL: req.AssetsBaseURL,
	}

	// Execute sync
	result, err := h.syncService.SyncPolicy(c.Request.Context(), syncReq)
	if err != nil {
		_ = c.Error(err)
		return
	}

	response := dto.SyncResponseDTO{
		PolicyName: result.PolicyName,
		Version:    result.Version,
		Status:     result.Status,
	}

	middleware.SendSuccess(c, response)
}
