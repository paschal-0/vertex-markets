import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { CandleEvent } from "@vertex/types";

export class SqliteCandleStore {
  private db: Database.Database;

  constructor(dbPath: string) {
    const resolved = path.resolve(dbPath);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    this.db = new Database(resolved);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS candles (
        symbol TEXT NOT NULL,
        interval TEXT NOT NULL,
        open_time INTEGER NOT NULL,
        close_time INTEGER NOT NULL,
        open REAL NOT NULL,
        high REAL NOT NULL,
        low REAL NOT NULL,
        close REAL NOT NULL,
        volume REAL NOT NULL,
        sequence INTEGER NOT NULL,
        PRIMARY KEY(symbol, interval, open_time)
      );
      CREATE INDEX IF NOT EXISTS idx_candles_symbol_interval_close
      ON candles(symbol, interval, close_time DESC);
    `);
  }

  insert(candle: CandleEvent): void {
    const stmt = this.db.prepare(`
      INSERT INTO candles (
        symbol, interval, open_time, close_time, open, high, low, close, volume, sequence
      ) VALUES (
        @symbol, @interval, @openTime, @closeTime, @open, @high, @low, @close, @volume, @sequence
      )
      ON CONFLICT(symbol, interval, open_time) DO UPDATE SET
        close_time = excluded.close_time,
        high = excluded.high,
        low = excluded.low,
        close = excluded.close,
        volume = excluded.volume,
        sequence = excluded.sequence
    `);
    stmt.run(candle);
  }

  getCandles(symbol: string, interval: string, limit: number): CandleEvent[] {
    const stmt = this.db.prepare(`
      SELECT symbol, interval, open_time as openTime, close_time as closeTime, open, high, low, close, volume, sequence
      FROM candles
      WHERE symbol = ? AND interval = ?
      ORDER BY open_time DESC
      LIMIT ?
    `);
    return stmt.all(symbol, interval, limit).map((row: any) => ({
      type: "CandleEvent",
      sequence: row.sequence,
      symbol: row.symbol,
      interval: row.interval,
      openTime: row.openTime,
      closeTime: row.closeTime,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume
    }));
  }
}

