-- Policy Hub Database Schema (Single Table Architecture)

-- Single policy_version table with all metadata
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
);

-- Create policy_docs table (references policy_version directly)
CREATE TABLE IF NOT EXISTS policy_docs (
	id SERIAL PRIMARY KEY,
	policy_version_id INTEGER NOT NULL REFERENCES policy_version(id) ON DELETE CASCADE,
	page VARCHAR(50) NOT NULL,
	content_md TEXT NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	UNIQUE(policy_version_id, page)
);

-- Critical indexes for high-load operations
CREATE UNIQUE INDEX IF NOT EXISTS idx_policy_version_latest_unique 
ON policy_version (policy_name) WHERE is_latest = TRUE;

CREATE INDEX IF NOT EXISTS idx_policy_version_latest_list
ON policy_version (policy_name, is_latest) WHERE is_latest = TRUE;

CREATE INDEX IF NOT EXISTS idx_policy_version_categories_gin
ON policy_version USING gin (categories) WHERE is_latest = TRUE;

CREATE INDEX IF NOT EXISTS idx_policy_version_provider 
ON policy_version (provider) WHERE is_latest = TRUE;

CREATE INDEX IF NOT EXISTS idx_policy_version_platforms_gin
ON policy_version USING gin (supported_platforms) WHERE is_latest = TRUE;

CREATE INDEX IF NOT EXISTS idx_policy_version_search
ON policy_version USING gin (to_tsvector('english', display_name || ' ' || coalesce(description, ''))) 
WHERE is_latest = TRUE;

CREATE INDEX IF NOT EXISTS idx_policy_version_name_version 
ON policy_version (policy_name, version);

CREATE INDEX IF NOT EXISTS idx_policy_version_created_at ON policy_version (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_policy_docs_page ON policy_docs (policy_version_id, page);
