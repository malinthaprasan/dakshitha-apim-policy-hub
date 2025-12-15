package middleware

import (
	"crypto/sha256"
	"fmt"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/wso2/policyhub/internal/logging"
)

// Logger is a middleware that logs HTTP requests
func Logger(logger *logging.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate trace and request IDs
		traceID := uuid.New().String()
		requestID := uuid.New().String()

		c.Set("trace_id", traceID)
		c.Set("request_id", requestID)

		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		// Capture request size
		requestSize := c.Request.ContentLength

		// Process request
		c.Next()

		// Capture response size (approximate)
		responseSize := c.Writer.Size()

		// Log request details asynchronously to avoid blocking
		go func() {
			latency := time.Since(start)
			status := c.Writer.Status()

			// Privacy-conscious logging
			ip := c.ClientIP()
			userAgent := c.Request.UserAgent()

			// In production, hash IP for privacy compliance
			if os.Getenv("GIN_MODE") != "debug" {
				ip = hashIP(ip)
				userAgent = truncateUserAgent(userAgent)
			}

			// Determine log level based on request characteristics
			logLevel := determineLogLevel(status, latency)

			// Create log entry with appropriate level
			logEntry := logger.With(
				zap.String("trace_id", traceID),
				zap.String("request_id", requestID),
				zap.String("method", c.Request.Method),
				zap.String("path", path),
				zap.String("query", query),
				zap.Int("status", status),
				zap.Duration("latency", latency),
				zap.Int64("request_size", requestSize),
				zap.Int("response_size", responseSize),
				zap.String("ip", ip),
				zap.String("user_agent", userAgent),
			)

			switch logLevel {
			case "debug":
				logEntry.Debug("HTTP Request")
			case "info":
				logEntry.Info("HTTP Request")
			case "warn":
				logEntry.Warn("HTTP Request - Slow or Client Error")
			case "error":
				logEntry.Error("HTTP Request - Server Error")
			}
		}()
	}
}

// determineLogLevel decides the appropriate log level based on response status and latency
func determineLogLevel(status int, latency time.Duration) string {
	// Server errors (5xx) - always ERROR
	if status >= 500 {
		return "error"
	}

	// Client errors (4xx) - WARN
	if status >= 400 {
		return "warn"
	}

	// Slow requests (>1 second) - WARN
	if latency > time.Second {
		return "warn"
	}

	// Normal successful requests - DEBUG (not shown in production)
	return "debug"
}

// hashIP creates a SHA256 hash of the IP for privacy
func hashIP(ip string) string {
	if ip == "" {
		return ""
	}
	hash := sha256.Sum256([]byte(ip))
	return fmt.Sprintf("%x", hash)[:16] // First 16 chars of hash
}

// truncateUserAgent shortens user agent string for privacy
func truncateUserAgent(ua string) string {
	if len(ua) > 50 {
		return ua[:47] + "..."
	}
	return ua
}
