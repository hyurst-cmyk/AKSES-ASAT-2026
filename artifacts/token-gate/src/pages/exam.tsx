import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { ArrowLeft, Maximize2, Minimize2, AlertTriangle, Loader2 } from "lucide-react";

export default function ExamPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const settings = useSettings();

  const [examUrl, setExamUrl] = useState<string | null>(null);
  const [examLabel, setExamLabel] = useState<string>("");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    const label = params.get("label") ?? "";
    if (!url) {
      setLocation("/protected");
      return;
    }
    setExamUrl(url);
    setExamLabel(label);
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated || !examUrl) return null;

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <AnimatePresence>
        {!fullscreen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <header className="w-full h-12 border-b border-border bg-white flex items-center justify-between px-4">
              <Link
                href="/protected"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Kembali ke Daftar Ujian</span>
                <span className="sm:hidden">Kembali</span>
              </Link>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{examLabel}</span>
              </div>

              <button
                onClick={() => setFullscreen(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Layar penuh"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Layar Penuh</span>
              </button>
            </header>

            <AnnouncementBanner
              visible={settings.announcementVisible}
              text={settings.announcementText}
              type={settings.announcementType}
              dismissible={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen exit bar */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="shrink-0 w-full h-8 bg-foreground/90 flex items-center justify-between px-4"
          >
            <span className="text-xs text-white/70">{examLabel}</span>
            <button
              onClick={() => setFullscreen(false)}
              className="flex items-center gap-1.5 text-xs text-white hover:text-white/80 transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              Keluar dari Layar Penuh
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iframe container */}
      <div className="flex-1 relative overflow-hidden">
        {!iframeLoaded && !iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Memuat halaman ujian…</p>
          </div>
        )}

        {iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background z-10 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">Halaman tidak bisa dimuat di sini</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Beberapa website tidak mengizinkan tampil di dalam frame. Gunakan tombol di bawah untuk membuka di tab baru.
              </p>
              <a
                href={examUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Buka di Tab Baru
              </a>
            </div>
          </div>
        )}

        <iframe
          key={examUrl}
          src={examUrl}
          className={`w-full h-full border-0 transition-opacity duration-300 ${iframeLoaded && !iframeError ? "opacity-100" : "opacity-0"}`}
          title={examLabel || "Halaman Ujian"}
          onLoad={() => setIframeLoaded(true)}
          onError={() => { setIframeLoaded(true); setIframeError(true); }}
          allow="camera; microphone; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
}
