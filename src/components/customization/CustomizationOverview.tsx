import { useState } from "react";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import { getWidgetThemeById, getThemeName, getThemeDesc } from "@/lib/customization-themes";
import { Palette, Layers, Clock, Sparkles } from "lucide-react";
import { WidgetCustomization } from "./WidgetCustomization";
import { BackgroundCustomization } from "./BackgroundCustomization";
import { BorderCustomization } from "./BorderCustomization";
import { showCustomizationToast } from "@/lib/customization-toast";

type CustomizationTab = "overview" | "widgets" | "backgrounds" | "borders";

export function CustomizationOverview({
  onSubPageOpen,
}: {
  onSubPageOpen?: (isOpen: boolean) => void;
}) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<CustomizationTab>("overview");
  const { settings, update: updateSettings } = useSettings();

  const activeWidgetTheme = getWidgetThemeById(settings.widgetTheme);

  const handleSetTab = (tab: CustomizationTab) => {
    setActiveTab(tab);
    onSubPageOpen?.(tab !== "overview");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (activeTab === "widgets") {
    return <WidgetCustomization onBack={() => handleSetTab("overview")} />;
  }

  if (activeTab === "backgrounds") {
    return <BackgroundCustomization onBack={() => handleSetTab("overview")} />;
  }

  if (activeTab === "borders") {
    return <BorderCustomization onBack={() => handleSetTab("overview")} />;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-2xl mx-auto">
      {/* Conteneur global d'arrière-plan englobant toute la page de personnalisation */}
      <div className="relative rounded-[32px] p-4 sm:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm space-y-6 overflow-hidden">
        {/* 1. En-tête Widget Plein avec fond dynamique aux couleurs du Thème / Widget actif */}
        <div
          className={`relative rounded-[28px] px-5 sm:px-6 pt-[2px] pb-[5px] -mx-2.5 -mt-1 mb-[26px] text-center text-white shadow-md border border-white/20 overflow-hidden transition-all duration-300 ${
            activeWidgetTheme.animClass || ""
          }`}
          style={{
            background:
              activeWidgetTheme.gradient ||
              `linear-gradient(135deg, ${activeWidgetTheme.from}, ${activeWidgetTheme.to})`,
          }}
        >
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
            {t("customizationTitle")}
          </h1>
          <p className="text-xs text-white/90 mt-1 font-medium max-w-md mx-auto drop-shadow-2xs">
            {t("customizationSub")}
          </p>
        </div>

        {/* 2. Grille Supérieure (2 Cartes Principales) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: Arrière-plan */}
          <div
            data-widget-card
            onClick={() => handleSetTab("backgrounds")}
            className="relative rounded-[28px] p-4 sm:p-5 flex flex-col justify-between h-[280px] sm:h-[290px] overflow-hidden shadow-xs bg-gradient-to-tr from-[#fef08a] via-[#fbcfe8] to-[#bae6fd] text-slate-900 transition-all hover:shadow-md cursor-pointer group"
          >
            {/* Top internal items */}
            <div className="flex items-start justify-between w-full">
              <div className="grid size-9 sm:size-10 place-items-center rounded-full bg-slate-900/10 backdrop-blur-md text-slate-900 border border-slate-900/10 shadow-xs">
                <Palette className="size-4 sm:size-5" />
              </div>
            </div>

            {/* Bottom title & Action Button */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                {t("background")}
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetTab("backgrounds");
                }}
                className="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-white/95 hover:bg-white text-slate-900 font-extrabold text-[11px] sm:text-sm rounded-full shadow-md backdrop-blur-md border border-white/80 transition-all active:scale-95 cursor-pointer text-center truncate"
              >
                {t("bgCustomizeBtn")}
              </button>
            </div>
          </div>

          {/* Card 2: Widgets */}
          <div
            data-widget-card
            onClick={() => handleSetTab("widgets")}
            className="relative rounded-[28px] p-4 sm:p-5 flex flex-col justify-between h-[280px] sm:h-[290px] overflow-hidden shadow-xs bg-white dark:bg-slate-900 text-foreground transition-all hover:shadow-md cursor-pointer group"
          >
            {/* Top internal icon */}
            <div className="flex items-start justify-between w-full">
              <div className="grid size-8 sm:size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs">
                <Layers className="size-4 sm:size-5" />
              </div>
            </div>

            {/* Dashboard white theme preview */}
            <div
              data-widget-card
              className="my-auto relative rounded-2xl bg-white dark:bg-slate-900 p-2.5 sm:p-3 text-slate-900 dark:text-slate-100 shadow-xs space-y-1.5 sm:space-y-2 overflow-hidden border border-slate-200/80 dark:border-slate-800"
            >
              <div className="flex items-center justify-between text-[8px] sm:text-[10px]">
                <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                  <Clock className="size-2.5 sm:size-3 text-sky-500" />
                  <span className="truncate" suppressHydrationWarning>
                    12 Déc 21/IS
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-semibold">
                    31/15
                  </span>
                  <span
                    className="bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-semibold pt-[2px] -ml-[9px]"
                    style={{ paddingTop: "2px", marginLeft: "-9px" }}
                  >
                    Doua'a
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[8px] sm:text-[9px] font-medium">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-1 sm:p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 flex items-center gap-1 min-w-0">
                  <span className="size-1.5 rounded-full bg-blue-500 shrink-0"></span>
                  <span className="truncate" suppressHydrationWarning>
                    {t("nav_home") || "Rappels"}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-1 sm:p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 flex items-center gap-1 min-w-0">
                  <span className="size-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate" suppressHydrationWarning>
                    {t("nav_prayers") || "Prières"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom title & Action Button */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">{t("widgets")}</h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetTab("widgets");
                }}
                className="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground font-extrabold text-[11px] sm:text-sm rounded-full border border-slate-200/80 dark:border-slate-700 shadow-xs transition-all active:scale-95 cursor-pointer text-center truncate"
              >
                {t("widgetsCustomizeBtn")}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Section Inférieure: Bordures Animées (Conteneur clair épuré) */}
        <div
          data-widget-card
          className="rounded-[28px] p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/80 text-foreground shadow-xs space-y-4"
        >
          {/* Section Title */}
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            <h2 className="text-base sm:text-lg font-extrabold tracking-wide text-foreground">
              {t("animatedBorders")}
            </h2>
          </div>

          {/* 3 Cards Horizontal Container */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Card A: Rainbow Luxe */}
            <button
              type="button"
              onClick={() => {
                updateSettings({ widgetBorderTheme: "wb-rainbow-luxe" });
                const name = getThemeName(t, { id: "wb-rainbow-luxe", name: "Rainbow Luxe" });
                showCustomizationToast(t("borderAppliedToWidgets").replace("{name}", name), {
                  category: "border",
                  accentColor: "purple",
                });
                handleSetTab("borders");
              }}
              className="group relative rounded-2xl p-2.5 sm:p-3.5 bg-white dark:bg-slate-900 text-left border-2 border-fuchsia-500/70 hover:border-fuchsia-500 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer flex flex-col justify-between h-[120px] sm:h-[130px] overflow-hidden"
            >
              <div className="size-6 sm:size-7 rounded-lg bg-fuchsia-500/10 dark:bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-500 shrink-0">
                <Sparkles className="size-3.5 sm:size-4 text-fuchsia-500" />
              </div>
              <div>
                <h3 className="text-[10px] sm:text-xs font-black text-foreground group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors truncate">
                  {getThemeName(t, { id: "wb-rainbow-luxe", name: "Rainbow Luxe" })}
                </h3>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                  {getThemeDesc(t, {
                    id: "wb-rainbow-luxe",
                    desc: "Spectre multicolore soyeux aux transitions douces",
                  })}
                </p>
              </div>
            </button>

            {/* Card B: Aurora Royale */}
            <button
              type="button"
              onClick={() => {
                updateSettings({ widgetBorderTheme: "wb-cosmic-galaxy" });
                const name = getThemeName(t, { id: "wb-cosmic-galaxy", name: "Cosmic Galaxy" });
                showCustomizationToast(t("borderAppliedToWidgets").replace("{name}", name), {
                  category: "border",
                  accentColor: "purple",
                });
                handleSetTab("borders");
              }}
              className="group relative rounded-2xl p-2.5 sm:p-3.5 bg-white dark:bg-slate-900 text-left border-2 border-purple-500/70 hover:border-purple-500 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer flex flex-col justify-between h-[120px] sm:h-[130px] overflow-hidden"
            >
              <div className="size-6 sm:size-7 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center font-black text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 shrink-0">
                <Sparkles className="size-3.5 sm:size-4 text-purple-500" />
              </div>
              <div>
                <h3 className="text-[10px] sm:text-xs font-black text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                  {getThemeName(t, { id: "wb-cosmic-galaxy", name: "Cosmic Galaxy" })}
                </h3>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                  {getThemeDesc(t, {
                    id: "wb-cosmic-galaxy",
                    desc: "Nébuleuse stellaire violette, bleu nuit et orchidée",
                  })}
                </p>
              </div>
            </button>

            {/* Card C: Émeraude Luxe */}
            <button
              type="button"
              onClick={() => {
                updateSettings({ widgetBorderTheme: "wb-interact-emerald" });
                const name = getThemeName(t, { id: "wb-interact-emerald", name: "Océan Émeraude" });
                showCustomizationToast(t("borderAppliedToWidgets").replace("{name}", name), {
                  category: "border",
                  accentColor: "emerald",
                });
                handleSetTab("borders");
              }}
              className="group relative rounded-2xl p-2.5 sm:p-3.5 bg-white dark:bg-slate-900 text-left border-2 border-emerald-500/70 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer flex flex-col justify-between h-[120px] sm:h-[130px] overflow-hidden"
            >
              <div className="size-6 sm:size-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center p-1 sm:p-1.5 shrink-0">
                <Sparkles className="size-3.5 sm:size-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-[10px] sm:text-xs font-black text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                  {getThemeName(t, { id: "wb-interact-emerald", name: "Océan Émeraude" })}
                </h3>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                  {getThemeDesc(t, {
                    id: "wb-interact-emerald",
                    desc: "Contour émeraude au toucher",
                  })}
                </p>
              </div>
            </button>
          </div>

          {/* Full-width bottom action button */}
          <button
            type="button"
            onClick={() => handleSetTab("borders")}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 active:scale-[0.98] text-foreground font-extrabold text-xs sm:text-sm rounded-full border border-slate-200/80 dark:border-slate-700 shadow-xs transition-all cursor-pointer text-center block tracking-wide"
          >
            {t("customizeBordersBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
