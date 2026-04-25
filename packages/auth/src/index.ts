import jwt from "jsonwebtoken";
import type { JwtClaims, Role } from "@vertex/types";

export interface TokenConfig {
  accessSecret: string;
  refreshSecret: string;
  accessTtl: string;
  refreshTtl: string;
}

export interface SessionIdentity {
  userId: string;
  tenantId: string;
  roles: Role[];
  sessionId: string;
}

export function issueAccessToken(identity: SessionIdentity, config: TokenConfig): string {
  const claims: JwtClaims = {
    sub: identity.userId,
    tenantId: identity.tenantId,
    roles: identity.roles,
    sessionId: identity.sessionId
  };
  return jwt.sign(claims, config.accessSecret, {
    expiresIn: config.accessTtl as jwt.SignOptions["expiresIn"]
  });
}

export function issueRefreshToken(identity: SessionIdentity, config: TokenConfig): string {
  const claims: JwtClaims = {
    sub: identity.userId,
    tenantId: identity.tenantId,
    roles: identity.roles,
    sessionId: identity.sessionId
  };
  return jwt.sign(claims, config.refreshSecret, {
    expiresIn: config.refreshTtl as jwt.SignOptions["expiresIn"]
  });
}

export function verifyAccessToken(token: string, config: TokenConfig): JwtClaims {
  return jwt.verify(token, config.accessSecret) as JwtClaims;
}
