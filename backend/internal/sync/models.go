package sync

import "github.com/wso2/policyhub/internal/policy"

// SyncRequest represents a policy sync request
type SyncRequest struct {
	PolicyName    string
	Version       string
	SourceType    string
	SourceURL     string
	DefinitionURL string
	Metadata      *policy.PolicyMetadata
	Documentation map[string]string
	AssetsBaseURL string
}

// SyncResult represents the result of a sync operation
type SyncResult struct {
	PolicyName string
	Version    string
	Status     string
}
