import { Sliders, X, Type, MoveVertical, Check, Sparkles, MoveHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import { vibrate } from "@/lib/vibration";

interface QuranStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QURAN_FONTS = [
  {
    id: "uthmani",
    name: "Coran Uthmani",
    description: "Écriture médinoise classique imprimée standard",
    fontClass: "quran-font-uthmani",
  },
  {
    id: "tajwid",
    name: "Coran Tajwid",
    description: "Lettres colorées selon les règles de Tajwid",
    fontClass: "quran-font-tajwid",
  },
  {
    id: "indopak",
    name: "Style Indopak",
    description: "Calligraphie fluide de style Asie du Sud",
    fontClass: "quran-font-indopak",
  },
  {
    id: "amiri",
    name: "Police Naskh / Amiri",
    description: "Typographie Naskh traditionnelle et lisible",
    fontClass: "quran-font-amiri",
  },
] as const;

export function QuranStyleModal({ isOpen, onClose }: QuranStyleModalProps) {
  const { t } = useI18n();
  const { settings, update } = useSettings();

  if (!isOpen) return null;

  const currentFont = settings.quranFont || "uthmani";
  const fontSize = settings.quranFontSize || 28;
  const lineHeight = settings.quranLineHeight || 2.2;
  const letterSpacing = settings.quranLetterSpacing ?? 0;

  const handleSelectFont = (fontId: (typeof QURAN_FONTS)[number]["id"]) => {
    vibrate("button", settings);
    update({
      quranFont: fontId,
      quranMode: fontId === "tajwid" ? "tajwid" : "normal",
    });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    update({ quranFontSize: Number(e.target.value) });
  };

  const handleLineHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    update({ quranLineHeight: Number(e.target.value) });
  };

  const handleLetterSpacingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    update({ quranLetterSpacing: Number(e.target.value) });
  };

  const applyPreset = (preset: "default" | "large" | "spacious") => {
    vibrate("button", settings);
    if (preset === "default") {
      update({ quranFontSize: 28, quranLineHeight: 2.2, quranLetterSpacing: 0 });
    } else if (preset === "large") {
      update({ quranFontSize: 36, quranLineHeight: 2.4, quranLetterSpacing: 1 });
    } else if (preset === "spacious") {
      update({ quranFontSize: 32, quranLineHeight: 2.7, quranLetterSpacing: 2 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass bg-card/95 border border-emerald-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-emerald-500/5">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-2xl bg-emerald-600 text-white shadow-xs">
              <Type className="size-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-foreground text-base">{t.quranStyleTitle}</h2>
              <p className="text-[11px] text-muted-foreground">{t.quranStyleSub}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition active:scale-90 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* 1. Live Verse Preview Card (AT THE TOP) */}
          <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/20 text-center space-y-2">
            <span className="text-[10px] uppercase font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">
              {t.livePreview}
            </span>
            <p
              dir="rtl"
              className={`transition-all duration-200 text-foreground ${
                QURAN_FONTS.find((f) => f.id === currentFont)?.fontClass || "quran-font-uthmani"
              }`}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                letterSpacing: `${letterSpacing}px`,
              }}
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </div>

          {/* Preset Buttons for Quick Customization */}
          <div className="flex items-center gap-1.5 justify-between bg-secondary/40 p-1.5 rounded-2xl border border-border/40">
            <button
              type="button"
              onClick={() => applyPreset("default")}
              className="flex-1 py-1.5 text-[11px] font-bold rounded-xl bg-card border border-border/60 hover:bg-secondary text-foreground transition active:scale-95 cursor-pointer"
            >
              {t.defaultPreset}
            </button>
            <button
              type="button"
              onClick={() => applyPreset("large")}
              className="flex-1 py-1.5 text-[11px] font-bold rounded-xl bg-card border border-border/60 hover:bg-secondary text-foreground transition active:scale-95 cursor-pointer"
            >
              {t.largeTextPreset}
            </button>
            <button
              type="button"
              onClick={() => applyPreset("spacious")}
              className="flex-1 py-1.5 text-[11px] font-bold rounded-xl bg-card border border-border/60 hover:bg-secondary text-foreground transition active:scale-95 cursor-pointer"
            >
              {t.spaciousPreset}
            </button>
          </div>

          {/* 2. SIZING CONTROLS DIRECTLY UNDER PREVIEW */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
              <Sliders className="size-3.5 text-emerald-600" />
              <span>{t.dimensionSettings}</span>
            </h3>

            {/* Text Size Slider */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-foreground flex items-center gap-1.5">
                  <Type className="size-3.5 text-emerald-600" />
                  <span>{t.textSize}</span>
                </span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                  {fontSize} px
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[10px] font-bold text-muted-foreground">A</span>
                <input
                  type="range"
                  min="18"
                  max="48"
                  step="1"
                  value={fontSize}
                  onChange={handleSizeChange}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 rounded-lg bg-secondary"
                />
                <span className="text-base font-bold text-muted-foreground">A</span>
              </div>
            </div>

            {/* Line Spacing Slider */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-foreground flex items-center gap-1.5">
                  <MoveVertical className="size-3.5 text-emerald-600" />
                  <span>{t.lineHeight}</span>
                </span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                  {lineHeight.toFixed(1)} x
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[10px] font-bold text-muted-foreground">{t.tight}</span>
                <input
                  type="range"
                  min="1.4"
                  max="3.2"
                  step="0.1"
                  value={lineHeight}
                  onChange={handleLineHeightChange}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 rounded-lg bg-secondary"
                />
                <span className="text-[10px] font-bold text-muted-foreground">{t.spacious}</span>
              </div>
            </div>

            {/* Letter / Word Spacing Slider */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-foreground flex items-center gap-1.5">
                  <MoveHorizontal className="size-3.5 text-emerald-600" />
                  <span>{t.letterSpacing}</span>
                </span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                  {letterSpacing} px
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[10px] font-bold text-muted-foreground">{t.compact}</span>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={letterSpacing}
                  onChange={handleLetterSpacingChange}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 rounded-lg bg-secondary"
                />
                <span className="text-[10px] font-bold text-muted-foreground">{t.wide}</span>
              </div>
            </div>
          </div>

          {/* 3. FONT STYLE SELECTION BELOW SIZING */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-emerald-600" />
              <span>{t.chooseFont}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QURAN_FONTS.map((f) => {
                const isActive = currentFont === f.id;
                const fontInfo =
                  f.id === "uthmani"
                    ? { name: t.font_uthmani_name, description: t.font_uthmani_desc }
                    : f.id === "tajwid"
                      ? { name: t.font_tajwid_name, description: t.font_tajwid_desc }
                      : f.id === "indopak"
                        ? { name: t.font_indopak_name, description: t.font_indopak_desc }
                        : { name: t.font_amiri_name, description: t.font_amiri_desc };
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectFont(f.id)}
                    className={`relative flex flex-col text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/20 shadow-xs ring-1 ring-emerald-500/30"
                        : "border-border/60 bg-secondary/40 hover:bg-secondary/80"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-xs text-foreground">
                        {fontInfo.name}
                      </span>
                      {isActive && (
                        <span className="grid size-4 place-items-center rounded-full bg-emerald-600 text-white text-[10px]">
                          <Check className="size-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                      {fontInfo.description}
                    </p>
                    <p
                      dir="rtl"
                      className={`text-lg mt-1 text-emerald-800 dark:text-emerald-300 font-bold ${f.fontClass}`}
                    >
                      الْحَمْدُ لِلَّهِ
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/60 bg-secondary/20">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold cursor-pointer py-3"
            onClick={onClose}
          >
            {t.savePreferences}
          </Button>
        </div>
      </div>
    </div>
  );
}
