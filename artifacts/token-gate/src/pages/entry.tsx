import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useVerifyToken, useGetTokenStatus } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useSettings, BG_CLASSES } from "@/lib/settings-context";
import { Loader2, KeyRound } from "lucide-react";
import { TimerRing } from "@/components/timer-ring";

export default function EntryPage() {
  const [token, setToken] = useState("");
  const [, setLocation] = useLocation();
  const { setAuthenticated } = useAuth();
  const [isError, setIsError] = useState(false);
  const settings = useSettings();

  const { data: status } = useGetTokenStatus({ query: { refetchInterval: 1000 } });
  const verify = useVerifyToken();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    verify.mutate(
      { data: { token } },
      {
        onSuccess: (res) => {
          if (res.valid) {
            setIsError(false);
            setAuthenticated(true);
            setLocation("/protected");
          } else {
            setIsError(true);
            setTimeout(() => setIsError(false), 500);
          }
        },
        onError: () => {
          setIsError(true);
          setTimeout(() => setIsError(false), 500);
        },
      }
    );
  };

  return (
    <div className={`min-h-[100dvh] w-full flex flex-col items-center justify-center ${BG_CLASSES[settings.backgroundStyle]}`}>
      <div className="w-full max-w-sm px-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-5">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">{settings.siteName}</h1>
          <p className="text-sm text-muted-foreground">{settings.siteDescription}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center mb-8"
        >
          {status ? (
            <>
              <TimerRing secondsRemaining={status.secondsRemaining} windowMinutes={status.windowMinutes} size={100} />
              {!settings.useCustomToken && (
                <p className="text-xs text-muted-foreground mt-3">
                  Kode berganti dalam {Math.floor(status.secondsRemaining / 60)}:{(status.secondsRemaining % 60).toString().padStart(2, "0")} menit
                </p>
              )}
              {settings.useCustomToken && (
                <p className="text-xs text-muted-foreground mt-3">Kode akses tetap aktif</p>
              )}
            </>
          ) : (
            <div className="w-[100px] h-[100px] rounded-full border-2 border-border flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          )}
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-3"
        >
          <motion.div animate={isError ? { x: [-6, 6, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Kode Akses
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              placeholder="Masukkan kode akses"
              className={`w-full h-11 px-4 rounded-md border text-sm font-mono tracking-widest outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50 bg-white ${
                isError ? "border-destructive text-destructive focus:ring-destructive/20 focus:border-destructive" : "border-border text-foreground"
              }`}
              disabled={verify.isPending}
            />
            {isError && <p className="text-xs text-destructive mt-1.5">Kode akses tidak valid. Silakan coba lagi.</p>}
          </motion.div>

          <button
            type="submit"
            disabled={!token || verify.isPending}
            className="h-11 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
          >
            {verify.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Masuk"}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center gap-3 mt-6"
        >
          <p className="text-center text-xs text-muted-foreground">
            Hubungi pengawas jika Anda belum menerima kode akses.
          </p>
          <a href="/admin" className="text-xs text-muted-foreground/60 hover:text-primary transition-colors underline underline-offset-2">
            Panel Admin
          </a>
        </motion.div>
      </div>
    </div>
  );
}
