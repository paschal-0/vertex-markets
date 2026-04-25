import http from "node:http";
import { getLogger, recordMetric } from "@vertex/observability";
import type { TickEvent } from "@vertex/types";
import { createChartApiApp } from "./app";
import { loadChartApiEnv } from "./config";
import { CandleAggregator } from "./market/aggregator";
import { MockFeedAdapter } from "./market/mock-feed-adapter";
import { FOREX_SYMBOLS, OTC_SYMBOLS } from "./market/symbols";
import { RedisBus } from "./store/redis-bus";
import { SqliteCandleStore } from "./store/sqlite-store";
import { MarketWsGateway } from "./ws/market-ws";

const env = loadChartApiEnv();
const logger = getLogger();

const sqliteStore = new SqliteCandleStore(env.SQLITE_DB_PATH);
const app = createChartApiApp(sqliteStore);
const server = http.createServer(app);
const wsGateway = new MarketWsGateway(server);
const redisBus = new RedisBus(env.REDIS_URL);
const aggregator = new CandleAggregator();
const adapter = new MockFeedAdapter();

let sequence = 0;

function buildTick(symbol: string, price: number, source: TickEvent["source"]): TickEvent {
  return {
    type: "TickEvent",
    sequence: ++sequence,
    symbol,
    price,
    ts: Date.now(),
    source
  };
}

function buildOtcMirrorTick(symbol: string, price: number): TickEvent {
  const otcPrice = +(price * (1 + (Math.random() - 0.5) * 0.0006)).toFixed(5);
  return buildTick(`${symbol}_OTC`, otcPrice, "OTC_SYNTHETIC");
}

async function handleTick(tick: TickEvent) {
  recordMetric("feed.tick", 1, { symbol: tick.symbol });
  wsGateway.broadcastTick(tick);
  await redisBus.publishTick(tick);

  const closedCandles = aggregator.ingest(tick);
  for (const candle of closedCandles) {
    sqliteStore.insert(candle);
    wsGateway.broadcastCandle(candle);
    await redisBus.publishCandle(candle);
  }
}

async function bootstrap() {
  await adapter.connect();
  await adapter.subscribe(FOREX_SYMBOLS as unknown as string[]);
  await adapter.heartbeat();
  await adapter.replayGap(Date.now() - 60_000);

  adapter.onTick(async (normalized) => {
    const upstreamTick = buildTick(normalized.symbol, normalized.price, normalized.source);
    await handleTick(upstreamTick);
    const otcTick = buildOtcMirrorTick(normalized.symbol, normalized.price);
    await handleTick(otcTick);
  });

  logger.info({ symbols: FOREX_SYMBOLS.length + OTC_SYMBOLS.length }, "chart-api feed initialized");
  server.listen(env.CHART_API_PORT, () => {
    logger.info({ port: env.CHART_API_PORT }, "chart-api listening");
  });
}

bootstrap().catch((error) => {
  logger.error({ error }, "chart-api failed to start");
  process.exit(1);
});

