"use client";

import { useMemo, useState } from "react";
import { INTERVALS, useMarketWs } from "./use-market-ws";

export function MarketTerminal() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [interval, setInterval] = useState("1m");
  const channel = useMemo(() => `ticker:${symbol}`, [symbol]);
  const { connected, lastTick } = useMarketWs(channel);

  return (
    <div className="grid" style={{ gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "EURUSD_OTC"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={interval} onChange={(e) => setInterval(e.target.value)}>
          {INTERVALS.map((it) => (
            <option key={it}>{it}</option>
          ))}
        </select>
        <span className="mono">{connected ? "LIVE" : "DISCONNECTED"}</span>
      </div>
      <div className="card" style={{ borderColor: connected ? "#a7f3d0" : "#fecaca" }}>
        <h3 style={{ marginTop: 0 }}>{symbol}</h3>
        <div className="mono" style={{ fontSize: "2rem", color: "var(--brand)" }}>
          {lastTick?.price?.toFixed(5) ?? "--"}
        </div>
        <p style={{ marginBottom: 0 }}>Selected interval: {interval}</p>
      </div>
    </div>
  );
}

