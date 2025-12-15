package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/wso2/policyhub/internal/errs"
	"github.com/wso2/policyhub/internal/http/dto"
)

// ErrorHandler is a middleware that handles errors and formats responses
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Check if there are any errors
		if len(c.Errors) == 0 {
			return
		}

		err := c.Errors.Last().Err
		traceID := GetTraceID(c)
		requestID := GetRequestID(c)

		// Check if it's an AppError
		appErr, ok := err.(*errs.AppError)
		if !ok {
			// Wrap unexpected errors
			appErr = errs.NewInternalError("An unexpected error occurred", map[string]any{
				"error": err.Error(),
			})
		}

		response := dto.BaseResponse{
			Success: false,
			Data:    nil,
			Error: &dto.ErrorDTO{
				Code:    string(appErr.Code),
				Message: appErr.Message,
				Details: appErr.Details,
			},
			Meta: dto.MetaDTO{
				TraceID:   traceID,
				Timestamp: time.Now().UTC(),
				RequestID: requestID,
			},
		}

		c.JSON(appErr.HTTPStatus, response)
	}
}

// GetTraceID retrieves or creates a trace ID
func GetTraceID(c *gin.Context) string {
	if traceID, exists := c.Get("trace_id"); exists {
		return traceID.(string)
	}
	return uuid.New().String()
}

// GetRequestID retrieves or creates a request ID
func GetRequestID(c *gin.Context) string {
	if requestID, exists := c.Get("request_id"); exists {
		return requestID.(string)
	}
	return uuid.New().String()
}

// SendSuccess sends a successful response
func SendSuccess(c *gin.Context, data interface{}) {
	response := dto.BaseResponse{
		Success: true,
		Data:    data,
		Error:   nil,
		Meta: dto.MetaDTO{
			TraceID:   GetTraceID(c),
			Timestamp: time.Now().UTC(),
			RequestID: GetRequestID(c),
		},
	}
	c.JSON(200, response)
}

// SendSuccessWithPagination sends a successful response with pagination
func SendSuccessWithPagination(c *gin.Context, data interface{}, pagination dto.PaginationDTO) {
	response := dto.PaginatedResponse{
		Success: true,
		Data:    data,
		Error:   nil,
		Meta: dto.PaginatedMetaDTO{
			TraceID:    GetTraceID(c),
			Timestamp:  time.Now().UTC(),
			RequestID:  GetRequestID(c),
			Pagination: pagination,
		},
	}
	c.JSON(200, response)
}
