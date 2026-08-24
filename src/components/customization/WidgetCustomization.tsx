import { useEffect } from "react";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import {
  SOLID_WIDGET_THEMES,
  GRADIENT_WIDGET_THEMES,
  ANIMATED_WIDGET_THEMES,
  getThemeName,
  getThemeDesc,
  type WidgetTheme,
} from "@/lib/customization-themes";
import { ArrowLeft, Check, Sparkles, Palette, Layers, Clock } from "lucide-react";
import { showCustomizationToast } from "@/lib/customization-toast";

export function WidgetCustomization({ onBack }: { onBack: () => void }) {
  const { settings, update } = useSettings();
  const { t } = useI18n();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleSelectTheme = (theme: WidgetTheme) => {
    update({ widgetTheme: theme.id });
    const name = getThemeName(t, theme);
    showCustomizationToast(t("themeAppliedToWidgets").replace("{name}", name), {
      category: "widget",
      accentColor:
        theme.category === "animated" ? "purple" : theme.category === "gradient" ? "sky" : "amber",
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Container */}
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
            {t("widgetCustomizationTitle")}
          </h1>
          <p className="text-xs text-muted-foreground">{t("widgetCustomizationSub")}</p>
        </div>
      </div>

      {/* Categories in Master White Cards */}
      <div className="space-y-6 pt-2">
        {/* Catégorie 1: Couleurs Unies */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Palette className="size-4 text-amber-500" />
            <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 dark:text-slate-100">
              {t("solidColors")}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {SOLID_WIDGET_THEMES.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={settings.widgetTheme === theme.id}
                onSelect={() => handleSelectTheme(theme)}
              />
            ))}
          </div>
        </section>

        {/* Catégorie 2: Dégradés & Multicolores */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Layers className="size-4 text-sky-500" />
            <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 dark:text-slate-100">
              {t("gradientsAndMulticolors")}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {GRADIENT_WIDGET_THEMES.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={settings.widgetTheme === theme.id}
                onSelect={() => handleSelectTheme(theme)}
              />
            ))}
          </div>
        </section>

        {/* Catégorie 3: Widgets Animés */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="size-4 text-purple-500" />
            <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 dark:text-slate-100">
              {t("animatedWidgets")}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {ANIMATED_WIDGET_THEMES.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={settings.widgetTheme === theme.id}
                onSelect={() => handleSelectTheme(theme)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: WidgetTheme;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { settings } = useSettings();
  const { t } = useI18n();
  const themeName = getThemeName(t, theme);
  const themeDesc = getThemeDesc(t, theme);
  const cityName = settings.place?.name || settings.mosque?.city || "";

  return (
    <button
      onClick={onSelect}
      className={`group relative w-full flex flex-col rounded-2xl p-2 sm:p-2.5 transition-all duration-200 text-left cursor-pointer ${
        isActive
          ? "bg-secondary ring-2 ring-amber-500 shadow-md scale-[1.02]"
          : "bg-card/70 hover:bg-secondary/60 border border-border/50"
      }`}
    >
      {/* Active Badge */}
      {isActive && (
        <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 flex items-center gap-0.5 bg-amber-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
          <Check className="size-2 sm:size-2.5" />
          {t("active")}
        </span>
      )}

      {/* Preview Box */}
      <div
        className={`w-full h-16 sm:h-20 rounded-xl overflow-hidden shadow-inner flex flex-col justify-between p-1.5 sm:p-2 border border-white/20 transition ${
          theme.animClass || ""
        }`}
        style={{
          backgroundColor: theme.from,
          backgroundImage:
            theme.gradient ||
            (theme.animClass
              ? undefined
              : `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`),
          color: theme.fg,
        }}
      >
        <div className="flex justify-between items-center text-[9px] opacity-80">
          <span className="font-bold">18 Safar</span>
          <Clock className="size-2.5" />
        </div>
        <div className="rounded-lg bg-white/20 backdrop-blur-xs p-1 text-center">
          <p className="text-[8px] font-black uppercase tracking-wider truncate">
            {cityName || "—"}
          </p>
          <p className="text-[10px] font-extrabold">21:15</p>
        </div>
      </div>

      {/* Label */}
      <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-bold truncate text-foreground">
        {themeName}
      </p>
      {themeDesc && (
        <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate opacity-80">
          {themeDesc}
        </p>
      )}
    </button>
  );
}
