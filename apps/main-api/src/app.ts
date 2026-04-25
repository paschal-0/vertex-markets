import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { createAuthRouter } from "./routes/v1/auth";
import { usersRouter } from "./routes/v1/users";
import { walletRouter } from "./routes/v1/wallet";
import { p2pRouter } from "./routes/v1/p2p";
import { affiliateRouter } from "./routes/v1/affiliate";
import { tournamentsRouter } from "./routes/v1/tournaments";
import { adminRouter } from "./routes/v1/admin";
import { requestContextMiddleware } from "@vertex/observability";
import { authMiddleware, requireRoles } from "./middleware/auth";
import { requireTenant, tenantContextMiddleware } from "./middleware/tenant";
import type { MainApiEnv } from "./config";

export function createMainApiApp(env: MainApiEnv) {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("combined"));
  app.use(requestContextMiddleware);
  app.use(tenantContextMiddleware(env.TENANT_HEADER.toLowerCase()));

  const tokenConfig = {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessTtl: env.JWT_ACCESS_TTL,
    refreshTtl: env.JWT_REFRESH_TTL
  };

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "main-api", ts: Date.now() });
  });

  app.use("/api/v1/auth", createAuthRouter(tokenConfig));
  app.use("/api/v1/users", authMiddleware(tokenConfig), requireTenant, usersRouter);
  app.use("/api/v1/wallet", authMiddleware(tokenConfig), requireTenant, walletRouter);
  app.use("/api/v1/p2p", authMiddleware(tokenConfig), requireTenant, p2pRouter);
  app.use("/api/v1/affiliate", authMiddleware(tokenConfig), requireTenant, affiliateRouter);
  app.use("/api/v1/tournaments", authMiddleware(tokenConfig), requireTenant, tournamentsRouter);
  app.use(
    "/api/v1/admin",
    authMiddleware(tokenConfig),
    requireTenant,
    requireRoles(["ADMIN", "SUPPORT", "FINANCE_OPS"]),
    adminRouter
  );

  return app;
}
