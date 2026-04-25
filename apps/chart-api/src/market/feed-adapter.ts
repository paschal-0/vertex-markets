import type { SymbolCode } from "@vertex/types";

export interface RawTick {
  symbol: SymbolCode;
  bid: number;
  ask: number;
  ts: number;
}

export interface NormalizedTick {
  symbol: SymbolCode;
  price: number;
  ts: number;
  source: "UPSTREAM" | "OTC_SYNTHETIC";
}

export interface FeedAdapter {
  connect(): Promise<void>;
  subscribe(symbols: SymbolCode[]): Promise<void>;
  heartbeat(): Promise<boolean>;
  replayGap(fromTs: number): Promise<NormalizedTick[]>;
  normalizeTick(raw: RawTick): NormalizedTick;
  onTick(listener: (tick: NormalizedTick) => void): void;
}

