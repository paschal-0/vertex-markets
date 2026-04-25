# Vertex Markets Platform

Dual-system fintech architecture scaffold:
- `apps/main-api`: business logic API (auth, wallets, P2P escrow, affiliates, tournaments, admin).
- `apps/chart-api`: market data engine (tick ingestion, 13 interval aggregation, Redis pub/sub, SQLite candle store, WS fanout).
- `apps/web`: Next.js 15 monolith client with trader/admin route groups.
- `packages/*`: shared contracts and utilities (`types`, `auth`, `config`, `observability`, `clients`).

## Quick Start

1. Install dependencies:
```bash
pnpm install
```

2. Start local data services:
```bash
docker compose up -d
```

3. Configure environment:
```bash
cp .env.example .env
```

4. Generate Prisma client (required before using DB flows):
```bash
pnpm --filter @vertex/main-api prisma:generate
```

5. Run services:
```bash
pnpm dev
```

Service ports:
- Web: `http://127.0.0.1:3000`
- Main API: `http://127.0.0.1:4000`
- Chart API: `http://127.0.0.1:4100`
- Market WS: `ws://127.0.0.1:4100/ws/market`

## Production Process Manager

PM2 ecosystem config is provided at:
- `infra/pm2/ecosystem.config.cjs`

Nginx edge proxy template is provided at:
- `infra/nginx/edge.conf`

## Current Wave Coverage

Implemented in this commit:
- Monorepo/workspace structure and service skeletons.
- REST namespaces under `/api/v1/*`.
- Tenant context middleware + JWT/RBAC scaffolding.
- Chart ingestion pipeline with 30 forex + OTC mirrors and 13 intervals.
- Redis publish + SQLite candle persistence.
- Next.js trader/admin foundational UI.
- Unit tests for candle aggregation and escrow state transitions.
