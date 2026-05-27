import { Router, type IRouter } from "express";
import {
  VerifyTokenBody,
  VerifyTokenResponse,
  GetTokenStatusResponse,
  GetAdminTokenHeader,
  GetAdminTokenResponse,
} from "@workspace/api-zod";
import {
  generateToken,
  verifyToken,
  getSecondsRemaining,
  getWindowMinutes,
} from "../lib/token";

const router: IRouter = Router();

router.post("/token/verify", async (req, res): Promise<void> => {
  const parsed = VerifyTokenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const valid = verifyToken(parsed.data.token);
  const secondsRemaining = getSecondsRemaining();

  res.json(
    VerifyTokenResponse.parse({
      valid,
      secondsRemaining,
    }),
  );
});

router.get("/token/status", async (_req, res): Promise<void> => {
  res.json(
    GetTokenStatusResponse.parse({
      secondsRemaining: getSecondsRemaining(),
      windowMinutes: getWindowMinutes(),
    }),
  );
});

router.get("/token/admin", async (req, res): Promise<void> => {
  const headerParsed = GetAdminTokenHeader.safeParse({
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

  res.json(
    GetAdminTokenResponse.parse({
      token: generateToken(),
      secondsRemaining: getSecondsRemaining(),
    }),
  );
});

export default router;
