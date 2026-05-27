import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { UpdateSettingsBody } from "@workspace/api-zod";
import type { z } from "zod/v4";

export type AppSettings = z.infer<typeof UpdateSettingsBody>;

const DATA_DIR = join(process.cwd(), "data");
const SETTINGS_FILE = join(DATA_DIR, "settings.json");

const DEFAULT_SETTINGS: AppSettings = {
  siteName: "Akses Ujian",
  siteDescription: "Masukkan kode akses yang berlaku untuk melanjutkan.",
  primaryColor: "blue",
  examLinks: [
    { label: "Kelas X", description: "Link ujian untuk siswa kelas X", url: "https://pengumuman-snbt.snpmb.id/" },
    { label: "Kelas XI", description: "Link ujian untuk siswa kelas XI", url: "https://pengumuman-snbt.snpmb.id/" },
    { label: "Kelas XII", description: "Link ujian untuk siswa kelas XII", url: "https://pengumuman-snbt.snpmb.id/" },
  ],
};

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getSettings(): AppSettings {
  ensureDataDir();
  if (!existsSync(SETTINGS_FILE)) {
    writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const raw = readFileSync(SETTINGS_FILE, "utf-8");
    const parsed = UpdateSettingsBody.safeParse(JSON.parse(raw));
    if (!parsed.success) return { ...DEFAULT_SETTINGS };
    return parsed.data;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): AppSettings {
  ensureDataDir();
  const validated = UpdateSettingsBody.parse(settings);
  writeFileSync(SETTINGS_FILE, JSON.stringify(validated, null, 2), "utf-8");
  return validated;
}
