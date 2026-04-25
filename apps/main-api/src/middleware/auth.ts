import type { NextFunction, Response } from "express";
import { verifyAccessToken, type TokenConfig } from "@vertex/auth";
import type { JwtClaims, Role } from "@vertex/types";
import type { TenantRequest } from "./tenant";

export interface AuthenticatedRequest extends TenantRequest {
  claims?: JwtClaims;
}

export function authMiddleware(tokenConfig: TokenConfig) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const rawHeader = req.headers.authorization;
    if (!rawHeader?.startsWith("Bearer ")) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    try {
      const token = rawHeader.slice("Bearer ".length);
      const claims = verifyAccessToken(token, tokenConfig);
      req.claims = claims;
      req.tenantId = req.tenantId || claims.tenantId;
      next();
    } catch {
      res.status(401).json({ ok: false, error: "Invalid token" });
    }
  };
}

export function requireRoles(roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const assigned = req.claims?.roles || [];
    if (!roles.some((role) => assigned.includes(role))) {
      res.status(403).json({ ok: false, error: "Forbidden" });
      return;
    }
    next();
  };
}

