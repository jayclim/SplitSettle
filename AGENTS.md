# Project "SplitSettle" Documentation for AI Agents

## Project Overview
This is a Next.js 15 application for expense splitting (similar to Splitwise). It uses the App Router, TypeScript, Tailwind CSS, and Drizzle ORM with Postgres.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Radix UI (via Shadcn/ui patterns), Lucide React.
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth / NextAuth (check implementation details in `lib/supabase` or `api/auth.ts`).
- **Testing**: Jest, React Testing Library.

## Architecture & Directory Structure

### Core Directories
- **`app/`**: Next.js App Router pages and layouts.
  - `(main)/`: Main authenticated application routes.
  - `api/`: Next.js API Routes (HTTP endpoints).
  - `auth/`: Authentication pages.
- **`api/`**: **Service Layer**. Contains the core business logic and domain services.
  - `auth.ts`, `balances.ts`, `expenses.ts`, `groups.ts`, `messages.ts`.
  - **Rule**: Business logic should reside here, not in UI components or API route handlers directly.
- **`lib/`**: Shared utilities and configurations.
  - `db/`: Database configuration and Drizzle schema (`schema.ts`).
  - `actions/`: Server Actions for form submissions and mutations.
  - `supabase/`: Supabase client configuration.
- **`components/`**: Reusable React components.
- **`scripts/`**: Utility scripts for testing (seeding, cleaning data).

### Data Flow
1. **UI Components** trigger **Server Actions** (`lib/actions`) or call **API Routes** (`app/api`).
2. **Server Actions/API Routes** call into the **Service Layer** (`api/`).
3. **Service Layer** interacts with the **Database** via Drizzle ORM (`lib/db`).

## Database & Testing
- **ORM**: Drizzle is used for all DB interactions.
- **Migrations**: Managed via `drizzle-kit`.
- **Testing**:
  - Uses a dedicated test database (configured in `.env.test.local`).
  - `npm test` runs Jest.
  - Scripts in `scripts/` handle test data seeding and cleanup (`test:seed`, `test:clean`).

## Key Commands
- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm test`: Run tests.
- `npm run db:migrate`: Run database migrations.
- `npm run db:generate`: Generate migration files from schema changes.
- `npm run db:studio`: Open Drizzle Studio to view data.

## Development Guidelines
- **Styling**: Use Tailwind utility classes.
- **Components**: Prefer small, reusable components.
- **State**: Use Server Components where possible; Client Components for interactivity.
- **Type Safety**: strict TypeScript usage. Define interfaces for data models.
