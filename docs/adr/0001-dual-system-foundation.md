# ADR 0001: Dual-System Foundation

## Status
Accepted

## Context
Vertex requires low-latency market fanout without coupling chart throughput to business workflows.

## Decision
- Split runtime into two APIs:
  - `main-api`: business state and transactional integrity on PostgreSQL.
  - `chart-api`: high-frequency tick/candle workloads on Redis + SQLite.
- Use Redis pub/sub and cache namespaces (`cache:*`, `ws:*`, `rate:*`, `session:*`).
- Keep tenant context required for all protected business endpoints (`X-Tenant-ID` + JWT claims).

## Consequences
- Horizontal scaling for chart workers is independent from account/wallet services.
- Cross-service event contracts must remain stable (`TickEvent`, `CandleEvent`, etc).
- Financial consistency remains Postgres-first; fanout/cache are eventual.

