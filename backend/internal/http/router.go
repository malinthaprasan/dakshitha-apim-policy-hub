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

	// API Version group
	apiV1 := router.Group("/api/v1")

	// Public routes under /api/v1
	// Policy routes
	apiV1.GET("/policies", validationMW.ValidatePagination(), policyHandler.ListPolicies)
	apiV1.POST("/policies/resolve", policyHandler.ResolvePolicies)

	// Metadata routes (must come before parameterized routes)
	apiV1.GET("/policies/categories", policyHandler.GetCategories)
	apiV1.GET("/policies/providers", policyHandler.GetProviders)
	apiV1.GET("/policies/platforms", policyHandler.GetPlatforms)

	// Parameterized policy routes
	apiV1.GET("/policies/:name", validationMW.ValidatePolicyName(), policyHandler.GetPolicySummary)
	apiV1.GET("/policies/:name/versions", validationMW.ValidatePolicyName(), validationMW.ValidatePagination(), policyHandler.ListPolicyVersions)
	apiV1.GET("/policies/:name/versions/latest", validationMW.ValidatePolicyName(), policyHandler.GetLatestVersion)
	apiV1.GET("/policies/:name/versions/:version", validationMW.ValidatePolicyName(), validationMW.ValidateVersion(), policyHandler.GetPolicyVersionDetail)
	apiV1.GET("/policies/:name/versions/:version/definition", validationMW.ValidatePolicyName(), validationMW.ValidateVersion(), policyHandler.GetPolicyDefinition)
	apiV1.GET("/policies/:name/versions/:version/engine", validationMW.ValidatePolicyName(), validationMW.ValidateVersion(), policyHandler.GetPolicyForEngine)
	apiV1.GET("/policies/:name/versions/:version/docs", validationMW.ValidatePolicyName(), validationMW.ValidateVersion(), policyHandler.GetAllDocs)
	apiV1.GET("/policies/:name/versions/:version/docs/:page", validationMW.ValidatePolicyName(), validationMW.ValidateVersion(), validationMW.ValidateDocType(), policyHandler.GetSingleDoc)

	// Internal routes under /api/v1/internal
	internal := apiV1.Group("/internal")
	internal.GET("/health", healthHandler.HealthCheck)
	internal.POST("/policies/:name/versions/:version", validationMW.ValidatePolicyName(), validationMW.ValidateVersion(), syncHandler.CreatePolicyVersion)

	return router
}
