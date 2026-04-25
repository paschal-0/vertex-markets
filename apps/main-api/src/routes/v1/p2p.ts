import { Router } from "express";
import { transitionEscrow, type EscrowStatus } from "../../services/escrow-state-machine";

export const p2pRouter = Router();

const escrowStore = new Map<string, EscrowStatus>();

p2pRouter.post("/escrow/:escrowId/transition", (req, res) => {
  const escrowId = req.params.escrowId;
  const from = escrowStore.get(escrowId) || "OPEN";
  const to = req.body?.to as EscrowStatus;

  try {
    const nextState = transitionEscrow(from, to);
    escrowStore.set(escrowId, nextState);
    res.json({ ok: true, data: { escrowId, from, to: nextState } });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

p2pRouter.get("/offers", (_req, res) => {
  res.json({
    ok: true,
    data: [
      { id: "offer_001", side: "BUY", asset: "USDT", rate: 1.0, min: 50, max: 5000, status: "OPEN" }
    ]
  });
});

