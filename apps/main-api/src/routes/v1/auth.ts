import { Router } from "express";
import { issueAccessToken, issueRefreshToken, type SessionIdentity, type TokenConfig } from "@vertex/auth";
import type { Role } from "@vertex/types";

export function createAuthRouter(tokenConfig: TokenConfig) {
  const router = Router();

  router.post("/login", (req, res) => {
    const { userId = "demo-user", tenantId = "demo-tenant", roles = ["TRADER"] } = req.body || {};
    const typedRoles = (roles as Role[]) || (["TRADER"] as Role[]);
    const identity: SessionIdentity = {
      userId,
      tenantId,
      roles: typedRoles,
      sessionId: crypto.randomUUID()
    };

    const accessToken = issueAccessToken(identity, tokenConfig);
    const refreshToken = issueRefreshToken(identity, tokenConfig);
    res.json({
      ok: true,
      data: { accessToken, refreshToken, twoFactorRequired: typedRoles.includes("ADMIN") }
    });
  });

  router.post("/2fa/verify", (_req, res) => {
    res.json({ ok: true, data: { verified: true } });
  });

  router.post("/refresh", (_req, res) => {
    res.status(501).json({ ok: false, error: "Refresh rotation stub pending persistence layer." });
  });

  return router;
}
