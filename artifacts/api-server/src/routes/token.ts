import { Router, type IRouter } from "express";
import {
  VerifyTokenBody,
  VerifyTokenResponse,
  GetTokenStatusResponse,
  GetAdminTokenHeader,
  GetAdminTokenResponse,
} from "@workspace/api-zod";
import { generateToken, verifyToken, getSecondsRemaining, getWindowMinutes } from "../lib/token";
import { isValidAdminSecret } from "../lib/settings";

const router: IRouter = Router();

router.post("/token/verify", async (req, res): Promise<void> => {
  const parsed = VerifyTokenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.json(VerifyTokenResponse.parse({ valid: verifyToken(parsed.data.token), secondsRemaining: getSecondsRemaining() }));
});

router.get("/token/status", async (_req, res): Promise<void> => {
  res.json(GetTokenStatusResponse.parse({ secondsRemaining: getSecondsRemaining(), windowMinutes: getWindowMinutes() }));
});

router.get("/token/admin", async (req, res): Promise<void> => {
  const headerParsed = GetAdminTokenHeader.safeParse({ "x-admin-secret": req.headers["x-admin-secret"] });
  if (!headerParsed.success || !isValidAdminSecret(headerParsed.data["x-admin-secret"])) {
    res.status(401).json({ error: "Invalid admin secret" });
    return;
  }
  res.json(GetAdminTokenResponse.parse({ token: generateToken(), secondsRemaining: getSecondsRemaining() }));
});

export default router;
