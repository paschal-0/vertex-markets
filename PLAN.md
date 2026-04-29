# Vunex Markets V1 Delivery Plan (Execution-Ready)

## 1) Product Direction and Client Alignment

This project is a **Forex/OTC trading platform**, not just a generic dashboard.  
The delivery must match the client's mockups and stated backend architecture.

### Screen-to-system mapping from client mockups

1. Landing/marketing page
- Purpose: acquisition, onboarding, trust messaging.
- System dependencies: auth endpoints, feature flags, CMS/static content.

2. Trader terminal
- Purpose: live candlestick chart, pair selector, invest amount, buy/sell actions, open trades, trade history, portfolio panel.
- System dependencies: chart API WS, trade execution API, wallet API, leaderboard API.

3. Deposit/wallet flows
- Purpose: fund account, show balance changes, pending settlements.
- System dependencies: wallet ledger, payment provider callbacks, reconciliation jobs.

4. Admin dashboard
- Purpose: users, fund requests, server health, risk controls, dispute handling.
- System dependencies: RBAC, audit logs, admin APIs, observability metrics.

### Architecture alignment
- Dual-system approach remains correct:
1. `apps/chart-api`: low-latency market data (Redis/SQLite/WebSocket).
2. `apps/main-api`: business-critical state (PostgreSQL/Prisma).
3. `apps/web`: trader/admin UI in Next.js 15.

## 2) Delivery Scope and Constraints

### In-scope for V1
- 30+ Forex pairs and OTC mirrors.
- 13 intervals (`5s` through `4h`) with live chart updates.
- Auth + role-based access + tenant context.
- Wallet ledger core + deposit/withdraw workflow.
- P2P offers + escrow lifecycle + dispute path.
- Admin command center with risk/manipulation controls.
- Affiliate tracking + tournament leaderboard baseline.
- AI support integration gateway.

### Out-of-scope for V1
- Native mobile apps.
- Direct on-chain key custody in platform core.
- Formal SOC2/ISO certification program.

### Non-functional targets
- Uptime: `99.9%`
- Main API latency: `p95 < 250ms`
- Market fanout latency: `p95 < 120ms`
- Tick/candle freshness on 5s tier: `<= 1s`

## 3) Implementation Workstreams (Client + Server + DB + Caching)

## A. Frontend Workstream (`apps/web`)
- Build route groups for `trader`, `admin`, `support`, `finance`.
- Implement screens to match client visual direction:
1. Landing page.
2. Trader terminal with chart, portfolio, buy/sell panel, history tabs.
3. Deposit funds and wallet summary.
4. Admin dashboard tiles, tables, and controls.
- Create typed API client with retry/backoff and shared DTO contracts.
- Add auth/tenant middleware and role guards for protected pages.

## B. Main API Workstream (`apps/main-api`)
- Implement versioned REST APIs:
`/api/v1/auth`, `/users`, `/wallet`, `/p2p`, `/affiliate`, `/tournaments`, `/admin`.
- Auth domain:
1. JWT access/refresh rotation.
2. 2FA verification flow.
3. session/device tracking and revocation hooks.
- Trading domain:
1. create/open/close trade endpoints.
2. risk pre-checks before execution.
3. trade history and PnL snapshot endpoints.
- Wallet domain:
1. double-entry ledger writes.
2. deposit/withdraw request lifecycle.
3. provider callback idempotency.
- P2P domain:
1. offer listing/creation.
2. escrow state machine with valid transitions.
3. dispute initiation and admin resolution path.
- Admin domain:
1. manipulation policy endpoints.
2. user/fund moderation actions.
3. mandatory audit logs on privileged actions.

## C. Chart API Workstream (`apps/chart-api`)
- Build upstream feed adapter and fallback mode.
- Tick pipeline:
1. normalize upstream ticks.
2. publish `ticker:{symbol}` to Redis + WS.
3. generate OTC mirrors deterministically.
- Candle pipeline:
1. aggregate across 13 intervals.
2. persist recent windows to SQLite.
3. cache hot candles in Redis.
- Market WS contracts:
1. subscribe/unsubscribe channels.
2. snapshot + incremental sequence updates.
3. reconnect-safe replay endpoint.

## D. Data + Consistency Workstream
- PostgreSQL (Prisma) is source of truth for financial and user state.
- Redis namespaces:
1. `cache:*` hot market/query cache.
2. `ws:*` channel metadata/pubsub fanout.
3. `rate:*` throttle counters.
4. `session:*` short-lived auth/session state.
- SQLite strategy:
1. local market shard DB for fast chart history.
2. compaction/retention jobs.
- Consistency policy:
1. financial writes commit in Postgres first.
2. event outbox publishes async to Redis/WS.
3. idempotency keys for callbacks and retry flows.

## E. Security + Operations Workstream
- Enforce TLS, CORS, CSP, and RBAC guards.
- Add brute-force/IP protection and rate limiting.
- Add structured logs with trace IDs.
- Metrics: feed lag, WS fanout, order latency, DB pool, cache hit ratio, CPU/RAM.
- Alerting and dashboards (Prometheus/Grafana-compatible).
- Backup/DR:
1. Postgres nightly dump + WAL strategy.
2. Redis snapshots for non-critical cache.
3. SQLite periodic export for replay.

## 4) 8-Week Build Program (Concrete Outputs)

## Wave 1 (Weeks 1-2): Foundation + Contracts
- Deliverables:
1. monorepo skeleton and shared packages.
2. auth/tenant scaffolding.
3. market feed adapter interface and WS contracts.
4. initial Prisma schema by domain.
5. nginx/pm2 deployment templates.
- Exit criteria:
1. all services boot in staging.
2. health endpoints + trace IDs active.
3. typecheck/build/test pipelines pass.

## Wave 2 (Weeks 3-4): Trading Core + Chart Experience
- Deliverables:
1. real/upstream feed integration.
2. 13-interval candles and hot cache retrieval.
3. trader terminal UI matching mockup layout.
4. trade execution APIs with risk validation.
- Exit criteria:
1. live chart updates stable under load.
2. end-to-end trade open/close path verified.
3. p95 latency in target range on staging load tests.

## Wave 3 (Weeks 5-6): Wallet + P2P + Affiliate
- Deliverables:
1. ledger posting engine + reconciliation checks.
2. deposit/withdraw workflows + callback handlers.
3. P2P offers, escrow transitions, dispute workflow.
4. affiliate tracking and payout batch draft flow.
- Exit criteria:
1. ledger balancing invariants always pass.
2. escrow lifecycle is idempotent and auditable.
3. wallet balance updates match journal state.

## Wave 4 (Weeks 7-8): Admin + Advanced Modules + Hardening
- Deliverables:
1. admin command center APIs and dashboard UI.
2. manipulation engine policy controls.
3. tournament engine baseline + leaderboard materialization.
4. AI support gateway integration.
5. performance/security hardening and runbooks.
- Exit criteria:
1. production readiness checklist complete.
2. alerting/backup/recovery drill executed.
3. zero critical test findings at go-live gate.

## 5) API, Event, and Data Contracts

### REST namespaces
- `/api/v1/auth/*`
- `/api/v1/users/*`
- `/api/v1/wallet/*`
- `/api/v1/p2p/*`
- `/api/v1/affiliate/*`
- `/api/v1/tournaments/*`
- `/api/v1/admin/*`

### WebSocket namespaces
- `/ws/market`
- `/ws/p2p-chat`
- `/ws/notifications`

### Core event types
- `TickEvent`
- `CandleEvent`
- `TradeEvent`
- `EscrowEvent`
- `LedgerEvent`
- `AdminActionEvent`

### Tenant context
- `X-Tenant-ID` required for admin/internal calls and attached to protected business flows.

## 6) Testing and Acceptance Gates

### Unit tests
- feed normalization
- candle aggregation accuracy
- escrow transition rules
- ledger balancing invariants
- affiliate commission calculations

### Integration tests
- auth + 2FA + token refresh
- trade lifecycle and history
- wallet provider callback idempotency
- dispute resolution flow
- tournament score updates

### Contract tests
- upstream feed payload normalization
- WS payload schema/sequence compatibility

### Performance and security tests
- 30+ symbols x 13 intervals with concurrent subscribers
- burst traffic and reconnect behavior
- JWT abuse/privilege escalation/rate-limit bypass/replay attack checks

### Go-live criteria
- no critical vulnerabilities
- reconciled ledger totals
- SLO targets met in staging soak
- rollback and incident runbook validated

## 7) Current Status and Next Immediate Steps

### Already completed (foundation)
- monorepo split into `web`, `main-api`, `chart-api`, shared packages.
- initial route scaffolds and market pipeline skeleton.
- Prisma schema baseline.
- deployment templates and ADR doc.

### Immediate next build items
1. replace mock feed with real provider adapter implementation.
2. implement trade execution and PnL paths.
3. implement wallet/deposit provider integration.
4. implement full trader UI matching client mockups.
5. implement admin moderation and fund request actions.

## 8) Assumptions
- Upstream market feed credentials/spec delivered before Wave 2 lock.
- PostgreSQL remains primary transactional DB (ignore client mockup “MySQL” wording unless formally changed).
- Wallet model remains internal ledger + external provider execution.
- Multi-tenant logical isolation from day 1.
- Web-first release in V1.


