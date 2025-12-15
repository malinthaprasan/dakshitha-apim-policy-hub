# Setup Guide

## Prerequisites

- Go 1.24.0 or later
- PostgreSQL 12 or later
- Make (for using Makefile)
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd policy-hub
```

2. Install dependencies:
```bash
go mod download
```

3. Set up PostgreSQL database:
```bash
createdb policyhub
```

## Configuration

The application uses environment variables for configuration. Create a `.env` file or set environment variables:

```bash
# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
GIN_MODE=release

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=policyhub
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL_MODE=disable
DB_MAX_CONNS=25
DB_MIN_CONNS=5

# Logging
LOG_LEVEL=info
```

## Building

Use the Makefile for building:

```bash
# Build the application
make build

# Build with verbose output
make build-verbose

# Clean build artifacts
make clean
```

## Running

### Development Mode

```bash
# Run with hot reload (requires air)
make dev

# Or run directly
go run cmd/policyhub/main.go
```

### Production Mode

```bash
# Build and run
make build
./bin/policyhub
```

## Database Setup

1. Create database schema:
```bash
make db-setup
```

This will:
- Connect to PostgreSQL
- Create all tables and indexes
- Set up initial data

2. Populate sample data:
```bash
make populate-data
```

This loads sample policies from `scripts/populate-data.sql`.

## Testing

```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage

# Run specific tests
go test ./internal/... -v
```

## Docker Setup

Build and run with Docker:

```bash
# Build Docker image
make docker-build

# Run with Docker Compose
docker-compose up -d
```

## Makefile Targets

| Target | Description |
|--------|-------------|
| `build` | Build the application binary |
| `build-verbose` | Build with verbose output |
| `clean` | Remove build artifacts |
| `dev` | Run in development mode with hot reload |
| `test` | Run all tests |
| `test-coverage` | Run tests with coverage report |
| `db-setup` | Set up database schema |
| `populate-data` | Load sample data |
| `docker-build` | Build Docker image |
| `docker-run` | Run with Docker |
| `lint` | Run linters |
| `fmt` | Format code |
| `deps` | Download dependencies |

## Sample Data

The sample data includes:

- Rate Limiting Policy (v1.0.0)
- Authentication Policy (v1.0.0)
- CORS Policy (v1.0.0)

Each policy includes:
- Metadata (name, description, categories, tags)
- Documentation (overview, configuration, examples)
- Assets (logos, banners)

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check connection string in environment variables
- Verify database exists: `createdb policyhub`

### Build Issues

- Ensure Go 1.24.0+ is installed: `go version`
- Clean module cache: `go clean -modcache`
- Re-download dependencies: `go mod download`

### Port Conflicts

- Change SERVER_PORT in environment variables
- Check if port is in use: `lsof -i :8080`

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| SERVER_HOST | 0.0.0.0 | Server bind address |
| SERVER_PORT | 8080 | Server port |
| GIN_MODE | release | Gin mode (debug/release) |
| DB_HOST | localhost | Database host |
| DB_PORT | 5432 | Database port |
| DB_NAME | policyhub | Database name |
| DB_USER | - | Database user |
| DB_PASSWORD | - | Database password |
| DB_SSL_MODE | disable | SSL mode |
| DB_MAX_CONNS | 25 | Max database connections |
| DB_MIN_CONNS | 5 | Min database connections |
| LOG_LEVEL | info | Log level (debug/info/warn/error) |
