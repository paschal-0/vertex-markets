import { z } from "zod";
import { loadSharedEnv } from "@vertex/config";

const chartEnvSchema = z.object({
  CHART_API_PORT: z.coerce.number().default(4100),
  SQLITE_DB_PATH: z.string().default("./apps/chart-api/data/market.db"),
  UPSTREAM_FEED_MODE: z.enum(["mock", "upstream"]).default("mock")
});

export function loadChartApiEnv(input: NodeJS.ProcessEnv = process.env) {
  const shared = loadSharedEnv(input);
  const chart = chartEnvSchema.parse(input);
  return {
    ...shared,
    ...chart
  };
}

export type ChartApiEnv = ReturnType<typeof loadChartApiEnv>;

