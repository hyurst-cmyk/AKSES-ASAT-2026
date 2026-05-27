import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useVerifyToken, useGetTokenStatus } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Loader2, KeyRound } from "lucide-react";
import { TimerRing } from "@/components/timer-ring";

export default function EntryPage() {
  const [token, setToken] = useState("");
  const [, setLocation] = useLocation();
  const { setAuthenticated } = useAuth();
  const [isError, setIsError] = useState(false);

  const { data: status } = useGetTokenStatus({
    query: { refetchInterval: 1000 }
  });

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
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary)) 0%, transparent 40%)', transform: 'scale(1.5)' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center max-w-md w-full px-6"
      >
        <div className="mb-12">
          {status ? (
            <TimerRing 
              secondsRemaining={status.secondsRemaining} 
              windowMinutes={status.windowMinutes} 
              size={120} 
            />
          ) : (
            <div className="w-[120px] h-[120px] rounded-full border border-muted flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl tracking-widest uppercase font-mono mb-2 text-primary">Access Sequence</h1>
          <p className="text-sm text-muted-foreground">Enter the rotating sequence to proceed.</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <motion.div 
            animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <KeyRound className={`w-5 h-5 ${isError ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              placeholder="ENTER TOKEN"
              className={`w-full bg-card border-b-2 outline-none h-14 pl-12 pr-4 text-center font-mono text-xl tracking-[0.25em] transition-colors focus:bg-background placeholder:text-muted-foreground/30 ${
                isError 
                  ? "border-destructive text-destructive focus:border-destructive" 
                  : "border-muted focus:border-primary text-foreground"
              } ${isError ? "glitch" : ""}`}
              disabled={verify.isPending}
            />
            {verify.isPending && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            )}
          </motion.div>
          
          <div className="mt-8 flex justify-center">
            <button 
              type="submit"
              disabled={!token || verify.isPending}
              className="px-8 py-3 bg-primary text-primary-foreground font-mono font-bold tracking-widest text-sm uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Initialize
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
