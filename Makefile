.PHONY: help setup full-setup start backend-setup frontend-setup backend-run frontend-dev backend-test frontend-build backend-docker-up backend-docker-down backend-docker-clean docker-clean backend-populate-data clean backend-deps backend-sqlc backend-build backend-lint backend-dev frontend-install frontend-lint frontend-preview

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-25s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: backend-setup frontend-setup ## Setup both backend and frontend

full-setup: backend-setup backend-populate-data frontend-setup ## Full setup with sample data

start: ## Start both backend and frontend servers
	@echo "Starting backend and frontend..."
	make backend-run & make frontend-dev

backend-setup: ## Setup backend (Docker, deps, SQLC)
	cd backend && make docker-up && make deps && make sqlc-generate

frontend-setup: ## Setup frontend (install dependencies)
	cd frontend && npm install

backend-run: ## Run backend server
	cd backend && make run

frontend-dev: ## Run frontend in development mode
	cd frontend && npm run dev

backend-test: ## Run backend tests
	cd backend && make test

frontend-build: ## Build frontend for production
	cd frontend && npm run build

backend-docker-up: ## Start backend Docker containers
	cd backend && make docker-up

backend-docker-down: ## Stop backend Docker containers
	cd backend && make docker-down

backend-docker-clean: ## Clean backend Docker containers and volumes
	cd backend && make docker-clean

docker-clean: backend-docker-clean ## Alias for backend-docker-clean

backend-populate-data: ## Populate backend with sample data
	cd backend && make populate-sample-data

clean: ## Clean all build artifacts
	cd backend && make clean
	cd frontend && rm -rf node_modules dist

# Backend-specific targets (delegate to backend/Makefile)
backend-deps: ## Install backend dependencies
	cd backend && make deps

backend-sqlc: ## Generate backend SQLC code
	cd backend && make sqlc-generate

backend-build: ## Build backend binary
	cd backend && make build

backend-lint: ## Lint backend code
	cd backend && make lint

backend-dev: ## Run backend in development mode
	cd backend && make dev

# Frontend-specific targets
frontend-install: ## Install frontend dependencies
	cd frontend && npm install

frontend-lint: ## Lint frontend code
	cd frontend && npm run lint

frontend-preview: ## Preview frontend production build
	cd frontend && npm run preview
