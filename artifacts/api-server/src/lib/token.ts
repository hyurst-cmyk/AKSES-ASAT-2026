import { createHmac } from "crypto";

const WINDOW_MINUTES = 5;
const WINDOW_SECONDS = WINDOW_MINUTES * 60;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be set.");
  }
  return secret;
}

function getCurrentWindow(): number {
  return Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
}

export function generateToken(window?: number): string {
  const w = window ?? getCurrentWindow();
  const secret = getSecret();
  const hmac = createHmac("sha256", secret);
  hmac.update(`token-gate:${w}`);
  const digest = hmac.digest("hex");
  return digest.slice(0, 8).toUpperCase();
}

export function getSecondsRemaining(): number {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const elapsed = nowSeconds % WINDOW_SECONDS;
  return WINDOW_SECONDS - elapsed;
}

export function verifyToken(input: string): boolean {
  const current = generateToken();
  return input.trim().toUpperCase() === current;
}

export function getWindowMinutes(): number {
  return WINDOW_MINUTES;
}
