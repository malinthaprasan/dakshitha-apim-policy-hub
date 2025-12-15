.PHONY: help build run test clean sqlc-generate docker-up docker-down populate-sample-data

# Load environment variables
include .env
export

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the application
	go build -o bin/policyhub cmd/policyhub/main.go

run: ## Run the application
	go run cmd/policyhub/main.go

test: ## Run tests
	go test -v ./...

clean: ## Clean build artifacts
	rm -rf bin/
	rm -rf storage/

sqlc-generate: ## Generate sqlc code
	sqlc generate

docker-up: ## Start docker containers with database setup
	@echo "Starting Policy Hub with database setup..."
	docker-compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker-compose exec postgres pg_isready -U policyhub > /dev/null 2>&1; do sleep 2; done
	@echo "Setting up database schema..."
	@docker-compose exec postgres psql -U policyhub -d policyhub -f /tmp/schema.sql
	@echo "Policy Hub database ready!"
	@echo "Run 'make run' to start the server"

docker-down: ## Stop docker containers
	docker-compose down

docker-clean: ## Stop containers and remove volumes
	docker-compose down -v
	@echo "Database volumes removed"

deps: ## Install dependencies
	go mod download
	go mod tidy

lint: ## Run linter
	golangci-lint run

dev: ## Run in development mode with hot reload
	air

populate-sample-data: ## Populate database with sample data
	@echo "Populating database with sample data..."
	@docker-compose exec postgres psql -U policyhub -d policyhub -f /tmp/populate-data.sql
	@echo "Sample data populated!"
	@echo "Summary: 5 policies, 6 versions, documentation included"
