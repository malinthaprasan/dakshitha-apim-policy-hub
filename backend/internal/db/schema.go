package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

// CreateSchema creates the database schema by executing DDL statements directly
func CreateSchema(pool *pgxpool.Pool, logger *zap.Logger) error {
	logger.Info("Creating database schema...")

	ctx := context.Background()

	policyVersionTable := `
	CREATE TABLE IF NOT EXISTS policy_version (
		id SERIAL PRIMARY KEY,
		policy_name VARCHAR(100) NOT NULL,
		version VARCHAR(50) NOT NULL,
		is_latest BOOLEAN DEFAULT FALSE,
		
		-- All metadata fields (can vary per version)
		display_name VARCHAR(200) NOT NULL,
		provider VARCHAR(100) NOT NULL,
		description TEXT,
		categories JSONB,
		tags JSONB,
		logo_path VARCHAR(500),
		banner_path VARCHAR(500),
		supported_platforms JSONB,
		
		-- Version-specific fields
		release_date DATE,
		definition_yaml TEXT NOT NULL,
		icon_path VARCHAR(500),
		source_type VARCHAR(50),
		source_url VARCHAR(1000),
		
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		
		UNIQUE(policy_name, version)
	);`

	// Create policy_docs table
	policyDocsTable := `
	CREATE TABLE IF NOT EXISTS policy_docs (
		id SERIAL PRIMARY KEY,
		policy_version_id INTEGER NOT NULL REFERENCES policy_version(id) ON DELETE CASCADE,
		page VARCHAR(50) NOT NULL,
		content_md TEXT NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		UNIQUE(policy_version_id, page)
	);`

	// Create indexes for better performance
	indexes := []string{
		// Critical indexes for high-load operations
		`CREATE UNIQUE INDEX IF NOT EXISTS idx_policy_version_latest_unique 
		ON policy_version (policy_name) WHERE is_latest = TRUE;`,

		`CREATE INDEX IF NOT EXISTS idx_policy_version_latest_list
		ON policy_version (policy_name, is_latest) WHERE is_latest = TRUE;`,

		`CREATE INDEX IF NOT EXISTS idx_policy_version_categories_gin
		ON policy_version USING gin (categories) WHERE is_latest = TRUE;`,

		`CREATE INDEX IF NOT EXISTS idx_policy_version_provider 
		ON policy_version (provider) WHERE is_latest = TRUE;`,

		`CREATE INDEX IF NOT EXISTS idx_policy_version_platforms_gin
		ON policy_version USING gin (supported_platforms) WHERE is_latest = TRUE;`,

		`CREATE INDEX IF NOT EXISTS idx_policy_version_search
		ON policy_version USING gin (to_tsvector('english', display_name || ' ' || coalesce(description, ''))) 
		WHERE is_latest = TRUE;`,

		`CREATE INDEX IF NOT EXISTS idx_policy_version_name_version 
		ON policy_version (policy_name, version);`,

		`CREATE INDEX IF NOT EXISTS idx_policy_version_created_at ON policy_version (created_at DESC);`,
		`CREATE INDEX IF NOT EXISTS idx_policy_docs_page ON policy_docs (policy_version_id, page);`,
	}

	tables := []string{policyVersionTable, policyDocsTable}

	// Execute table creation
	for i, tableSQL := range tables {
		tableNames := []string{"policy_version", "policy_docs"}
		logger.Info("Creating table", zap.String("table", tableNames[i]))
		if _, err := pool.Exec(ctx, tableSQL); err != nil {
			return fmt.Errorf("failed to create table %s: %w", tableNames[i], err)
		}
	}

	// Execute index creation
	for _, indexSQL := range indexes {
		logger.Info("Creating index", zap.String("sql", indexSQL))
		if _, err := pool.Exec(ctx, indexSQL); err != nil {
			return fmt.Errorf("failed to create index: %w", err)
		}
	}

	logger.Info("Database schema created successfully")
	return nil
}
