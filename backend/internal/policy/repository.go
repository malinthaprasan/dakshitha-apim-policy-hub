package policy

import (
	"context"
)

// Repository defines the interface for policy data access
type Repository interface {
	GetPolicyByName(ctx context.Context, name string) (*PolicyVersion, error)
	ListPolicies(ctx context.Context, filters PolicyFilters) ([]*PolicyVersion, error)
	CountPolicies(ctx context.Context, filters PolicyFilters) (int, error)

	// Metadata operations
	GetDistinctCategories(ctx context.Context) ([]string, error)
	GetDistinctProviders(ctx context.Context) ([]string, error)
	GetDistinctPlatforms(ctx context.Context) ([]string, error)

	GetPolicyVersion(ctx context.Context, name string, version string) (*PolicyVersion, error)
	ListPolicyVersions(ctx context.Context, name string, page, pageSize int) ([]*PolicyVersion, error)
	CountPolicyVersions(ctx context.Context, name string) (int, error)
	GetLatestPolicyVersion(ctx context.Context, name string) (*PolicyVersion, error)
	CreatePolicyVersion(ctx context.Context, version *PolicyVersion) (*PolicyVersion, error)

	// Documentation operations
	GetPolicyDoc(ctx context.Context, versionID int32, page string) (*PolicyDoc, error)
	ListPolicyDocs(ctx context.Context, versionID int32) ([]*PolicyDoc, error)
	UpsertPolicyDoc(ctx context.Context, doc *PolicyDoc) (*PolicyDoc, error)
}
