import { Router } from "express";

export const adminRouter = Router();

adminRouter.get("/health/ops", (_req, res) => {
  res.json({
    ok: true,
    data: {
      cpuPct: process.cpuUsage(),
      memory: process.memoryUsage()
    }
  });
});

adminRouter.post("/market-controls/manipulation-policy", (req, res) => {
  res.status(202).json({
    ok: true,
    data: {
      accepted: true,
      policy: req.body || {},
      auditId: crypto.randomUUID()
    }
  });
});

