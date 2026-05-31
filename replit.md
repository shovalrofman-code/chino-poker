# Workspace

## Overview

Monorepo using TypeScript and npm workspaces.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase Cloud (PostgreSQL)
- **Authentication**: Admin Mode (password protected)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **API Client**: React Query + Orval generated hooks
- **Validation**: Zod
- **Infrastructure**: Supabase (Cloud hosted)

## Apps

### CHINO POKER (`chino-poker-nextjs`)

A high-end professional poker session manager web app. Casino-style professional theme.

**Features:**
- Circular poker table layout showing active session players
- Admin password protection
- Player database with search by name/phone
- Buy-in tracking: default 1:2 ratio (NIS:Chips)
- Session timer (real-time clock from session start)
- Settlement engine: calculates "who pays whom" with phone numbers, minimal transfers
- Rake calculation: 10% on net profit only
- Group balance/treasury tracking across sessions
- Player dashboards with lifetime P/L, win rate %, total games
- Leaderboard page

**Admin password:** `Shoval25`

## Structure

```text
chino-poker/
├── chino-poker-nextjs/     # Main Next.js Application
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   └── integrations/       # External integrations
├── scripts/                # Utility scripts
├── package.json
└── tsconfig.json
```

## Database Schema (Supabase)

- `players` — Registered players (id, first_name, last_name, phone, is_guest, created_at)
- `sessions` — Game sessions (id, status, note, total_rake, started_at, closed_at)
- `session_players` — Players per session (id, session_id, player_id, total_buyins, final_chips)
- `buyins` — Individual buy-in records (id, session_id, player_id, amount, chips, created_at)
- `group_balance` — Rake per session (id, session_id, rake, created_at)

## Root Scripts

- `npm run build` — build all workspaces
- `npm run typecheck` — run type checking
