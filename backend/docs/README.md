# Policy Hub Backend Documentation

Welcome to the Policy Hub Backend documentation. This comprehensive guide covers everything you need to understand, set up, and use the Policy Hub backend service.

## 📚 Documentation Overview

- **[Architecture](./ARCHITECTURE.md)** - System design, components, and data flow
- **[Features](./FEATURES.md)** - Complete feature set and capabilities
- **[API Reference](./API_REFERENCE.md)** - All endpoints with curl examples
- **[Setup Guide](./SETUP.md)** - Installation, configuration, and deployment

## 🚀 Quick Start

For a quick setup, see the [Setup Guide](./SETUP.md) which includes:
- Prerequisites and dependencies
- Configuration options
- Building and running the service
- Database setup with sample data
- Docker deployment
- Makefile targets

## 📖 Key Topics

- **Policy Management**: CRUD operations for API policies
- **Version Control**: Immutable policy versions with documentation
- **Synchronization**: CI/CD integration via sync endpoint
- **Search & Filtering**: Advanced policy discovery
- **Asset Management**: Icons, banners, and media files

## 🔗 Related Documentation

- [Main Project README](../README.md) - Project overview and structure
- [OpenAPI Specification](../api/openapi.yaml) - API contract definition
- [Project Structure](../../PROJECT_STRUCTURE.md) - Codebase organization

1. **Clone the repository**

```bash
cd /Users/dakshithas/Downloads/APIP/policy
```

2. **Copy environment configuration**

```bash
cp .env.example .env
```

3. **Edit `.env` file with your settings**

```bash
# Set your database credentials and API key
vim .env
```

4. **Install dependencies**

```bash
make deps
```

5. **Start PostgreSQL (using Docker)**

```bash
make docker-up
```

6. **Generate SQLC code**

```bash
make sqlc-generate
```

7. **Run database migrations**

```bash
make migrate-up
```

8. **Run the application**

```bash
make run
```

The server will start on `http://localhost:8080`

## 🛠️ Development

### Available Make Commands

```bash
make help           # Show all available commands
make build          # Build the application binary
make run            # Run the application
make test           # Run tests
make sqlc-generate  # Generate sqlc code from queries
make migrate-up     # Apply database migrations
make migrate-down   # Rollback database migrations
make migrate-create # Create new migration (usage: make migrate-create NAME=add_field)
make docker-up      # Start PostgreSQL container
make docker-down    # Stop PostgreSQL container
make clean          # Clean build artifacts
make lint           # Run linter
```

### Project Structure

```
.
├── api/
│   └── openapi.yaml                    # OpenAPI 3.0 specification
├── cmd/
│   └── policyhub/
│       └── main.go                     # Application entry point
├── internal/
│   ├── config/                         # Configuration management
│   │   └── config.go
│   ├── db/                             # Database layer
│   │   ├── db.go                       # Database connection
│   │   ├── migrations.go               # Migration runner
│   │   ├── migrations/                 # SQL migrations
│   │   │   ├── 000001_init.up.sql
│   │   │   └── 000001_init.down.sql
│   │   ├── queries/                    # SQL queries for sqlc
│   │   │   ├── policies.sql
│   │   │   ├── policy_versions.sql
│   │   │   └── policy_docs.sql
│   │   └── sqlc/                       # Generated sqlc code
│   ├── errs/                           # Error handling
│   │   └── errors.go
│   ├── logging/                        # Structured logging
│   │   └── logger.go
│   ├── policy/                         # Policy domain
│   │   ├── models.go                   # Domain models
│   │   ├── repository.go               # Repository interface
│   │   ├── repository_sqlc.go          # SQLC implementation
│   │   └── service.go                  # Business logic
│   ├── sync/                           # Sync service
│   │   └── service.go
│   └── http/                           # HTTP layer
│       ├── router.go                   # Route definitions
│       ├── dto/                        # API DTOs
│       │   └── dto.go
│       ├── handlers/                   # HTTP handlers
│       │   ├── health_handler.go
│       │   ├── policy_handler.go
│       │   └── sync_handler.go
│       └── middleware/                 # HTTP middleware
│           ├── auth.go
│           ├── errors.go
│           ├── logging.go
│           └── recovery.go
├── sqlc.yaml                           # SQLC configuration
├── docker-compose.yml                  # PostgreSQL container
├── Makefile                            # Build automation
├── .env.example                        # Environment template
└── README.md                           # This file
```

## 📡 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/policies` | List all policies (paginated) |
| GET | `/policies/{name}` | Get policy summary with latest version |
| GET | `/policies/{name}/versions` | List policy versions (paginated) |
| GET | `/policies/{name}/versions/{version}` | Get version metadata |
| GET | `/policies/{name}/versions/{version}/definition` | Get raw policy definition JSON |
| GET | `/policies/{name}/versions/{version}/docs` | Get all documentation pages |
| GET | `/policies/{name}/versions/{version}/docs/{page}` | Get single documentation page |
| GET | `/assets/{policy}/{version}/{file}` | Serve static assets |

### Protected Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/sync` | Sync policy from external source | - |

### Query Parameters

**Pagination** (all list endpoints):
- `page` (default: 1)
- `pageSize` (default: 20, max: 100)

**Filtering** (`/policies`):
- `search` - Free text search
- `category` - Filter by category
- `provider` - Filter by provider
- `platform` - Filter by supported platform

## 📝 API Response Format

All JSON endpoints use a standardized response envelope:

```json
{
  "success": true,
  "data": { },
  "error": null,
  "meta": {
    "trace_id": "abc123",
    "timestamp": "2025-11-26T12:00:00Z",
    "request_id": "xyz123",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 57,
      "totalPages": 3
    }
  }
}
```

**Error Response**:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "POLICY_NOT_FOUND",
    "message": "Policy not found",
    "details": {
      "policyName": "rate-limit"
    }
  },
  "meta": {
    "trace_id": "abc123",
    "timestamp": "2025-11-26T12:00:00Z",
    "request_id": "xyz123"
  }
}
```

## 🔄 Sync Workflow

The `/sync` endpoint allows CI/CD pipelines to register or update policies:

```bash
curl -X POST http://localhost:8080/sync \
  -H "Content-Type: application/json" \
  -d '{
    "policyName": "rate-limit",
    "version": "v1.1.0",
    "sourceType": "github",
    "downloadUrl": "https://github.com/wso2/policies/rate-limit",
    "definitionUrl": "https://raw.githubusercontent.com/.../policy-definition.json",
    "metadataUrl": "https://raw.githubusercontent.com/.../metadata.json",
    "docsBaseUrl": "https://raw.githubusercontent.com/.../docs/",
    "assetsBaseUrl": "https://raw.githubusercontent.com/.../assets/"
  }'
```

**What happens during sync**:

1. Validates request payload
2. Fetches and validates `metadata.json`
3. Creates or updates the policy
4. Checks if version already exists (immutable)
5. Fetches and stores `policy-definition.json` (raw)
6. Downloads documentation (Markdown)
7. Downloads assets (icons, banners, images)
8. Returns sync status

## 🗄️ Database Schema

### `policy` Table

Stores root policy metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | TEXT | Unique policy name |
| display_name | TEXT | Human-readable name |
| provider | TEXT | Provider (e.g., WSO2) |
| description | TEXT | Policy description |
| categories | JSONB | Array of categories |
| tags | JSONB | Array of tags |
| logo_path | TEXT | Path to logo asset |
| banner_path | TEXT | Path to banner asset |
| supported_platforms | JSONB | Array of platforms |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Update timestamp |

### `policy_version` Table

Stores immutable policy versions.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| policy_id | INT | Foreign key to policy |
| version | TEXT | Version string (e.g., v1.1.0) |
| description | TEXT | Version description |
| release_date | DATE | Release date |
| supported_platforms | JSONB | Platform overrides |
| definition_json | JSONB | Raw policy definition |
| icon_path | TEXT | Version-specific icon |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Update timestamp |

**Unique constraint**: `(policy_id, version)`

### `policy_docs` Table

Stores Markdown documentation per version.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| policy_version_id | INT | Foreign key to policy_version |
| page | TEXT | Page name (overview, configuration, etc.) |
| content_md | TEXT | Markdown content |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Update timestamp |

**Unique constraint**: `(policy_version_id, page)`

## 🔐 Security

- **Input Validation**: All inputs validated using Gin binding
- **SQL Injection Protection**: Using parameterized queries via sqlc
- **Error Sanitization**: Internal errors don't leak sensitive info

## 🧪 Testing

Run unit tests:

```bash
make test
```

Run with coverage:

```bash
go test -v -cover ./...
```

## 📊 Logging

Structured JSON logging using Zap:

```json
{
  "level": "info",
  "ts": "2025-11-26T12:00:00.000Z",
  "msg": "HTTP Request",
  "trace_id": "abc123",
  "request_id": "xyz789",
  "method": "GET",
  "path": "/policies",
  "status": 200,
  "latency": "5ms"
}
```

## 🐛 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| POLICY_NOT_FOUND | 404 | Policy does not exist |
| POLICY_VERSION_NOT_FOUND | 404 | Version does not exist |
| DOC_NOT_FOUND | 404 | Documentation page not found |
| VERSION_IMMUTABLE | 409 | Attempt to modify existing version |
| VALIDATION_ERROR | 400 | Invalid request payload |
| SYNC_FETCH_FAILED | 502 | Failed to fetch remote resource |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error |
| DB_ERROR | 500 | Database operation failed |

## 🔧 Configuration

Edit `.env` file:

```bash
# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
GIN_MODE=debug

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=policyhub
DB_PASSWORD=policyhub
DB_NAME=policyhub
DB_SSLMODE=disable

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json
```

## 📦 Deployment

### Docker Build

```bash
docker build -t policyhub:latest .
```

### Production Checklist

- [ ] Use `GIN_MODE=release`
- [ ] Set `LOG_LEVEL=info`
- [ ] Configure PostgreSQL with SSL (`DB_SSLMODE=require`)
- [ ] Set up database backups
- [ ] Configure reverse proxy (nginx/traefik)
- [ ] Enable HTTPS
- [ ] Set up monitoring and alerting

## 🤝 Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Update OpenAPI spec for API changes
4. Run `make lint` before committing
5. Keep commits atomic and well-described

## 📄 License

Copyright © 2025 WSO2

## 🙏 Acknowledgments

- Built with [Gin](https://gin-gonic.com/)
- SQL generation by [sqlc](https://sqlc.dev/)
- Logging by [Zap](https://github.com/uber-go/zap)
- Migrations by [golang-migrate](https://github.com/golang-migrate/migrate)

---

**Note**: After generating the SQLC code with `make sqlc-generate`, you'll need to update `internal/policy/repository_sqlc.go` to use the generated queries. The current implementation contains stub methods for compilation purposes.

## 🚧 Next Steps

1. Run `make sqlc-generate` to generate database access code
2. Implement the actual repository methods using the generated sqlc code
3. Add unit tests for services and handlers
4. Set up CI/CD pipeline
5. Add integration tests
6. Configure monitoring and observability
