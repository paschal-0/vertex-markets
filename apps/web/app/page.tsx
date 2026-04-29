import Link from "next/link";
import { HeroImageMotion } from "./hero-image-motion";
import { LiveMarketStrip } from "./live-market-strip";
import { RainOverlay } from "./rain-overlay";

export default function HomePage() {
  return (
    <main className="landing-shell">
      <RainOverlay />
      <div className="landing-bg">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container hero-container">
            <div className="hero-content">
              <h1 className="hero-title">Trade Smarter. Trade Vunex.</h1>
              <p className="hero-description">
                Professional trading conditions, institutional-grade technology, and deep liquidity across global markets.
              </p>
              <div className="hero-cta">
                <Link href="/signup" className="btn btn-primary">Get Started</Link>
                <button className="btn btn-secondary">Try Demo Account</button>
              </div>
              
              {/* Feature Pills */}
              <div className="hero-features">
                <div className="feature-pill">
                  <div className="pill-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="7" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M12 3V5.5" />
                      <path d="M12 18.5V21" />
                      <path d="M3 12H5.5" />
                      <path d="M18.5 12H21" />
                    </svg>
                  </div>
                  <div className="pill-copy">
                    <div className="pill-title">Tight Spreads</div>
                    <div className="pill-subtitle">From 0.0 pips</div>
                  </div>
                </div>
                <div className="feature-pill">
                  <div className="pill-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="8" />
                      <path d="M12 7V12L15 14" />
                      <path d="M12 4V5.5" />
                      <path d="M19 12H20.5" />
                    </svg>
                  </div>
                  <div className="pill-copy">
                    <div className="pill-title">Fast Execution</div>
                    <div className="pill-subtitle">&lt; 30ms Average</div>
                  </div>
                </div>
                <div className="feature-pill">
                  <div className="pill-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 3.5L18.5 6.3V11.1C18.5 15.6 15.5 18.8 12 20.5C8.5 18.8 5.5 15.6 5.5 11.1V6.3L12 3.5Z" />
                      <path d="M9.2 11.8L11.1 13.7L14.8 10" />
                    </svg>
                  </div>
                  <div className="pill-copy">
                    <div className="pill-title">Secure & Regulated</div>
                    <div className="pill-subtitle">Global Compliance</div>
                  </div>
                </div>
                <div className="feature-pill">
                  <div className="pill-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M4 12.2A8 8 0 0 1 20 12.2" />
                      <rect x="3.2" y="12.2" width="3.2" height="5" rx="1.2" />
                      <rect x="17.6" y="12.2" width="3.2" height="5" rx="1.2" />
                      <path d="M18.5 17.2V18.2C18.5 19 17.8 19.7 17 19.7H14.5" />
                    </svg>
                  </div>
                  <div className="pill-copy">
                    <div className="pill-title">24/7 Support</div>
                    <div className="pill-subtitle">Real Traders</div>
                  </div>
                </div>
              </div>
            </div>

            <HeroImageMotion />
          </div>
        </section>

        {/* Trust Section */}
        <section className="trust-section" id="partners">
          <div className="container">
            <div className="trust-belt-wrap">
              <img
                src="/belt.png"
                alt="Trusted by traders, regulated by authorities"
                className="trust-belt-image"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section" id="features">
          <div className="container">
            <h2 className="section-title">Advantages Built for <strong>Serious Traders</strong></h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-media">
                  <img src="/Bar-Chart.png" alt="Bar chart icon" />
                </div>
                <div className="feature-copy">
                  <h3>Institutional-Grade Liquidity</h3>
                  <p>Deep liquidity from Tier-1 providers ensuring minimal slippage and maximum stability.</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-media">
                  <img src="/Time.png" alt="Execution speed icon" />
                </div>
                <div className="feature-copy">
                  <h3>Ultra-Fast Execution</h3>
                  <p>Average execution speed under 30ms with no dealing desk interference.</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-media">
                  <img src="/Shield.png" alt="Security shield icon" />
                </div>
                <div className="feature-copy">
                  <h3>Security You Can Trust</h3>
                  <p>Segregated client funds, advanced encryption, and global regulatory oversight.</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-media">
                  <img src="/Safe.png" alt="Trading controls icon" />
                </div>
                <div className="feature-copy">
                  <h3>Professional Trading Conditions</h3>
                  <p>Raw spreads, flexible leverage, and low commissions built for serious performance.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Market Data Section */}
        <section className="market-section" id="markets">
          <div className="container">
            <LiveMarketStrip />
          </div>
        </section>

        {/* Platforms Section */}
        <section className="platforms-section" id="platforms">
          <div className="container platforms-container">
            <div className="platforms-image">
              <div className="platform-mockup">
                <img src="/Laptop.png" alt="Trading platform on laptop and mobile" className="platform-mockup-image" />
              </div>
            </div>
            <div className="platforms-content">
              <p className="platforms-label">POWERFUL, FLEXIBLE, ADVANCED</p>
              <h2 className="section-title">Trading Platforms<br/>Built for Performance</h2>
              <p className="section-description">Experience next-level trading on our advanced platforms. Available on web, desktop, and mobile.</p>
              <div className="platforms-grid">
                <div className="platform-item">
                  <span className="platform-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12H21" />
                      <path d="M12 3C9.4 5.6 8 8.7 8 12C8 15.3 9.4 18.4 12 21" />
                      <path d="M12 3C14.6 5.6 16 8.7 16 12C16 15.3 14.6 18.4 12 21" />
                    </svg>
                  </span>
                  <h4>Web Trader</h4>
                  <p>Full-featured platform</p>
                </div>
                <div className="platform-item">
                  <span className="platform-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="3.5" y="5" width="17" height="11.5" rx="1.8" />
                      <path d="M2.5 19H21.5" />
                      <path d="M9.5 19L10.2 16.5H13.8L14.5 19" />
                    </svg>
                  </span>
                  <h4>Desktop</h4>
                  <p>Windows & Mac</p>
                </div>
                <div className="platform-item">
                  <span className="platform-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="7.2" y="3.2" width="9.6" height="17.6" rx="2" />
                      <path d="M10.6 5.8H13.4" />
                      <circle cx="12" cy="18.1" r="0.85" />
                    </svg>
                  </span>
                  <h4>Mobile App</h4>
                  <p>iOS & Android</p>
                </div>
              </div>
              <button className="btn btn-primary">Explore Platforms</button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" id="company">
          <div className="container">
            <div className="cta-panel">
              <div className="cta-copy">
                <h2>Ready to Elevate Your Trading?</h2>
                <p>Join Vunex Markets today and trade the world&apos;s markets with confidence, technology, and transparency.</p>
              </div>
              <div className="cta-actions">
                <Link href="/signup" className="btn btn-primary">Get Started</Link>
                <p>or <a href="#demo">Try Demo Account</a></p>
              </div>
              <div className="cta-visual-slot" aria-hidden="true">
                <img src="/V.png" alt="" className="cta-visual-image" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}



