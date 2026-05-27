import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import { TimerRing } from "@/components/timer-ring";
import { Link } from "wouter";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const [adminData, setAdminData] = useState<{ token: string, secondsRemaining: number, windowMinutes: number } | null>(null);

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
      setAdminData({ ...data, windowMinutes: 5 }); // Assume 5 min window
      setIsAuthenticated(true);
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for admin token if authenticated
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
      } catch (e) {
        // Silently fail on poll
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, secret]);


  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center p-6 relative">
      <Link href="/" className="absolute top-6 left-6 text-muted-foreground hover:text-foreground flex items-center gap-2 font-mono text-sm tracking-widest transition-colors z-50">
        <ArrowLeft className="w-4 h-4" />
        RETURN
      </Link>

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <ShieldAlert className="w-12 h-12 text-muted-foreground mb-6" />
            <h1 className="text-xl font-mono tracking-[0.2em] mb-8 text-center">ADMIN OVERRIDE</h1>
            <form onSubmit={authenticate} className="w-full flex flex-col gap-4">
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="AUTHORIZATION CODE"
                className={`w-full bg-card border h-12 px-4 text-center font-mono tracking-widest transition-colors outline-none focus:border-primary ${error ? "border-destructive text-destructive" : "border-border"}`}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!secret || isLoading}
                className="h-12 bg-foreground text-background font-mono font-bold tracking-widest hover:bg-muted-foreground transition-colors flex justify-center items-center"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "AUTHENTICATE"}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl flex flex-col items-center"
          >
            <div className="text-center mb-12">
              <h2 className="text-muted-foreground font-mono text-sm tracking-[0.3em] uppercase mb-4">Current Active Token</h2>
              <div className="text-6xl md:text-8xl font-mono font-bold text-primary tracking-widest tabular-nums">
                {adminData?.token || "---"}
              </div>
            </div>

            {adminData && (
              <div className="flex flex-col items-center gap-4">
                <TimerRing 
                  secondsRemaining={adminData.secondsRemaining} 
                  windowMinutes={adminData.windowMinutes} 
                  size={80}
                  strokeWidth={4}
                />
                <div className="font-mono text-sm text-muted-foreground tabular-nums tracking-widest">
                  {Math.floor(adminData.secondsRemaining / 60).toString().padStart(2, '0')}:
                  {(adminData.secondsRemaining % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
