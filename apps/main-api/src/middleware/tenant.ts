import type { NextFunction, Request, Response } from "express";

export interface TenantRequest extends Request {
  tenantId?: string;
}

export function tenantContextMiddleware(headerName: string) {
  return (req: TenantRequest, _res: Response, next: NextFunction) => {
    const tenantId = (req.headers[headerName] as string | undefined)?.trim();
    if (tenantId) {
      req.tenantId = tenantId;
    }
    next();
  };
}

export function requireTenant(req: TenantRequest, res: Response, next: NextFunction) {
  if (!req.tenantId) {
    res.status(400).json({
      ok: false,
      error: "Missing tenant context. Provide X-Tenant-ID header or authenticated tenant token."
    });
    return;
  }
  next();
}

