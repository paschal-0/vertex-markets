import Redis from "ioredis";
import type { CandleEvent, TickEvent } from "@vertex/types";

export class RedisBus {
  private publisher: Redis;

  constructor(redisUrl: string) {
    this.publisher = new Redis(redisUrl, { maxRetriesPerRequest: 1 });
  }

  async publishTick(tick: TickEvent) {
    await this.publisher.publish(`ticker:${tick.symbol}`, JSON.stringify(tick));
  }

  async publishCandle(candle: CandleEvent) {
    await this.publisher.publish(`candle:${candle.symbol}:${candle.interval}`, JSON.stringify(candle));
    await this.publisher.set(
      `cache:candle:${candle.symbol}:${candle.interval}`,
      JSON.stringify(candle),
      "EX",
      600
    );
  }
}

