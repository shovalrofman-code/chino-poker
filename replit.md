# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + framer-motion

## Apps

### THE POKER LOUNGE (`artifacts/poker-lounge`)

A high-end professional poker session manager web app. Casino-style dark theme (red/black/white/gold).

**Features:**
- Circular poker table layout showing active session players
- Admin password protection (`Shoval25`)
- Player database with autocomplete (search by name/phone)
- Buy-in tracking: default 50 NIS = 100 chips (1:2 ratio). Quick +50/+100/+200 NIS buttons
- Session timer (real-time clock from session start)
- Settlement engine: calculates "who pays whom" with phone numbers, minimal transfers
- Rake calculation: 10% on net profit only
- Group balance/treasury tracking across sessions
- Player dashboards with lifetime P/L, win rate %, total games
- Guest mode for one-time players
- Leaderboard page

**Pages:**
- `/` — Main poker table view
- `/players` — Player database
- `/player/:id` — Individual player profile & stats
- `/settlement/:sessionId` — Settlement results after closing a session
- `/history` — Session history
- `/leaderboard` — All-time rankings + group treasury

**Admin password:** `Shoval25` (stored in sessionStorage)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── poker-lounge/       # THE POKER LOUNGE React+Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- `players` — Registered players (id, firstName, lastName, phone, isGuest, createdAt)
- `sessions` — Game sessions (id, status, note, totalRake, startedAt, closedAt)
- `session_players` — Players per session (id, sessionId, playerId, totalBuyins, finalChips)
- `buyins` — Individual buy-in records (id, sessionId, playerId, amount, chips, createdAt)
- `group_balance` — Rake per session (id, sessionId, rake, createdAt)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes
