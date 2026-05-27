import { Router, type IRouter } from "express";
import { UpdateSettingsHeader, UpdateSettingsBody, GetSettingsResponse } from "@workspace/api-zod";
import { getSettings, saveSettings } from "../lib/settings";

const router: IRouter = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  res.json(GetSettingsResponse.parse(getSettings()));
});

router.put("/settings", async (req, res): Promise<void> => {
  const headerParsed = UpdateSettingsHeader.safeParse({
    "x-admin-secret": req.headers["x-admin-secret"],
  });

  if (!headerParsed.success) {
    res.status(401).json({ error: "Missing admin secret" });
    return;
  }

  const adminSecret = process.env.SESSION_SECRET;
  if (headerParsed.data["x-admin-secret"] !== adminSecret) {
    res.status(401).json({ error: "Invalid admin secret" });
    return;
  }

  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const saved = saveSettings(parsed.data);
  res.json(GetSettingsResponse.parse(saved));
});

export default router;
