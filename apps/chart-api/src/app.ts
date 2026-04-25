import express, { type Express } from "express";
import { createHttpRouter } from "./routes/http";
import { requestContextMiddleware } from "@vertex/observability";
import { SqliteCandleStore } from "./store/sqlite-store";

export function createChartApiApp(store: SqliteCandleStore): Express {
  const app = express();
  app.use(express.json());
  app.use(requestContextMiddleware);
  app.use(createHttpRouter(store));
  return app;
}
