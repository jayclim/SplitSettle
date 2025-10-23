SplitSettle

SplitSettle is a modern expense-splitting and group-settlement web application built with Next.js. It aims to make splitting group expenses, tracking balances, and settling up easy and transparent. The project is actively under development and not yet finished — this README documents the current state, how to run it locally, and the near-term roadmap.

Table of contents

- Project snapshot
- Key features
- Tech stack & architecture
- Getting started (local development)
- Environment variables
- Tests & scripts
- Status & roadmap
- Contributing
- Contact

Project snapshot

SplitSettle provides:

- Group management (create/join groups)
- Expense creation with multiple participants and split logic
- Balances & settlement flows
- Messaging around groups and expenses
- AI-assisted expense parsing (planned)

This codebase includes server API routes, React components, and a small test suite. See the `app/`, `api/`, `components/`, and `__tests__/` folders for primary code.

Key features (work-in-progress)

- Group creation and membership
- Expense entry and split calculation
- Persistent data with Supabase (project contains a `supabase/` helper)
- Modular UI components (in `components/ui/`)
- Automated tests with Jest (basic tests present)

Tech stack & architecture

- Next.js (App Router)
- TypeScript
- Supabase for database/auth (server-side helpers in `lib/supabase/`)
- Drizzle ORM (see `drizzle.config.ts` and `db/schema.ts`)
- TailwindCSS for styling
- Jest + React Testing Library for tests

High-level layout:

- `app/` — Next.js pages and server actions
- `app/api/` and top-level `api/` — server routes and API helpers
- `components/` — shared UI components
- `lib/` — utilities, actions, test utils
- `db/` — database schema and migrations
- `scripts/` — developer scripts (seed/clean test data)

Getting started (local development)

Prerequisites: Node.js (16+ recommended), and a Supabase project or local Postgres instance depending on your environment.

1. Install dependencies

```bash
# using npm
npm install

# or using pnpm
pnpm install
```

2. Copy environment variable template and fill values

```bash
cp .env.example .env.local
# then edit .env.local to add your Supabase URL / keys and any AI provider keys
```

3. Run the development server

```bash
npm run dev
# or
pnpm dev
```

Open http://localhost:3000 in your browser.

Notes:

- The project ships Supabase client/server helpers in `lib/supabase/` and `supabase/`.
- There are seed scripts in the `scripts/` directory to populate test data. These are TypeScript files; run them using ts-node or compile them first.

Environment variables

This project reads secrets from environment variables for Supabase and any AI provider you integrate. Typical variables (add to `.env.local`):

- SUPABASE_URL — your Supabase project URL
- SUPABASE_ANON_KEY — Supabase anon/public key (for client)
- SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (server-only)
- NEXT_PUBLIC_SUPABASE_URL — optional public variant
- OPENAI_API_KEY — if using OpenAI for AI processing
- DATABASE_URL — if using a direct Postgres connection

Important: Do NOT commit real secrets. Add `.env.local` to `.gitignore`.

Tests & developer scripts

- Run unit and integration tests (Jest):

```bash
npm test
```

- Seed or clear test data (developer scripts):

```bash
# compile and run or run with ts-node
node ./scripts/seed-test-data.ts
node ./scripts/clean-test-data.ts
```

There is a basic test in `__tests__/auth.test.tsx` to demonstrate the testing setup.

Status & roadmap

Status: IN PROGRESS — this project is a work in progress and is actively developed. It is being prepared for production but several important features and polish remain.

Current high-level TODOs (prioritized):

- Finish integrating APIs: complete wiring of server routes and client calls for auth, groups, expenses, balances, and messages; add typing and error handling.
- Implement AI processing: integrate an AI provider to parse receipts and suggest categorizations and splits.
- Implement WebSockets for live chat: add real-time messaging or server-sent events for conversation and notifications.
- Add comprehensive tests: expand Jest coverage for core flows (auth, group management, expense lifecycle).
- Improve error handling & logging: standardize error responses and add monitoring (Sentry or similar).
- CI/CD and deployment: add GitHub Actions that run lint/tests and deploy to Vercel (or preferred host).
- Security review & env management: audit secret usage, add `.env.example`, and document runtime requirements.
- Polish UX & accessibility: finalize responsive layouts, keyboard navigation, and ARIA attributes.

If this project is being viewed as part of a job application, I can provide a short walkthrough video or live demo upon request. Please note that some API keys and production configuration are intentionally omitted from the repository.

Contributing

This repo is primarily maintained by the author for demo/job-application purposes. If you want to contribute:

- Open an issue describing the change or feature
- Create a branch and a focused PR
- Include tests for new functionality when possible

Contact

If you'd like to discuss the project, see the author metadata or contact via the GitHub account associated with this repository.

A short checklist for reviewers

- Run `npm install` then `npm run dev` and open http://localhost:3000
- Provide Supabase credentials in `.env.local` to test persistence flows
- Run tests with `npm test`

---

This project is MIT-style demo code for evaluation; see repository for file-level comments and inline documentation.
