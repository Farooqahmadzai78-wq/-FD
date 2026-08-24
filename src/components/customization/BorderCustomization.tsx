import { useEffect, useRef } from "react";
import { ArrowLeft, Check, Square, Flame, Touchpad, ChevronLeft, ChevronRight } from "lucide-react";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import {
  SOLID_BORDER_THEMES,
  ANIMATED_BORDER_THEMES,
  TOUCH_BORDER_THEMES,
  getThemeName,
  getThemeDesc,
  WidgetBorderTheme,
} from "@/lib/customization-themes";
import { showCustomizationToast } from "@/lib/customization-toast";

interface BorderCustomizationProps {
  onBack: () => void;
}

export function BorderCustomization({ onBack }: BorderCustomizationProps) {
  const { settings, update: updateSettings } = useSettings();
  const { t } = useI18n();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleSelectBorderTheme = (theme: WidgetBorderTheme) => {
    updateSettings({ widgetBorderTheme: theme.id });
    const name = getThemeName(t, theme);
    showCustomizationToast(t("borderAppliedToWidgets").replace("{name}", name), {
      category: "border",
      accentColor:
        theme.category === "touch" ? "emerald" : theme.category === "animated" ? "amber" : "purple",
    });
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Header Container - Clean & Streamlined */}
      <div
        data-widget-card
        className="glass p-4 rounded-3xl border border-border/80 shadow-sm flex items-center gap-3"
      >
        <button
          onClick={onBack}
          className="grid size-10 place-items-center rounded-2xl bg-secondary/80 text-foreground transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            {t("borderCustomizationTitle")}
          </h1>
          <p className="text-xs text-muted-foreground">{t("borderCustomizationSub")}</p>
        </div>
      </div>

      {/* CATEGORY 1: BORDURES UNIES */}
      <CategorySection
        title={t("solidBorders")}
        badge={`${SOLID_BORDER_THEMES.length} ${t("modelsCount")}`}
        icon={<Square className="size-4 text-slate-500" />}
        themes={SOLID_BORDER_THEMES}
        activeId={settings.widgetBorderTheme}
        onSelect={handleSelectBorderTheme}
      />

      {/* CATEGORY 2: BORDURE MULTICOLORE ANIMÉE */}
      <CategorySection
        title={t("animatedMulticolorBorders")}
        badge={`${ANIMATED_BORDER_THEMES.length} ${t("modelsCount")}`}
        icon={<Flame className="size-4 text-amber-500" />}
        themes={ANIMATED_BORDER_THEMES}
        activeId={settings.widgetBorderTheme}
        onSelect={handleSelectBorderTheme}
      />

      {/* CATEGORY 3: BORDURE LUMINEUSE TACTILE */}
      <CategorySection
        title={t("touchBorders")}
        badge={`${TOUCH_BORDER_THEMES.length} ${t("modelsCount")}`}
        icon={<Touchpad className="size-4 text-emerald-500" />}
        themes={TOUCH_BORDER_THEMES}
        activeId={settings.widgetBorderTheme}
        onSelect={handleSelectBorderTheme}
      />
    </div>
  );
}

interface CategorySectionProps {
  title: string;
  badge: string;
  icon: React.ReactNode;
  description?: string;
  themes: WidgetBorderTheme[];
  activeId: string;
  onSelect: (theme: WidgetBorderTheme) => void;
}

function CategorySection({ title, badge, icon, themes, activeId, onSelect }: CategorySectionProps) {
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
      {/* Category Header with Title, Badge, and Left/Right Navigation Arrows */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 dark:text-slate-100">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            {badge}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-90 cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-90 cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Single-Row Horizontal Carousel */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 pt-1 px-1 no-scrollbar scroll-smooth touch-pan-x"
        >
          {themes.map((theme) => {
            const isActive = activeId === theme.id;
            const themeName = getThemeName(t, theme);
            const themeDesc = getThemeDesc(t, theme);

            return (
              <button
                key={theme.id}
                onClick={() => onSelect(theme)}
                className={`group relative flex flex-col items-center justify-center min-h-[92px] sm:min-h-[102px] w-[155px] sm:w-[185px] shrink-0 snap-start p-3.5 rounded-2xl text-center overflow-hidden transition-all duration-300 cursor-pointer select-none bg-slate-50 dark:bg-slate-950 shadow-xs hover:shadow-md ${
                  theme.borderClass || "border border-slate-200 dark:border-slate-800"
                } ${isActive ? "ring-2 ring-amber-500 shadow-md scale-[1.02]" : ""}`}
              >
                {/* Selected Checkmark Badge in Top Right */}
                {isActive && (
                  <span className="absolute top-2 right-2 flex size-5.5 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-xs z-20">
                    <Check className="size-3.5 stroke-[3]" />
                  </span>
                )}

                {/* Title & Description */}
                <div className="z-10 px-1 w-full flex flex-col items-center justify-center">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 text-center leading-snug">
                    {themeName}
                  </h3>
                  {themeDesc && (
                    <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 text-center leading-tight mt-1 line-clamp-2 opacity-85">
                      {themeDesc}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Swipe Hint */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-1 pt-1">
          <span>
            {themes.length} {t("modelsCount")}
          </span>
          <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold">
            <span>{t("swipeHorizontally")}</span>
            <ChevronRight className="size-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
