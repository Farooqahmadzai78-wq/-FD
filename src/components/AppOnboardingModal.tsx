import { useState, useEffect, useRef } from "react";
import {
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Globe,
  MapPin,
  Palette,
  Play,
  Pause,
  QrCode,
  Search,
  Sparkles,
  Volume2,
  AlertCircle,
  ShieldCheck,
  Award,
} from "lucide-react";
import logo from "@/assets/images/splash_logo_crescent_1786275718969.jpg";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/app-settings";
import { useI18n, LOCALE_LABELS, type LocaleCode } from "@/lib/i18n";
import { playClick, playConfirm } from "@/lib/sfx";
import { vibrate } from "@/lib/vibration";
import {
  isOnboardingCompleted,
  setOnboardingCompleted,
  subscribeToOnboardingOpen,
} from "@/lib/onboarding-state";

function ModernQiblaCompassIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="qiblaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="qiblaEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Outer Dial Bezel Ring */}
      <circle cx="32" cy="32" r="28" stroke="url(#qiblaGoldGrad)" strokeWidth="2.5" />
      <circle
        cx="32"
        cy="32"
        r="24"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
        strokeDasharray="2 2"
      />
      {/* Cardinal Points */}
      <circle cx="32" cy="8" r="2" fill="#eab308" />
      <circle cx="56" cy="32" r="2" fill="#eab308" />
      <circle cx="32" cy="56" r="2" fill="#eab308" />
      <circle cx="8" cy="32" r="2" fill="#eab308" />
      {/* 8-Point Islamic Star Rosette in background */}
      <path
        d="M32 15 L35 29 L49 32 L35 35 L32 49 L29 35 L15 32 L29 29 Z"
        fill="url(#qiblaGoldGrad)"
        opacity="0.25"
      />
      {/* North Qibla Needle */}
      <polygon points="32,8 36,32 32,28 28,32" fill="url(#qiblaEmeraldGrad)" />
      <polygon points="32,8 32,28 28,32" fill="#047857" />
      {/* South Counter Needle */}
      <polygon points="32,56 36,32 32,36 28,32" fill="#ef4444" opacity="0.85" />
      <polygon points="32,56 32,36 28,32" fill="#b91c1c" opacity="0.9" />
      {/* Center Pivot Emblem */}
      <circle
        cx="32"
        cy="32"
        r="4.5"
        fill="#09090b"
        stroke="url(#qiblaGoldGrad)"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="32" r="1.5" fill="#fbbf24" />
    </svg>
  );
}

function MiniKaaba3D({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <ellipse cx="24" cy="40" rx="15" ry="4" fill="black" opacity="0.25" />
      <path d="M24 6 L40 14 L40 36 L24 44 L8 36 L8 14 Z" fill="#18181b" />
      <path d="M8 14 L24 22 L24 44 L8 36 Z" fill="#09090b" opacity="0.9" />
      <path d="M24 22 L40 14 L40 36 L24 44 Z" fill="#27272a" />
      <path d="M24 6 L40 14 L24 22 L8 14 Z" fill="#3f3f46" />
      <path d="M8 19 L24 27 L40 19 L40 22 L24 30 L8 22 Z" fill="#facc15" />
      <path d="M28 27 L34 24 L34 35 L28 38 Z" fill="#eab308" stroke="#fef08a" strokeWidth="0.5" />
    </svg>
  );
}

export function AppOnboardingModal({ onComplete }: { onComplete: () => void }) {
  const { settings, update } = useSettings();
  const { t } = useI18n();

  const [step, setStep] = useState<number>(0);
  const [visible, setVisible] = useState(false);
  const [langSearch, setLangSearch] = useState("");

  // Slide 1 (Prayer) state
  const [isPlayingAdhanDemo, setIsPlayingAdhanDemo] = useState(false);
  const [selectedReminderOffset, setSelectedReminderOffset] = useState<number>(15);
  const [checkedPrayers, setCheckedPrayers] = useState<Record<string, boolean>>({
    fajr: true,
    dhuhr: true,
    asr: false,
    maghrib: false,
    isha: false,
  });

  // Slide 2 (Quran) state
  const [activeQuranTab, setActiveQuranTab] = useState<"arabic" | "translit" | "translation">(
    "arabic",
  );
  const [selectedReciterDemo, setSelectedReciterDemo] = useState("alafasy");

  // Slide 3 (Halal) state
  const [activeHalalSample, setActiveHalalSample] = useState<"halal" | "doubtful" | "haram">(
    "halal",
  );

  // Slide 4 (Tasbih) state
  const [tasbihCount, setTasbihCount] = useState<number>(12);
  const [tasbihPhraseIndex, setTasbihPhraseIndex] = useState<number>(0);

  // Slide 5 (Qibla) state
  const [isQiblaAligned, setIsQiblaAligned] = useState(false);

  // Slide 6 (Themes) state
  const [selectedThemePreview, setSelectedThemePreview] = useState<string>(
    settings.widgetTheme || "w-grad-vert-chartreuse",
  );

  const audioToneIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOnboardingCompleted()) {
      setVisible(true);
      document.body.style.overflow = "hidden";
    }

    const unsubscribe = subscribeToOnboardingOpen(() => {
      setStep(0);
      setVisible(true);
      document.body.style.overflow = "hidden";
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioToneIntervalRef.current) {
        clearInterval(audioToneIntervalRef.current);
        audioToneIntervalRef.current = null;
      }
    };
  }, [step]);

  if (!visible) return null;

  const totalSlides = 6;

  const handleSelectLanguage = (langCode: LocaleCode) => {
    playClick();
    vibrate("button");
    update({ language: langCode });
  };

  const handleNext = () => {
    playClick();
    vibrate("button");
    if (step < totalSlides) {
      setStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    playClick();
    vibrate("button");
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    playClick();
    handleComplete();
  };

  const handleComplete = () => {
    setOnboardingCompleted(true);
    document.body.style.overflow = "";
    setVisible(false);
    onComplete();
  };

  const toggleAdhanDemoSound = () => {
    vibrate("button");
    if (isPlayingAdhanDemo) {
      setIsPlayingAdhanDemo(false);
      if (audioToneIntervalRef.current) {
        clearInterval(audioToneIntervalRef.current);
        audioToneIntervalRef.current = null;
      }
    } else {
      setIsPlayingAdhanDemo(true);
      playConfirm();
      let note = 0;
      const notes = [440, 493.88, 554.37, 659.25, 554.37, 440];
      audioToneIntervalRef.current = setInterval(() => {
        note = (note + 1) % notes.length;
        if (note === 0) {
          setIsPlayingAdhanDemo(false);
          if (audioToneIntervalRef.current) {
            clearInterval(audioToneIntervalRef.current);
            audioToneIntervalRef.current = null;
          }
        }
      }, 700);
    }
  };

  const handlePrayerToggle = (prayerKey: string) => {
    playConfirm();
    vibrate("button");
    setCheckedPrayers((prev) => ({ ...prev, [prayerKey]: !prev[prayerKey] }));
  };

  const handleTasbihTap = () => {
    playClick();
    vibrate("button");
    setTasbihCount((prev) => {
      const next = prev + 1;
      if (next >= 33) {
        playConfirm();
        setTasbihPhraseIndex((p) => (p + 1) % 3);
        return 0;
      }
      return next;
    });
  };

  const tasbihPhrases = [
    { ar: "سُبْحَانَ اللَّهِ", fr: "SubhanAllah", meaning: "Gloire et Pureté à Allah", target: 33 },
    {
      ar: "الْحَمْدُ لِلَّهِ",
      fr: "Alhamdulillah",
      meaning: "Toutes les louanges sont à Allah",
      target: 33,
    },
    { ar: "اللَّهُ أَكْبَرُ", fr: "Allahu Akbar", meaning: "Allah est le Plus Grand", target: 34 },
  ];

  const currentTasbih = tasbihPhrases[tasbihPhraseIndex];

  const themePresets = [
    {
      id: "w-grad-vert-chartreuse",
      name: "Vert Chartreuse",
      grad: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      color: "#38ef7d",
    },
    {
      id: "w-grad-ambre-dore",
      name: "Ambre Doré",
      grad: "linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)",
      color: "#ffaf7b",
    },
    {
      id: "w-solid-bleu",
      name: "Bleu Impérial",
      grad: "linear-gradient(135deg, #0396ff 0%, #3b82f6 100%)",
      color: "#3b82f6",
    },
    {
      id: "w-grad-sunset-warm",
      name: "Coucher de Soleil",
      grad: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
      color: "#f5af19",
    },
    {
      id: "w-grad-purple-night",
      name: "Nuit Violette",
      grad: "linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)",
      color: "#8f94fb",
    },
    {
      id: "w-grad-emerald-dark",
      name: "Émeraude Royale",
      grad: "linear-gradient(135deg, #0575e6 0%, #00f260 100%)",
      color: "#00f260",
    },
  ];

  const slideTitles = [
    { title: "Langue & Région", sub: "Personnalisation linguistique" },
    { title: "Horaires de Prière & Azan", sub: "Calculs précis & rappels" },
    { title: "Le Saint Coran & Tajwid", sub: "Lecture & récitations audio" },
    { title: "Scan & Analyse Halal", sub: "Détection des additifs E-numbers" },
    { title: "Tasbih & Invocations", sub: "Dhikr haptique & invocations" },
    { title: "Qibla & Mosquées", sub: "Boussole 3D & Mawaqit" },
    { title: "Style & Thème Visual", sub: "Personnalisation des widgets" },
  ];

  return (
    <div className="fixed inset-0 z-[99998] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-300 select-none">
      <div className="w-full max-w-xl bg-card/95 text-card-foreground border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-[0_25px_60px_-15px_rgba(245,158,11,0.2)] relative overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] h-auto backdrop-saturate-150">
        {/* Background Islamic Watermark Star Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 400 400"
            className="size-[500px] text-amber-500 fill-current animate-[spin_180s_linear_infinite]"
          >
            <path d="M200 20 L230 130 L340 100 L270 190 L380 230 L270 270 L340 360 L230 330 L200 440 L170 330 L60 360 L130 270 L20 230 L130 190 L60 100 L170 130 Z" />
          </svg>
        </div>

        {/* Subtle Decorative Ambient Glows */}
        <div className="absolute -top-28 -right-28 size-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 size-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* TOP HEADER (Sleek Glass Bar) */}
        <div className="shrink-0 mb-3 relative z-10">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="size-9 sm:size-10 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 p-1 border border-amber-500/30 flex items-center justify-center shadow-xs">
                <img src={logo} alt="Islam-Noor" className="size-full object-contain rounded-xl" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-black text-base sm:text-lg text-foreground tracking-tight leading-tight">
                    Islam-Noor
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    v3.0 Premium
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground block">
                  {slideTitles[step]?.title} • {slideTitles[step]?.sub}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-bold text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-xl hover:bg-muted/80 transition cursor-pointer"
              >
                {t.onboardingSkip || "Passer"}
              </button>
            </div>
          </div>

          {/* Stepper Interactive Pills */}
          <div className="grid grid-cols-7 gap-1.5 mt-3">
            {Array.from({ length: 7 }).map((_, idx) => {
              const isActive = idx <= step;
              const isCurrent = idx === step;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    playClick();
                    setStep(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isCurrent
                      ? "bg-amber-500 shadow-sm shadow-amber-500/40 ring-2 ring-amber-500/30"
                      : isActive
                        ? "bg-amber-500/60"
                        : "bg-muted/60 hover:bg-muted"
                  }`}
                  title={`Étape ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* MIDDLE SCROLLABLE CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 my-1 relative z-10 space-y-4">
          {/* ============================================================ */}
          {/* STEP 0: LANGUAGE SELECTION                                   */}
          {/* ============================================================ */}
          {step === 0 && (
            <div className="space-y-3 animate-in slide-in-from-right duration-300">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 border border-amber-500/20 flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-xs">
                  <Globe className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-foreground font-serif tracking-tight truncate">
                      {t.selectLanguageTitle || "Choisissez votre langue"}
                    </h2>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                      50 langues
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.selectLanguageSub ||
                      "Islam-Noor s'adapte instantanément à votre langue choisie."}
                  </p>
                </div>
              </div>

              {/* Language Search & Selected Language Banner */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher parmi 50 langues (Français, العربية, English, Urdu...)..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-2xl bg-muted/40 border border-border/80 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-muted-foreground/60"
                  />
                </div>

                <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 shadow-xs">
                  <span className="flex items-center gap-2 font-medium truncate">
                    <Sparkles className="size-3.5 text-emerald-500 shrink-0" />
                    <span>
                      Langue active :{" "}
                      <b className="text-foreground font-bold">
                        {LOCALE_LABELS[settings.language]}
                      </b>
                    </span>
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md shrink-0 ml-2">
                    Actif
                  </span>
                </div>
              </div>

              {/* Language Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] sm:max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                {(Object.keys(LOCALE_LABELS) as LocaleCode[])
                  .filter(
                    (code) =>
                      LOCALE_LABELS[code].toLowerCase().includes(langSearch.toLowerCase()) ||
                      code.toLowerCase().includes(langSearch.toLowerCase()),
                  )
                  .map((code) => {
                    const label = LOCALE_LABELS[code];
                    const isSelected = settings.language === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleSelectLanguage(code)}
                        className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/40 shadow-xs"
                            : "border-border/60 bg-card hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="size-2 rounded-full bg-amber-500/80 shrink-0" />
                          <span className="truncate">{label}</span>
                        </div>
                        {isSelected ? (
                          <CheckCircle2 className="size-4 shrink-0 text-amber-500" />
                        ) : (
                          <span className="size-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 1: PRAYER TIMES, ADHAN & SMART REMINDERS                */}
          {/* ============================================================ */}
          {step === 1 && (
            <div className="space-y-3.5 animate-in slide-in-from-right duration-300">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 border border-amber-500/20 flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-xs">
                  <Bell className="size-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-foreground font-serif tracking-tight">
                    {t.onboardingStep1Title || "Horaires de Prière & Rappels"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Calculs astronomiques exacts pour votre ville avec Azan audio.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border/80 bg-card/80 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      Prochaine prière
                    </span>
                    <div className="text-base font-extrabold font-serif text-foreground">
                      Maghrib — 19:42{" "}
                      <span className="text-xs font-normal text-muted-foreground font-sans">
                        (-01h 18m)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleAdhanDemoSound}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs ${
                      isPlayingAdhanDemo
                        ? "bg-amber-500 text-slate-950 ring-2 ring-amber-400"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30"
                    }`}
                  >
                    {isPlayingAdhanDemo ? (
                      <Pause className="size-4 animate-spin" />
                    ) : (
                      <Play className="size-4" />
                    )}
                    <span>
                      {isPlayingAdhanDemo
                        ? t.guideAdhanPlaying || "Lecture Azan..."
                        : t.guidePrayerAdhanDemo || "Écouter l'Azan"}
                    </span>
                  </button>
                </div>

                {/* 5 Prayer Cards Grid */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  {[
                    { key: "fajr", name: "Fajr", time: "05:28" },
                    { key: "dhuhr", name: "Dhuhr", time: "13:15" },
                    { key: "asr", name: "Asr", time: "16:45" },
                    { key: "maghrib", name: "Maghrib", time: "19:42", highlight: true },
                    { key: "isha", name: "Isha", time: "21:10" },
                  ].map((p) => {
                    const isDone = checkedPrayers[p.key];
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => handlePrayerToggle(p.key)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          p.highlight
                            ? "border-amber-500 bg-amber-500/20 text-foreground font-bold ring-1 ring-amber-500/40"
                            : isDone
                              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                              : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        <div className="text-[10px] font-bold truncate">{p.name}</div>
                        <div className="text-xs font-mono font-black">{p.time}</div>
                        <div className="mt-1">
                          {isDone ? (
                            <Check className="size-3.5 mx-auto text-emerald-500" />
                          ) : (
                            <span className="size-2 rounded-full bg-muted-foreground/30 mx-auto block" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Reminder Selector */}
                <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold text-xs flex items-center gap-1.5">
                    <Volume2 className="size-4 text-amber-500" />
                    Rappel avant Azan :
                  </span>
                  <div className="flex items-center gap-1">
                    {[5, 15, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          playClick();
                          setSelectedReminderOffset(mins);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          selectedReminderOffset === mins
                            ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {mins} {t.unitMin || "min"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: HOLY QURAN, TAJWEED & AUDIO RECITATIONS               */}
          {/* ============================================================ */}
          {step === 2 && (
            <div className="space-y-3.5 animate-in slide-in-from-right duration-300">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-xs">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-foreground font-serif tracking-tight">
                    {t.onboardingStep2Title || "Le Saint Coran & Tajwid"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Texte coranique authentique, règle du Tajwid en couleur et récitations.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border/80 bg-card/80 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Ayat Al-Kursi (2:255)
                  </span>

                  <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveQuranTab("arabic")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activeQuranTab === "arabic"
                          ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Arabe
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQuranTab("translit")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activeQuranTab === "translit"
                          ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Phonétique
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQuranTab("translation")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activeQuranTab === "translation"
                          ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Traduction
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-emerald-500/25 text-center space-y-2.5">
                  {activeQuranTab === "arabic" && (
                    <p
                      className="font-arabic text-xl sm:text-2xl leading-loose text-foreground font-bold"
                      dir="rtl"
                    >
                      اللَّهُ <span className="text-purple-500">لَا إِلَٰهَ</span> إِلَّا هُوَ{" "}
                      <span className="text-emerald-500 font-extrabold">الْحَيُّ</span> الْقَيُّومُ
                    </p>
                  )}
                  {activeQuranTab === "translit" && (
                    <p className="text-xs font-bold italic text-foreground leading-relaxed">
                      "Allahu laaa ilaaha illaa Huwal-Hayyul-Qayyoom..."
                    </p>
                  )}
                  {activeQuranTab === "translation" && (
                    <p className="text-xs font-semibold text-foreground leading-relaxed">
                      « Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par
                      Lui-même. »
                    </p>
                  )}

                  <div className="pt-2 border-t border-border/40 flex items-center justify-center gap-3 text-[10px] font-bold text-muted-foreground">
                    <span className="text-purple-500 flex items-center gap-1">
                      ● Madd (Allongement)
                    </span>
                    <span className="text-emerald-500 flex items-center gap-1">
                      ● Ghunnah (Nasalisation)
                    </span>
                    <span className="text-sky-500 flex items-center gap-1">● Qalqalah</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-xs text-muted-foreground font-semibold">Récitateur :</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: "alafasy", name: "Mishary Alafasy" },
                      { id: "abdulbasit", name: "Abdul Basit" },
                      { id: "ghamdi", name: "Saad Al-Ghamidi" },
                    ].map((reciter) => (
                      <button
                        key={reciter.id}
                        type="button"
                        onClick={() => {
                          playClick();
                          setSelectedReciterDemo(reciter.id);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          selectedReciterDemo === reciter.id
                            ? "border-emerald-500 bg-emerald-500/20 text-foreground font-bold ring-1 ring-emerald-500/30"
                            : "border-border bg-card text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {reciter.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: HALAL SCANNER                                        */}
          {/* ============================================================ */}
          {step === 3 && (
            <div className="space-y-3.5 animate-in slide-in-from-right duration-300">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-500/10 via-card to-sky-500/5 border border-sky-500/20 flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30 shadow-xs">
                  <QrCode className="size-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-foreground font-serif tracking-tight">
                    {t.onboardingStep3Title || "Scanner & Analyseur Halal"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Analyse immédiate du code-barres et des ingrédients (Additifs, Gélatine).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border/80 bg-card/80 space-y-3 shadow-xs">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "halal", label: "🟢 Halal", title: "Flocons d'avoine" },
                    { id: "doubtful", label: "🟡 Douteux", title: "Gélules E471" },
                    { id: "haram", label: "🔴 Haram", title: "Gélatine Porcine" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playClick();
                        setActiveHalalSample(item.id as "halal" | "doubtful" | "haram");
                      }}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        activeHalalSample === item.id
                          ? "border-amber-500 bg-amber-500/15 font-bold text-foreground ring-1 ring-amber-500/40"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-xs font-extrabold truncate mt-0.5">{item.title}</div>
                    </button>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-xs space-y-1.5">
                  {activeHalalSample === "halal" && (
                    <>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="size-4" /> Produit Certifié Halal & Sain
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Ingrédients : Farine complète, huile d'olive, levure naturelle. Aucun
                        additif d'origine douteuse.
                      </p>
                    </>
                  )}
                  {activeHalalSample === "doubtful" && (
                    <>
                      <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-xs">
                        <AlertCircle className="size-4" /> Presence d'Émulsifiant Douteux (E471)
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Mono- et diglycérides d'acides gras. Origine végétale ou animale non
                        spécifiée sur l'emballage.
                      </p>
                    </>
                  )}
                  {activeHalalSample === "haram" && (
                    <>
                      <div className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 text-xs">
                        <AlertCircle className="size-4" /> Non Conforme (Gélatine porcine E441)
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Contient de la gélatine animale non conforme aux normes rituelles d'abattage
                        islamiques.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: TASBIH & DHIKR                                       */}
          {/* ============================================================ */}
          {step === 4 && (
            <div className="space-y-3.5 animate-in slide-in-from-right duration-300">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 border border-amber-500/20 flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-xs">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-foreground font-serif tracking-tight">
                    {t.onboardingStep4DhikrTitle || "Tasbih & Invocations (Dhikr)"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Compteur haptique interactif et invocations quotidiennes vérifiées.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-card to-amber-500/15 border border-amber-500/30 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
                <div className="font-arabic text-2xl font-black text-foreground" dir="rtl">
                  {currentTasbih.ar}
                </div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {currentTasbih.fr} —{" "}
                  <span className="text-muted-foreground font-normal">{currentTasbih.meaning}</span>
                </div>

                <button
                  type="button"
                  onClick={handleTasbihTap}
                  className="size-24 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-mono font-black text-3xl shadow-xl shadow-amber-500/30 flex flex-col items-center justify-center active:scale-90 transition-all cursor-pointer my-1 border-2 border-amber-200"
                >
                  <span>{tasbihCount}</span>
                  <span className="text-[9px] font-sans font-bold opacity-80">
                    / {currentTasbih.target}
                  </span>
                </button>

                <p className="text-xs text-muted-foreground font-medium">
                  {t.guideTasbihTapHint || "Touchez la boule pour compter le Dhikr"}
                </p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 5: QIBLA & MOSQUES                                      */}
          {/* ============================================================ */}
          {step === 5 && (
            <div className="space-y-3.5 animate-in slide-in-from-right duration-300">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-card to-amber-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-md">
                  <ModernQiblaCompassIcon className="size-7" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-foreground font-serif tracking-tight">
                    {t.onboardingStep5Title || "Boussole Qibla & Mosquées"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Localisation précise de la Kaaba et des mosquées aux alentours.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border/80 bg-card/80 space-y-3 shadow-xs">
                {/* 3D Islamic Qibla Interactive Compass Card */}
                <div
                  className={`p-3.5 rounded-3xl border transition-all flex items-center justify-between gap-3 relative overflow-hidden ${
                    isQiblaAligned
                      ? "bg-gradient-to-br from-emerald-500/20 via-card to-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                      : "bg-gradient-to-br from-muted/40 via-card to-muted/20 border-border/80"
                  }`}
                >
                  {/* Modern 3D Dial */}
                  <div className="relative size-24 shrink-0 flex items-center justify-center">
                    {/* Glowing Backlight on Alignment */}
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
                        isQiblaAligned
                          ? "bg-emerald-500/30 blur-xl scale-110"
                          : "bg-amber-500/10 blur-lg"
                      }`}
                    />

                    {/* Outer Compass Housing Dial */}
                    <div
                      className={`relative size-24 rounded-full border-2 p-1 flex items-center justify-center transition-colors duration-500 shadow-inner ${
                        isQiblaAligned
                          ? "border-emerald-400 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : "border-amber-500/40 bg-zinc-950/30"
                      }`}
                    >
                      {/* Fixed Cardinal Indicators & Graduations */}
                      <div className="absolute inset-0 pointer-events-none">
                        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-amber-500">
                          N
                        </span>
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-muted-foreground/60">
                          S
                        </span>
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-muted-foreground/60">
                          E
                        </span>
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-muted-foreground/60">
                          O
                        </span>
                      </div>

                      {/* Geometric Rosette in Dial */}
                      <div className="absolute size-12 rounded-full border border-amber-500/20 opacity-40 rotate-45" />
                      <div className="absolute size-12 rounded-full border border-amber-500/20 opacity-40" />

                      {/* Rotating 3D Needle */}
                      <div
                        className="relative size-20 flex items-center justify-center transition-transform duration-700 ease-out"
                        style={{
                          transform: isQiblaAligned ? "rotate(0deg)" : "rotate(58deg)",
                        }}
                      >
                        {/* North Emerald Pointer to Kaaba */}
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[34px] border-b-emerald-500 drop-shadow-md" />
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-r-[5px] border-r-transparent border-b-[34px] border-b-emerald-400 opacity-80" />

                        {/* South Crimson Counter Pointer */}
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[28px] border-t-rose-500 drop-shadow-sm opacity-80" />
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-t-[28px] border-t-rose-700 opacity-90" />

                        {/* Center 3D Kaaba Pivot */}
                        <div className="relative z-10 size-7 rounded-full bg-zinc-950 border border-amber-400 shadow-md flex items-center justify-center p-0.5">
                          <MiniKaaba3D className="size-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Info & Interactive Alignment Toggle */}
                  <div className="flex-1 min-w-0 space-y-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        playConfirm();
                        setIsQiblaAligned(!isQiblaAligned);
                      }}
                      className={`text-xs font-black px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5 ${
                        isQiblaAligned
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 border border-emerald-300/40"
                          : "bg-muted/80 text-foreground hover:bg-muted border border-border/80"
                      }`}
                    >
                      <Sparkles className="size-3.5" />
                      <span>{isQiblaAligned ? "✨ Aligné 119° SE" : "Tester alignement"}</span>
                    </button>

                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold text-foreground">
                        {isQiblaAligned ? "🕋 Face à la Mecque" : "Orientez votre téléphone"}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {isQiblaAligned
                          ? "Signal précis • Prêt pour la prière"
                          : "Tournez vers 119° SE pour aligner"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="size-5 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-extrabold text-foreground">Mosquée Grande-Mosquée</div>
                      <div className="text-[11px] text-muted-foreground">
                        À 450 m • Synchronisation Mawaqit active
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    Ouverte
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 6: CUSTOMIZATION & LAUNCH                               */}
          {/* ============================================================ */}
          {step === 6 && (
            <div className="space-y-3.5 animate-in slide-in-from-right duration-300">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-card to-purple-500/5 border border-purple-500/20 flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30 shadow-xs">
                  <Palette className="size-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-foreground font-serif tracking-tight">
                    {t.onboardingStep4Title || "Personnalisez votre thème"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Ajustez l'apparence visuelle des widgets selon vos préférences.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border/80 bg-card/80 space-y-3 shadow-xs">
                {/* Live Widget Preview */}
                <div
                  className="p-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-between text-white"
                  style={{
                    background:
                      themePresets.find((t) => t.id === selectedThemePreview)?.grad ||
                      "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                    color:
                      selectedThemePreview === "w-grad-vert-chartreuse" ? "#0f172a" : "#ffffff",
                  }}
                >
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black uppercase opacity-80">
                      Prochaine Prière
                    </div>
                    <div className="text-base font-black font-serif">Fajr — 05:28</div>
                  </div>
                  <div className="text-xs font-black bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl">
                    -02h 15m
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {themePresets.map((preset) => {
                    const isSel = selectedThemePreview === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          playClick();
                          setSelectedThemePreview(preset.id);
                          update({ widgetTheme: preset.id });
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                          isSel
                            ? "border-amber-500 bg-amber-500/15 text-foreground font-bold ring-1 ring-amber-500/40 shadow-xs"
                            : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        <div
                          className="size-3 rounded-full shrink-0 shadow-xs border border-white/20"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="text-xs font-bold truncate">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="size-5 text-emerald-500 shrink-0" />
                <span className="font-semibold">
                  Bienvenue dans Islam-Noor ! Votre expérience est personnalisée et prête.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS & DEDICATED VALIDATION BUTTON (iPhone-Style Curved Translucent Floating Island) */}
        <div className="shrink-0 mt-3 p-2 rounded-full bg-background/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.15)] flex items-center justify-between gap-3 relative z-20">
          {/* Left: Back button or Language indicator pill */}
          <div className="shrink-0 pl-1">
            {step > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="text-xs font-bold rounded-full gap-1.5 h-10 px-4 cursor-pointer border-border/80 bg-card/60 hover:bg-card/90 backdrop-blur-md transition-all"
              >
                <ChevronLeft className="size-4" />
                <span>{t.back || "Retour"}</span>
              </Button>
            ) : (
              <div className="text-xs text-foreground font-extrabold flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 backdrop-blur-md shadow-xs">
                <Globe className="size-4 text-amber-500 shrink-0" />
                <span className="truncate text-xs max-w-[120px] sm:max-w-[180px]">
                  {LOCALE_LABELS[settings.language]}
                </span>
              </div>
            )}
          </div>

          {/* Right: Validation CTA Action */}
          <div className="flex items-center gap-2 shrink-0 ml-auto pr-0.5">
            <Button
              onClick={() => (step === totalSlides ? handleComplete() : handleNext())}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black px-6 py-2.5 rounded-full shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all text-xs sm:text-sm h-10 cursor-pointer shrink-0 border border-amber-300/40"
            >
              <Check className="size-4 shrink-0 stroke-[3]" />
              <span className="whitespace-nowrap font-bold">
                {step === totalSlides
                  ? t.onboardingValidateAndStart || "Lancer l'application"
                  : step === 0
                    ? "Continuer"
                    : t.onboardingValidateAndNext || "Valider & Suivant"}
              </span>
              <ChevronRight className="size-4 shrink-0" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
