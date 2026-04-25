import { Router } from "express";

export const affiliateRouter = Router();

affiliateRouter.get("/summary", (_req, res) => {
  res.json({
    ok: true,
    data: {
      referrals: 0,
      totalCommissionMinor: "0",
      pendingPayoutMinor: "0",
      tier: "T1"
    }
  });
});

