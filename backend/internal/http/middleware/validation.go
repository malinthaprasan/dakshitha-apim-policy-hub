package middleware

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/wso2/policyhub/internal/errs"
	"github.com/wso2/policyhub/internal/logging"
)

// ValidationMiddleware provides common request validation
type ValidationMiddleware struct {
	logger *logging.Logger
}

// NewValidationMiddleware creates a new validation middleware
func NewValidationMiddleware(logger *logging.Logger) *ValidationMiddleware {
	return &ValidationMiddleware{
		logger: logger,
	}
}

// ValidatePolicyName validates policy name parameter
func (m *ValidationMiddleware) ValidatePolicyName() gin.HandlerFunc {
	return func(c *gin.Context) {
		policyName := c.Param("name")
		if policyName == "" {
			_ = c.Error(errs.NewValidationError("policy name is required", nil))
			c.Abort()
			return
		}

		// Basic validation - more detailed validation happens in service layer
		if len(policyName) > 100 {
			_ = c.Error(errs.NewValidationError("policy name too long", nil))
			c.Abort()
			return
		}

		c.Next()
	}
}

// ValidateVersion validates version parameter
func (m *ValidationMiddleware) ValidateVersion() gin.HandlerFunc {
	return func(c *gin.Context) {
		version := c.Param("version")
		if version == "" {
			_ = c.Error(errs.NewValidationError("version is required", nil))
			c.Abort()
			return
		}

		if len(version) > 50 {
			_ = c.Error(errs.NewValidationError("version too long", nil))
			c.Abort()
			return
		}

		c.Next()
	}
}

// ValidatePagination validates pagination query parameters
func (m *ValidationMiddleware) ValidatePagination() gin.HandlerFunc {
	return func(c *gin.Context) {
		page := getIntQuery(c, "page", 1)
		pageSize := getIntQuery(c, "pageSize", 20)

		if page < 1 {
			_ = c.Error(errs.NewValidationError("page must be greater than 0", nil))
			c.Abort()
			return
		}

		if pageSize < 1 || pageSize > 100 {
			_ = c.Error(errs.NewValidationError("pageSize must be between 1 and 100", nil))
			c.Abort()
			return
		}

		c.Next()
	}
}

// ValidateDocType validates doc type parameter
func (m *ValidationMiddleware) ValidateDocType() gin.HandlerFunc {
	return func(c *gin.Context) {
		docType := c.Param("page")
		if docType == "" {
			_ = c.Error(errs.NewValidationError("doc type is required", nil))
			c.Abort()
			return
		}

		// Basic validation - more detailed validation happens in service layer
		if len(docType) > 50 {
			_ = c.Error(errs.NewValidationError("doc type too long", nil))
			c.Abort()
			return
		}

		c.Next()
	}
}

// getIntQuery gets an integer query parameter with a default value
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
