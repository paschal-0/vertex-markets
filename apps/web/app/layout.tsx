import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vertex Markets",
  description: "Dual-system fintech trading platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="container" style={{ paddingBottom: "0.25rem" }}>
          <nav className="card" style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Vertex Markets</strong>
            <div style={{ display: "flex", gap: "1rem", color: "var(--muted)" }}>
              <a href="/">Overview</a>
              <a href="/trader">Trader</a>
              <a href="/admin">Admin</a>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

