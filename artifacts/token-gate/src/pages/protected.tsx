import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, ShieldCheck, ExternalLink } from "lucide-react";

export default function ProtectedPage() {
  const { isAuthenticated, logout } = useAuth();
  const settings = useSettings();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col">
      <header className="w-full h-14 border-b border-border bg-white flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm font-medium">Akses Diberikan</span>
        </div>
        <button
          onClick={() => { logout(); setLocation("/"); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </header>

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
