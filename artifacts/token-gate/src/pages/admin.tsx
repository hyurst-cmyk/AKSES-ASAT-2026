import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Loader2, ArrowLeft, KeyRound, Link2, Palette,
  Save, Check, Timer, Lock, Eye, EyeOff, RotateCcw, Megaphone,
} from "lucide-react";
import { TimerRing } from "@/components/timer-ring";
import { Link } from "wouter";
import { THEME_COLORS, BG_CLASSES, type PrimaryColor, type BackgroundStyle } from "@/lib/settings-context";

type Tab = "token" | "links" | "appearance" | "timer-token" | "security" | "announcement";

const THEME_OPTIONS: { value: PrimaryColor; label: string }[] = [
  { value: "blue",    label: "Biru" },
  { value: "indigo",  label: "Indigo" },
  { value: "emerald", label: "Hijau" },
  { value: "rose",    label: "Merah" },
  { value: "slate",   label: "Abu-abu" },
];

const BG_OPTIONS: { value: BackgroundStyle; label: string }[] = [
  { value: "light",      label: "Putih Bersih" },
  { value: "gray",       label: "Abu-abu Muda" },
  { value: "blue-light", label: "Biru Muda" },
  { value: "warm",       label: "Kuning Hangat" },
  { value: "gradient",   label: "Gradien" },
];

// ─── Auth hook ────────────────────────────────────────────────────────────────
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

// ─── Save helper ──────────────────────────────────────────────────────────────
async function savePartial(secret: string, patch: Record<string, unknown>) {
  const current = await fetch("/api/settings").then((r) => r.json());
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-secret": secret },
    body: JSON.stringify({ ...current, ...patch }),
  });
  if (!res.ok) throw new Error("Save failed");
}

// ─── Save button ──────────────────────────────────────────────────────────────
function SaveBtn({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" />Tersimpan</> : <><Save className="w-4 h-4" />Simpan</>}
    </button>
  );
}

function useSave() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const trigger = useCallback(async (fn: () => Promise<void>) => {
    setSaving(true);
    try {
      await fn();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  }, []);
  return { saving, saved, trigger };
}

// ─── Token aktif tab ──────────────────────────────────────────────────────────
function TokenTab({ secret }: { secret: string }) {
  const [data, setData] = useState<{ token: string; secondsRemaining: number } | null>(null);
  const [useCustom, setUseCustom] = useState(false);
  const [examLocked, setExamLocked] = useState(false);
  const [lockSaving, setLockSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      setUseCustom(d.useCustomToken ?? false);
      setExamLocked(d.examLocked ?? false);
    });
  }, []);

  useEffect(() => {
    const go = async () => {
      try {
        const res = await fetch("/api/token/admin", { headers: { "x-admin-secret": secret } });
        if (res.ok) setData(await res.json());
      } catch {}
    };
    go();
    const iv = setInterval(go, 1000);
    return () => clearInterval(iv);
  }, [secret]);

  const toggleLock = async () => {
    const next = !examLocked;
    setExamLocked(next);
    setLockSaving(true);
    try {
      await savePartial(secret, { examLocked: next });
    } catch {
      setExamLocked(!next);
    } finally {
      setLockSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-6 gap-5">
      {/* Kunci Ujian toggle */}
      <div className={`w-full rounded-lg border-2 px-4 py-4 flex items-center justify-between gap-4 transition-colors ${examLocked ? "border-rose-300 bg-rose-50" : "border-border bg-white"}`}>
        <div>
          <p className={`text-sm font-semibold ${examLocked ? "text-rose-700" : "text-foreground"}`}>
            {examLocked ? "Ujian Sedang Dikunci" : "Kunci Ujian"}
          </p>
          <p className={`text-xs mt-0.5 ${examLocked ? "text-rose-600" : "text-muted-foreground"}`}>
            {examLocked ? "Siswa tidak dapat mengakses halaman masuk." : "Klik untuk memblokir akses siswa sementara."}
          </p>
        </div>
        <button
          onClick={toggleLock}
          disabled={lockSaving}
          className={`relative inline-flex h-7 w-14 rounded-full transition-colors disabled:opacity-60 ${examLocked ? "bg-rose-500" : "bg-gray-300"}`}
        >
          <span className={`inline-block h-6 w-6 rounded-full bg-white shadow transform transition-transform mt-0.5 ${examLocked ? "translate-x-7" : "translate-x-0.5"}`} />
        </button>
      </div>

      {useCustom && (
        <div className="w-full rounded-md bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-800 text-center">
          Token tetap (custom) sedang aktif
        </div>
      )}
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Token Aktif Saat Ini</p>
        <div className="text-5xl md:text-7xl font-mono font-bold text-primary tracking-[0.15em] tabular-nums select-all">
          {data?.token ?? "------"}
        </div>
      </div>
      {data && !useCustom && (
        <div className="flex flex-col items-center gap-2 pt-5 border-t border-border w-full">
          <p className="text-xs text-muted-foreground mb-1">Token berganti dalam</p>
          <TimerRing secondsRemaining={data.secondsRemaining} windowMinutes={5} size={80} strokeWidth={5} />
          <p className="text-sm font-mono font-semibold tabular-nums">
            {Math.floor(data.secondsRemaining / 60).toString().padStart(2, "0")}:
            {(data.secondsRemaining % 60).toString().padStart(2, "0")}
          </p>
        </div>
      )}
      <p className="text-xs text-muted-foreground text-center">Klik token untuk memilih, lalu bagikan ke siswa.</p>
    </div>
  );
}

// ─── Link ujian tab ───────────────────────────────────────────────────────────
function LinksTab({ secret }: { secret: string }) {
  const [links, setLinks] = useState([
    { label: "Kelas X", description: "Link ujian untuk siswa kelas X", url: "" },
    { label: "Kelas XI", description: "Link ujian untuk siswa kelas XI", url: "" },
    { label: "Kelas XII", description: "Link ujian untuk siswa kelas XII", url: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const { saving, saved, trigger } = useSave();

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => { if (d.examLinks) setLinks(d.examLinks); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const update = (i: number, field: keyof typeof links[0], val: string) =>
    setLinks((p) => p.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)));

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="flex flex-col gap-4 py-4">
      {links.map((link, i) => (
        <div key={i} className="border border-border rounded-lg p-4 bg-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <input
              value={link.label}
              onChange={(e) => update(i, "label", e.target.value)}
              className="text-sm font-semibold bg-transparent outline-none border-b border-transparent focus:border-primary text-foreground transition-colors"
              placeholder="Nama kelas"
            />
            <button onClick={() => setLinks((p) => p.filter((_, idx) => idx !== i))} className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-2">Hapus</button>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Deskripsi</label>
            <input value={link.description} onChange={(e) => update(i, "description", e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all" placeholder="Deskripsi singkat" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">URL Ujian</label>
            <input value={link.url} onChange={(e) => update(i, "url", e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all font-mono" placeholder="https://..." />
          </div>
        </div>
      ))}
      <button onClick={() => setLinks((p) => [...p, { label: `Kelas Baru`, description: "", url: "" }])} className="text-sm text-primary border border-dashed border-primary/40 rounded-lg py-3 hover:bg-primary/5 transition-colors">
        + Tambah Kelas
      </button>
      <SaveBtn onClick={() => trigger(() => savePartial(secret, { examLinks: links }))} saving={saving} saved={saved} />
    </div>
  );
}

// ─── Tampilan tab ─────────────────────────────────────────────────────────────
function AppearanceTab({ secret }: { secret: string }) {
  const [siteName, setSiteName] = useState("Akses Ujian");
  const [siteDescription, setSiteDescription] = useState("");
  const [primaryColor, setPrimaryColor] = useState<PrimaryColor>("blue");
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>("light");
  const [loading, setLoading] = useState(true);
  const { saving, saved, trigger } = useSave();

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      if (d.siteName) setSiteName(d.siteName);
      if (d.siteDescription) setSiteDescription(d.siteDescription);
      if (d.primaryColor) setPrimaryColor(d.primaryColor);
      if (d.backgroundStyle) setBackgroundStyle(d.backgroundStyle);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const previewColor = (c: PrimaryColor) => {
    document.documentElement.style.setProperty("--primary", THEME_COLORS[c]);
    document.documentElement.style.setProperty("--ring", THEME_COLORS[c]);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="flex flex-col gap-5 py-4">
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Nama Situs</label>
        <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="w-full h-10 px-3 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white" />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Deskripsi</label>
        <input value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} className="w-full h-10 px-3 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white" />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Warna Utama</label>
        <div className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => { setPrimaryColor(opt.value); previewColor(opt.value); }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${primaryColor === opt.value ? "border-primary" : "border-transparent hover:border-border"}`}>
              <div className="w-9 h-9 rounded-full shadow-sm" style={{ backgroundColor: `hsl(${THEME_COLORS[opt.value]})` }} />
              <span className="text-xs text-muted-foreground">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Latar Belakang</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BG_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setBackgroundStyle(opt.value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${backgroundStyle === opt.value ? "border-primary" : "border-border hover:border-primary/50"}`}>
              <div className={`w-full h-10 rounded-md ${BG_CLASSES[opt.value]}`} />
              <span className="text-xs text-muted-foreground">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      <SaveBtn onClick={() => trigger(() => savePartial(secret, { siteName, siteDescription, primaryColor, backgroundStyle }))} saving={saving} saved={saved} />
    </div>
  );
}

// ─── Timer & Token tab ────────────────────────────────────────────────────────
function TimerTokenTab({ secret }: { secret: string }) {
  const [inactivityTimeout, setInactivityTimeout] = useState(120);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(120);
  const [tokenWindowMinutes, setTokenWindowMinutes] = useState(5);
  const [useCustomToken, setUseCustomToken] = useState(false);
  const [customToken, setCustomToken] = useState("");
  const [loading, setLoading] = useState(true);
  const { saving, saved, trigger } = useSave();

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      if (d.inactivityTimeoutSeconds) setInactivityTimeout(d.inactivityTimeoutSeconds);
      if (d.sessionDurationMinutes) setSessionDurationMinutes(d.sessionDurationMinutes);
      if (d.tokenWindowMinutes) setTokenWindowMinutes(d.tokenWindowMinutes);
      if (typeof d.useCustomToken === "boolean") setUseCustomToken(d.useCustomToken);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const regenerate = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    setCustomToken(Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Session duration */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Durasi Sesi Ujian
        </label>
        <p className="text-xs text-muted-foreground mb-3">Berapa lama siswa bisa mengakses ujian setelah masuk. Sesi akan berakhir otomatis. (0 = tidak terbatas)</p>
        <div className="grid grid-cols-4 gap-2">
          {[60, 90, 120, 180].map((m) => (
            <button key={m} onClick={() => setSessionDurationMinutes(m)}
              className={`py-2 text-sm rounded-md border-2 font-medium transition-all ${sessionDurationMinutes === m ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
              {m}m
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            min={0}
            max={480}
            value={sessionDurationMinutes}
            onChange={(e) => setSessionDurationMinutes(Number(e.target.value))}
            className="w-24 h-9 px-3 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
          />
          <span className="text-sm text-muted-foreground">menit</span>
        </div>
      </div>

      {/* Inactivity timeout */}
      <div className="border-t border-border pt-5">
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Timer Inaktivitas
        </label>
        <p className="text-xs text-muted-foreground mb-3">Siswa keluar otomatis jika tidak ada aktivitas selama waktu ini.</p>
        <div className="grid grid-cols-4 gap-2">
          {[60, 120, 180, 300].map((s) => (
            <button key={s} onClick={() => setInactivityTimeout(s)}
              className={`py-2 text-sm rounded-md border-2 font-medium transition-all ${inactivityTimeout === s ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
              {s < 60 ? `${s}d` : `${s / 60}m`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            min={30}
            max={3600}
            value={inactivityTimeout}
            onChange={(e) => setInactivityTimeout(Number(e.target.value))}
            className="w-24 h-9 px-3 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
          />
          <span className="text-sm text-muted-foreground">detik</span>
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Interval Rotasi Token
        </label>
        <p className="text-xs text-muted-foreground mb-3">Seberapa sering token otomatis berganti.</p>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 15, 30].map((m) => (
            <button key={m} onClick={() => setTokenWindowMinutes(m)}
              className={`py-2 text-sm rounded-md border-2 font-medium transition-all ${tokenWindowMinutes === m ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
              {m}m
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Token Tetap (Custom)</label>
            <p className="text-xs text-muted-foreground mt-0.5">Gunakan kode yang tidak berubah otomatis.</p>
          </div>
          <button
            onClick={() => setUseCustomToken((v) => !v)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${useCustomToken ? "bg-primary" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${useCustomToken ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        {useCustomToken && (
          <div className="flex gap-2 mt-2">
            <input
              value={customToken}
              onChange={(e) => setCustomToken(e.target.value.toUpperCase().slice(0, 12))}
              placeholder="Masukkan kode (maks. 12 karakter)"
              className="flex-1 h-9 px-3 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white font-mono tracking-widest"
            />
            <button onClick={regenerate} title="Buat kode acak" className="h-9 w-9 flex items-center justify-center border border-border rounded-md hover:border-primary transition-colors">
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      <SaveBtn
        onClick={() => trigger(() => savePartial(secret, {
          inactivityTimeoutSeconds: inactivityTimeout,
          sessionDurationMinutes,
          tokenWindowMinutes,
          useCustomToken,
          customToken: useCustomToken ? customToken : "",
        }))}
        saving={saving}
        saved={saved}
      />
    </div>
  );
}

// ─── Pengumuman tab ───────────────────────────────────────────────────────────
function AnnouncementTab({ secret }: { secret: string }) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success">("info");
  const [loading, setLoading] = useState(true);
  const { saving, saved, trigger } = useSave();

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      setVisible(d.announcementVisible ?? false);
      setText(d.announcementText ?? "");
      setType(d.announcementType ?? "info");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const TYPE_OPTIONS: { value: "info" | "warning" | "success"; label: string; preview: string }[] = [
    { value: "info",    label: "Info",      preview: "bg-blue-50 border-blue-200 text-blue-800" },
    { value: "warning", label: "Peringatan", preview: "bg-amber-50 border-amber-200 text-amber-800" },
    { value: "success", label: "Sukses",    preview: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  ];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Tampilkan Pengumuman</label>
          <p className="text-xs text-muted-foreground mt-0.5">Tampilkan banner pesan di halaman utama dan halaman ujian.</p>
        </div>
        <button
          onClick={() => setVisible((v) => !v)}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${visible ? "bg-primary" : "bg-gray-300"}`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${visible ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Isi Pesan</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Contoh: Ujian akan dimulai pukul 09.00. Harap tenang dan siapkan peralatan Anda."
          className="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white resize-none leading-relaxed"
        />
        <p className="text-xs text-muted-foreground mt-1">{text.length} karakter</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Jenis Pesan</label>
        <div className="flex flex-col gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${type === opt.value ? "border-primary" : "border-border hover:border-primary/40"}`}
            >
              <div className={`w-3 h-3 rounded-full border ${opt.preview}`} />
              <span className="text-sm font-medium text-foreground">{opt.label}</span>
              {text && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded border ${opt.preview}`}>Pratinjau</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {visible && text && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          type === "info"    ? "bg-blue-50 border-blue-200 text-blue-800" :
          type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" :
                               "bg-emerald-50 border-emerald-200 text-emerald-800"
        }`}>
          <p className="text-xs font-medium uppercase tracking-wider mb-1 opacity-60">Pratinjau</p>
          {text}
        </div>
      )}

      <SaveBtn onClick={() => trigger(() => savePartial(secret, { announcementVisible: visible, announcementText: text, announcementType: type }))} saving={saving} saved={saved} />
    </div>
  );
}

// ─── Keamanan tab ─────────────────────────────────────────────────────────────
function SecurityTab({ secret }: { secret: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const { saving, saved, trigger } = useSave();

  const handleSave = () => {
    if (!newPassword) { setError("Password baru tidak boleh kosong."); return; }
    if (newPassword !== confirmPassword) { setError("Konfirmasi password tidak cocok."); return; }
    if (newPassword.length < 6) { setError("Password minimal 6 karakter."); return; }
    setError("");
    trigger(async () => {
      await savePartial(secret, { adminPassword: newPassword });
      setNewPassword("");
      setConfirmPassword("");
    });
  };

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="rounded-md bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
        Kode otorisasi bawaan (SESSION_SECRET) tetap bisa digunakan sebagai cadangan meski Anda mengganti password di sini.
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Password Baru</label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full h-10 px-3 pr-10 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
            placeholder="Minimal 6 karakter"
          />
          <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Konfirmasi Password</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-10 px-3 pr-10 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
            placeholder="Ulangi password baru"
          />
          <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <SaveBtn onClick={handleSave} saving={saving} saved={saved} />
    </div>
  );
}

// ─── Main admin page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const auth = useAdminAuth();
  const [tab, setTab] = useState<Tab>("token");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "token",        label: "Token",        icon: <KeyRound className="w-4 h-4" /> },
    { id: "links",        label: "Link Ujian",   icon: <Link2 className="w-4 h-4" /> },
    { id: "appearance",   label: "Tampilan",     icon: <Palette className="w-4 h-4" /> },
    { id: "timer-token",  label: "Timer",        icon: <Timer className="w-4 h-4" /> },
    { id: "announcement", label: "Pengumuman",   icon: <Megaphone className="w-4 h-4" /> },
    { id: "security",     label: "Keamanan",     icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col">
      <header className="w-full border-b border-border bg-white px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />Kembali
        </Link>
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm font-medium">Panel Admin</span>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {!auth.authed ? (
              <motion.div key="auth" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-8">
                <div className="bg-white border border-border rounded-lg p-8 shadow-sm">
                  <h1 className="text-xl font-semibold mb-1">Login Admin</h1>
                  <p className="text-sm text-muted-foreground mb-6">Masukkan kode otorisasi untuk mengelola pengaturan situs.</p>
                  <form onSubmit={auth.login} className="flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Kode Otorisasi</label>
                      <input
                        type="password"
                        value={auth.secret}
                        onChange={(e) => auth.setSecret(e.target.value)}
                        placeholder="Masukkan kode otorisasi"
                        className={`w-full h-11 px-4 rounded-md border text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white placeholder:text-muted-foreground/50 ${auth.error ? "border-destructive focus:ring-destructive/20" : "border-border"}`}
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
                {/* Tab bar */}
                <div className="flex gap-0.5 bg-muted rounded-lg p-1 mb-4 overflow-x-auto">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium py-2 px-3 rounded-md transition-all whitespace-nowrap ${tab === t.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
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
                      transition={{ duration: 0.15 }}
                    >
                      {tab === "token"        && <TokenTab secret={auth.secret} />}
                      {tab === "links"        && <LinksTab secret={auth.secret} />}
                      {tab === "appearance"   && <AppearanceTab secret={auth.secret} />}
                      {tab === "timer-token"  && <TimerTokenTab secret={auth.secret} />}
                      {tab === "announcement" && <AnnouncementTab secret={auth.secret} />}
                      {tab === "security"     && <SecurityTab secret={auth.secret} />}
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
