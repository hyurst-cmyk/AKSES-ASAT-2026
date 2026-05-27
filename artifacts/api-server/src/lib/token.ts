import { createHmac } from "crypto";
import { getSettings } from "./settings";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be set.");
  return secret;
}

function getWindowSeconds(): number {
  const settings = getSettings();
  return (settings.tokenWindowMinutes ?? 5) * 60;
}

function getCurrentWindow(windowSeconds: number): number {
  return Math.floor(Date.now() / 1000 / windowSeconds);
}

export function generateToken(): string {
  const settings = getSettings();
  if (settings.useCustomToken && settings.customToken && settings.customToken.trim()) {
    return settings.customToken.trim().toUpperCase();
  }
  const windowSeconds = getWindowSeconds();
  const w = getCurrentWindow(windowSeconds);
  const secret = getSecret();
  const hmac = createHmac("sha256", secret);
  hmac.update(`token-gate:${w}`);
  return hmac.digest("hex").slice(0, 8).toUpperCase();
}

export function getSecondsRemaining(): number {
  const settings = getSettings();
  if (settings.useCustomToken) return 0;
  const windowSeconds = getWindowSeconds();
  const nowSeconds = Math.floor(Date.now() / 1000);
  return windowSeconds - (nowSeconds % windowSeconds);
}

export function verifyToken(input: string): boolean {
  return input.trim().toUpperCase() === generateToken();
}

export function getWindowMinutes(): number {
  const settings = getSettings();
  return settings.tokenWindowMinutes ?? 5;
}
