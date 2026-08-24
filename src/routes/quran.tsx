import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  BookOpenText,
  CloudRain,
  Heart,
  Landmark,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Search,
  Shield,
  Sun,
  Sparkles,
  SkipBack,
  SkipForward,
  Info,
  X,
  Type,
  SlidersHorizontal,
  Volume2,
} from "lucide-react";
import { appToast } from "@/lib/app-toast";
import quranClosed from "@/assets/quran-closed.png";
import quranOpen from "@/assets/quran-open.png";
import soothingBanner from "@/assets/images/cat_soothing_banner_1785678227815.jpg";
import powerfulBanner from "@/assets/images/cat_powerful_banner_1785678243172.jpg";
import calmBanner from "@/assets/images/cat_calm_banner_1785678259540.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n, isRtl } from "@/lib/i18n";
import { useSettings } from "@/lib/app-settings";
import { getWidgetThemeById } from "@/lib/customization-themes";
import { SURAH_CATEGORIES, type SurahRef } from "@/lib/nur-data";
import { INVOCATION_CATEGORIES } from "@/lib/invocations-full";
import { audio, useTrack } from "@/lib/audio-player";
import { ALL_SURAHS, cleanAyahText, getSurahMeta, type QuranSurahMeta } from "@/lib/quran-data";
import { parseTajwidClusters, TAJWID_CATEGORY_STYLES } from "@/lib/tajwid-parser";
import { QuranStyleModal, QURAN_FONTS } from "@/components/QuranStyleModal";
import { QuranAudioMenuModal, QURAN_RECITERS } from "@/components/QuranAudioMenuModal";
import { MainQuranInlinePlayer } from "@/components/MainQuranInlinePlayer";

const TRANSLATION_EDITIONS: Record<string, string> = {
  fr: "fr.hamidullah",
  en: "en.sahih",
  ar: "ar.muyassar",
  "ar-DZ": "ar.muyassar",
  "ar-MA": "ar.muyassar",
  "ar-EG": "ar.muyassar",
  "ar-TN": "ar.muyassar",
  fa: "fa.fooladvand",
  it: "it.piccardo",
  ps: "ps.abdulwali",
  ru: "ru.kuliev",
};

function getEditionForLocale(loc: string): string {
  if (TRANSLATION_EDITIONS[loc]) return TRANSLATION_EDITIONS[loc];
  const lang = loc.split("-")[0];
  if (TRANSLATION_EDITIONS[lang]) return TRANSLATION_EDITIONS[lang];
  return "fr.hamidullah";
}

export const Route = createFileRoute("/quran")({
  head: () => ({
    meta: [
      { title: "Coran en arabe et français — Islam-Noor" },
      {
        name: "description",
        content:
          "Lisez le Coran complet en arabe avec la traduction française, écoutez les récitations et retrouvez les invocations du quotidien.",
      },
      { property: "og:title", content: "Coran en arabe et français — Islam-Noor" },
      { property: "og:description", content: "Lecture, traduction et récitations audio." },
    ],
  }),
  component: QuranPage,
});

type SurahMeta = QuranSurahMeta;

type Ayah = { number: number; numberInSurah: number; text: string };

const CATEGORY_BANNERS: Record<string, string> = {
  soothing: soothingBanner,
  powerful: powerfulBanner,
  calm: calmBanner,
};

const audioUrl = (n: number, reciterId?: string) =>
  `https://cdn.islamic.network/quran/audio-surah/128/${reciterId || "ar.alafasy"}/${n}.mp3`;

/** Per-verse recitation (global ayah number). */
const ayahUrl = (n: number, reciterId?: string) =>
  `https://cdn.islamic.network/quran/audio/128/${reciterId || "ar.alafasy"}/${n}.mp3`;

/** Play/pause a track through the global single-track player. */
function toggleTrack(id: string, src: string, playing: boolean, errMsg?: string) {
  if (playing) return audio.pause();
  void audio
    .play(id, src)
    .catch(() =>
      appToast.error(errMsg || "Recitation currently unavailable", { category: "reciter" }),
    );
}

function useFavorites() {
  const { t } = useI18n();
  const [favorites, setFavorites] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("quran_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (n: number) => {
    const isAdding = !favorites.includes(n);
    const next = isAdding ? [...favorites, n] : favorites.filter((id) => id !== n);
    setFavorites(next);
    try {
      localStorage.setItem("quran_favorites", JSON.stringify(next));
    } catch {
      // ignore
    }
    if (isAdding) {
      appToast.success(t.addedToFavorites || "Added to favorites", {
        category: "quran",
        icon: <Heart className="size-4 fill-rose-500 text-rose-500" />,
      });
    } else {
      appToast.info(t.removedFromFavorites || "Removed from favorites", {
        category: "quran",
      });
    }
  };

  return { favorites, toggleFavorite };
}

function TajwidModeSelector({
  quranMode,
  onChangeMode,
  showLegendBtn = true,
}: {
  quranMode: "normal" | "tajwid";
  onChangeMode: (mode: "normal" | "tajwid") => void;
  showLegendBtn?: boolean;
}) {
  const [showLegend, setShowLegend] = useState(false);

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="inline-flex items-center p-1 rounded-2xl bg-secondary/80 backdrop-blur-md border border-border/60 shadow-xs">
        <button
          type="button"
          onClick={() => onChangeMode("normal")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            quranMode === "normal"
              ? "bg-emerald-600 text-white shadow-xs scale-[1.02]"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span>📖</span>
          <span>Normal</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeMode("tajwid")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            quranMode === "tajwid"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs scale-[1.02] ring-1 ring-emerald-400/40"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span>🎨</span>
          <span>Tajwid</span>
        </button>
      </div>

      {showLegendBtn && quranMode === "tajwid" && (
        <button
          type="button"
          onClick={() => setShowLegend(!showLegend)}
          title="Légende des couleurs Tajwid"
          className="grid size-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition active:scale-95 cursor-pointer"
        >
          <Info className="size-4" />
        </button>
      )}

      {/* Popover Legend for Tajwid Colors */}
      {showLegend && showLegendBtn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="glass max-w-sm w-full p-5 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                <span>🎨</span>
                <span>Règles de Tajwid (Code Couleur)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="grid size-7 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="size-3 rounded-full bg-red-500 shrink-0" />
                <div>
                  <span className="font-bold text-red-600 dark:text-red-400">Madd (Rouge)</span>
                  <p className="text-[11px] text-muted-foreground">
                    Prolongations de la voix (2, 4, 5 ou 6 temps)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="size-3 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Ghunna (Vert)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Nasalisation soutenue (Nun & Mim Shaddah)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <span className="size-3 rounded-full bg-sky-500 shrink-0" />
                <div>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    Qalqala (Bleu ciel)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Rebond / résonance (ق, ط, ب, ج, د)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="size-3 rounded-full bg-purple-500 shrink-0" />
                <div>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    Ikhfa (Violet)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Dissimulation de la prononciation du Nun
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <span className="size-3 rounded-full bg-orange-500 shrink-0" />
                <div>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    Idgham (Orange)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Fusion de deux lettres (يرملون)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="size-3 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Iqlab (Jaune / Ambre)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Conversion du Nun Sakinah en Mim avant Ba
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-500/10 border border-slate-500/20">
                <span className="size-3 rounded-full bg-slate-400 shrink-0" />
                <div>
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    Lettres silencieuses (Gris)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Lettres écrites mais non prononcées
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              onClick={() => setShowLegend(false)}
            >
              J'ai compris
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RenderAyahText({
  surahNumber,
  ayahNumberInSurah,
  rawText,
  mode,
}: {
  surahNumber: number;
  ayahNumberInSurah: number;
  rawText: string;
  mode: "normal" | "tajwid";
}) {
  const cleanedText = cleanAyahText(surahNumber, ayahNumberInSurah, rawText);

  if (mode === "normal") {
    return <span>{cleanedText}</span>;
  }

  const clusters = parseTajwidClusters(cleanedText);

  return (
    <span className="transition-colors duration-300">
      {clusters.map((c, i) => {
        if (!c.category) return <span key={i}>{c.text}</span>;
        return (
          <span key={i} className={TAJWID_CATEGORY_STYLES[c.category]}>
            {c.text}
          </span>
        );
      })}
    </span>
  );
}

function QuranPage() {
  const { locale, t } = useI18n();
  const { settings, update: updateSettings } = useSettings();
  const activeWidgetTheme = getWidgetThemeById(settings.widgetTheme);
  const [opened, setOpened] = useState(false);
  const [surahs, setSurahs] = useState<QuranSurahMeta[]>(ALL_SURAHS);
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getCategoryInfo = (key: string) => {
    if (key === "soothing") return { title: t.cat_soothing_title, subtitle: t.cat_soothing_sub };
    if (key === "powerful") return { title: t.cat_powerful_title, subtitle: t.cat_powerful_sub };
    if (key === "calm") return { title: t.cat_calm_title, subtitle: t.cat_calm_sub };
    return { title: "", subtitle: "" };
  };

  if (current !== null) {
    return <SurahReader n={current} onBack={() => setCurrent(null)} />;
  }

  if (selectedCategory !== null) {
    return (
      <CategoryDetailPage
        catKey={selectedCategory}
        onBack={() => setSelectedCategory(null)}
        onSelectSurah={(n) => setCurrent(n)}
      />
    );
  }

  const filtered = surahs.filter((s) =>
    `${s.number} ${s.englishName} ${s.name}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-24 max-w-2xl mx-auto">
      {/* Zone 1: En-tête Coran & Lecteur */}
      <div
        data-widget-card
        className="rounded-[32px] p-4 sm:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
      >
        {/* Single merged widget card: Header + Book Reader */}
        <section
          data-widget-card
          className={`widget rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-xs text-white transition-all duration-300 ${
            activeWidgetTheme.animClass || ""
          }`}
          style={{
            background:
              activeWidgetTheme.gradient ||
              `linear-gradient(135deg, ${activeWidgetTheme.from}, ${activeWidgetTheme.to})`,
          }}
        >
          {/* Top header banner */}
          <div className="p-5 pb-2">
            <h1
              className="text-2xl font-extrabold text-white drop-shadow-xs"
              suppressHydrationWarning
            >
              {t.quranTitle}
            </h1>
            <p
              className="text-xs text-white/90 font-medium drop-shadow-2xs mt-0.5"
              suppressHydrationWarning
            >
              {t.quranSubtitle}
            </p>
          </div>

          {/* Bottom book reader section inside same continuous widget */}
          <div className="flex flex-col items-center p-5 pt-2">
            <img
              src={opened ? quranOpen : quranClosed}
              alt=""
              className={`h-44 object-contain transition-all duration-700 ${
                opened ? "scale-105" : "anim-float"
              }`}
              style={opened ? { animation: "nur-open-book .7s ease-out both" } : undefined}
            />
            {!opened && (
              <Button variant="glass" size="xl" className="mt-4" onClick={() => setOpened(true)}>
                {t.startReading}
              </Button>
            )}
          </div>
        </section>

        {!opened && (
          <MainQuranInlinePlayer
            onOpenSurah={(num) => {
              setOpened(true);
              setCurrent(num);
            }}
          />
        )}

        {opened && (
          <section data-widget-card className="glass p-3 space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-1">
              <div className="flex flex-1 items-center gap-2">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <Input
                  value={query}
                  maxLength={40}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.searchSurah}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>
              {/* Modern Tajwid Toggle directly next to search input */}
              <TajwidModeSelector
                quranMode={settings.quranMode}
                onChangeMode={(mode) => updateSettings({ quranMode: mode })}
              />
            </div>

            {/* Mini Player placed between search widget and surah list */}
            <MainQuranInlinePlayer
              onOpenSurah={(num) => {
                setCurrent(num);
              }}
            />
            <div className="mt-2 max-h-96 space-y-1 overflow-auto">
              {!surahs.length && (
                <div className="flex justify-center py-6">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {filtered.map((s) => (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => setCurrent(s.number)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-accent"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold bg-secondary text-secondary-foreground">
                    {s.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{s.englishName}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {s.englishNameTranslation} · {s.numberOfAyahs} {t.verses}
                    </span>
                  </span>
                  <span className="font-[var(--font-arabic)] text-lg">{s.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Zone 2: Section Invocations du quotidien */}
      <div
        data-widget-card
        className="rounded-[32px] p-4 sm:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
      >
        <section className="space-y-3.5">
          {/* Sous-widget d'en-tête dynamique pour Invocations du quotidien */}
          <div
            data-widget-card
            className={`relative rounded-3xl p-4 sm:p-5 text-white shadow-md border border-white/20 overflow-hidden transition-all duration-300 flex items-center justify-between ${
              activeWidgetTheme.animClass || ""
            }`}
            style={{
              background:
                activeWidgetTheme.gradient ||
                `linear-gradient(135deg, ${activeWidgetTheme.from}, ${activeWidgetTheme.to})`,
            }}
          >
            <div>
              <h2
                className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-xs"
                suppressHydrationWarning
              >
                {t.invocationsTitle}
              </h2>
              <p
                className="text-xs text-white/90 font-medium drop-shadow-2xs mt-0.5"
                suppressHydrationWarning
              >
                {t.invocationsCatCount}
              </p>
            </div>
            <div className="grid size-9 sm:size-10 place-items-center rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/25 shadow-xs shrink-0">
              <BookOpenText className="size-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {INVOCATION_CATEGORIES.map((c) => {
              const langKey = locale.split("-")[0];
              const label = c.label[locale] || c.label[langKey] || c.label.fr;
              const CategoryIcon =
                c.icon === "sunrise"
                  ? Sun
                  : c.icon === "mosque"
                    ? Landmark
                    : c.icon === "shield"
                      ? Shield
                      : CloudRain;

              return (
                <Link
                  key={c.key}
                  to="/invocations/$cat"
                  params={{ cat: c.key }}
                  data-widget-card
                  className="group relative h-40 w-full overflow-hidden rounded-3xl p-4 text-left shadow-xs transition-all duration-300 hover:shadow-md active:scale-[0.98] flex flex-col justify-end"
                >
                  <img
                    src={c.coverImage}
                    alt={label}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 size-full object-cover anim-kenburns transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Crisp original image with light bottom gradient for text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="relative z-10 flex flex-col gap-1.5">
                    <span className="grid size-8 place-items-center rounded-xl bg-white/20 backdrop-blur-md text-white shadow-xs border border-white/20 w-fit">
                      <CategoryIcon className="size-4" />
                    </span>
                    <h3 className="text-sm font-bold text-white leading-tight drop-shadow-xs">
                      {label}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* Zone 3: Section Catégories de sourates */}
      <div
        data-widget-card
        className="rounded-[32px] p-4 sm:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
      >
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="grid size-7 sm:size-8 place-items-center rounded-xl text-white shadow-xs"
                style={{
                  background:
                    activeWidgetTheme.gradient ||
                    `linear-gradient(135deg, ${activeWidgetTheme.from}, ${activeWidgetTheme.to})`,
                }}
              >
                <Sparkles className="size-4" />
              </span>
              <h2
                className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white"
                suppressHydrationWarning
              >
                {t.surahCategoriesTitle}
              </h2>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-xs border border-white/20 shrink-0"
              style={{
                background:
                  activeWidgetTheme.gradient ||
                  `linear-gradient(135deg, ${activeWidgetTheme.from}, ${activeWidgetTheme.to})`,
              }}
              suppressHydrationWarning
            >
              {t.surahCategoriesCount}
            </span>
          </div>

          <div className="space-y-4">
            {SURAH_CATEGORIES.map((cat) => {
              const bannerImg = CATEGORY_BANNERS[cat.key] || soothingBanner;
              const catInfo = getCategoryInfo(cat.key);

              return (
                <div
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  data-widget-card
                  className="group relative h-44 sm:h-48 w-full overflow-hidden rounded-[1.85rem] p-5 text-left shadow-xs transition-all duration-300 hover:shadow-md active:scale-[0.98] cursor-pointer flex flex-col justify-between border border-slate-200/40 dark:border-slate-800/40"
                >
                  {/* Official Banner Image */}
                  <img
                    src={bannerImg}
                    alt={catInfo.title}
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Crisp original banner image with light bottom gradient for text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Top badge */}
                  <div className="relative z-10 flex justify-end">
                    <span className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] font-extrabold text-white border border-white/20 shadow-xs uppercase tracking-wider">
                      {cat.items.length} {t.surahLabel}s
                    </span>
                  </div>

                  {/* Bottom title & Explorer button */}
                  <div className="relative z-10 flex items-end justify-between gap-3">
                    <div className="space-y-1 max-w-[72%]">
                      <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug drop-shadow-md">
                        {catInfo.title}
                      </h3>
                      <p className="text-xs text-white/90 line-clamp-1 drop-shadow-xs font-medium">
                        {catInfo.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(cat.key);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-md px-4 py-2 text-xs font-bold text-white border border-white/30 shadow-xs transition-all active:scale-95 shrink-0"
                    >
                      {t.exploreBtn}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function CategoryDetailPage({
  catKey,
  onBack,
  onSelectSurah,
}: {
  catKey: string;
  onBack: () => void;
  onSelectSurah: (n: number) => void;
}) {
  const { t } = useI18n();
  const category = SURAH_CATEGORIES.find((c) => c.key === catKey) || SURAH_CATEGORIES[0];
  const banner = CATEGORY_BANNERS[catKey] || soothingBanner;
  const { favorites, toggleFavorite } = useFavorites();

  const catInfo =
    catKey === "soothing"
      ? { title: t.cat_soothing_title, subtitle: t.cat_soothing_sub }
      : catKey === "powerful"
        ? { title: t.cat_powerful_title, subtitle: t.cat_powerful_sub }
        : { title: t.cat_calm_title, subtitle: t.cat_calm_sub };

  return (
    <div className="min-h-screen pb-28 bg-slate-50 dark:bg-slate-950">
      {/* Top Banner (Ratio 20:9 format mobile, ~30% height) */}
      <div className="relative h-60 sm:h-72 w-full overflow-hidden rounded-b-[2.2rem] shadow-lg">
        {/* Official Banner Image */}
        <img
          src={banner}
          alt={catInfo.title}
          className="size-full object-cover object-center scale-105"
        />

        {/* Light black transparent gradient at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Top bar back button */}
        <div className="absolute top-4 left-4 z-20 pt-[max(0.25rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onBack}
            aria-label={t.back}
            className="grid size-10 place-items-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-md"
          >
            <ArrowLeft className="size-5" />
          </button>
        </div>

        {/* Title & Subtitle overlaid on lower banner */}
        <div className="absolute bottom-0 inset-x-0 p-5 z-10 flex flex-col gap-1 text-white">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-0.5 text-[10px] font-extrabold text-white border border-white/25 shadow-xs uppercase tracking-wider">
              {category.items.length} {t.recommendedSurahsBadge}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold leading-tight text-white drop-shadow-md">
            {catInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-white/90 drop-shadow-xs max-w-md font-medium">
            {catInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Surah List */}
      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-3.5">
        <MainQuranInlinePlayer onOpenSurah={onSelectSurah} />

        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
            {t.surahsInCategory}
          </h2>
          <span className="text-xs text-slate-500 font-medium">{t.recitationsSelected}</span>
        </div>

        {category.items.map((surah) => (
          <CategorySurahCard
            key={surah.n}
            surah={surah}
            isFav={favorites.includes(surah.n)}
            onToggleFavorite={() => toggleFavorite(surah.n)}
            onRead={() => onSelectSurah(surah.n)}
          />
        ))}
      </div>
    </div>
  );
}

function CategorySurahCard({
  surah,
  isFav,
  onToggleFavorite,
  onRead,
}: {
  surah: SurahRef;
  isFav: boolean;
  onToggleFavorite: () => void;
  onRead: () => void;
}) {
  const { t } = useI18n();
  const { settings } = useSettings();
  const id = `surah-${surah.n}`;
  const { playing } = useTrack(id);

  return (
    <article className="group relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800/80 transition-all duration-200 hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Number, Transliterated Name, Duration & Arabic */}
      <div className="flex items-center justify-between sm:justify-start gap-3.5 min-w-0 flex-1">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#388E6C] dark:text-emerald-400 font-extrabold text-sm border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
            {surah.n}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                {surah.name}
              </h3>
              {surah.duration && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                  {surah.duration}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {t.surahLabel} {surah.n} · {t.alafasyRecitation}
            </p>
          </div>
        </div>

        {/* Arabic Name */}
        <div className="shrink-0 pl-2 text-right">
          <span className="font-[var(--font-arabic)] text-2xl font-bold text-slate-900 dark:text-emerald-400 leading-none">
            {surah.arabic}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        {/* Favorite Button */}
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFav ? t.remove : t.save}
          className={`grid size-9 place-items-center rounded-full transition-all active:scale-90 ${
            isFav
              ? "bg-rose-50 dark:bg-rose-950/50 text-rose-500 border border-rose-200 dark:border-rose-900 shadow-2xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <Heart className={`size-4.5 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>

        {/* Read Full Surah Verses */}
        <button
          type="button"
          onClick={onRead}
          aria-label={t.readBtn}
          title={t.readBtn}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors active:scale-95 cursor-pointer"
        >
          <BookOpen className="size-3.5" />
          <span>{t.readBtn}</span>
        </button>

        {/* Play / Pause Recitation Button */}
        <button
          type="button"
          onClick={() => {
            if (playing) {
              audio.pause();
            } else {
              void audio.playSurah(surah.n, { reciterId: settings.quranReciter }).catch(() =>
                appToast.error(t.recitationUnavailable || "Recitation currently unavailable", {
                  category: "reciter",
                }),
              );
            }
          }}
          aria-label={playing ? t.stop : t.listen}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer ${
            playing
              ? "bg-[#388E6C] text-white ring-2 ring-[#388E6C]/30"
              : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
          }`}
        >
          {playing ? (
            <Pause className="size-3.5 fill-current" />
          ) : (
            <Play className="size-3.5 fill-current" />
          )}
          <span>{playing ? t.stop : t.listen}</span>
        </button>
      </div>
    </article>
  );
}

const surahAyahCache = new Map<
  string,
  { arabic: Ayah[]; translatedAyahs: Ayah[]; title: string }
>();

function SurahReader({ n, onBack }: { n: number; onBack: () => void }) {
  const { locale, t } = useI18n();
  const { settings, update: updateSettings } = useSettings();
  const edition = getEditionForLocale(locale);
  const cacheKey = `${n}_${edition}`;
  const cachedSurah = surahAyahCache.get(cacheKey);

  const [arabic, setArabic] = useState<Ayah[]>(() => cachedSurah?.arabic ?? []);
  const [translatedAyahs, setTranslatedAyahs] = useState<Ayah[]>(
    () => cachedSurah?.translatedAyahs ?? [],
  );
  const [title, setTitle] = useState(() => cachedSurah?.title ?? "");
  const [loading, setLoading] = useState(!cachedSurah);

  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);

  useEffect(() => {
    if (surahAyahCache.has(cacheKey)) {
      const c = surahAyahCache.get(cacheKey)!;
      setArabic(c.arabic);
      setTranslatedAyahs(c.translatedAyahs);
      setTitle(c.title);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`https://api.alquran.cloud/v1/surah/${n}/editions/quran-uthmani,${edition}`)
      .then((r) => r.json())
      .then((j) => {
        const a = j.data?.[0]?.ayahs ?? [];
        const tr = j.data?.[1]?.ayahs ?? [];
        const ti = `${j.data?.[0]?.englishName ?? ""} · ${j.data?.[0]?.name ?? ""}`;
        setArabic(a);
        setTranslatedAyahs(tr);
        setTitle(ti);
        surahAyahCache.set(cacheKey, { arabic: a, translatedAyahs: tr, title: ti });
      })
      .catch(() =>
        appToast.error(t.surahUnavailable || "Surah currently unavailable", { category: "quran" }),
      )
      .finally(() => setLoading(false));
  }, [n, edition, cacheKey, t]);

  const activeFontClass =
    QURAN_FONTS.find((f) => f.id === (settings.quranFont || "uthmani"))?.fontClass ||
    "quran-font-uthmani";
  const fontSize = settings.quranFontSize || 28;
  const lineHeight = settings.quranLineHeight || 2.2;
  const letterSpacing = settings.quranLetterSpacing ?? 0;

  return (
    <div className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-24">
      {/* Top Navigation & Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="glass" size="icon-lg" onClick={onBack} aria-label={t.back}>
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="truncate text-base sm:text-lg font-extrabold">
              {title || `${t.surahLabel} ${n}`}
            </h1>
          </div>
        </div>

        {/* Customization Toolbar: Style, Mode, Audio */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl glass border border-border/60 bg-secondary/30">
          <TajwidModeSelector
            quranMode={settings.quranMode}
            onChangeMode={(mode) => updateSettings({ quranMode: mode })}
          />

          <div className="flex items-center gap-1.5">
            {/* Style Customization Button */}
            <button
              type="button"
              onClick={() => setShowStyleModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/70 hover:bg-secondary text-xs font-extrabold text-foreground transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Type className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.styleLabel}</span>
            </button>

            {/* Audio Options Menu Button */}
            <button
              type="button"
              onClick={() => setShowAudioModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/70 hover:bg-secondary text-xs font-extrabold text-foreground transition active:scale-95 cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.audioLabel}</span>
            </button>
          </div>
        </div>
      </div>

      <AudioCardBar n={n} />

      {/* Standard Basmala Header Banner for all Surahs except At-Tawbah (Surah 9) */}
      {n !== 9 && (
        <div
          data-widget-card
          className="glass p-5 text-center my-4 space-y-1.5 rounded-3xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-xs"
        >
          <p
            dir="rtl"
            className={`text-2xl font-bold text-emerald-800 dark:text-emerald-300 tracking-wide leading-relaxed ${activeFontClass}`}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="text-[11px] font-medium text-muted-foreground italic">
            {t.basmalaTranslation}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {arabic.map((a, i) => (
            <article key={a.numberInSurah} data-widget-card className="glass p-4 rounded-3xl">
              <span className="inline-grid size-6 place-items-center rounded-full text-[10px] font-bold bg-secondary text-secondary-foreground">
                {a.numberInSurah}
              </span>
              <p
                dir="rtl"
                className={`mt-2 font-bold text-foreground transition-all duration-200 ${activeFontClass}`}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  letterSpacing: `${letterSpacing}px`,
                }}
              >
                <RenderAyahText
                  surahNumber={n}
                  ayahNumberInSurah={a.numberInSurah}
                  rawText={a.text}
                  mode={settings.quranMode}
                />
              </p>
              <p
                className="mt-2 text-xs sm:text-sm text-muted-foreground"
                dir={isRtl(locale) ? "rtl" : "ltr"}
              >
                {translatedAyahs[i]?.text}
              </p>
              <AyahAudio n={a.number} surahNumber={n} ayahNumberInSurah={a.numberInSurah} />
            </article>
          ))}
        </div>
      )}

      {/* Style Customization Modal */}
      <QuranStyleModal isOpen={showStyleModal} onClose={() => setShowStyleModal(false)} />

      {/* Audio Options Modal */}
      <QuranAudioMenuModal
        isOpen={showAudioModal}
        onClose={() => setShowAudioModal(false)}
        currentSurahNum={n}
      />
    </div>
  );
}

function AudioCardBar({ n }: { n: number }) {
  const { t } = useI18n();
  const { settings } = useSettings();
  const id = `surah-${n}`;
  const { playing, time } = useTrack(id);

  const handlePlaySurah = () => {
    if (playing) {
      audio.pause();
    } else {
      void audio.playSurah(n, { reciterId: settings.quranReciter }).catch(() =>
        appToast.error(t.recitationUnavailable || "Recitation currently unavailable", {
          category: "reciter",
        }),
      );
    }
  };

  return (
    <div className="mt-3 flex gap-2">
      <Button
        variant="widget"
        size="xl"
        className="flex-1 cursor-pointer"
        onClick={handlePlaySurah}
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        {playing ? t.stop : t.listen}
      </Button>
      <Button
        variant="soft"
        size="xl"
        aria-label={t.reset}
        disabled={!playing && time === 0}
        onClick={() => audio.reset(id)}
        className="cursor-pointer"
      >
        <RotateCcw className="size-4" />
      </Button>
    </div>
  );
}

function AyahAudio({
  n,
  surahNumber,
  ayahNumberInSurah,
}: {
  n: number;
  surahNumber?: number;
  ayahNumberInSurah?: number;
}) {
  const { t } = useI18n();
  const { settings } = useSettings();
  const id =
    surahNumber && ayahNumberInSurah ? `ayah-${surahNumber}-${ayahNumberInSurah}` : `ayah-${n}`;
  const { playing, time } = useTrack(id);

  const handlePlayAyah = () => {
    if (playing) {
      audio.pause();
    } else {
      void audio
        .playAyah(surahNumber || 1, ayahNumberInSurah || 1, n, {
          reciterId: settings.quranReciter,
        })
        .catch(() =>
          appToast.error(t.recitationUnavailable || "Recitation currently unavailable", {
            category: "reciter",
          }),
        );
    }
  };

  return (
    <div className="mt-2 flex items-center gap-1.5">
      <button
        type="button"
        onClick={handlePlayAyah}
        className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold cursor-pointer"
      >
        {playing ? <Pause className="size-3" /> : <Play className="size-3" />}
        {playing ? t.stop : t.listen}
      </button>
      <button
        type="button"
        onClick={() => audio.reset(id)}
        disabled={!playing && time === 0}
        aria-label={t.reset}
        title={t.reset}
        className="inline-flex size-6 items-center justify-center rounded-full bg-accent disabled:opacity-40 cursor-pointer"
      >
        <RotateCcw className="size-3" />
      </button>
    </div>
  );
}
