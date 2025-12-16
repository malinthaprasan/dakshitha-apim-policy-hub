# API Reference

This document provides comprehensive API reference for the Policy Hub Backend with curl examples for all endpoints.

## Prerequisites

Set environment variables:

```bash
export API_HOST="http://localhost:8080"
export API_KEY="dev-api-key-change-in-production"
```

## Base Response Format

All API responses follow this structure:

```json
{
  "success": true|false,
  "data": { ... } | null,
  "error": { ... } | null,
  "meta": {
    "trace_id": "string",
    "timestamp": "2025-12-14T10:00:00Z",
    "request_id": "string"
  }
}
```

## Health Check

**GET** `/health`

Health check endpoint.

```bash
curl -X GET "$API_HOST/health"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-12-14T10:00:00Z"
  },
  "error": null,
  "meta": {
    "trace_id": "abc123",
    "timestamp": "2025-12-14T10:00:00Z",
    "request_id": "xyz123"
  }
}
```

## Policies

### List Policies

**GET** `/policies`

List all policies with optional filtering and pagination.

**Query Parameters:**
- `search` (string): Free text search over name, description, tags
- `category`/`categories` (string): Filter by category (comma-separated)
- `provider`/`providers` (string): Filter by provider (comma-separated)
- `platform`/`platforms` (string): Filter by supported platform (comma-separated)
- `page` (integer): Page number (default: 1)
- `pageSize` (integer): Items per page (default: 20, max: 100)

```bash
# Basic listing
curl -X GET "$API_HOST/policies"

# With search and filters
curl -X GET "$API_HOST/policies?search=rate&category=security&provider=WSO2&page=1&pageSize=10"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "rate-limit",
      "displayName": "Rate Limiting Policy",
      "description": "Limits API calls per time window",
      "provider": "WSO2",
      "categories": ["security", "traffic-control"],
      "tags": ["limit", "quota"],
      "supportedPlatforms": ["apim-4.5+"],
      "logoUrl": "/assets/rate-limit/icon.svg",
      "bannerUrl": "/assets/rate-limit/banner.png",
      "latestVersion": "1.1.0"
    }
  ],
  "error": null,
  "meta": {
    "trace_id": "abc123",
    "timestamp": "2025-12-14T10:00:00Z",
    "request_id": "xyz123",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 50,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Batch Get Policies

**POST** `/policies/resolve`

Retrieve multiple policies in a single request with strategy-based version selection.

**Request Body:**
```json
{
  "policies": [
    {
      "name": "rate-limiting",
      "retrievalStrategy": "exact",
      "baseVersion": "1.1.0"
    },
    {
      "name": "jwt-authentication",
      "retrievalStrategy": "latest_patch",
      "baseVersion": "2.1"
    },
    {
      "name": "cors-policy",
      "retrievalStrategy": "latest_minor",
      "baseVersion": "1"
    },
    {
      "name": "api-throttling",
      "retrievalStrategy": "latest_major"
    }
  ]
}
```

**Retrieval Strategies:**
- `exact`: Get the exact version specified in `baseVersion` (required)
- `latest_patch`: Get the latest patch version within major.minor from `baseVersion` (e.g., "2.1" → latest 2.1.x)
- `latest_minor`: Get the latest minor version within major from `baseVersion` (e.g., "2" → latest 2.x.x)
- `latest_major`: Get the latest major version (no `baseVersion` needed)

```bash
curl -X POST "$API_HOST/policies/resolve" \
  -H "Content-Type: application/json" \
  -d '{
    "policies": [
      {
        "name": "rate-limiting",
        "retrievalStrategy": "exact",
        "baseVersion": "1.1.0"
      },
      {
        "name": "jwt-authentication",
        "retrievalStrategy": "latest_major"
      }
    ]
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "rate-limiting",
      "version": "1.1.0",
      "sourceType": "github",
      "downloadUrl": "https://github.com/wso2/policy-hub/tree/main/storage/rate-limiting/1.1.0",
      "definition": {
        "yaml": "name: rate-limiting\nversion: 1.1.0\n..."
      },
      "metadata": {
        "displayName": "Rate Limiting Policy",
        "provider": "WSO2",
        "description": "Controls the number of requests per time window",
        "categories": ["security", "traffic-control"],
        "supportedPlatforms": ["apim-4.5+"]
      }
    },
    {
      "name": "jwt-authentication",
      "version": "2.1.0",
      "sourceType": "github",
      "downloadUrl": "https://github.com/wso2/policy-hub/tree/main/storage/jwt-authentication/2.1.0",
      "definition": {
        "yaml": "name: jwt-authentication\nversion: 2.1.0\n..."
      },
      "metadata": {
        "displayName": "JWT Authentication Policy",
        "provider": "WSO2",
        "description": "Validates JSON Web Tokens (JWT)",
        "categories": ["security", "authentication"],
        "supportedPlatforms": ["apim-4.5+"]
      }
    }
  ],
  "error": null,
  "meta": {
    "trace_id": "abc123",
    "timestamp": "2025-12-16T10:00:00Z",
    "request_id": "xyz123"
  }
}
```

**Constraints:**
- Maximum 100 policies per batch request
- Policies that cannot be found are silently omitted from response
- Version format must be `d.d.d` (e.g., "1.2.3", not "v1.2.3")

### Get Categories

**GET** `/policies/categories`

Get all available categories.

```bash
curl -X GET "$API_HOST/policies/categories"
```

**Response (200):**
```json
{
  "success": true,
  "data": ["security", "networking", "compliance", "traffic-control"],
  "error": null,
  "meta": { ... }
}
```

### Get Providers

**GET** `/policies/providers`

Get all available providers.

```bash
curl -X GET "$API_HOST/policies/providers"
```

**Response (200):**
```json
{
  "success": true,
  "data": ["WSO2", "Acme Inc", "SecureAPI Corp"],
  "error": null,
  "meta": { ... }
}
```

### Get Platforms

**GET** `/policies/platforms`

Get all supported platforms.

```bash
curl -X GET "$API_HOST/policies/platforms"
```

**Response (200):**
```json
{
  "success": true,
  "data": ["apim-4.5+", "apim-4.0+", "gateway-1.0+"],
  "error": null,
  "meta": { ... }
}
```

### Get Policy Summary

**GET** `/policies/{name}`

Get policy summary information.

```bash
curl -X GET "$API_HOST/policies/rate-limiting"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "name": "rate-limit",
    "displayName": "Rate Limiting Policy",
    "description": "Limits API calls per time window",
    "provider": "WSO2",
    "categories": ["security", "traffic-control"],
    "tags": ["limit", "quota"],
    "supportedPlatforms": ["apim-4.5+"],
    "logoUrl": "/assets/rate-limit/icon.svg",
    "bannerUrl": "/assets/rate-limit/banner.png",
    "latestVersion": "v1.1.0"
  },
  "error": null,
  "meta": { ... }
}
```

### List Policy Versions

**GET** `/policies/{name}/versions`

List all versions of a policy.

```bash
curl -X GET "$API_HOST/policies/rate-limiting/versions?page=1&pageSize=10"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "version": "v1.1.0",
      "createdAt": "2025-12-14T10:00:00Z",
      "isLatest": true
    },
    {
      "version": "v1.0.0",
      "createdAt": "2025-11-01T10:00:00Z",
      "isLatest": false
    }
  ],
  "error": null,
  "meta": {
    "trace_id": "abc123",
    "timestamp": "2025-12-14T10:00:00Z",
    "request_id": "xyz123",
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 2,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### Get Latest Version

**GET** `/policies/{name}/versions/latest`

Get the latest version information for a policy.

```bash
curl -X GET "$API_HOST/policies/rate-limiting/versions/latest"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "version": "v1.1.0",
    "createdAt": "2025-12-14T10:00:00Z",
    "isLatest": true
  },
  "error": null,
  "meta": { ... }
}
```

### Get Policy Version Detail

**GET** `/policies/{name}/versions/{version}`

Get detailed information about a specific policy version.

```bash
curl -X GET "$API_HOST/policies/rate-limiting/versions/1.1.0"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "name": "rate-limit",
    "version": "v1.1.0",
    "displayName": "Rate Limiting Policy",
    "description": "Limits API calls per time window",
    "provider": "WSO2",
    "categories": ["security", "traffic-control"],
    "tags": ["limit", "quota"],
    "supportedPlatforms": ["apim-4.5+"],
    "logoUrl": "/assets/rate-limit/icon.svg",
    "bannerUrl": "/assets/rate-limit/banner.png",
    "sourceType": "github",
    "downloadUrl": "https://github.com/wso2/policies/rate-limit",
    "createdAt": "2025-12-14T10:00:00Z"
  },
  "error": null,
  "meta": { ... }
}
```

### Get Policy Definition

**GET** `/policies/{name}/versions/{version}/definition`

Get the JSON schema definition for a policy version.

```bash
curl -X GET "$API_HOST/policies/rate-limiting/versions/1.1.0/definition"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "type": "object",
    "properties": {
      "requestsPerMin": {
        "type": "integer",
        "minimum": 1,
        "maximum": 10000
      }
    },
    "required": ["requestsPerMin"]
  },
  "error": null,
  "meta": { ... }
}
```

### Get Policy for Engine

**GET** `/policies/{name}/versions/{version}/engine`

Get policy data formatted for API engine consumption.

```bash
curl -X GET "$API_HOST/policies/rate-limiting/versions/1.1.0/engine"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "name": "rate-limit",
    "version": "v1.1.0",
    "definition": { ... },
    "metadata": { ... },
    "sourceType": "github",
    "downloadUrl": "https://github.com/wso2/policies/rate-limit"
  },
  "error": null,
  "meta": { ... }
}
```

### Batch Get Policies

**POST** `/policies/resolve`

Retrieve multiple policies in a single request with strategy-based version selection.

**Request Body:**
```json
{
  "policies": [
    {
      "name": "rate-limiting",
      "retrievalStrategy": "exact",
      "baseVersion": "1.1.0"
    },
    {
      "name": "jwt-authentication",
      "retrievalStrategy": "latest_patch",
      "baseVersion": "2.1"
    },
    {
      "name": "cors-policy",
      "retrievalStrategy": "latest_minor",
      "baseVersion": "1"
    },
    {
      "name": "api-throttling",
      "retrievalStrategy": "latest_major"
    }
  ]
}
```

**Retrieval Strategies:**
- `exact`: Get the exact version specified in `baseVersion` (required)
- `latest_patch`: Get the latest patch version within major.minor from `baseVersion` (e.g., "2.1" → latest 2.1.x)
- `latest_minor`: Get the latest minor version within major from `baseVersion` (e.g., "2" → latest 2.x.x)
- `latest_major`: Get the latest major version (no `baseVersion` needed)

```bash
curl -X POST "$API_HOST/policies/resolve" \
  -H "Content-Type: application/json" \
  -d '{
    "policies": [
      {
        "name": "rate-limiting",
        "retrievalStrategy": "exact",
        "baseVersion": "1.1.0"
      },
      {
        "name": "jwt-authentication",
        "retrievalStrategy": "latest_major"
      }
    ]
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "rate-limiting",
      "version": "1.1.0",
      "sourceType": "github",
      "downloadUrl": "https://github.com/wso2/policy-hub/tree/main/storage/rate-limiting/1.1.0",
      "definition": {
        "yaml": "name: rate-limiting\nversion: 1.1.0\n..."
      },
      "metadata": {
        "displayName": "Rate Limiting Policy",
        "provider": "WSO2",
        "description": "Controls the number of requests per time window",
        "categories": ["security", "traffic-control"],
        "supportedPlatforms": ["apim-4.5+"]
      }
    },
    {
      "name": "jwt-authentication",
      "version": "2.1.0",
      "sourceType": "github",
      "downloadUrl": "https://github.com/wso2/policy-hub/tree/main/storage/jwt-authentication/2.1.0",
      "definition": {
        "yaml": "name: jwt-authentication\nversion: 2.1.0\n..."
      },
      "metadata": {
        "displayName": "JWT Authentication Policy",
        "provider": "WSO2",
        "description": "Validates JSON Web Tokens (JWT)",
        "categories": ["security", "authentication"],
        "supportedPlatforms": ["apim-4.5+"]
      }
    }
  ],
  "error": null,
  "meta": {
    "trace_id": "abc123",
    "timestamp": "2025-12-16T10:00:00Z",
    "request_id": "xyz123"
  }
}
```

**Constraints:**
- Maximum 100 policies per batch request
- Policies that cannot be found are silently omitted from response
- Version format must be `d.d.d` (e.g., "1.2.3", not "v1.2.3")

### Get All Documentation

**GET** `/policies/{name}/versions/{version}/docs`

List all available documentation pages for a policy version.

```bash
curl -X GET "$API_HOST/policies/rate-limiting/versions/1.1.0/docs"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "type": "overview",
      "title": "Overview",
      "url": "/policies/rate-limit/versions/v1.1.0/docs/overview"
    },
    {
      "type": "configuration",
      "title": "Configuration",
      "url": "/policies/rate-limit/versions/v1.1.0/docs/configuration"
    }
  ],
  "error": null,
  "meta": { ... }
}
```

### Get Single Documentation Page

**GET** `/policies/{name}/versions/{version}/docs/{page}`

Get a specific documentation page. Valid page types: `overview`, `configuration`, `examples`, `faq`, `troubleshooting`.

```bash
curl -X GET "$API_HOST/policies/rate-limiting/versions/1.1.0/docs/overview"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "type": "overview",
    "title": "Overview",
    "content": "# Rate Limiting Policy\n\nThis policy limits API calls per time window..."
  },
  "error": null,
  "meta": { ... }
}
```

## Sync

### Sync Policy

**POST** `/sync`

Sync a policy from an external source. Requires API key authentication.

**Request Body:**
```json
{
  "policyName": "rate-limiting",
  "version": "1.1.0",
  "sourceType": "github",
  "downloadUrl": "https://github.com/wso2/policies/rate-limit",
  "definitionUrl": "https://raw.githubusercontent.com/wso2/policies/rate-limit/v1.1.0/policy-definition.yml",
  "metadata": {
    "name": "rate-limit",
    "displayName": "Rate Limiting Policy",
    "provider": "WSO2",
    "description": "Rate limit traffic per minute",
    "categories": ["security", "traffic-control"],
    "tags": ["limit", "quota"],
    "supportedPlatforms": ["apim-4.5+"],
    "logoUrl": "https://raw.githubusercontent.com/wso2/policies/rate-limit/v1.1.0/icon.svg",
    "bannerUrl": "https://raw.githubusercontent.com/wso2/policies/rate-limit/v1.1.0/banner.png"
  },
  "documentation": {
    "overview": "https://raw.githubusercontent.com/wso2/policies/rate-limiting/1.1.0/docs/overview.md",
    "configuration": "https://raw.githubusercontent.com/wso2/policies/rate-limiting/1.1.0/docs/configuration.md",
    "examples": "https://raw.githubusercontent.com/wso2/policies/rate-limiting/1.1.0/docs/examples.md",
    "faq": "https://raw.githubusercontent.com/wso2/policies/rate-limiting/1.1.0/docs/faq.md",
    "troubleshooting": "https://raw.githubusercontent.com/wso2/policies/rate-limiting/1.1.0/docs/troubleshooting.md"
  },
  "assetsBaseUrl": "https://raw.githubusercontent.com/wso2/policies/rate-limit/v1.1.0/assets/"
}
```

```bash
curl -X POST "$API_HOST/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "policyName": "rate-limit",
    "version": "v1.1.0",
    "sourceType": "github",
    "downloadUrl": "https://github.com/wso2/policies/rate-limit",
    "definitionUrl": "https://raw.githubusercontent.com/wso2/policies/rate-limit/v1.1.0/policy-definition.yml",
    "metadata": {
      "name": "rate-limit",
      "displayName": "Rate Limiting Policy",
      "provider": "WSO2",
      "description": "Rate limit traffic per minute",
      "categories": ["security", "traffic-control"],
      "tags": ["limit", "quota"],
      "supportedPlatforms": ["apim-4.5+"],
      "logoUrl": "https://raw.githubusercontent.com/wso2/policies/rate-limiting/1.1.0/icon.svg",
      "bannerUrl": "https://raw.githubusercontent.com/wso2/policies/rate-limiting/1.1.0/banner.png"
    },
    "documentation": {
      "overview": "https://raw.githubusercontent.com/wso2/policies/rate-limit/v1.1.0/docs/overview.md",
      "configuration": "https://raw.githubusercontent.com/wso2/policies/rate-limit/v1.1.0/docs/configuration.md"
    },
    "assetsBaseUrl": "https://raw.githubusercontent.com/wso2/policies/rate-limit/v1.1.0/assets/"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "policyName": "rate-limit",
    "version": "v1.1.0",
    "status": "synced"
  },
  "error": null,
  "meta": { ... }
}
```

## Error Responses

### Authentication Error (401)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key",
    "details": null
  },
  "meta": { ... }
}
```

### Validation Error (400)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "invalid version format",
    "details": {
      "version": "1.0.0",
      "expected": "v1.2.3"
    }
  },
  "meta": { ... }
}
```

### Not Found (404)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "POLICY_NOT_FOUND",
    "message": "Policy not found",
    "details": {
      "policyName": "non-existent-policy"
    }
  },
  "meta": { ... }
}
```

### Conflict (409)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VERSION_IMMUTABLE",
    "message": "Policy version is immutable and already exists",
    "details": {
      "policyName": "rate-limiting",
      "version": "1.1.0"
    }
  },
  "meta": { ... }
}
```
