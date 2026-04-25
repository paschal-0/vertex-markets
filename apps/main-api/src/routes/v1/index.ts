import { Router } from "express";
import { createAuthRouter } from "./auth";
import { usersRouter } from "./users";
import { walletRouter } from "./wallet";
import { p2pRouter } from "./p2p";
import { affiliateRouter } from "./affiliate";
import { tournamentsRouter } from "./tournaments";
import { adminRouter } from "./admin";
import type { TokenConfig } from "@vertex/auth";

export function createV1Router(tokenConfig: TokenConfig) {
  const router = Router();
  router.use("/auth", createAuthRouter(tokenConfig));
  router.use("/users", usersRouter);
  router.use("/wallet", walletRouter);
  router.use("/p2p", p2pRouter);
  router.use("/affiliate", affiliateRouter);
  router.use("/tournaments", tournamentsRouter);
  router.use("/admin", adminRouter);
  return router;
}

