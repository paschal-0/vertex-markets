# Vunex Markets Feature Build Order

This file is the implementation sequence for feature work.
Use it as the execution board after infrastructure setup.

## Current State (Already Done)
- Monorepo structure (`apps/web`, `apps/main-api`, `apps/chart-api`, `packages/*`)
- Basic route scaffolds and service bootstraps
- Prisma schema baseline
- PM2/Nginx templates
- Health endpoints and basic trader/admin pages

## Phase 1: Authentication and Identity (Start Here)

## 1. Identity Data and Auth Foundations
- Build:
1. User identity schema updates (`email_verified`, `email_verified_at`, `verification_attempts`, `locked_until`)
2. Password hashing (argon2 or bcrypt) and policy validation
3. Tenant-aware user creation and uniqueness checks
4. Email provider integration abstraction (SMTP/Resend/SendGrid adapter)
- Done criteria:
1. User records support verification state transitions
2. Password policy and hashing are enforced on write
3. Email delivery service can send test verification messages in non-dev environments

## 2. Signup Email OTP (Mandatory Verification)
- Build:
1. `POST /api/v1/auth/signup` (creates user in unverified state and triggers OTP)
2. `POST /api/v1/auth/signup/verify-otp`
3. `POST /api/v1/auth/signup/resend-otp`
4. OTP storage (hashed OTP + expiry + retry counter + resend counter)
5. OTP policy: expiry 10 minutes, max attempts 5 per OTP, resend cooldown 60 seconds, max resend 5 per hour
- Done criteria:
1. New user cannot obtain full session until OTP is verified
2. Expired/invalid OTPs fail with proper error codes
3. Resend and attempt limits are enforced and audited

## 3. Login + Verified-User Gate
- Build:
1. `POST /api/v1/auth/login`
2. Block login for unverified users with explicit verification-required response
3. Issue access + refresh tokens only for verified users
4. Basic login rate limit by IP and email
- Done criteria:
1. Verified users can log in from web UI
2. Unverified users are blocked and guided to resend/verify OTP
3. Invalid credentials and lockouts return consistent API errors

## 4. Session + Refresh Rotation
- Build:
1. Persistent session table in Postgres
2. `POST /api/v1/auth/refresh`
3. Logout + token revocation
- Done criteria:
1. Refresh token rotates and old one is invalid
2. Logout invalidates active session

## 5. Login 2FA (Privileged and Optional User-Level)
- Build:
1. 2FA setup and verification endpoints
2. Mandatory 2FA for privileged roles (`ADMIN`, `FINANCE_OPS`, `SUPPORT`)
3. Optional user-level 2FA enable/disable flow
4. Backup recovery codes generation and revoke/regenerate flow
- Done criteria:
1. Privileged login requires valid OTP
2. Users with enabled 2FA are challenged after password login
3. Recovery path is implemented and documented

## Phase 2: Trading Core and Market Data

## 6. Feed Adapter (Real Provider)
- Build:
1. Replace mock feed adapter with real upstream adapter
2. Heartbeat/reconnect/replay handling
- Done criteria:
1. Real ticks flow into Redis and WebSocket
2. Feed disconnect recovers automatically

## 7. Candle and Symbol APIs
- Build:
1. Finalize 13-interval aggregation
2. Historical candle query endpoints from SQLite
3. 30+ forex + OTC symbol support
- Done criteria:
1. Trader UI receives live candles reliably
2. Historical requests return consistent OHLCV

## 8. Trade Execution Engine
- Build:
1. Open trade endpoint (buy/sell)
2. Close/settle trade endpoint
3. Risk checks and trade validation
4. PnL calculation service
- Done criteria:
1. Trades move through valid lifecycle
2. PnL values match configured rules

## Phase 3: Wallet and Funds

## 9. Double-Entry Ledger Completion
- Build:
1. Journal posting service backed by Postgres
2. Account balance snapshots from ledger
- Done criteria:
1. Every funds operation writes balanced postings
2. Reconciliation script passes

## 10. Deposit/Withdrawal Flows
- Build:
1. Deposit request endpoints
2. Withdrawal request endpoints
3. Callback/webhook handlers with idempotency keys
- Done criteria:
1. Pending and completed fund requests visible in UI
2. Duplicate callbacks do not double-credit

## 10.1 Binance USDT (TRC20) Direct Settlement Integration
- Build:
1. Provider adapter for Binance-directed settlement flow (prefer unique deposit reference/order per user; avoid single shared address as primary mode)
2. User dashboard deposit module: destination/QR display, deposit status timeline (`PENDING -> CONFIRMING -> CREDITED`), and deposit history (tx hash, amount, network, timestamps)
3. Admin panel deposit operations: integration settings, monitor queue, reconciliation view, flagged/failed deposits, and manual review actions with audit trail
4. Verified-credit service: credit user wallet only after confirmed provider/on-chain settlement with idempotency checks
5. Reconciliation job: compare provider settlement records against internal ledger credits and raise mismatches
- Done criteria:
1. Deposits can be initiated from trader UI and traced end-to-end to credited wallet balance
2. Admin can monitor all deposit states and resolve exceptions from one panel
3. Duplicate or replayed notifications never create double-credit events
4. Reconciliation report has zero unexplained variances for test data

## Phase 4: P2P and Growth Modules

## 11. P2P Marketplace + Escrow
- Build:
1. Offer create/list/take flows
2. Escrow transitions (`OPEN -> FUNDED -> RELEASED|DISPUTED|CANCELLED`)
3. Dispute and admin resolution path
- Done criteria:
1. End-to-end P2P trade succeeds
2. Invalid transitions are blocked

## 12. Affiliate and Tournament
- Build:
1. Referral tracking and tiered commissions
2. Payout batch generation
3. Tournament season + leaderboard jobs
- Done criteria:
1. Referral events create commission records
2. Leaderboard updates from trade data

## Phase 5: Admin, Security, and Polish

## 13. Admin Command Center
- Build:
1. User moderation endpoints
2. Fund request approvals/rejections
3. Risk/manipulation controls with audit logs
- Done criteria:
1. Admin UI performs all core moderation tasks
2. Every admin action is audited

## 14. Security Hardening + Observability
- Build:
1. Rate limits and IP controls
2. Structured logs with trace IDs
3. Dashboards/alerts for API and market engine
- Done criteria:
1. Abuse controls active on critical routes
2. Alerting triggers on service failure

## 15. UI Matching and UX Completion
- Build:
1. Align trader/admin UI to client mockup style
2. Complete landing/onboarding/deposit screens
- Done criteria:
1. Core screens match expected layout and flow
2. Mobile/desktop behavior verified

## Execution Rules
- Always finish backend endpoint + tests before wiring final UI behavior.
- Merge in vertical slices:
1. API + DB + tests
2. then UI integration
- Do not start new module until current module done criteria pass.

