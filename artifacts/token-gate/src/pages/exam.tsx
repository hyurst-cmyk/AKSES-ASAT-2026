import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { ArrowLeft, Maximize2, Minimize2, ExternalLink, Loader2 } from "lucide-react";

export default function ExamPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const settings = useSettings();

  const [examUrl, setExamUrl] = useState<string | null>(null);
  const [examLabel, setExamLabel] = useState<string>("");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    <div className="h-[100dvh] w-full flex flex-col bg-white overflow-hidden">

      {/* Header — hidden in fullscreen via CSS, no framer-motion needed */}
      <div className={`shrink-0 transition-all duration-200 ${fullscreen ? "h-0 overflow-hidden" : ""}`}>
        <header className="w-full h-12 border-b border-border bg-white flex items-center justify-between px-4">
          <Link
            href="/protected"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Daftar Ujian</span>
            <span className="sm:hidden">Kembali</span>
          </Link>

          <span className="text-sm font-medium text-foreground truncate px-2 max-w-[40%]">
            {examLabel}
          </span>

          <div className="flex items-center gap-3">
            <a
              href={examUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Buka di tab baru"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Tab Baru</span>
            </a>
            <button
              onClick={() => setFullscreen(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Layar penuh"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Layar Penuh</span>
            </button>
          </div>
        </header>

        <AnnouncementBanner
          visible={settings.announcementVisible}
          text={settings.announcementText}
          type={settings.announcementType}
          dismissible={false}
        />
      </div>

      {/* Fullscreen exit bar */}
      {fullscreen && (
        <div className="shrink-0 w-full h-8 bg-gray-900 flex items-center justify-between px-4">
          <span className="text-xs text-white/60 truncate">{examLabel}</span>
          <button
            onClick={() => setFullscreen(false)}
            className="flex items-center gap-1.5 text-xs text-white hover:text-white/80 transition-colors shrink-0 ml-3"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Keluar Layar Penuh
          </button>
        </div>
      )}

      {/* Iframe area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Loading overlay */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Memuat halaman ujian…</p>
          </div>
        )}

        {/* Help link shown after load (in case iframe content is blank due to X-Frame-Options) */}
        {iframeLoaded && (
          <div className="absolute bottom-4 right-4 z-20">
            <a
              href={examUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs bg-white border border-border text-muted-foreground hover:text-foreground hover:border-primary px-3 py-1.5 rounded-full shadow-sm transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              Tidak tampil? Buka di tab baru
            </a>
          </div>
        )}

        <iframe
          ref={iframeRef}
          key={examUrl}
          src={examUrl}
          className={`w-full h-full border-0 transition-opacity duration-300 ${iframeLoaded ? "opacity-100" : "opacity-0"}`}
          title={examLabel || "Halaman Ujian"}
          onLoad={() => setIframeLoaded(true)}
          allow="camera; microphone; fullscreen; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
