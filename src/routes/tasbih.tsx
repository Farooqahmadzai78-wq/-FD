import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import { playClick } from "@/lib/sfx";
import {
  TasbihHistoryChart,
  getStoredHistory,
  recordTasbihTap,
  setTodayTasbihCount,
  type DailyHistory,
} from "@/components/TasbihHistoryChart";

export const Route = createFileRoute("/tasbih")({
  head: () => ({
    meta: [
      { title: "Tasbih numérique — Islam-Noor" },
      {
        name: "description",
        content:
          "Compteur de dhikr avec vibration, visualisation des progrès et suivi automatique.",
      },
      { property: "og:title", content: "Tasbih numérique — Islam-Noor" },
      {
        property: "og:description",
        content: "Comptez vos dhikr et suivez vos progrès quotidiens.",
      },
    ],
  }),
  component: TasbihPage,
});

const PHRASES = [
  { arabic: "سُبْحَانَ اللَّهِ", fr: "Subhan Allah" },
  { arabic: "الْحَمْدُ لِلَّهِ", fr: "Alhamdulillah" },
  { arabic: "اللَّهُ أَكْبَرُ", fr: "Allahu Akbar" },
];

function TasbihPage() {
  const { t } = useI18n();
  const { settings, update } = useSettings();
  const count = settings.tasbihCount;
  const phrase = PHRASES[Math.floor(count / 33) % 3];
  const [history, setHistory] = useState<DailyHistory>({});

  useEffect(() => {
    setHistory(getStoredHistory());
  }, []);

  const tap = () => {
    if ("vibrate" in navigator) navigator.vibrate(12);
    playClick();
    const nextCount = count + 1;
    update({ tasbihCount: nextCount });
    const updatedHistory = recordTasbihTap(1);
    setHistory(updatedHistory);
  };

  const handleReset = () => {
    update({ tasbihCount: 0 });
    const updatedHistory = setTodayTasbihCount(0);
    setHistory(updatedHistory);
  };

  return (
    <div className="space-y-4 px-4 pb-12 pt-[max(1rem,env(safe-area-inset-top))]">
      <div data-widget-card className="glass flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="grid size-10 place-items-center rounded-2xl bg-secondary/80 text-foreground hover:bg-secondary transition active:scale-95 border border-border/50 shrink-0"
          aria-label={t.back || "Retour"}
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{t.tasbih}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t.tasbihSub}</p>
        </div>
      </div>

      <div data-widget-card className="glass mt-4 p-6 text-center">
        <p className="font-[var(--font-arabic)] text-3xl">{phrase.arabic}</p>
        <p className="mt-1 text-xs text-muted-foreground">{phrase.fr}</p>

        <motion.button
          onClick={tap}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="widget mx-auto mt-6 grid size-56 place-items-center rounded-full select-none cursor-pointer shadow-lg"
        >
          <motion.span
            key={count}
            initial={{ scale: 1.25, opacity: 0.75 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 450, damping: 18 }}
            className="inline-block text-6xl font-extrabold tabular-nums"
          >
            {count}
          </motion.span>
        </motion.button>

        <p className="mt-3 text-xs text-muted-foreground">{count % 33} / 33</p>

        <Button variant="soft" className="mt-4" onClick={handleReset}>
          <RotateCcw className="size-4" /> {t.reset}
        </Button>
      </div>

      <TasbihHistoryChart currentCount={count} history={history} />
    </div>
  );
}
