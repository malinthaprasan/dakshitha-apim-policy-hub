package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/wso2/policyhub/internal/errs"
	"github.com/wso2/policyhub/internal/logging"
)

// Recovery is a middleware that recovers from panics
func Recovery(logger *logging.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.Error("Panic recovered",
					zap.Any("error", err),
					zap.String("path", c.Request.URL.Path),
					zap.String("method", c.Request.Method),
				)

				// Create an internal server error
				appErr := errs.NewInternalError("Internal server error", map[string]any{
					"panic": err,
				})

				_ = c.Error(appErr)
				c.AbortWithStatus(http.StatusInternalServerError)
			}
		}()

		c.Next()
	}
}
