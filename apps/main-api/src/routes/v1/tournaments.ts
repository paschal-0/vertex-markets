import { Router } from "express";

export const tournamentsRouter = Router();

tournamentsRouter.get("/leaderboard", (_req, res) => {
  res.json({
    ok: true,
    data: {
      seasonId: "season_001",
      entries: []
    }
  });
});

