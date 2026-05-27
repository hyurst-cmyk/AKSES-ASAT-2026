import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { TimerRing } from "@/components/timer-ring";
import { Link } from "wouter";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const [adminData, setAdminData] = useState<{ token: string; secondsRemaining: number; windowMinutes: number } | null>(null);

  const authenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) return;

    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/token/admin', {
        headers: { 'x-admin-secret': secret }
      });
      if (!res.ok) throw new Error("Invalid");
      const data = await res.json();
      setAdminData({ ...data, windowMinutes: 5 });
      setIsAuthenticated(true);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !secret) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/token/admin', {
          headers: { 'x-admin-secret': secret }
        });
        if (res.ok) {
          const data = await res.json();
          setAdminData(prev => ({ ...data, windowMinutes: prev?.windowMinutes || 5 }));
        }
      } catch {
        // Silently fail on poll
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, secret]);

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col">
      {/* Top bar */}
      <header className="w-full border-b border-border bg-white px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm font-medium">Panel Admin</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-sm"
            >
              <div className="bg-white border border-border rounded-lg p-8 shadow-sm">
                <div className="mb-6">
                  <h1 className="text-xl font-semibold text-foreground mb-1">Login Admin</h1>
                  <p className="text-sm text-muted-foreground">Masukkan kode otorisasi untuk melihat token aktif.</p>
                </div>

                <form onSubmit={authenticate} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Kode Otorisasi
                    </label>
                    <input
                      type="password"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder="Masukkan kode otorisasi"
                      className={`w-full h-11 px-4 rounded-md border text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white placeholder:text-muted-foreground/50 ${
                        error ? "border-destructive focus:ring-destructive/20" : "border-border"
                      }`}
                      disabled={isLoading}
                    />
                    {error && (
                      <p className="text-xs text-destructive mt-1.5">Kode otorisasi tidak valid.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!secret || isLoading}
                    className="h-11 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Masuk"}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md"
            >
              <div className="bg-white border border-border rounded-lg p-8 shadow-sm text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
                  Token Aktif Saat Ini
                </p>
                <div className="text-5xl md:text-7xl font-mono font-bold text-primary tracking-[0.15em] tabular-nums mb-8">
                  {adminData?.token || "---"}
                </div>

                <div className="flex flex-col items-center gap-2 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">Token berganti dalam</p>
                  {adminData && (
                    <>
                      <TimerRing
                        secondsRemaining={adminData.secondsRemaining}
                        windowMinutes={adminData.windowMinutes}
                        size={80}
                        strokeWidth={5}
                      />
                      <p className="text-sm font-mono font-semibold text-foreground tabular-nums mt-1">
                        {Math.floor(adminData.secondsRemaining / 60).toString().padStart(2, '0')}:
                        {(adminData.secondsRemaining % 60).toString().padStart(2, '0')}
                      </p>
                    </>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                  Bagikan token ini kepada siswa sebelum ujian dimulai.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
