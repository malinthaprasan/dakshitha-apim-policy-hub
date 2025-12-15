# API Policy Hub

A comprehensive platform for managing and discovering API policies for the WSO2 API Platform. This project provides both a backend API service (built with Go) and a modern frontend application (built with React and TypeScript) for browsing, versioning, and synchronizing API policies.

[![Go](https://img.shields.io/badge/Go-1.24+-00ADD8.svg)](https://golang.org/)
[![React](https://img.shields.io/badge/React-19.2+-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## ✨ Features

### Backend (Go)
- **Policy Management**: Full CRUD operations for API policies
- **Version Control**: Immutable policy versioning with rich documentation
- **Synchronization**: CI/CD integration via sync endpoints
- **Search & Filtering**: Advanced policy discovery capabilities
- **Asset Management**: Support for icons, banners, and media files
- **RESTful API**: Well-documented endpoints with OpenAPI specification
- **Database**: PostgreSQL with SQLC-generated type-safe queries
- **Docker Support**: Containerized deployment with docker-compose

### Frontend (React/TypeScript)
- **Policy Discovery**: Intuitive search and filtering interface
- **Rich Documentation**: Markdown rendering with syntax highlighting
- **Version Management**: Easy browsing of policy versions
- **Theme Support**: Light/dark mode with persistent preferences
- **Fully Responsive**: Optimized for all device sizes
- **Modern UI**: Material-UI components with custom theming

## 🛠️ Tech Stack

### Backend
- **Go** 1.24+ - Backend language
- **Gin** - HTTP web framework
- **PostgreSQL** - Database
- **SQLC** - Type-safe SQL code generation
- **Docker** - Containerization
- **Make** - Build automation

### Frontend
- **React** 19.2+ - UI framework
- **TypeScript** 5.9+ - Type safety
- **Material-UI** 7.3+ - Component library
- **Vite** 7.2+ - Build tool and dev server
- **React Router** - Client-side routing
- **React Markdown** - Markdown rendering

### Monorepo Tools
- **Make** - Unified build automation (root Makefile for cross-project commands)

## 📋 Prerequisites

- **Go**: 1.24.0 or later
- **Node.js**: 18.x or later (tested with v22.14.0)
- **npm**: 9.x or later (tested with v10.9.2)
- **PostgreSQL**: 12 or later
- **Make**: For build automation
- **Git**: For version control
- **Docker**: Optional, for containerized setup

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd apim-policy-hub
```

### 2. Backend Setup

#### Using Docker (Recommended)
```bash
make backend-setup  # Setup PostgreSQL, install deps, generate SQLC
make backend-run    # Start the backend server
```

#### Manual Setup
```bash
cd backend
# Install dependencies
go mod download

# Set up PostgreSQL database
createdb policyhub

# Configure environment (copy and edit .env)
cp .env.example .env

# Generate SQLC code
make sqlc-generate

# Start server
make run
```

Backend will be available at `http://localhost:8080`

### 3. Frontend Setup
```bash
make frontend-setup  # Install dependencies
make frontend-dev    # Start development server
```

Frontend will be available at `http://localhost:3000`

### 4. Access the Application
Open `http://localhost:3000` in your browser to access the full application.

## 🚀 Quick Setup with Sample Data

Choose the setup that fits your needs:

### Full Setup with Sample Data (Recommended for first-time users)
```bash
make full-setup  # Complete setup: Docker, deps, SQLC, sample data, frontend install
make start       # Start both backend and frontend servers
```
*Use this for a fully functional environment with demo data.*

### Basic Setup (Without sample data)
```bash
make setup       # Setup backend and frontend without sample data
make start       # Start both servers
```
*Use this if you want to start with an empty database.*

### Clean Database
```bash
make docker-clean  # Stop containers and remove volumes (reset DB to clean state)
```
*Use this to reset the database and start fresh.*
If you prefer manual control:

### 1. Backend with Sample Data
```bash
make backend-setup          # Setup PostgreSQL, deps, SQLC
make backend-populate-data  # Populate database with sample policies
make backend-run            # Start the backend server
```

### 2. Frontend
```bash
make frontend-setup  # Install dependencies
make frontend-dev    # Start development server
```

### 3. Access with Sample Data
- Backend API: `http://localhost:8080`
- Frontend App: `http://localhost:3000`
- Sample data includes 5 policies with 6 versions and documentation

This setup provides a fully functional environment with demo data for testing and development.

## 📁 Project Structure

```
apim-policy-hub/
├── backend/                 # Go backend service
│   ├── api/                # OpenAPI specifications
│   ├── cmd/                # Application entry points
│   ├── internal/           # Private application code
│   │   ├── config/        # Configuration management
│   │   ├── db/            # Database layer
│   │   ├── http/          # HTTP handlers and middleware
│   │   ├── logging/       # Logging utilities
│   │   ├── policy/        # Policy business logic
│   │   ├── sync/          # Synchronization services
│   │   └── validation/    # Input validation
│   ├── scripts/           # Database scripts
│   ├── docs/              # Backend documentation
│   ├── docker-compose.yml # Docker services
│   ├── Dockerfile         # Container definition
│   ├── Makefile           # Build automation
│   └── go.mod             # Go dependencies
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities and constants
│   │   ├── pages/         # Route components
│   │   └── content/       # Static content
│   ├── package.json       # Node dependencies
│   ├── vite.config.ts     # Vite configuration
│   └── tsconfig.json      # TypeScript configuration
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 📚 Documentation

### Backend Documentation
Located in `backend/docs/`:
- **[Architecture](./backend/docs/ARCHITECTURE.md)** - System design and data flow
- **[Features](./backend/docs/FEATURES.md)** - Complete feature overview
- **[API Reference](./backend/docs/API_REFERENCE.md)** - All endpoints with examples
- **[Setup Guide](./backend/docs/SETUP.md)** - Detailed installation instructions

### API Specification
- **[OpenAPI Spec](./backend/api/openapi.yaml)** - Complete API contract

## 🛠️ Development

### Backend Development
```bash
make backend-test     # Run tests
make backend-build    # Build binary
make backend-lint     # Lint code
make backend-dev      # Run in development mode
make backend-sqlc     # Generate SQLC code
```

### Frontend Development
```bash
make frontend-build   # Production build
make frontend-preview # Preview production build
make frontend-lint    # Run ESLint
```

### Database Management
```bash
make backend-docker-up      # Start PostgreSQL container
make backend-docker-down    # Stop PostgreSQL container
make backend-docker-clean   # Stop containers and remove volumes (clean DB)
make backend-populate-data  # Populate with sample data
```

## 🔧 Configuration

### Backend Environment Variables
Create `backend/.env`:
```bash
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=policyhub
DB_USER=your_username
DB_PASSWORD=your_password
LOG_LEVEL=info
```

### Frontend Environment Variables
Create `frontend/.env.local`:
```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Support

For support and questions:
- Check the [documentation](./backend/docs/)
- Open an issue on GitHub
- Review the [API Reference](./backend/docs/API_REFERENCE.md)

---

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

Built with ❤️ for the WSO2 API Platform community.
