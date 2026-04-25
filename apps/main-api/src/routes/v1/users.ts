import { Router } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth";

export const usersRouter = Router();

usersRouter.get("/me", (req: AuthenticatedRequest, res) => {
  res.json({
    ok: true,
    data: {
      userId: req.claims?.sub || "anonymous",
      tenantId: req.tenantId,
      roles: req.claims?.roles || []
    }
  });
});

