export const INTERVALS = [
  "5s",
  "10s",
  "15s",
  "30s",
  "1m",
  "2m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "3h",
  "4h"
] as const;

export type Interval = (typeof INTERVALS)[number];

const intervalToMsMap: Record<Interval, number> = {
  "5s": 5000,
  "10s": 10000,
  "15s": 15000,
  "30s": 30000,
  "1m": 60000,
  "2m": 120000,
  "5m": 300000,
  "15m": 900000,
  "30m": 1800000,
  "1h": 3600000,
  "2h": 7200000,
  "3h": 10800000,
  "4h": 14400000
};

export function intervalToMs(interval: Interval): number {
  return intervalToMsMap[interval];
}

