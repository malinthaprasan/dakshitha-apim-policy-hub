package http

import (
	"github.com/gin-gonic/gin"

	"github.com/wso2/policyhub/internal/config"
	"github.com/wso2/policyhub/internal/http/handlers"
	"github.com/wso2/policyhub/internal/http/middleware"
	"github.com/wso2/policyhub/internal/logging"
	"github.com/wso2/policyhub/internal/policy"
	"github.com/wso2/policyhub/internal/sync"
)

// Router sets up all HTTP routes
func SetupRouter(
	cfg *config.Config,
	policyService *policy.Service,
	syncService *sync.Service,
	logger *logging.Logger,
) *gin.Engine {
	// Set Gin mode
	gin.SetMode(cfg.Server.GinMode)

	router := gin.New()

	// Global middleware
	router.Use(middleware.CORS(&cfg.CORS))
	router.Use(middleware.Recovery(logger))
	router.Use(middleware.Logger(logger))
	router.Use(middleware.ErrorHandler())

	// Validation middleware
	validationMW := middleware.NewValidationMiddleware(logger)

	// Handlers
	healthHandler := handlers.NewHealthHandler()
	policyHandler := handlers.NewPolicyHandler(policyService, logger)
	syncHandler := handlers.NewSyncHandler(syncService, logger)

	// Public routes
	router.GET("/health", healthHandler.HealthCheck)

	// Policy routes
	router.GET("/policies", validationMW.ValidatePagination(), policyHandler.ListPolicies)
	router.POST("/policies/batch", policyHandler.BatchGetPolicies)

	// Metadata routes (must come before parameterized routes)
	router.GET("/policies/categories", policyHandler.GetCategories)
	router.GET("/policies/providers", policyHandler.GetProviders)
	router.GET("/policies/platforms", policyHandler.GetPlatforms)

	// Parameterized policy routes
	router.GET("/policies/:name", validationMW.ValidatePolicyName(), policyHandler.GetPolicySummary)
	router.GET("/policies/:name/versions", validationMW.ValidatePolicyName(), validationMW.ValidatePagination(), policyHandler.ListPolicyVersions)
	router.GET("/policies/:name/versions/latest", validationMW.ValidatePolicyName(), policyHandler.GetLatestVersion)
	router.GET("/policies/:name/versions/:version", validationMW.ValidatePolicyName(), validationMW.ValidateVersion(), policyHandler.GetPolicyVersionDetail)
	router.GET("/policies/:name/versions/:version/definition", validationMW.ValidatePolicyName(), validationMW.ValidateVersion(), policyHandler.GetPolicyDefinition)
	router.GET("/policies/:name/versions/:version/engine", validationMW.ValidatePolicyName(), validationMW.ValidateVersion(), policyHandler.GetPolicyForEngine)
	router.GET("/policies/:name/versions/:version/docs", validationMW.ValidatePolicyName(), validationMW.ValidateVersion(), policyHandler.GetAllDocs)
	router.GET("/policies/:name/versions/:version/docs/:page", validationMW.ValidatePolicyName(), validationMW.ValidateVersion(), validationMW.ValidateDocType(), policyHandler.GetSingleDoc)

	// Sync endpoint
	router.POST("/sync", syncHandler.Sync)

	return router
}
