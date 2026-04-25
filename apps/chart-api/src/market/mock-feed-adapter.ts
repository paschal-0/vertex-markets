import type { FeedAdapter, NormalizedTick, RawTick } from "./feed-adapter";
import type { SymbolCode } from "@vertex/types";
import { FOREX_SYMBOLS } from "./symbols";

export class MockFeedAdapter implements FeedAdapter {
  private listeners: Array<(tick: NormalizedTick) => void> = [];
  private timers: NodeJS.Timeout[] = [];
  private lastPrice = new Map<SymbolCode, number>();

  async connect(): Promise<void> {
    return Promise.resolve();
  }

  async subscribe(symbols: SymbolCode[]): Promise<void> {
    this.stop();
    const streamSymbols = symbols.filter((symbol) => !symbol.endsWith("_OTC"));
    for (const symbol of streamSymbols) {
      if (!this.lastPrice.has(symbol)) {
        this.lastPrice.set(symbol, 1 + Math.random());
      }
      const timer = setInterval(() => {
        const base = this.lastPrice.get(symbol) ?? 1.0;
        const next = Math.max(0.01, +(base + (Math.random() - 0.5) * 0.0009).toFixed(5));
        this.lastPrice.set(symbol, next);
        const raw: RawTick = { symbol, bid: next - 0.00005, ask: next + 0.00005, ts: Date.now() };
        const normalized = this.normalizeTick(raw);
        this.listeners.forEach((listener) => listener(normalized));
      }, 250);
      this.timers.push(timer);
    }
  }

  async heartbeat(): Promise<boolean> {
    return true;
  }

  async replayGap(_fromTs: number): Promise<NormalizedTick[]> {
    const now = Date.now();
    return FOREX_SYMBOLS.slice(0, 5).map((symbol, index) => ({
      symbol,
      price: 1 + index * 0.01,
      ts: now - (5 - index) * 1000,
      source: "UPSTREAM"
    }));
  }

  normalizeTick(raw: RawTick): NormalizedTick {
    return {
      symbol: raw.symbol,
      price: +(Number(((raw.bid + raw.ask) / 2).toFixed(5))),
      ts: raw.ts,
      source: "UPSTREAM"
    };
  }

  onTick(listener: (tick: NormalizedTick) => void): void {
    this.listeners.push(listener);
  }

  stop() {
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers = [];
  }
}

