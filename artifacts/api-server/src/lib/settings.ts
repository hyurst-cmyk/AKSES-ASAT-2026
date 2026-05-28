import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { UpdateSettingsBody } from "@workspace/api-zod";
import type { z } from "zod/v4";

export type StoredSettings = z.infer<typeof UpdateSettingsBody>;

const DATA_DIR = join(process.cwd(), "data");
const SETTINGS_FILE = join(DATA_DIR, "settings.json");

const DEFAULT_SETTINGS: StoredSettings = {
  siteName: "Akses Ujian",
  siteDescription: "Masukkan kode akses yang berlaku untuk melanjutkan.",
  primaryColor: "blue",
  backgroundStyle: "light",
  examLinks: [
    { label: "Kelas X",   description: "Link ujian untuk siswa kelas X",   url: "https://pengumuman-snbt.snpmb.id/" },
    { label: "Kelas XI",  description: "Link ujian untuk siswa kelas XI",  url: "https://pengumuman-snbt.snpmb.id/" },
    { label: "Kelas XII", description: "Link ujian untuk siswa kelas XII", url: "https://pengumuman-snbt.snpmb.id/" },
  ],
  inactivityTimeoutSeconds: 120,
  tokenWindowMinutes: 5,
  useCustomToken: false,
  customToken: "",
  adminPassword: "",
  announcementVisible: false,
  announcementText: "",
  announcementType: "info" as const,
  examLocked: false,
  sessionDurationMinutes: 120,
};

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getSettings(): StoredSettings {
  ensureDataDir();
  if (!existsSync(SETTINGS_FILE)) {
    writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const raw = readFileSync(SETTINGS_FILE, "utf-8");
    const parsed = UpdateSettingsBody.safeParse(JSON.parse(raw));
    if (!parsed.success) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...parsed.data };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(input: StoredSettings): StoredSettings {
  ensureDataDir();
  const current = getSettings();
  // If adminPassword is empty string in input, keep existing
  const toSave: StoredSettings = {
    ...input,
    adminPassword: input.adminPassword && input.adminPassword.trim()
      ? input.adminPassword.trim()
      : current.adminPassword,
  };
  const validated = UpdateSettingsBody.parse(toSave);
  writeFileSync(SETTINGS_FILE, JSON.stringify(validated, null, 2), "utf-8");
  return validated;
}

export function isValidAdminSecret(input: string): boolean {
  const settings = getSettings();
  const masterSecret = process.env.SESSION_SECRET ?? "";
  // SESSION_SECRET always works as master key
  if (input === masterSecret) return true;
  // Custom adminPassword also works if set
  if (settings.adminPassword && settings.adminPassword.trim()) {
    return input === settings.adminPassword.trim();
  }
  return false;
}

export function getPublicSettings(stored: StoredSettings) {
  // Strip sensitive fields before returning to public
  const { customToken: _ct, adminPassword: _ap, ...pub } = stored;
  return pub;
}
