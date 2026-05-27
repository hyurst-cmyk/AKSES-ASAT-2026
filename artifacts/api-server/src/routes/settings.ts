import { Router, type IRouter } from "express";
import { UpdateSettingsHeader, UpdateSettingsBody, GetSettingsResponse } from "@workspace/api-zod";
import { getSettings, saveSettings, isValidAdminSecret, getPublicSettings } from "../lib/settings";

const router: IRouter = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  const stored = getSettings();
  res.json(GetSettingsResponse.parse(getPublicSettings(stored)));
});

router.put("/settings", async (req, res): Promise<void> => {
  const headerParsed = UpdateSettingsHeader.safeParse({ "x-admin-secret": req.headers["x-admin-secret"] });
  if (!headerParsed.success || !isValidAdminSecret(headerParsed.data["x-admin-secret"])) {
    res.status(401).json({ error: "Invalid admin secret" });
    return;
  }
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const saved = saveSettings(parsed.data);
  res.json(GetSettingsResponse.parse(getPublicSettings(saved)));
});

export default router;
