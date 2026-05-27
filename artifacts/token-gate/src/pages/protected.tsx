import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, ExternalLink } from "lucide-react";

const examLinks = [
  {
    label: "Kelas X",
    description: "Link ujian untuk siswa kelas X",
    url: "https://pengumuman-snbt.snpmb.id/",
    delay: 0.2,
  },
  {
    label: "Kelas XI",
    description: "Link ujian untuk siswa kelas XI",
    url: "https://pengumuman-snbt.snpmb.id/",
    delay: 0.3,
  },
  {
    label: "Kelas XII",
    description: "Link ujian untuk siswa kelas XII",
    url: "https://pengumuman-snbt.snpmb.id/",
    delay: 0.4,
  },
];

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
          <span className="font-mono text-sm font-bold tracking-widest">AKSES DIBERIKAN</span>
        </div>
        <button
          onClick={() => {
            logout();
            setLocation("/");
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-xs uppercase tracking-widest"
        >
          <Lock className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </header>

      <main className="flex-1 w-full max-w-3xl px-6 py-12 flex flex-col gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-5xl font-sans tracking-tight mb-3">
            Link Ujian Siswa
          </h1>
          <p className="text-muted-foreground text-base">
            Pilih kelas Anda dan klik tombol untuk membuka soal ujian.
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {examLinks.map((item) => (
            <motion.a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: item.delay }}
              className="group flex items-center justify-between p-6 rounded-lg border border-border bg-card hover:border-primary hover:bg-card/80 transition-all duration-200 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
              <div className="pl-2">
                <h2 className="text-xl font-semibold mb-1 font-mono tracking-wide group-hover:text-primary transition-colors">
                  {item.label}
                </h2>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-4" />
            </motion.a>
          ))}
        </div>
      </main>
    </div>
  );
}
