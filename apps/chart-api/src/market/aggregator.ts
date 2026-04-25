import type { CandleEvent, TickEvent } from "@vertex/types";
import { INTERVALS, intervalToMs, type Interval } from "./intervals";

interface MutableCandle {
  symbol: string;
  interval: Interval;
  openTime: number;
  closeTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function getBucketStart(ts: number, intervalMs: number) {
  return Math.floor(ts / intervalMs) * intervalMs;
}

export class CandleAggregator {
  private buckets = new Map<string, MutableCandle>();
  private sequence = 0;

  ingest(tick: TickEvent): CandleEvent[] {
    const closed: CandleEvent[] = [];

    for (const interval of INTERVALS) {
      const intervalMs = intervalToMs(interval);
      const bucketStart = getBucketStart(tick.ts, intervalMs);
      const activeKey = `${tick.symbol}:${interval}`;
      const current = this.buckets.get(activeKey);

      if (!current || current.openTime !== bucketStart) {
        if (current) {
          closed.push({
            type: "CandleEvent",
            sequence: ++this.sequence,
            symbol: current.symbol,
            interval: current.interval,
            openTime: current.openTime,
            closeTime: current.closeTime,
            open: current.open,
            high: current.high,
            low: current.low,
            close: current.close,
            volume: current.volume
          });
        }

        const next: MutableCandle = {
          symbol: tick.symbol,
          interval,
          openTime: bucketStart,
          closeTime: bucketStart + intervalMs - 1,
          open: tick.price,
          high: tick.price,
          low: tick.price,
          close: tick.price,
          volume: 1
        };
        this.buckets.set(activeKey, next);
      } else {
        current.high = Math.max(current.high, tick.price);
        current.low = Math.min(current.low, tick.price);
        current.close = tick.price;
        current.volume += 1;
      }
    }

    return closed;
  }
}
