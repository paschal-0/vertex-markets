import pino from "pino";
import type { Request, Response, NextFunction } from "express";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: null
});

export function getLogger() {
  return logger;
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const traceId = (req.headers["x-trace-id"] as string | undefined) || crypto.randomUUID();
  req.headers["x-trace-id"] = traceId;
  res.setHeader("x-trace-id", traceId);
  next();
}

export function recordMetric(name: string, value: number, tags: Record<string, string> = {}) {
  logger.debug({ metric: name, value, tags }, "metric");
}

