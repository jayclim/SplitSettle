# Gemini CLI Context for SplitSettle

## Quick Summary
- **Project**: SplitSettle (Expense Splitting App)
- **Stack**: Next.js 15, TypeScript, Tailwind, Drizzle ORM, Postgres.
- **Docs**: See `AGENTS.md` for detailed architecture.

## Common Tasks

### 1. Running the App
- **Command**: `npm run dev`
- **Port**: Usually 3000.

### 2. Testing
- **Command**: `npm test`
- **Note**: Uses a separate test database (`.env.test.local`).
- **Workflow**:
  - Run `npm run test:setup` to reset/seed test DB if needed.
  - Run `npm test` to run all tests.

### 3. Database Management
- **Schema**: `lib/db/schema.ts`
- **Generate Migration**: `npm run db:generate` (after changing schema)
- **Run Migration**: `npm run db:migrate`
- **Studio**: `npm run db:studio` (view data)

## Code Guidelines
- **Logic**: Put business logic in `api/*.ts` files.
- **UI**: Use Tailwind for styling.
- **New Features**:
  1. Define data model in `lib/db/schema.ts`.
  2. Create/Update service in `api/`.
  3. Create Server Action in `lib/actions/` or API route in `app/api/`.
  4. Build UI in `components/` or `app/`.

## Important Files
- `package.json`: Scripts and dependencies.
- `drizzle.config.ts`: DB config.
- `AGENTS.md`: Full architectural guide.
