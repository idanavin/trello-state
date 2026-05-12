import { Router } from "express";
import { state } from "./state.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    cards: state.cards.size,
    users: state.connectedUsers.size,
  });
});

export default router;
