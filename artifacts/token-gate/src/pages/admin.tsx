import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, ArrowLeft, KeyRound, Link2, Palette, Save, Check, RefreshCw } from "lucide-react";
import { TimerRing } from "@/components/timer-ring";
import { Link } from "wouter";
import { THEME_COLORS } from "@/lib/settings-context";
import type { AppSettings } from "@/lib/settings-context";

type Tab = "token" | "links" | "appearance";

const THEME_OPTIONS: { value: AppSettings["primaryColor"]; label: string; bg: string }[] = [
  { value: "blue",    label: "Biru",    bg: "hsl(221 83% 40%)" },
  { value: "indigo",  label: "Indigo",  bg: "hsl(243 75% 50%)" },
  { value: "emerald", label: "Hijau",   bg: "hsl(160 84% 39%)" },
  { value: "rose",    label: "Merah",   bg: "hsl(350 89% 50%)" },
  { value: "slate",   label: "Abu-abu", bg: "hsl(215 25% 35%)" },
];

function useAdminAuth() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/token/admin", { headers: { "x-admin-secret": secret } });
      if (!res.ok) throw new Error();
      setAuthed(true);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return { secret, setSecret, authed, loading, error, login };
}

function TokenTab({ secret }: { secret: string }) {
  const [data, setData] = useState<{ token: string; secondsRemaining: number } | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/token/admin", { headers: { "x-admin-secret": secret } });
        if (res.ok) setData(await res.json());
      } catch {}
    };
    fetch_();
    const iv = setInterval(fetch_, 1000);
    return () => clearInterval(iv);
  }, [secret]);

  return (
    <div className="flex flex-col items-center py-6 gap-6">
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Token Aktif Saat Ini</p>
        <div className="text-5xl md:text-7xl font-mono font-bold text-primary tracking-[0.15em] tabular-nums">
          {data?.token ?? "------"}
        </div>
      </div>
      {data && (
        <div className="flex flex-col items-center gap-2 pt-5 border-t border-border w-full">
          <p className="text-xs text-muted-foreground mb-1">Token berganti dalam</p>
          <TimerRing secondsRemaining={data.secondsRemaining} windowMinutes={5} size={80} strokeWidth={5} />
          <p className="text-sm font-mono font-semibold text-foreground tabular-nums">
            {Math.floor(data.secondsRemaining / 60).toString().padStart(2, "0")}:
            {(data.secondsRemaining % 60).toString().padStart(2, "0")}
          </p>
        </div>
      )}
      <p className="text-xs text-muted-foreground text-center">Bagikan token ini kepada siswa sebelum ujian dimulai.</p>
    </div>
  );
}

function LinksTab({ secret }: { secret: string }) {
  const [links, setLinks] = useState([
    { label: "Kelas X",   description: "Link ujian untuk siswa kelas X",   url: "" },
    { label: "Kelas XI",  description: "Link ujian untuk siswa kelas XI",  url: "" },
    { label: "Kelas XII", description: "Link ujian untuk siswa kelas XII", url: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.examLinks) setLinks(d.examLinks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateLink = (i: number, field: "label" | "description" | "url", value: string) => {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  };

  const addLink = () => {
    setLinks((prev) => [...prev, { label: `Kelas ${prev.length + 1}`, description: "", url: "" }]);
  };

  const removeLink = (i: number) => {
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    setSaving(true);
    try {
      const current = await fetch("/api/settings").then((r) => r.json());
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ ...current, examLinks: links }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="flex flex-col gap-4 py-4">
      {links.map((link, i) => (
        <div key={i} className="border border-border rounded-lg p-4 bg-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <input
              value={link.label}
              onChange={(e) => updateLink(i, "label", e.target.value)}
              className="text-sm font-semibold bg-transparent outline-none border-b border-transparent focus:border-primary text-foreground transition-colors"
              placeholder="Nama kelas"
            />
            <button
              onClick={() => removeLink(i)}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-2"
            >
              Hapus
            </button>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Deskripsi</label>
            <input
              value={link.description}
              onChange={(e) => updateLink(i, "description", e.target.value)}
              className="w-full h-9 px-3 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all"
              placeholder="Deskripsi singkat"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">URL Ujian</label>
            <input
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              className="w-full h-9 px-3 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all font-mono"
              placeholder="https://..."
            />
          </div>
        </div>
      ))}

      <button
        onClick={addLink}
        className="text-sm text-primary border border-dashed border-primary/40 rounded-lg py-3 hover:bg-primary/5 transition-colors"
      >
        + Tambah Kelas
      </button>

      <button
        onClick={save}
        disabled={saving}
        className="h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <><Check className="w-4 h-4" /> Tersimpan</>
        ) : (
          <><Save className="w-4 h-4" /> Simpan Perubahan</>
        )}
      </button>
    </div>
  );
}

function AppearanceTab({ secret }: { secret: string }) {
  const [siteName, setSiteName] = useState("Akses Ujian");
  const [siteDescription, setSiteDescription] = useState("Masukkan kode akses yang berlaku untuk melanjutkan.");
  const [primaryColor, setPrimaryColor] = useState<AppSettings["primaryColor"]>("blue");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.siteName) setSiteName(d.siteName);
        if (d.siteDescription) setSiteDescription(d.siteDescription);
        if (d.primaryColor) setPrimaryColor(d.primaryColor);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const previewColor = (color: AppSettings["primaryColor"]) => {
    document.documentElement.style.setProperty("--primary", THEME_COLORS[color]);
    document.documentElement.style.setProperty("--ring", THEME_COLORS[color]);
  };

  const save = async () => {
    setSaving(true);
    try {
      const current = await fetch("/api/settings").then((r) => r.json());
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ ...current, siteName, siteDescription, primaryColor }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="flex flex-col gap-5 py-4">
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Nama Situs</label>
        <input
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          className="w-full h-10 px-3 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all"
          placeholder="Akses Ujian"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Deskripsi Halaman</label>
        <input
          value={siteDescription}
          onChange={(e) => setSiteDescription(e.target.value)}
          className="w-full h-10 px-3 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all"
          placeholder="Masukkan kode akses..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Warna Tema</label>
        <div className="flex flex-wrap gap-3">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setPrimaryColor(opt.value); previewColor(opt.value); }}
              className={`flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all ${primaryColor === opt.value ? "border-primary" : "border-transparent hover:border-border"}`}
            >
              <div className="w-10 h-10 rounded-full shadow-sm" style={{ backgroundColor: opt.bg }} />
              <span className="text-xs text-muted-foreground">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <><Check className="w-4 h-4" /> Tersimpan</>
        ) : (
          <><Save className="w-4 h-4" /> Simpan Perubahan</>
        )}
      </button>
    </div>
  );
}

export default function AdminPage() {
  const auth = useAdminAuth();
  const [tab, setTab] = useState<Tab>("token");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "token",      label: "Token Aktif",  icon: <KeyRound className="w-4 h-4" /> },
    { id: "links",      label: "Link Ujian",   icon: <Link2 className="w-4 h-4" /> },
    { id: "appearance", label: "Tampilan",     icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col">
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

      <div className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {!auth.authed ? (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mt-8"
              >
                <div className="bg-white border border-border rounded-lg p-8 shadow-sm">
                  <h1 className="text-xl font-semibold mb-1">Login Admin</h1>
                  <p className="text-sm text-muted-foreground mb-6">Masukkan kode otorisasi untuk mengelola pengaturan situs.</p>

                  <form onSubmit={auth.login} className="flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                        Kode Otorisasi
                      </label>
                      <input
                        type="password"
                        value={auth.secret}
                        onChange={(e) => auth.setSecret(e.target.value)}
                        placeholder="Masukkan kode otorisasi"
                        className={`w-full h-11 px-4 rounded-md border text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white placeholder:text-muted-foreground/50 ${
                          auth.error ? "border-destructive focus:ring-destructive/20" : "border-border"
                        }`}
                        disabled={auth.loading}
                      />
                      {auth.error && <p className="text-xs text-destructive mt-1.5">Kode otorisasi tidak valid.</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={!auth.secret || auth.loading}
                      className="h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                    >
                      {auth.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Masuk"}
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                {/* Tabs */}
                <div className="flex gap-1 bg-muted rounded-lg p-1 mb-4">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-md transition-all ${
                        tab === t.id
                          ? "bg-white text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.icon}
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* Panel */}
                <div className="bg-white border border-border rounded-lg px-5 pb-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      {tab === "token"      && <TokenTab secret={auth.secret} />}
                      {tab === "links"      && <LinksTab secret={auth.secret} />}
                      {tab === "appearance" && <AppearanceTab secret={auth.secret} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
