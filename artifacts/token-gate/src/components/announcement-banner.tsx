import { motion, AnimatePresence } from "framer-motion";
import { Info, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import type { AnnouncementType } from "@/lib/settings-context";

const STYLES: Record<AnnouncementType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: <Info className="w-4 h-4 shrink-0 mt-0.5" />,
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    icon: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />,
  },
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    icon: <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />,
  },
};

export function AnnouncementBanner({
  visible,
  text,
  type,
  dismissible = true,
}: {
  visible: boolean;
  text: string;
  type: AnnouncementType;
  dismissible?: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);
  const show = visible && !!text && !dismissed;
  const s = STYLES[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="announcement"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.25 }}
          className={`w-full border-b ${s.bg} ${s.border} overflow-hidden`}
        >
          <div className="max-w-2xl mx-auto px-6 py-3 flex items-start gap-3">
            <span className={s.text}>{s.icon}</span>
            <p className={`text-sm flex-1 ${s.text}`}>{text}</p>
            {dismissible && (
              <button
                onClick={() => setDismissed(true)}
                className={`${s.text} opacity-60 hover:opacity-100 transition-opacity mt-0.5`}
                aria-label="Tutup pengumuman"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
