package validation

import (
	"fmt"
	"net/url"
	"regexp"
	"strings"

	"github.com/wso2/policyhub/internal/errs"
	"github.com/wso2/policyhub/internal/policy"
)

// ValidatePolicyName validates a policy name
func ValidatePolicyName(name string) *errs.AppError {
	if name == "" {
		return errs.NewValidationError("policy name cannot be empty", nil)
	}

	if len(name) > policy.MaxPolicyNameLength {
		return errs.NewValidationError(
			fmt.Sprintf("policy name too long (max %d characters)", policy.MaxPolicyNameLength),
			map[string]any{"maxLength": policy.MaxPolicyNameLength},
		)
	}

	matched, _ := regexp.MatchString(policy.PolicyNameRegex, name)
	if !matched {
		return errs.NewValidationError(
			"policy name must contain only alphanumeric characters, hyphens, and underscores",
			map[string]any{"pattern": policy.PolicyNameRegex},
		)
	}

	return nil
}

// ValidateVersion validates a version string
func ValidateVersion(version string) *errs.AppError {
	if version == "" {
		return errs.NewValidationError("version cannot be empty", nil)
	}

	if len(version) > policy.MaxVersionLength {
		return errs.NewValidationError(
			fmt.Sprintf("version too long (max %d characters)", policy.MaxVersionLength),
			map[string]any{"maxLength": policy.MaxVersionLength},
		)
	}

	matched, _ := regexp.MatchString(policy.VersionRegex, version)
	if !matched {
		return errs.NewValidationError(
			"version must follow semantic versioning format (e.g., v1.2.3)",
			map[string]any{"pattern": policy.VersionRegex},
		)
	}

	return nil
}

// ValidateDescription validates a description
func ValidateDescription(description string) *errs.AppError {
	if len(description) > policy.MaxDescriptionLength {
		return errs.NewValidationError(
			fmt.Sprintf("description too long (max %d characters)", policy.MaxDescriptionLength),
			map[string]any{"maxLength": policy.MaxDescriptionLength},
		)
	}

	return nil
}

// ValidateURL validates a URL
func ValidateURL(urlStr string) *errs.AppError {
	if urlStr == "" {
		return errs.NewValidationError("URL cannot be empty", nil)
	}

	parsedURL, err := url.ParseRequestURI(urlStr)
	if err != nil {
		return errs.NewValidationError("invalid URL format", map[string]any{"error": err.Error()})
	}

	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return errs.NewValidationError("URL must use HTTP or HTTPS protocol", nil)
	}

	return nil
}

// ValidateCategories validates category names
func ValidateCategories(categories []string) *errs.AppError {
	for _, category := range categories {
		if strings.TrimSpace(category) == "" {
			return errs.NewValidationError("category names cannot be empty or whitespace", nil)
		}
		if len(category) > 50 {
			return errs.NewValidationError("category name too long (max 50 characters)", nil)
		}
	}

	return nil
}

// ValidatePlatforms validates platform names
func ValidatePlatforms(platforms []string) *errs.AppError {
	for _, platform := range platforms {
		if strings.TrimSpace(platform) == "" {
			return errs.NewValidationError("platform names cannot be empty or whitespace", nil)
		}
		if len(platform) > 50 {
			return errs.NewValidationError("platform name too long (max 50 characters)", nil)
		}
	}

	return nil
}

// ValidateTags validates tag names
func ValidateTags(tags []string) *errs.AppError {
	for _, tag := range tags {
		if strings.TrimSpace(tag) == "" {
			return errs.NewValidationError("tag names cannot be empty or whitespace", nil)
		}
		if len(tag) > 30 {
			return errs.NewValidationError("tag name too long (max 30 characters)", nil)
		}
	}

	return nil
}
