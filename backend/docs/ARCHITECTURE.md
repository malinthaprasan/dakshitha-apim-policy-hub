# Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          External Clients                        │
│  (UI App, API Engine, CI/CD Pipeline, Developer Tools)          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HTTP Layer (Gin Router)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Recovery   │  │   Logging    │  │Error Handler │          │
│  │  Middleware  │  │  Middleware  │  │  Middleware  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Handler Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Health     │  │   Policy     │  │    Sync      │          │
│  │   Handler    │  │   Handler    │  │   Handler    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
│  ┌──────────────────────────────┐  ┌────────────────────────┐  │
│  │      Policy Service          │  │     Sync Service       │  │
│  │  • Business Logic            │  │  • Fetch Metadata      │  │
│  │  • Validation Rules          │  │  • Download Assets     │  │
│  │  • Domain Operations         │  │  • Process Docs        │  │
│  └──────────────┬───────────────┘  └──────────┬─────────────┘  │
└─────────────────┼──────────────────────────────┼────────────────┘
                  │                              │
                  ▼                              │
┌─────────────────────────────────────────────┐  │
│         Repository Interface                │  │
│  • GetPolicyByName()                        │  │
│  • CreatePolicyVersion()                    │  │
│  • UpsertPolicyDoc()                        │  │
│  • ... (Domain operations)                  │  │
└─────────────────┬───────────────────────────┘  │
                  │                              │
                  ▼                              │
┌─────────────────────────────────────────────┐  │
│         SQLC Repository                     │  │
│  • Raw SQL queries                          │  │
│  • Auto-generated Go code                   │  │
│  • Type-safe database access                │  │
└─────────────────┬───────────────────────────┘  │
                  │                              │
                  ▼                              │
┌─────────────────────────────────────────────┐  │
│         PostgreSQL Database                 │  │
│  ┌─────────────────────┐  ┌──────────┐     │  │
│  │   policy_version    │  │policy_docs│     │  │
│  │                     │  │          │     │  │
│  │ • All policy data   │  │ • Docs   │     │  │
│  │ • Metadata          │  │ • Pages  │     │  │
│  │ • Versions          │  │          │     │  │
│  └─────────────────────┘  └──────────┘     │  │
└─────────────────────────────────────────────┘  │
                                                 │
                  ┌──────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│         Filesystem Storage                      │
│  storage/                                       │
│  ├── policy-name/                               │
│  │   ├── v1.0.0/                                │
│  │   │   ├── assets/                            │
│  │   │   │   ├── icon.svg                       │
│  │   │   │   └── banner.png                     │
│  │   │   └── images/                            │
│  │   │       └── diagram.png                    │
│  │   └── v1.1.0/                                │
│  │       └── assets/                            │
└─────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Read Flow (GET /policies/{name})

```
┌────────┐    HTTP GET     ┌──────────┐
│ Client ├────────────────►│  Router  │
└────────┘                 └─────┬────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ Middleware    │
                         │ • Logging     │
                         │ • Recovery    │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ PolicyHandler │
                         │.GetSummary()  │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │PolicyService  │
                         │.GetPolicyByN..│
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │  Repository   │
                         │.GetPolicyBy..│
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │   Database    │
                         │ SELECT * FROM │
                         │ policy WHERE..│
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │  Domain Model │
                         │  Policy{}     │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │  Response DTO │
                         │  + Envelope   │
                         └───────┬───────┘
                                 │
                                 ▼
┌────────┐     JSON       ┌─────────────┐
│ Client │◄───────────────┤  Response   │
└────────┘                └─────────────┘
```

### Sync Flow (POST /sync)

```
┌────────┐   HTTP POST    ┌──────────┐
│CI/CD   ├───────────────►│  Router  │
│Pipeline│  + API Key     └─────┬────┘
└────────┘                      │
                                ▼
                        ┌───────────────┐
                        │   Auth        │
                        │  Middleware   │
                        │ (API Key)     │
                        └───────┬───────┘
                                │
                                ▼
                        ┌───────────────┐
                        │ SyncHandler   │
                        │.Sync()        │
                        └───────┬───────┘
                                │
                                ▼
                        ┌───────────────┐
                        │ SyncService   │
                        │.SyncPolicy()  │
                        └───────┬───────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌────────────────┐      ┌────────────────┐
│Fetch Metadata │     │Fetch Definition│      │  Download      │
│   (HTTP GET)  │     │   (HTTP GET)   │      │   Assets       │
└───────┬───────┘     └────────┬───────┘      └────────┬───────┘
        │                      │                       │
        └──────────────────────┼───────────────────────┘
                               │
                               ▼
                       ┌───────────────┐
                       │  Validate     │
                       │  Data         │
                       └───────┬───────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐  ┌──────────┐
        │ Upsert   │   │  Create  │  │  Store   │
        │ Policy   │   │ Version  │  │  Docs    │
        └────┬─────┘   └────┬─────┘  └────┬─────┘
             │              │             │
             └──────────────┼─────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Database    │
                    │  Transaction  │
                    └───────┬───────┘
                            │
                            ▼
┌────────┐    JSON     ┌───────────┐
│CI/CD   │◄────────────┤ Success   │
│Pipeline│             │ Response  │
└────────┘             └───────────┘
```

## Component Responsibilities

### HTTP Layer (`internal/http/`)

**Router** (`router.go`)
- Route definitions
- Middleware attachment
- Handler registration

**Handlers** (`handlers/`)
- HTTP request/response handling
- Request validation (binding)
- DTO conversion
- Error propagation

**Middleware** (`middleware/`)
- `auth.go`: API key validation
- `errors.go`: Global error handling, response envelope
- `logging.go`: Request/response logging, trace ID generation
- `recovery.go`: Panic recovery

**DTOs** (`dto/`)
- API request/response structures
- JSON serialization tags
- Validation rules

### Service Layer (`internal/policy/`, `internal/sync/`)

**Policy Service** (`policy/service.go`)
- Business logic for policies
- Pagination logic
- Version immutability checks
- Domain model transformations

**Sync Service** (`sync/service.go`)
- HTTP client for fetching resources
- Metadata validation
- Asset downloading
- Documentation processing
- Image reference rewriting

### Repository Layer (`internal/policy/`)

**Repository Interface** (`repository.go`)
- Defines data access contract
- Independent of implementation

**SQLC Repository** (`repository_sqlc.go`)
- Implements repository interface
- Uses sqlc-generated code
- Type-safe SQL operations

### Database Layer (`internal/db/`)

**Database Connection** (`db.go`)
- Connection pool management
- Driver initialization

**Migrations** (`migrations/`)
- Schema versioning
- Up/down migration scripts

**Queries** (`queries/`)
- Raw SQL queries for sqlc
- Parameterized queries
- Type annotations

### Domain Models (`internal/policy/`)

**Models** (`models.go`)
- Core business entities
- Domain logic
- Custom types (StringArray, JSONB handling)

### Infrastructure (`internal/`)

**Config** (`config/`)
- Environment variable loading
- Configuration validation
- DSN construction

**Logging** (`logging/`)
- Structured logging (Zap)
- Log level management
- Global logger initialization

**Errors** (`errs/`)
- Typed error system
- Error codes
- HTTP status mapping
- Error details

## Design Patterns Used

### 1. Repository Pattern
- Abstracts data access
- Allows easy testing with mocks
- Database-agnostic interface

### 2. Service Layer Pattern
- Encapsulates business logic
- Orchestrates operations
- Domain model management

### 3. Middleware Pattern
- Cross-cutting concerns
- Request/response processing
- Error handling

### 4. DTO Pattern
- Separates API models from domain models
- Version API independently
- Hide implementation details

### 5. Dependency Injection
- Explicit dependencies
- Easy testing
- Loose coupling

## Error Handling Strategy

```
Error Occurs in Any Layer
         │
         ▼
    AppError Created
    (Typed Error)
         │
         ▼
    Propagated to Handler
    (via c.Error())
         │
         ▼
    Error Middleware
    Catches Error
         │
         ▼
    Convert to BaseResponse
    with ErrorDTO
         │
         ▼
    JSON Response with
    Appropriate HTTP Status
```

## Security Layers

1. **Input Validation**: Gin binding, custom validators
2. **SQL Injection**: Parameterized queries via sqlc
3. **Authentication**: API key middleware
4. **Error Sanitization**: Typed errors, no stack traces to client
5. **HTTPS**: Reverse proxy responsibility
6. **Rate Limiting**: (TODO: Add middleware)

## Scalability Considerations

### Horizontal Scaling
- Stateless application
- Can run multiple instances behind load balancer
- No in-memory session storage

### Database Scaling
- Connection pooling
- Read replicas (TODO)
- Query optimization via indexes

### Caching Strategy (Future)
- Redis for frequently accessed policies
- CDN for static assets
- HTTP caching headers

### Storage Scaling
- Object storage (S3) instead of filesystem
- CDN for asset delivery

## Monitoring Points

1. **HTTP Metrics**
   - Request count
   - Response time
   - Error rate

2. **Database Metrics**
   - Query performance
   - Connection pool usage
   - Slow query log

3. **Business Metrics**
   - Policies synced
   - API usage per endpoint
   - Sync failures

## Testing Strategy

### Unit Tests
- Service layer logic
- Repository mocks
- Error handling

### Integration Tests
- Database operations
- HTTP endpoints
- Full request/response cycle

### E2E Tests
- Sync flow
- Complete user journeys

## Deployment Architecture

```
                    ┌─────────────┐
                    │   Nginx     │
                    │(Reverse Proxy)
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼────┐    ┌─────▼────┐    ┌─────▼────┐
    │PolicyHub │    │PolicyHub │    │PolicyHub │
    │Instance 1│    │Instance 2│    │Instance 3│
    └─────┬────┘    └─────┬────┘    └─────┬────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │   Primary   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │   Replica   │
                    └─────────────┘
```

This architecture ensures high availability, fault tolerance, and horizontal scalability.
