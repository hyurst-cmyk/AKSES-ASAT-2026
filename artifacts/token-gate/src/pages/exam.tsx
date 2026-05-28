import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { ArrowLeft, Maximize2, Minimize2, ExternalLink, Loader2, Clock } from "lucide-react";

/** Transform Google Forms URLs to use ?embedded=true for proper iframe support. */
function getEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (
      u.hostname === "docs.google.com" &&
      u.pathname.includes("/forms/")
    ) {
      u.searchParams.set("embedded", "true");
      return u.toString();
    }
  } catch {}
  return url;
}

/** Returns seconds remaining in the session, or null if no limit. Calls onExpire when done. */
function useSessionCountdown(
  loginTime: number | null,
  sessionDurationMinutes: number,
  onExpire: () => void
): number | null {
  const [remaining, setRemaining] = useState<number | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!loginTime || !sessionDurationMinutes) {
      setRemaining(null);
      return;
    }
    const durationMs = sessionDurationMinutes * 60 * 1000;
    const calc = () => {
      const left = Math.max(0, Math.floor((loginTime + durationMs - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) onExpireRef.current();
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [loginTime, sessionDurationMinutes]);

  return remaining;
}

export default function ExamPage() {
  const { isAuthenticated, loginTime, logout } = useAuth();
  const [, setLocation] = useLocation();
  const settings = useSettings();

  const [examUrl, setExamUrl] = useState<string | null>(null);
  const [examLabel, setExamLabel] = useState<string>("");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleExpire = useCallback(() => {
    logout();
    setLocation("/");
  }, [logout, setLocation]);

  const sessionSecondsLeft = useSessionCountdown(
    loginTime,
    settings.sessionDurationMinutes,
    handleExpire
  );

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

  const embedUrl = getEmbedUrl(examUrl);

  const sessionMins = sessionSecondsLeft != null ? Math.floor(sessionSecondsLeft / 60) : null;
  const sessionSecs = sessionSecondsLeft != null ? sessionSecondsLeft % 60 : null;
  const sessionWarning = sessionSecondsLeft != null && sessionSecondsLeft <= 120;

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-white overflow-hidden">

      {/* Header */}
      <div className={`shrink-0 transition-all duration-200 ${fullscreen ? "h-0 overflow-hidden" : ""}`}>
        <header className="w-full h-12 border-b border-border bg-white flex items-center justify-between px-4 gap-2">
          <Link
            href="/protected"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali</span>
          </Link>

          <span className="text-sm font-medium text-foreground truncate flex-1 text-center px-2">
            {examLabel}
          </span>

          <div className="flex items-center gap-3 shrink-0">
            {/* Session timer */}
            {sessionSecondsLeft != null && (
              <div className={`hidden sm:flex items-center gap-1 text-xs transition-colors ${sessionWarning ? "text-amber-600 font-semibold" : "text-muted-foreground"}`}>
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">
                  {String(sessionMins).padStart(2, "0")}:{String(sessionSecs).padStart(2, "0")}
                </span>
              </div>
            )}
            <a
              href={examUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Buka di tab baru"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Tab Baru</span>
            </a>
            <button
              onClick={() => setFullscreen(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Layar penuh"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        <AnnouncementBanner
          visible={settings.announcementVisible}
          text={settings.announcementText}
          type={settings.announcementType}
          dismissible={false}
        />

        {/* Session expiry warning bar */}
        {sessionWarning && sessionSecondsLeft != null && sessionSecondsLeft > 0 && (
          <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-amber-600 mr-1.5 shrink-0" />
            <p className="text-xs text-amber-800">
              Sesi berakhir dalam{" "}
              <span className="font-semibold font-mono">
                {String(sessionMins).padStart(2, "0")}:{String(sessionSecs).padStart(2, "0")}
              </span>
            </p>
          </div>
        )}
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
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Memuat halaman ujian…</p>
          </div>
        )}

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
          key={embedUrl}
          src={embedUrl}
          className={`w-full h-full border-0 transition-opacity duration-300 ${iframeLoaded ? "opacity-100" : "opacity-0"}`}
          title={examLabel || "Halaman Ujian"}
          onLoad={() => setIframeLoaded(true)}
          allow="camera; microphone; fullscreen; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
