import { Router, type IRouter } from "express";
import { ALL_SYMBOLS } from "../market/symbols";
import { INTERVALS } from "../market/intervals";
import { SqliteCandleStore } from "../store/sqlite-store";

export function createHttpRouter(store: SqliteCandleStore): IRouter {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ ok: true, service: "chart-api", ts: Date.now() });
  });

  router.get("/api/v1/market/symbols", (_req, res) => {
    res.json({ ok: true, data: { symbols: ALL_SYMBOLS, intervals: INTERVALS } });
  });

  router.get("/api/v1/market/candles", (req, res) => {
    const symbol = String(req.query.symbol || "");
    const interval = String(req.query.interval || "1m");
    const limit = Number(req.query.limit || 100);
    if (!symbol) {
      res.status(400).json({ ok: false, error: "symbol is required" });
      return;
    }
    const candles = store.getCandles(symbol, interval, Math.min(limit, 1000));
    res.json({ ok: true, data: candles });
  });

  return router;
}
