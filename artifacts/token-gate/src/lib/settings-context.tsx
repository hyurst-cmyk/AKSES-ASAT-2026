import { createContext, useContext, useEffect } from "react";
import { useGetSettings } from "@workspace/api-client-react";

type ExamLink = { label: string; description: string; url: string };

export type AppSettings = {
  siteName: string;
  siteDescription: string;
  primaryColor: "blue" | "indigo" | "emerald" | "rose" | "slate";
  examLinks: ExamLink[];
};

const THEME_COLORS: Record<AppSettings["primaryColor"], string> = {
  blue:    "221 83% 40%",
  indigo:  "243 75% 50%",
  emerald: "160 84% 39%",
  rose:    "350 89% 50%",
  slate:   "215 25% 35%",
};

const DEFAULT: AppSettings = {
  siteName: "Akses Ujian",
  siteDescription: "Masukkan kode akses yang berlaku untuk melanjutkan.",
  primaryColor: "blue",
  examLinks: [
    { label: "Kelas X",   description: "Link ujian untuk siswa kelas X",   url: "#" },
    { label: "Kelas XI",  description: "Link ujian untuk siswa kelas XI",  url: "#" },
    { label: "Kelas XII", description: "Link ujian untuk siswa kelas XII", url: "#" },
  ],
};

const SettingsContext = createContext<AppSettings>(DEFAULT);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data } = useGetSettings({ query: { refetchOnWindowFocus: false } });

  const settings: AppSettings = data
    ? { ...data, primaryColor: data.primaryColor as AppSettings["primaryColor"] }
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

export { THEME_COLORS };
