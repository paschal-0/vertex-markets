"use client";

import { useEffect, useState } from "react";

type FlashDirection = "up" | "down" | null;

type MarketConfig = {
  symbol: string;
  base: number;
  decimals: number;
  volatility: number;
  meanReversion: number;
  trend: number;
  initialChange: number;
  initialShape: number[];
};

type MarketQuote = {
  symbol: string;
  decimals: number;
  price: number;
  anchor: number;
  history: number[];
  velocity: number;
  tick: number;
  direction: -1 | 0 | 1;
  flash: FlashDirection;
  flashCooldown: number;
};

const MARKET_CONFIGS: MarketConfig[] = [
  {
    symbol: "EUR/USD",
    base: 1.08946,
    decimals: 5,
    volatility: 0.00021,
    meanReversion: 0.12,
    trend: 0.2,
    initialChange: 0.47,
    initialShape: [-0.06, -0.05, -0.06, -0.04, -0.045, -0.02, -0.03, -0.01, -0.015, 0.01],
  },
  {
    symbol: "GBP/USD",
    base: 1.27482,
    decimals: 5,
    volatility: 0.00024,
    meanReversion: 0.11,
    trend: -0.22,
    initialChange: -0.55,
    initialShape: [0.08, 0.07, 0.075, 0.06, 0.065, 0.045, 0.04, 0.03, 0.025, 0.015],
  },
  {
    symbol: "XAU/USD",
    base: 2384.66,
    decimals: 2,
    volatility: 0.00027,
    meanReversion: 0.08,
    trend: 0.18,
    initialChange: 0.62,
    initialShape: [-0.22, -0.2, -0.21, -0.17, -0.19, -0.16, -0.15, -0.12, -0.13, -0.1],
  },
  {
    symbol: "USD/JPY",
    base: 156.743,
    decimals: 3,
    volatility: 0.00024,
    meanReversion: 0.12,
    trend: -0.12,
    initialChange: -0.21,
    initialShape: [0.05, 0.045, 0.05, 0.04, 0.045, 0.03, 0.035, 0.02, 0.025, 0.01],
  },
  {
    symbol: "BTC/USD",
    base: 67842.1,
    decimals: 2,
    volatility: 0.00042,
    meanReversion: 0.06,
    trend: 0.28,
    initialChange: 1.09,
    initialShape: [-0.7, -0.68, -0.66, -0.63, -0.6, -0.54, -0.5, -0.46, -0.42, -0.36],
  },
  {
    symbol: "US OIL",
    base: 78.245,
    decimals: 3,
    volatility: 0.00034,
    meanReversion: 0.1,
    trend: -0.16,
    initialChange: -0.15,
    initialShape: [0.13, 0.125, 0.13, 0.118, 0.122, 0.105, 0.11, 0.095, 0.1, 0.085],
  },
];

function expandSeries(points: number[], targetLength = 18): number[] {
  if (points.length >= targetLength) return points;
  const stretched: number[] = [];
  for (let i = 0; i < targetLength; i += 1) {
    const t = (i / (targetLength - 1)) * (points.length - 1);
    const left = Math.floor(t);
    const right = Math.min(points.length - 1, left + 1);
    const mix = t - left;
    const value = points[left] * (1 - mix) + points[right] * mix;
    stretched.push(value);
  }
  return stretched;
}

function createInitialQuotes(): MarketQuote[] {
  return MARKET_CONFIGS.map((config) => {
    const anchor = config.base / (1 + config.initialChange / 100);
    const rawHistory = config.initialShape.map((offsetPct) => config.base * (1 + offsetPct / 100));
    const history = expandSeries(rawHistory);
    return {
      symbol: config.symbol,
      decimals: config.decimals,
      price: config.base,
      anchor,
      history,
      velocity: 0,
      tick: 0,
      direction: config.initialChange >= 0 ? 1 : -1,
      flash: null,
      flashCooldown: 0,
    };
  });
}

function formatPrice(price: number, decimals: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

function buildSparklinePath(history: number[]): string {
  const min = Math.min(...history);
  const max = Math.max(...history);
  const spread = Math.max(max - min, 0.000001);
  const width = 116;
  const left = 2;
  const top = 6;
  const height = 20;

  return history
    .map((point, index) => {
      const x = left + (index / (history.length - 1)) * width;
      const y = top + (1 - (point - min) / spread) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function getSparklineHead(history: number[]) {
  const min = Math.min(...history);
  const max = Math.max(...history);
  const spread = Math.max(max - min, 0.000001);
  const x = 118;
  const y = 6 + (1 - (history[history.length - 1] - min) / spread) * 20;
  return { x, y };
}

export function LiveMarketStrip() {
  const [quotes, setQuotes] = useState<MarketQuote[]>(() => createInitialQuotes());

  useEffect(() => {
    const timer = setInterval(() => {
      setQuotes((previous) =>
        previous.map((quote, index) => {
          const config = MARKET_CONFIGS[index];
          const noise = (Math.random() - 0.5) * config.volatility * quote.price * 0.25;
          const drift = config.trend * config.volatility * quote.price * 0.07;
          const reversion = (config.base - quote.price) * config.meanReversion * 0.025;
          const acceleration = noise + drift + reversion;
          const nextVelocityRaw = quote.velocity * 0.82 + acceleration;
          const maxVelocity = quote.price * config.volatility * 0.18;
          const nextVelocity = Math.max(-maxVelocity, Math.min(maxVelocity, nextVelocityRaw));
          const nextPrice = Math.max(quote.price * 0.985, quote.price + nextVelocity);
          const nextAnchor = quote.anchor * 0.997 + nextPrice * 0.003;
          const direction: -1 | 0 | 1 = nextPrice > quote.price ? 1 : nextPrice < quote.price ? -1 : 0;
          const nextHistory = [...quote.history.slice(1), nextPrice];
          const pulseThreshold = quote.price * config.volatility * 0.06;
          const shouldFlash = Math.abs(nextPrice - quote.price) > pulseThreshold && quote.flashCooldown <= 0;
          const flash = shouldFlash ? (direction > 0 ? "up" : direction < 0 ? "down" : null) : null;
          const flashCooldown = shouldFlash ? 4 : Math.max(0, quote.flashCooldown - 1);

          return {
            ...quote,
            price: nextPrice,
            anchor: nextAnchor,
            history: nextHistory,
            velocity: nextVelocity,
            direction,
            flash,
            flashCooldown,
            tick: direction === 0 ? quote.tick : quote.tick + 1,
          };
        }),
      );
    }, 210);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="market-grid">
      {quotes.map((quote, index) => {
        const changePct = ((quote.price - quote.anchor) / quote.anchor) * 100;
        const isPositive = changePct >= 0;
        const trendClass = isPositive ? "positive" : "negative";
        const path = buildSparklinePath(quote.history);
        const head = getSparklineHead(quote.history);
        const flashDirection = quote.flash ?? (quote.direction >= 0 ? "up" : "down");
        const priceMotionClass = quote.flash === "up" ? "up" : quote.flash === "down" ? "down" : "flat";
        const gradientId = `spark-${quote.symbol.replace(/[^a-z0-9]/gi, "").toLowerCase()}-${index}`;

        return (
          <div className="market-item market-item-live" key={quote.symbol}>
            {quote.flash && (
              <span
                key={`${quote.symbol}-${quote.tick}`}
                className={`market-item-flash market-item-flash-${flashDirection}`}
                aria-hidden="true"
              />
            )}
            <div className="market-pair">{quote.symbol}</div>
            <div className={`market-price market-price-live ${priceMotionClass}`}>
              {formatPrice(quote.price, quote.decimals)}
            </div>
            <div className={`market-change ${trendClass}`}>{formatChange(changePct)}</div>
            <div className={`market-sparkline ${trendClass}`} aria-hidden="true">
              <svg viewBox="0 0 120 32" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
                    <stop offset="55%" stopColor="currentColor" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <path className="market-sparkline-base" d={path} />
                <path className="market-sparkline-flow" d={path} style={{ stroke: `url(#${gradientId})` }} />
                <circle className="market-sparkline-head" cx={head.x} cy={head.y} r="1.65" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
