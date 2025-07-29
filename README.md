# Modern TypeScript Monorepo Template

A production-ready monorepo template with best practices, featuring Express.js backend with Drizzle ORM and React frontend with Tailwind CSS 4 and shadcn/ui.

## ✨ Features

### 🏗️ Monorepo Architecture
- **Turborepo** for build system optimization with caching
- **pnpm workspaces** for efficient dependency management
- Shared ESLint and TypeScript configurations

### 🎯 Backend (Express + Drizzle)
- **Express.js** with TypeScript
- **Drizzle ORM** with SQLite (better-sqlite3)
- **Zod** for validation
- **Vitest** for testing with database setup
- Security middleware (helmet, cors, compression)
- Structured error handling

### 🎨 Frontend (React + Tailwind 4)
- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS 4** (alpha) with new features
- **shadcn/ui** components
- **React Router** for navigation
- **Vitest** for testing with React Testing Library

### 🔧 Development Tools
- **ESLint** with TypeScript support (flat config)
- **Prettier** for code formatting
- **TypeScript** strict configuration
- **Turborepo** for orchestrated builds
- Modern development workflows

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (installed automatically)

### Setup
```bash
# Clone the template
git clone <your-repo-url>
cd uber-template

# Install dependencies
pnpm install

# Generate database schema
pnpm db:generate

# Migrate database
pnpm db:migrate

# Start development servers
pnpm dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

## 📦 Package Structure

```
├── apps/
│   ├── api/              # Express.js backend
│   │   ├── src/
│   │   │   ├── db/       # Database schema and connection
│   │   │   ├── routes/   # API routes
│   │   │   └── middleware/ # Express middleware
│   │   ├── tests/        # Backend tests
│   │   └── drizzle/      # Database migrations
│   └── web/              # React frontend
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── pages/    # Page components
│       │   └── lib/      # Utility functions
│       └── tests/        # Frontend tests
└── packages/
    ├── eslint-config/    # Shared ESLint configurations
    └── typescript-config/ # Shared TypeScript configurations
```

## 🛠️ Available Scripts

### Root Commands
```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm lint:fix         # Fix linting issues
pnpm check-types      # Type check all packages

# Database (API only)
pnpm db:generate      # Generate migrations from schema
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio

# Utilities
pnpm clean            # Clean all build artifacts
```

### Package-specific Commands
```bash
# Backend API
cd apps/api
pnpm dev              # Start API server
pnpm build            # Build API
pnpm test             # Run API tests
pnpm test:coverage    # Run tests with coverage

# Frontend
cd apps/web
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm test             # Run frontend tests
pnpm test:ui          # Run tests with UI
```

## 🗄️ Database

The template uses **Drizzle ORM** with **SQLite** for simplicity. The schema is defined in `apps/api/src/db/schema.ts`.

### Example Usage
```typescript
// Create a user
const newUser = await db.insert(users).values({
  email: "user@example.com",
  name: "John Doe"
}).returning();

// Query users
const allUsers = await db.select().from(users);
```

### Migrations
```bash
# After changing schema
pnpm db:generate      # Generate migration
pnpm db:migrate       # Apply migration
```

## 🎨 Styling

The frontend uses **Tailwind CSS 4** (alpha) with the new features:
- `@theme` directive for design tokens
- OKLCH color space for better color handling
- Enhanced configuration

### shadcn/ui Components
Pre-configured components are available in `apps/web/src/components/ui/`:
- Button
- Card
- Form components (coming soon)

## 🧪 Testing

### Backend Tests
- **Vitest** with database setup
- Automatic database migrations for tests
- API endpoint testing with supertest

### Frontend Tests
- **Vitest** with React Testing Library
- Component testing
- Mocked API calls

## 📝 ESLint Configuration

The template includes three ESLint configurations:

1. **Base** (`@repo/eslint-config/base`) - Core TypeScript rules
2. **Node** (`@repo/eslint-config/node`) - Backend-specific rules
3. **React** (`@repo/eslint-config/react-internal`) - Frontend-specific rules

All configurations use:
- TypeScript ESLint with strict rules
- Modern flat config format
- Turborepo integration
- Prettier compatibility

## 🔧 Customization

### Adding New Packages
1. Create package in `apps/` or `packages/`
2. Add appropriate `package.json`
3. Update workspace configuration if needed

### Database Changes
1. Modify `apps/api/src/db/schema.ts`
2. Run `pnpm db:generate`
3. Run `pnpm db:migrate`

### Frontend Components
1. Add components to `apps/web/src/components/`
2. Use shadcn/ui patterns
3. Follow TypeScript strict mode

## 🚀 Deployment

### Backend
The API builds to a single JavaScript file and can be deployed to:
- Node.js hosting (Railway, Render, etc.)
- Serverless functions (Vercel, Netlify)
- Docker containers

### Frontend
The React app builds to static files and can be deployed to:
- Vercel
- Netlify
- Static hosting services

## 📄 License

MIT License - feel free to use this template for your projects!

## 🤝 Contributing

This is a template repository. Feel free to fork and customize for your needs!
