import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vertex Markets | Premium Trading Platform",
  description: "Cinematic forex and OTC trading experience with a dual-system backend architecture."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header-wrap">
          <nav className="site-header">
            <Link href="/" className="site-brand" aria-label="Vertex Markets home">
              <span className="site-logo-mark" aria-hidden="true">
                <svg viewBox="0 0 40 40" role="img">
                  <path d="M4 4h9l7 15 7-15h9L20 36 4 4Z" fill="currentColor" />
                  <path d="M14 4h5l1 3-2 4-4-7ZM21 4h5l-4 7-2-4 1-3Z" fill="#000" opacity="0.65" />
                </svg>
              </span>
              <span className="site-logo-text">
                <span className="site-logo-main">VERTEX</span>
                <span className="site-logo-sub">MARKETS</span>
              </span>
            </Link>

            <div className="site-nav" role="menubar" aria-label="Primary navigation">
              <Link href="/trader" role="menuitem">
                Trading
              </Link>
              <Link href="/#platforms" role="menuitem">
                Platforms
              </Link>
              <Link href="/#markets" role="menuitem">
                Markets
              </Link>
              <Link href="/#features" role="menuitem">
                Resources
              </Link>
              <Link href="/#company" role="menuitem">
                Company
              </Link>
              <Link href="/#partners" role="menuitem">
                Partners
              </Link>
            </div>

            <div className="site-actions">
              <Link href="/admin" className="nav-btn nav-btn-ghost">
                Login
              </Link>
              <Link href="/trader" className="nav-btn nav-btn-primary">
                Get Started
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
