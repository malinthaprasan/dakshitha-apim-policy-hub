package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"github.com/wso2/policyhub/internal/http/dto"
	"github.com/wso2/policyhub/internal/http/middleware"
)

// HealthHandler handles health check requests
type HealthHandler struct{}

// NewHealthHandler creates a new health handler
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// HealthCheck handles GET /health
func (h *HealthHandler) HealthCheck(c *gin.Context) {
	response := dto.HealthResponseDTO{
		Status:    "ok",
		Timestamp: time.Now().UTC(),
	}

	middleware.SendSuccess(c, response)
}
