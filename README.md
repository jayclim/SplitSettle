
## 🚀 Divvy

Divvy is a modern expense-splitting and group-settlement web application built with Next.js. It helps groups track shared expenses, calculate balances, and settle up fairly and transparently.

> Status: **IN PROGRESS** — actively developed. This repo is a demo for evaluation and not yet production-ready.


---

## 🔎 Project snapshot

Divvy provides:

- Group management (create/join groups)
- Expense creation with multiple participants and split logic
- Balances & settlement flows
- Group messaging and notifications
- AI-assisted expense parsing (planned)

Primary code locations: `app/`, `api/`, `components/`, `lib/`, and `db/`.

---

## ✨ Key features (work-in-progress)

- Group creation & membership
- Flexible expense entry with participant splits
- Persistent storage via Supabase
- Reusable UI primitives in `components/ui/`
- Initial test coverage (Jest)

---

## 🏗️ Tech stack & architecture

- Next.js (App Router)
- TypeScript
- Supabase (auth + Postgres)
- Drizzle ORM
- TailwindCSS
- Jest + React Testing Library

Layout overview:

- `app/` — pages & server actions
- `app/api/` & `api/` — server routes and client API helpers
- `components/` — UI and containers
- `lib/` — utilities and domain actions
- `db/` — schema & migrations

---

## ⚡ Quick start (local dev)

Prerequisites: Node.js 16+, and a Supabase project or Postgres DB for full functionality.

1) Install dependencies

```bash
npm install
# or
pnpm install
```

2) Create local env file

```bash
cp .env.example .env.local
# Edit `.env.local` with your Supabase and (optional) AI provider keys
```

3) Run dev server

```bash
npm run dev
# or
pnpm dev
```

Open http://localhost:3000

Notes:

- Seed scripts live in `scripts/` (use `scripts/seed-test-data.ts` and `scripts/clean-test-data.ts`).
- Some flows require Supabase service role keys (server-only). Keep those out of the client.

---

## 🔐 Environment variables

Add required variables to `.env.local` (DO NOT commit secrets):

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- NEXT_PUBLIC_SUPABASE_URL (optional)
- OPENAI_API_KEY (optional, for AI processing)
- DATABASE_URL (optional)

Tip: keep a minimal, non-secret `.env.example` in the repo that documents variable names.

---

## 🧪 Tests & developer scripts

- Run tests:

```bash
npm test
```

- Seed / clear test data:

```bash
node ./scripts/seed-test-data.ts
node ./scripts/clean-test-data.ts
```

There are initial tests in `__tests__/` (e.g., `auth.test.tsx`). Expand coverage before production.

---

## 📋 Roadmap & TODOs

Work-in-progress / upcoming priorities:

- [ ] Finish integrating APIs (auth, groups, expenses, balances, messages)
- [ ] Implement AI processing (receipt parsing, categorization)
- [ ] Implement WebSockets for live chat / real-time updates
- [ ] Add comprehensive tests (unit + integration)
- [ ] Improve error handling & logging (Sentry or similar)
- [ ] CI/CD (GitHub Actions) and deployment configuration
- [ ] Security review & env management (add `.env.example`)
- [ ] Polish UX and accessibility (a11y, responsive)


