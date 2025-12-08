import { Router } from "express";
import {
  syncBomberNilAthletes,
  syncBomberAdmins,
} from "../services/bomber.sync.service";

const router = Router();

// TODO: add real auth (only admins)
router.post("/sync/bomber", async (req, res) => {
  try {
    const result = await syncBomberNilAthletes();
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error("Error syncing Bomber NIL athletes", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

router.post("/sync/bomber/admins", async (req, res) => {
  try {
    const result = await syncBomberAdmins();
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error("Error syncing Bomber admins", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

export default router;
