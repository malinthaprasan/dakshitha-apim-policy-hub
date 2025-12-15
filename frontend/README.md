# WSO2 Policy Hub Frontend

A modern React 19 application for browsing and managing WSO2 API Platform policies.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![Material-UI](https://img.shields.io/badge/MUI-7.3-007FFF.svg)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF.svg)](https://vitejs.dev/)

## ✨ Features

- 🔍 **Policy Discovery** - Search and filter API management policies
- 📚 **Rich Documentation** - Markdown rendering with syntax highlighting
- 🔄 **Version Management** - Browse different policy versions
- 🎨 **Theme Support** - Light/dark mode with persistent preferences
- 📱 **Fully Responsive** - Optimized for all screen sizes

## 🛠️ Tech Stack

- **React** 19.2.1 - UI framework
- **React DOM** 19.2.1 - DOM rendering
- **TypeScript** 5.9.3 - Type safety
- **Material-UI** 7.3.6 - Component library
- **Vite** 7.2.6 - Build tool
- **React Router** 7.10.1 - Routing
- **React Markdown** 10.1.0 - Markdown rendering
- **Emotion** 11.14.0 - CSS-in-JS

## 📋 Prerequisites

- **Node.js**: v18.x or higher (tested with v22.14.0)
- **npm**: v9.x or higher (tested with v10.9.2)

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd policy-hub-frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local and set your backend API URL (default: http://localhost:8080)

# 4. Start development server
npm run dev
```

Application runs at `http://localhost:3000`

### Change Port
Edit `vite.config.ts` to use a different port:
```typescript
server: {
  port: 4000,  // Change to your desired port
}
```

## 📁 Project Structure

```
src/
├── components/          # UI Components
│   ├── common/         # Reusable components (Badge, EmptyState, etc.)
│   ├── layout/         # Layout components (Header, Footer)
│   ├── nav/            # Navigation (Breadcrumb, Tabs)
│   └── policies/       # Policy-specific components
├── contexts/           # React Context providers
│   ├── AppDataContext.tsx
│   ├── ErrorNotificationContext.tsx
│   └── ThemeContext.tsx
├── hooks/              # Custom hooks
│   ├── data/          # Data fetching (useAsyncData, usePolicyVersions)
│   ├── domain/        # Business logic (useErrorHandler)
│   ├── state/         # State management (useLocalStorage, useQueryParams)
│   └── ui/            # UI utilities (useDebouncedValue, useResponsive)
├── lib/               # Core utilities
│   ├── constants/     # App constants
│   ├── apiClient.ts   # API client
│   ├── theme.ts       # MUI theme
│   ├── types.ts       # TypeScript types
│   └── utils.ts       # Utility functions
├── pages/             # Route components
│   ├── HomePage.tsx
│   ├── PoliciesPage.tsx
│   ├── PolicyDetailPage.tsx
│   └── PolicyVersionPage.tsx
├── App.tsx            # Main component
└── main.tsx           # Entry point
```

## 🎯 Code Conventions

### Import Rules
```typescript
// ✅ Always use @/ alias
import { useAsyncData } from '@/hooks/data/useAsyncData';
import { ROUTES } from '@/lib/constants';

// ❌ Never use relative imports
import { useAsyncData } from '../../hooks/data/useAsyncData';
```

### File Naming
- **Components**: `PascalCase.tsx` (e.g., `PolicyCard.tsx`)
- **Hooks**: `useCamelCase.ts` (e.g., `useAsyncData.ts`)
- **Utils**: `camelCase.ts` (e.g., `apiClient.ts`)

---

Built with ❤️ by the WSO2 Community
