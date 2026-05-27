import { createContext, useContext, useEffect } from "react";
import { useGetSettings } from "@workspace/api-client-react";

export type PrimaryColor = "blue" | "indigo" | "emerald" | "rose" | "slate";
export type BackgroundStyle = "light" | "gray" | "blue-light" | "warm" | "gradient";
export type AnnouncementType = "info" | "warning" | "success";

export type ExamLink = { label: string; description: string; url: string };

export type AppSettings = {
  siteName: string;
  siteDescription: string;
  primaryColor: PrimaryColor;
  backgroundStyle: BackgroundStyle;
  examLinks: ExamLink[];
  inactivityTimeoutSeconds: number;
  tokenWindowMinutes: number;
  useCustomToken: boolean;
  announcementVisible: boolean;
  announcementText: string;
  announcementType: AnnouncementType;
};

export const THEME_COLORS: Record<PrimaryColor, string> = {
  blue:    "221 83% 40%",
  indigo:  "243 75% 50%",
  emerald: "160 84% 39%",
  rose:    "350 89% 50%",
  slate:   "215 25% 35%",
};

export const BG_CLASSES: Record<BackgroundStyle, string> = {
  "light":     "bg-[hsl(210_20%_98%)]",
  "gray":      "bg-gray-100",
  "blue-light":"bg-sky-50",
  "warm":      "bg-amber-50",
  "gradient":  "bg-gradient-to-br from-white via-sky-50 to-blue-100",
};

const DEFAULT: AppSettings = {
  siteName: "Akses Ujian",
  siteDescription: "Masukkan kode akses yang berlaku untuk melanjutkan.",
  primaryColor: "blue",
  backgroundStyle: "light",
  examLinks: [
    { label: "Kelas X",   description: "Link ujian untuk siswa kelas X",   url: "#" },
    { label: "Kelas XI",  description: "Link ujian untuk siswa kelas XI",  url: "#" },
    { label: "Kelas XII", description: "Link ujian untuk siswa kelas XII", url: "#" },
  ],
  inactivityTimeoutSeconds: 120,
  tokenWindowMinutes: 5,
  useCustomToken: false,
  announcementVisible: false,
  announcementText: "",
  announcementType: "info",
};

const SettingsContext = createContext<AppSettings>(DEFAULT);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data } = useGetSettings({ query: { refetchOnWindowFocus: false } });

  const settings: AppSettings = data
    ? {
        ...DEFAULT,
        ...data,
        primaryColor: (data.primaryColor as PrimaryColor) ?? DEFAULT.primaryColor,
        backgroundStyle: (data.backgroundStyle as BackgroundStyle) ?? DEFAULT.backgroundStyle,
      }
    : DEFAULT;

  useEffect(() => {
    const hsl = THEME_COLORS[settings.primaryColor];
    document.documentElement.style.setProperty("--primary", hsl);
    document.documentElement.style.setProperty("--ring", hsl);
  }, [settings.primaryColor]);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
