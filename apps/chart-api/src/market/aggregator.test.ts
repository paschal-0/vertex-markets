import { describe, expect, it } from "vitest";
import { CandleAggregator } from "./aggregator";

describe("candle aggregator", () => {
  it("closes candle when tick crosses bucket", () => {
    const aggregator = new CandleAggregator();
    const tickA = {
      type: "TickEvent" as const,
      sequence: 1,
      symbol: "EURUSD",
      price: 1.1,
      ts: 10_000,
      source: "UPSTREAM" as const
    };
    const tickB = {
      ...tickA,
      sequence: 2,
      price: 1.12,
      ts: 15_001
    };

    expect(aggregator.ingest(tickA)).toHaveLength(0);
    const closed = aggregator.ingest(tickB);
    expect(closed.some((c) => c.interval === "5s")).toBe(true);
  });
});

