package policy

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/wso2/policyhub/internal/db"
	"github.com/wso2/policyhub/internal/db/sqlc"
	"github.com/wso2/policyhub/internal/errs"
	"golang.org/x/mod/semver"
)

// SQLCRepository implements Repository using sqlc-generated code
type SQLCRepository struct {
	db      *db.DB
	queries *sqlc.Queries
}

// NewSQLCRepository creates a new SQLC-based repository
func NewSQLCRepository(database *db.DB) Repository {
	return &SQLCRepository{
		db:      database,
		queries: sqlc.New(database.Pool),
	}
}

// Helper to convert pgtype.Text to *string
func pgtypeTextToPtr(pt pgtype.Text) *string {
	if pt.Valid {
		return &pt.String
	}
	return nil
}

// Helper to convert *string to pgtype.Text
func ptrToPgtypeText(s *string) pgtype.Text {
	if s != nil {
		return pgtype.Text{String: *s, Valid: true}
	}
	return pgtype.Text{}
}

// Helper to convert *time.Time to pgtype.Date
func ptrToPgtypeDate(t *time.Time) pgtype.Date {
	if t != nil {
		return pgtype.Date{Time: *t, Valid: true}
	}
	return pgtype.Date{}
}

// Helper to convert *time.Time to sql.NullTime
// Mapper functions to convert between sqlc and domain models

func sqlcToPolicyVersion(spv sqlc.PolicyVersion) (*PolicyVersion, error) {
	var categories, tags, platforms []string

	if len(spv.Categories) > 0 {
		if err := json.Unmarshal(spv.Categories, &categories); err != nil {
			return nil, fmt.Errorf("failed to unmarshal categories: %w", err)
		}
	}

	if len(spv.Tags) > 0 {
		if err := json.Unmarshal(spv.Tags, &tags); err != nil {
			return nil, fmt.Errorf("failed to unmarshal tags: %w", err)
		}
	}

	if len(spv.SupportedPlatforms) > 0 {
		if err := json.Unmarshal(spv.SupportedPlatforms, &platforms); err != nil {
			return nil, fmt.Errorf("failed to unmarshal platforms: %w", err)
		}
	}

	var description, logoPath, bannerPath, iconPath, sourceType, sourceUrl *string
	if spv.Description.Valid {
		description = &spv.Description.String
	}
	if spv.LogoPath.Valid {
		logoPath = &spv.LogoPath.String
	}
	if spv.BannerPath.Valid {
		bannerPath = &spv.BannerPath.String
	}
	if spv.IconPath.Valid {
		iconPath = &spv.IconPath.String
	}
	if spv.SourceType.Valid {
		sourceType = &spv.SourceType.String
	}
	if spv.SourceUrl.Valid {
		sourceUrl = &spv.SourceUrl.String
	}

	var releaseDate *time.Time
	if spv.ReleaseDate.Valid {
		releaseDate = &spv.ReleaseDate.Time
	}

	return &PolicyVersion{
		ID:         spv.ID,
		PolicyName: spv.PolicyName,
		Version:    spv.Version,
		IsLatest:   spv.IsLatest.Bool,

		// All metadata fields
		DisplayName:        spv.DisplayName,
		Provider:           spv.Provider,
		Description:        description,
		Categories:         categories,
		Tags:               tags,
		LogoPath:           logoPath,
		BannerPath:         bannerPath,
		SupportedPlatforms: platforms,

		// Version-specific fields
		ReleaseDate:    releaseDate,
		DefinitionYAML: spv.DefinitionYaml,
		IconPath:       iconPath,
		SourceType:     sourceType,
		SourceURL:      sourceUrl,
		CreatedAt:      spv.CreatedAt.Time,
		UpdatedAt:      spv.UpdatedAt.Time,
	}, nil
}

func sqlcToPolicyDoc(spd sqlc.PolicyDoc) *PolicyDoc {
	return &PolicyDoc{
		ID:              spd.ID,
		PolicyVersionID: spd.PolicyVersionID,
		Page:            spd.Page,
		ContentMd:       spd.ContentMd,
		CreatedAt:       spd.CreatedAt.Time,
		UpdatedAt:       spd.UpdatedAt.Time,
	}
}

// filterRowToPolicyVersion converts FilterPoliciesByMultipleRow to PolicyVersion
func filterRowToPolicyVersion(row sqlc.FilterPoliciesByMultipleRow) (*PolicyVersion, error) {
	var categories, tags, platforms []string

	if len(row.Categories) > 0 {
		if err := json.Unmarshal(row.Categories, &categories); err != nil {
			return nil, fmt.Errorf("failed to unmarshal categories: %w", err)
		}
	}

	if len(row.Tags) > 0 {
		if err := json.Unmarshal(row.Tags, &tags); err != nil {
			return nil, fmt.Errorf("failed to unmarshal tags: %w", err)
		}
	}

	if len(row.SupportedPlatforms) > 0 {
		if err := json.Unmarshal(row.SupportedPlatforms, &platforms); err != nil {
			return nil, fmt.Errorf("failed to unmarshal platforms: %w", err)
		}
	}

	var description, logoPath, bannerPath, iconPath, sourceType, sourceUrl *string
	if row.Description.Valid {
		description = &row.Description.String
	}
	if row.LogoPath.Valid {
		logoPath = &row.LogoPath.String
	}
	if row.BannerPath.Valid {
		bannerPath = &row.BannerPath.String
	}
	if row.IconPath.Valid {
		iconPath = &row.IconPath.String
	}
	if row.SourceType.Valid {
		sourceType = &row.SourceType.String
	}
	if row.SourceUrl.Valid {
		sourceUrl = &row.SourceUrl.String
	}

	var releaseDate *time.Time
	if row.ReleaseDate.Valid {
		releaseDate = &row.ReleaseDate.Time
	}

	return &PolicyVersion{
		ID:         row.ID,
		PolicyName: row.PolicyName,
		Version:    row.Version,
		IsLatest:   row.IsLatest.Bool,

		// All metadata fields
		DisplayName:        row.DisplayName,
		Provider:           row.Provider,
		Description:        description,
		Categories:         categories,
		Tags:               tags,
		LogoPath:           logoPath,
		BannerPath:         bannerPath,
		SupportedPlatforms: platforms,

		// Version-specific fields
		ReleaseDate:    releaseDate,
		DefinitionYAML: row.DefinitionYaml,
		IconPath:       iconPath,
		SourceType:     sourceType,
		SourceURL:      sourceUrl,
		CreatedAt:      row.CreatedAt.Time,
		UpdatedAt:      row.UpdatedAt.Time,
	}, nil
}

// Policy operations

func (r *SQLCRepository) GetPolicyByName(ctx context.Context, name string) (*PolicyVersion, error) {
	// Use GetLatestPolicyVersion since we only have policy_version table
	return r.GetLatestPolicyVersion(ctx, name)
}

func (r *SQLCRepository) ListPolicies(ctx context.Context, filters PolicyFilters) ([]*PolicyVersion, error) {
	q := r.queries
	var sqlcPolicies []sqlc.FilterPoliciesByMultipleRow
	var err error

	offset := int32((filters.Page - 1) * filters.PageSize)
	limit := int32(filters.PageSize)

	// Use the new combined filtering query
	search := ""
	if filters.Search != "" {
		search = filters.Search
	}

	sqlcPolicies, err = q.FilterPoliciesByMultiple(ctx, sqlc.FilterPoliciesByMultipleParams{
		Column1: search,
		Column2: filters.Categories,
		Column3: filters.Providers,
		Column4: filters.Platforms,
		Limit:   limit,
		Offset:  offset,
	})

	if err != nil {
		return nil, errs.NewDatabaseError("failed to list policies", map[string]any{"error": err.Error()})
	}

	policies := make([]*PolicyVersion, 0, len(sqlcPolicies))
	for _, sp := range sqlcPolicies {
		p, err := filterRowToPolicyVersion(sp)
		if err != nil {
			return nil, err
		}
		policies = append(policies, p)
	}

	return policies, nil
}

func (r *SQLCRepository) CountPolicies(ctx context.Context, filters PolicyFilters) (int, error) {
	q := r.queries
	var count int64
	var err error

	// Use the new combined filtering count
	search := ""
	if filters.Search != "" {
		search = filters.Search
	}

	count, err = q.CountPoliciesByMultiple(ctx, sqlc.CountPoliciesByMultipleParams{
		Column1: search,
		Column2: filters.Categories,
		Column3: filters.Providers,
		Column4: filters.Platforms,
	})

	if err != nil {
		return 0, errs.NewDatabaseError("failed to count policies", map[string]any{"error": err.Error()})
	}

	return int(count), nil
}

// Metadata operations

func (r *SQLCRepository) GetDistinctCategories(ctx context.Context) ([]string, error) {
	q := r.queries
	categories, err := q.GetDistinctCategories(ctx)
	if err != nil {
		return nil, errs.NewDatabaseError("failed to get distinct categories", map[string]any{"error": err.Error()})
	}

	return categories, nil
}

func (r *SQLCRepository) GetDistinctProviders(ctx context.Context) ([]string, error) {
	q := r.queries
	providers, err := q.GetDistinctProviders(ctx)
	if err != nil {
		return nil, errs.NewDatabaseError("failed to get distinct providers", map[string]any{"error": err.Error()})
	}

	return providers, nil
}

func (r *SQLCRepository) GetDistinctPlatforms(ctx context.Context) ([]string, error) {
	q := r.queries
	platforms, err := q.GetDistinctPlatforms(ctx)
	if err != nil {
		return nil, errs.NewDatabaseError("failed to get distinct platforms", map[string]any{"error": err.Error()})
	}

	return platforms, nil
}

// PolicyVersion operations

func (r *SQLCRepository) GetPolicyVersion(ctx context.Context, name string, version string) (*PolicyVersion, error) {
	q := r.queries
	spv, err := q.GetPolicyVersion(ctx, sqlc.GetPolicyVersionParams{
		PolicyName: name,
		Version:    version,
	})
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, errs.NewNotFoundError(errs.CodePolicyVersionNotFound, "Policy version not found", map[string]any{"policyName": name, "version": version})
		}
		return nil, errs.NewDatabaseError("failed to get policy version", map[string]any{"error": err.Error()})
	}
	return sqlcToPolicyVersion(spv)
}

func (r *SQLCRepository) ListPolicyVersions(ctx context.Context, name string, page, pageSize int) ([]*PolicyVersion, error) {
	q := r.queries
	offset := int32((page - 1) * pageSize)
	limit := int32(pageSize)

	spvs, err := q.ListPolicyVersions(ctx, sqlc.ListPolicyVersionsParams{
		PolicyName: name,
		Limit:      limit,
		Offset:     offset,
	})

	if err != nil {
		return nil, errs.NewDatabaseError("failed to list policy versions", map[string]any{"error": err.Error()})
	}

	versions := make([]*PolicyVersion, 0, len(spvs))
	for _, spv := range spvs {
		pv, err := sqlcToPolicyVersion(spv)
		if err != nil {
			return nil, err
		}
		versions = append(versions, pv)
	}

	return versions, nil
}

func (r *SQLCRepository) CountPolicyVersions(ctx context.Context, name string) (int, error) {
	q := r.queries
	count, err := q.CountPolicyVersions(ctx, name)
	if err != nil {
		return 0, errs.NewDatabaseError("failed to count policy versions", map[string]any{"error": err.Error()})
	}
	return int(count), nil
}

func (r *SQLCRepository) GetLatestPolicyVersion(ctx context.Context, name string) (*PolicyVersion, error) {
	q := r.queries
	spv, err := q.GetLatestPolicyVersion(ctx, name)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, errs.NewNotFoundError(errs.CodePolicyVersionNotFound, "No versions found for policy", map[string]any{"policyName": name})
		}
		return nil, errs.NewDatabaseError("failed to get latest policy version", map[string]any{"error": err.Error()})
	}
	return sqlcToPolicyVersion(spv)
}

// determineIsLatestInTransaction determines if a version should be latest within a transaction
func (r *SQLCRepository) determineIsLatestInTransaction(ctx context.Context, q *sqlc.Queries, policyName, newVersion string) (bool, error) {
	// Get the current latest version within this transaction
	currentLatest, err := q.GetLatestPolicyVersion(ctx, policyName)
	if err != nil {
		// If no versions exist yet, this is the first version and should be latest
		if err == pgx.ErrNoRows {
			return true, nil
		}
		return false, errs.NewDatabaseError("failed to get current latest version", map[string]any{"error": err.Error()})
	}

	// Compare versions semantically using semver
	result := semver.Compare(r.normalizeVersion(newVersion), r.normalizeVersion(currentLatest.Version))

	// Version should be latest if it's greater than current latest
	return result > 0, nil
}

// normalizeVersion ensures version strings are in semver format (adds 'v' prefix if missing)
func (r *SQLCRepository) normalizeVersion(version string) string {
	if version == "" {
		return "v0.0.0"
	}
	if version[0] != 'v' {
		return "v" + version
	}
	return version
}

func (r *SQLCRepository) CreatePolicyVersion(ctx context.Context, version *PolicyVersion) (*PolicyVersion, error) {
	// Use transaction to ensure atomicity
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return nil, errs.NewDatabaseError("failed to start transaction", map[string]any{"error": err.Error()})
	}
	defer tx.Rollback(ctx)

	q := sqlc.New(tx)

	// Determine if this version should be latest by comparing with current latest
	isLatest, err := r.determineIsLatestInTransaction(ctx, q, version.PolicyName, version.Version)
	if err != nil {
		return nil, err
	}
	version.IsLatest = isLatest

	// If this version should be latest, update all other versions for this policy to not be latest
	if version.IsLatest {
		err = q.UpdateLatestVersion(ctx, sqlc.UpdateLatestVersionParams{
			PolicyName: version.PolicyName,
			Version:    version.Version,
		})
		if err != nil {
			return nil, errs.NewDatabaseError("failed to update latest version flags", map[string]any{"error": err.Error()})
		}
	}

	platformsJSON, _ := json.Marshal(version.SupportedPlatforms)

	categoriesJSON, _ := json.Marshal(version.Categories)
	tagsJSON, _ := json.Marshal(version.Tags)

	spv, err := q.InsertPolicyVersion(ctx, sqlc.InsertPolicyVersionParams{
		PolicyName:         version.PolicyName,
		Version:            version.Version,
		IsLatest:           pgtype.Bool{Bool: version.IsLatest, Valid: true},
		DisplayName:        version.DisplayName,
		Provider:           version.Provider,
		Description:        ptrToPgtypeText(version.Description),
		Categories:         categoriesJSON,
		Tags:               tagsJSON,
		LogoPath:           ptrToPgtypeText(version.LogoPath),
		BannerPath:         ptrToPgtypeText(version.BannerPath),
		SupportedPlatforms: platformsJSON,
		ReleaseDate:        ptrToPgtypeDate(version.ReleaseDate),
		DefinitionYaml:     version.DefinitionYAML,
		IconPath:           ptrToPgtypeText(version.IconPath),
		SourceType:         ptrToPgtypeText(version.SourceType),
		SourceUrl:          ptrToPgtypeText(version.SourceURL),
	})

	if err != nil {
		return nil, err
	}

	// Commit transaction
	if err = tx.Commit(ctx); err != nil {
		return nil, errs.NewDatabaseError("failed to commit transaction", map[string]any{"error": err.Error()})
	}

	return sqlcToPolicyVersion(spv)
}

// PolicyDoc operations

func (r *SQLCRepository) GetPolicyDoc(ctx context.Context, versionID int32, page string) (*PolicyDoc, error) {
	q := r.queries
	spd, err := q.GetPolicyDoc(ctx, sqlc.GetPolicyDocParams{
		PolicyVersionID: versionID,
		Page:            page,
	})
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, errs.NewNotFoundError(errs.CodeDocNotFound, "Documentation page not found", map[string]any{"versionID": versionID, "page": page})
		}
		return nil, errs.NewDatabaseError("failed to get policy doc", map[string]any{"error": err.Error()})
	}
	return sqlcToPolicyDoc(spd), nil
}

func (r *SQLCRepository) ListPolicyDocs(ctx context.Context, versionID int32) ([]*PolicyDoc, error) {
	q := r.queries
	sqlcDocs, err := q.ListPolicyDocs(ctx, versionID)
	if err != nil {
		return nil, errs.NewDatabaseError("failed to list policy docs", map[string]any{"error": err.Error()})
	}

	docs := make([]*PolicyDoc, 0, len(sqlcDocs))
	for _, spd := range sqlcDocs {
		docs = append(docs, sqlcToPolicyDoc(spd))
	}

	return docs, nil
}

func (r *SQLCRepository) UpsertPolicyDoc(ctx context.Context, doc *PolicyDoc) (*PolicyDoc, error) {
	q := r.queries
	spd, err := q.UpsertPolicyDoc(ctx, sqlc.UpsertPolicyDocParams{
		PolicyVersionID: doc.PolicyVersionID,
		Page:            doc.Page,
		ContentMd:       doc.ContentMd,
	})
	if err != nil {
		return nil, errs.NewDatabaseError("failed to upsert policy doc", map[string]any{"error": err.Error()})
	}
	return sqlcToPolicyDoc(spd), nil
}
