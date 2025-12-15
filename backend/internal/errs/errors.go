package errs

import (
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgconn"
)

// Code represents a machine-readable error code
type Code string

const (
	CodePolicyNotFound        Code = "POLICY_NOT_FOUND"
	CodePolicyVersionNotFound Code = "POLICY_VERSION_NOT_FOUND"
	CodeDocNotFound           Code = "DOC_NOT_FOUND"
	CodeValidationError       Code = "VALIDATION_ERROR"
	CodeSyncFetchFailed       Code = "SYNC_FETCH_FAILED"
	CodeInternalServerError   Code = "INTERNAL_SERVER_ERROR"
	CodeDatabaseError         Code = "DB_ERROR"
)

// AppError represents a structured application error
type AppError struct {
	Code       Code           `json:"code"`
	HTTPStatus int            `json:"-"`
	Message    string         `json:"message"`
	Details    map[string]any `json:"details,omitempty"`
}

// Error implements the error interface
func (e *AppError) Error() string {
	return string(e.Code) + ": " + e.Message
}

// NewValidationError creates a validation error
func NewValidationError(msg string, details map[string]any) *AppError {
	return &AppError{
		Code:       CodeValidationError,
		HTTPStatus: http.StatusBadRequest,
		Message:    msg,
		Details:    details,
	}
}

// NewNotFoundError creates a not found error
func NewNotFoundError(code Code, msg string, details map[string]any) *AppError {
	return &AppError{
		Code:       code,
		HTTPStatus: http.StatusNotFound,
		Message:    msg,
		Details:    details,
	}
}

// NewConflictError creates a conflict error
func NewConflictError(code Code, msg string, details map[string]any) *AppError {
	return &AppError{
		Code:       code,
		HTTPStatus: http.StatusConflict,
		Message:    msg,
		Details:    details,
	}
}

// NewInternalError creates an internal server error
func NewInternalError(msg string, details map[string]any) *AppError {
	return &AppError{
		Code:       CodeInternalServerError,
		HTTPStatus: http.StatusInternalServerError,
		Message:    msg,
		Details:    details,
	}
}

// NewDatabaseError creates a database error
func NewDatabaseError(msg string, details map[string]any) *AppError {
	return &AppError{
		Code:       CodeDatabaseError,
		HTTPStatus: http.StatusInternalServerError,
		Message:    msg,
		Details:    details,
	}
}

// SanitizeDatabaseError creates a user-friendly database error without internal details
func SanitizeDatabaseError(operation string) *AppError {
	return &AppError{
		Code:       CodeDatabaseError,
		HTTPStatus: http.StatusInternalServerError,
		Message:    "A database error occurred while processing your request",
		Details:    map[string]any{"operation": operation},
	}
}

// PolicyNotFound creates a policy not found error
func PolicyNotFound(name string) *AppError {
	return NewNotFoundError(
		CodePolicyNotFound,
		"Policy not found",
		map[string]any{"policyName": name},
	)
}

// PolicyVersionNotFound creates a policy version not found error
func PolicyVersionNotFound(name, version string) *AppError {
	return NewNotFoundError(
		CodePolicyVersionNotFound,
		"Policy version not found",
		map[string]any{
			"policyName": name,
			"version":    version,
		},
	)
}

// DocNotFound creates a documentation not found error
func DocNotFound(name, version, page string) *AppError {
	return NewNotFoundError(
		CodeDocNotFound,
		"Documentation page not found",
		map[string]any{
			"policyName": name,
			"version":    version,
			"page":       page,
		},
	)
}

// SyncFetchFailed creates a sync fetch failure error
func SyncFetchFailed(url string, err error) *AppError {
	details := map[string]any{"url": url}
	if err != nil {
		details["error"] = err.Error()
	}
	return &AppError{
		Code:       CodeSyncFetchFailed,
		HTTPStatus: http.StatusBadGateway,
		Message:    "Failed to fetch resource from remote URL",
		Details:    details,
	}
}

// IsUniqueConstraintError checks if an error is a PostgreSQL unique constraint violation
func IsUniqueConstraintError(err error) bool {
	if err == nil {
		return false
	}

	// Check for PostgreSQL unique constraint violation
	if pqErr, ok := err.(*pgconn.PgError); ok {
		return pqErr.Code == "23505" // unique_violation
	}

	// Check for generic unique constraint error message
	errMsg := strings.ToLower(err.Error())
	return strings.Contains(errMsg, "unique constraint") ||
		strings.Contains(errMsg, "duplicate key") ||
		strings.Contains(errMsg, "already exists")
}
