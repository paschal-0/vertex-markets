export default function HomePage() {
  return (
    <main className="container">
      <section className="card">
        <h1 style={{ marginTop: 0 }}>Full-Suite V1 Foundation</h1>
        <p>
          The platform is split into independent business and market engines. This web app exposes
          route groups for Trader and Admin workflows with tenant-aware API integration.
        </p>
      </section>
      <section className="grid grid-2" style={{ marginTop: "1rem" }}>
        <article className="card">
          <h3>Business Logic</h3>
          <p>Next.js + Main API + PostgreSQL/Prisma for identity, wallets, escrow, affiliates.</p>
        </article>
        <article className="card">
          <h3>Market Engine</h3>
          <p>Chart API + Redis + SQLite + WebSocket for low-latency tick/candle delivery.</p>
        </article>
      </section>
    </main>
  );
}

