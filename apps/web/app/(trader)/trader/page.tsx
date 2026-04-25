import { MarketTerminal } from "./market-terminal";

export default function TraderPage() {
  return (
    <main className="container">
      <section className="card">
        <h1 style={{ marginTop: 0 }}>Trader Terminal</h1>
        <p>Live market data via `/ws/market` with multi-interval support scaffolded for all 13 tiers.</p>
      </section>
      <section style={{ marginTop: "1rem" }}>
        <MarketTerminal />
      </section>
    </main>
  );
}

