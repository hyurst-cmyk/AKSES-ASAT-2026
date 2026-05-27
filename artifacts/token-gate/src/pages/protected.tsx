import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Database, Server } from "lucide-react";

export default function ProtectedPage() {
  const { isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col items-center">
      <header className="w-full h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="w-5 h-5" />
          <span className="font-mono text-sm font-bold tracking-widest">GATE_OPEN</span>
        </div>
        <button 
          onClick={() => {
            logout();
            setLocation("/");
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-xs uppercase tracking-widest"
        >
          <Lock className="w-4 h-4" />
          <span>Lock System</span>
        </button>
      </header>

      <main className="flex-1 w-full max-w-5xl p-8 flex flex-col gap-12 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-sans tracking-tight mb-4">Welcome to the inner sanctum.</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            You have successfully bypassed the perimeter. All systems are operational and awaiting your command.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
            <Database className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Core Archives</h3>
            <p className="text-muted-foreground text-sm">Access the central data repository. All records are currently synced and encrypted.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
            <Server className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Network Uplink</h3>
            <p className="text-muted-foreground text-sm">Active connections to external relays. Monitoring 47 nodes with 0 dropped packets.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
