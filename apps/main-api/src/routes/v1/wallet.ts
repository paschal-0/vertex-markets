import { Router } from "express";
import { createLedgerEntry } from "../../services/ledger";

export const walletRouter = Router();

walletRouter.get("/balances", (req, res) => {
  res.json({
    ok: true,
    data: {
      tenantId: req.headers["x-tenant-id"],
      balances: [
        { asset: "USD", availableMinor: "1000000", pendingMinor: "0" },
        { asset: "BTC", availableMinor: "2500000", pendingMinor: "0" }
      ]
    }
  });
});

walletRouter.post("/journal-entry", (req, res) => {
  try {
    const entry = createLedgerEntry(req.body);
    res.status(201).json({ ok: true, data: entry });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

