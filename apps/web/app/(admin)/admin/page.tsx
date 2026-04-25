const modules = [
  "Risk Controls & Trade Manipulation",
  "KYC Queue & Verification",
  "P2P Disputes",
  "Ledger Reconciliation",
  "Affiliate Payout Approvals",
  "Tournament Rules"
];

export default function AdminPage() {
  return (
    <main className="container">
      <section className="card">
        <h1 style={{ marginTop: 0 }}>Admin Command Center</h1>
        <p>RBAC-scoped operations dashboard for security, risk, and growth modules.</p>
      </section>
      <section className="grid grid-2" style={{ marginTop: "1rem" }}>
        {modules.map((moduleName) => (
          <article key={moduleName} className="card">
            <h3 style={{ marginTop: 0 }}>{moduleName}</h3>
            <p style={{ color: "var(--muted)", marginBottom: 0 }}>Module scaffold active.</p>
          </article>
        ))}
      </section>
    </main>
  );
}

