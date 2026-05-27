import { useAuth } from "@/lib/auth-context";
import { useSettings, BG_CLASSES } from "@/lib/settings-context";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { useLocation } from "wouter";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ShieldCheck, ExternalLink, Clock } from "lucide-react";

const WARNING_SECONDS = 30;

function useInactivityTimeout(timeoutSeconds: number, onTimeout: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(timeoutSeconds);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef(Date.now());

  const reset = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSecondsLeft(timeoutSeconds);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, timeoutSeconds * 1000);
  }, [timeoutSeconds, onTimeout]);

  useEffect(() => {
    reset();
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      setSecondsLeft(Math.max(0, timeoutSeconds - elapsed));
    }, 1000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reset, timeoutSeconds]);

  return secondsLeft;
}

export default function ProtectedPage() {
  const { isAuthenticated, logout } = useAuth();
  const settings = useSettings();
  const [, setLocation] = useLocation();

  const handleTimeout = useCallback(() => {
    logout();
    setLocation("/");
  }, [logout, setLocation]);

  const secondsLeft = useInactivityTimeout(settings.inactivityTimeoutSeconds, handleTimeout);
  const showWarning = secondsLeft <= WARNING_SECONDS;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className={`min-h-[100dvh] w-full text-foreground flex flex-col ${BG_CLASSES[settings.backgroundStyle]}`}>
      <header className="w-full h-14 border-b border-border bg-white flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm font-medium">Akses Diberikan</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`hidden sm:flex items-center gap-1.5 text-xs transition-colors ${showWarning ? "text-amber-600" : "text-muted-foreground"}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>
              Sesi berakhir dalam{" "}
              <span className="font-mono font-semibold tabular-nums">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </span>
          </div>
          <button
            onClick={() => { logout(); setLocation("/"); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </header>

      <AnnouncementBanner
        visible={settings.announcementVisible}
        text={settings.announcementText}
        type={settings.announcementType}
        dismissible={false}
      />

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between"
          >
            <p className="text-sm text-amber-800">
              Tidak ada aktivitas. Sesi berakhir dalam{" "}
              <span className="font-semibold font-mono tabular-nums">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>.
            </p>
            <button
              onClick={() => window.dispatchEvent(new MouseEvent("mousemove"))}
              className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2 shrink-0 ml-4"
            >
              Tetap di halaman
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Daftar Link Ujian</h1>
          <p className="text-sm text-muted-foreground">Pilih kelas Anda dan klik tombol untuk membuka halaman ujian.</p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {settings.examLinks.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="group flex items-center justify-between bg-white border border-border hover:border-primary hover:shadow-sm rounded-lg px-6 py-5 transition-all duration-200"
            >
              <div>
                <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                Buka <ExternalLink className="w-4 h-4" />
              </div>
            </motion.a>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-xs text-muted-foreground"
        >
          Hubungi pengawas jika mengalami kendala dalam mengakses ujian.
        </motion.p>
      </main>
    </div>
  );
}
