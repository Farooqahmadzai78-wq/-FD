import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Battery,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  Headphones,
  Info,
  Layers,
  Lock,
  Music,
  Pause,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Square,
  Timer,
  Trash2,
  Vibrate,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { appToast } from "@/lib/app-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/lib/app-settings";
import { IMAMS, type Imam } from "@/lib/nur-data";
import { resolveEffectiveReminder } from "@/lib/reminder-data";
import { sendSystemNotification } from "@/lib/sw-register";
import { vibrate } from "@/lib/vibration";
import { speakReminderText, stopReminderSpeech } from "@/lib/reminder-speaker";
import {
  isNativeAndroidPlatform,
  getNativeStatus,
  requestNativeExactAlarmPermissions,
  requestNativeBatteryExemption,
  scheduleNativeTestDelay,
  type NativePlatformStatus,
} from "@/lib/native-prayer-bridge";
import {
  playAzan,
  stopAzan,
  subscribeAzanStatus,
  resolveImam,
  type AzanPlaybackStatus,
} from "@/lib/azan-audio-engine";
import { useI18n } from "@/lib/i18n";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { countdown, PRAYER_KEYS } from "@/lib/prayer-times";

type TestLogEntry = {
  id: string;
  time: string;
  type: "adhan" | "reminder" | "scheduled" | "reciter";
  title: string;
  details: string;
  status: "success" | "warning" | "error";
};

export function AzanDevSimulator() {
  const { t } = useI18n();
  const { settings, update } = useSettings();
  const { data: prayerData, next: nextPrayer, now } = usePrayerTimes();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"adhan" | "reminder" | "reciters" | "android">(
    "adhan",
  );

  // Native Platform State
  const [nativeStatus, setNativeStatus] = useState<NativePlatformStatus | null>(null);

  // Prayer Context for Simulation
  const [selectedPrayer, setSelectedPrayer] = useState<string>("Maghrib");

  // Azan Scheduled Delay Testing
  const [delayType, setDelayType] = useState<"10s" | "30s" | "1m" | "5m" | "custom">("30s");
  const [customDelaySeconds, setCustomDelaySeconds] = useState<number>(30);
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const [scheduledTargetInfo, setScheduledTargetInfo] = useState<string | null>(null);
  const [scheduledType, setScheduledType] = useState<"adhan" | "reminder">("adhan");
  const countdownIntervalRef = useRef<number | null>(null);

  // Azan Real-Time Audio Playback Status from Engine
  const [audioStatus, setAudioStatus] = useState<AzanPlaybackStatus>({
    isPlaying: false,
    imamId: null,
    imamName: null,
    prayerName: null,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
  });

  // Test Logs
  const [testLogs, setTestLogs] = useState<TestLogEntry[]>([]);

  // Subscribe to central Azan audio engine
  useEffect(() => {
    const unsubscribe = subscribeAzanStatus((status) => {
      setAudioStatus(status);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Check native platform on mount
  useEffect(() => {
    void getNativeStatus().then(setNativeStatus);
  }, []);

  // Single Source of Truth for Muezzin & Reciter
  const currentImam: Imam = resolveImam(settings.imamId);

  // Resolved pre-reminder according to active settings and prayer
  const resolvedReminder = resolveEffectiveReminder(settings, selectedPrayer, t);

  // Helper to add logs
  const addLog = (
    type: "adhan" | "reminder" | "scheduled" | "reciter",
    title: string,
    details: string,
    status: "success" | "warning" | "error" = "success",
  ) => {
    const entry: TestLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      type,
      title,
      details,
      status,
    };
    setTestLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

  // Stop all running audio/speech
  const stopAllAudio = () => {
    stopAzan();
    stopReminderSpeech();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatSeconds = (secs: number) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // 1. Immediate Test of Azan (Exact same source)
  const handleTestAdhanNow = async (targetImam = currentImam) => {
    stopAllAudio();

    if (settings.vibrateAdhan) {
      vibrate("adhan", { vibrateAdhan: true });
    }

    void sendSystemNotification(`Islam-Noor — Adhan ${selectedPrayer}`, {
      body: `Il est l'heure de la prière de ${selectedPrayer} (${targetImam.name})`,
      tag: `test-adhan-${Date.now()}`,
    });

    const adhanPlayMsg = (t.azanPlayingToast || "Playing Azan: {name}").replace(
      "{name}",
      `${targetImam.name} (${selectedPrayer})`,
    );
    appToast.info(adhanPlayMsg, {
      category: "reciter",
    });

    addLog(
      "adhan",
      `Test Immédiat Azan — ${targetImam.name}`,
      `Prière: ${selectedPrayer} · Source: ${targetImam.audio} · Vibration: ${settings.vibrateAdhan ? "OUI" : "NON"}`,
    );

    try {
      await playAzan(targetImam, {
        prayerName: selectedPrayer,
        onEnded: () => {
          addLog(
            "adhan",
            `Azan terminé — ${targetImam.name}`,
            "Lecture audio terminée avec succès",
          );
        },
        onError: (err) => {
          appToast.error(err.message || t.cannotPlayAzan || "Error playing Azan", {
            category: "reciter",
          });
          addLog("adhan", `Erreur Azan — ${targetImam.name}`, err.message, "error");
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur de lecture";
      appToast.error(t.cannotPlayAzan || "Cannot play Azan", { category: "reciter" });
      addLog("adhan", `Échec Azan — ${targetImam.name}`, msg, "error");
    }
  };

  // 2. Immediate Test of Pre-Adhan Reminder
  const handleTestReminderNow = async () => {
    stopAllAudio();

    if (settings.vibrateNotifications) {
      vibrate("notification", { vibrateNotifications: true });
    }

    if (resolvedReminder.mode === "notification" || resolvedReminder.mode === "both") {
      void sendSystemNotification("Islam-Noor — Rappel de prière", {
        body: resolvedReminder.notifText,
        tag: `test-reminder-${Date.now()}`,
      });
      appToast.info(resolvedReminder.notifText, {
        category: "reminder",
        icon: <Bell className="size-4 text-emerald-500" />,
      });
    }

    if (resolvedReminder.mode === "audio" || resolvedReminder.mode === "both") {
      appToast.info(resolvedReminder.audioLabel || "Vocal", {
        category: "reminder",
        icon: <Volume2 className="size-4 text-emerald-500" />,
      });
      await speakReminderText(
        `dev-test-reminder-${Date.now()}`,
        resolvedReminder.audioText,
        resolvedReminder.isArabicAudio,
      );
    }

    addLog(
      "reminder",
      `Test Immédiat Rappel (-${settings.reminder}min)`,
      `Mode: ${resolvedReminder.mode} · Prière: ${selectedPrayer} · Texte: "${resolvedReminder.notifText}"`,
    );
  };

  // 3. Schedule Delay Test (Background, Closed App, Lock Screen)
  const handleScheduleTest = async (type: "adhan" | "reminder", overrideDelay?: number) => {
    let delay = overrideDelay !== undefined ? overrideDelay : customDelaySeconds;
    if (overrideDelay === undefined) {
      if (delayType === "10s") delay = 10;
      if (delayType === "30s") delay = 30;
      if (delayType === "1m") delay = 60;
      if (delayType === "5m") delay = 300;
    }

    if (delay < 2) delay = 2;

    setScheduledType(type);
    setCountdownRemaining(delay);
    const targetDate = new Date(Date.now() + delay * 1000);
    const targetTimeStr = targetDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setScheduledTargetInfo(
      `${type === "adhan" ? "🕌 Azan" : "🕐 Rappel"} à ${targetTimeStr} (dans ${delay}s)`,
    );

    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = window.setInterval(() => {
      setCountdownRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownIntervalRef.current) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          if (type === "adhan") {
            void handleTestAdhanNow(currentImam);
          } else {
            void handleTestReminderNow();
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    const isNative = isNativeAndroidPlatform();
    let audioUrlToSchedule = currentImam.audio;

    if (type === "reminder") {
      audioUrlToSchedule = "";
    }

    await scheduleNativeTestDelay({
      delaySeconds: delay,
      type,
      prayerName: selectedPrayer,
      mode: type === "adhan" ? "both" : resolvedReminder.mode,
      title:
        type === "adhan" ? `Islam-Noor — Adhan ${selectedPrayer}` : "Islam-Noor — Rappel de prière",
      notifText: resolvedReminder.notifText,
      message:
        type === "adhan"
          ? `Il est l'heure de la prière de ${selectedPrayer} (${currentImam.name})`
          : resolvedReminder.notifText,
      audioText: resolvedReminder.audioText,
      audioUrl: audioUrlToSchedule,
      isArabic: resolvedReminder.isArabicAudio,
      vibrate: type === "adhan" ? settings.vibrateAdhan : settings.vibrateNotifications,
    });

    appToast.success(
      `${type === "adhan" ? t.azanTestScheduled || "Azan test scheduled" : t.reminderScheduled || "Reminder scheduled"} (${delay}s)`,
      { category: "dev" },
    );

    addLog(
      "scheduled",
      `Test Programmé (${delay}s) — ${type === "adhan" ? "Azan" : "Rappel"}`,
      `Déclenchement prévu à ${targetTimeStr} · Prière: ${selectedPrayer} · Mode APK: ${isNative ? "Actif (AlarmManager)" : "Web"}`,
    );
  };

  // 4. Complete Sequence Simulation (Reminder at T+10s, Azan at T+25s)
  const handleScheduleFullSequence = async () => {
    stopAllAudio();
    cancelScheduledTest();

    appToast.info(t.startingSequentialSim || "Starting sequential simulation...", {
      category: "dev",
    });

    const isNative = isNativeAndroidPlatform();

    // Schedule Reminder at +10s
    await scheduleNativeTestDelay({
      delaySeconds: 10,
      type: "reminder",
      prayerName: selectedPrayer,
      mode: resolvedReminder.mode,
      title: "Islam-Noor — Rappel de prière",
      notifText: resolvedReminder.notifText,
      audioText: resolvedReminder.audioText,
      audioUrl: "",
      isArabic: resolvedReminder.isArabicAudio,
      vibrate: settings.vibrateNotifications,
    });

    // Schedule Azan at +25s
    await scheduleNativeTestDelay({
      delaySeconds: 25,
      type: "adhan",
      prayerName: selectedPrayer,
      mode: "both",
      title: `Islam-Noor — Adhan ${selectedPrayer}`,
      message: `Il est l'heure de la prière de ${selectedPrayer} (${currentImam.name})`,
      audioUrl: currentImam.audio,
      vibrate: settings.vibrateAdhan,
    });

    // In-browser / PWA visual timers
    setScheduledType("reminder");
    setCountdownRemaining(10);
    setScheduledTargetInfo(`Séquence active : Rappel dans 10s ➔ puis Azan dans 25s`);

    window.setTimeout(() => {
      void handleTestReminderNow();
      setScheduledType("adhan");
      setCountdownRemaining(15);
      setScheduledTargetInfo(`Étape 2/2 : Azan dans 15s`);
    }, 10000);

    window.setTimeout(() => {
      void handleTestAdhanNow(currentImam);
      setCountdownRemaining(null);
      setScheduledTargetInfo(null);
    }, 25000);

    addLog(
      "scheduled",
      "Séquence Complète Programmée (Rappel 10s ➔ Azan 25s)",
      `Rappel: "${resolvedReminder.notifText}" (Mode ${resolvedReminder.mode}) ➔ Azan: ${currentImam.name}`,
    );
  };

  const cancelScheduledTest = () => {
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdownRemaining(null);
    setScheduledTargetInfo(null);
    appToast.info(t.scheduledTestCancelled || "Scheduled test cancelled.", {
      category: "dev",
    });
    addLog("scheduled", "Annulation", "Le compte à rebours de test a été annulé.");
  };

  // Change reciter across the entire app
  const handleSelectImamForApp = (imamId: string) => {
    update({ imamId });
    const selected = IMAMS.find((i) => i.id === imamId);
    const reciterMsg = (t.reciterSetForApp || "Reciter set for app: {name}").replace(
      "{name}",
      selected?.name || imamId,
    );
    appToast.success(reciterMsg, { category: "reciter" });
    addLog(
      "reciter",
      `Changement de Muezzin — ${selected?.name || imamId}`,
      `Toutes les prières, tests et alarmes d'arrière-plan utiliseront désormais ce récitateur.`,
    );
  };

  // Next prayer info
  const cd = nextPrayer ? countdown(nextPrayer.at, now) : null;

  return (
    <div id="azan-dev-simulator" className="space-y-4 text-foreground">
      {/* HEADER WITH CONTEXT */}
      <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0 border border-amber-500/20">
              <Sliders className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground truncate">
                Simulateur & Validation Azan / Rappels
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                Source de vérité unifiée · Foreground & Arrière-plan APK Android
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {audioStatus.isPlaying && (
              <Button
                size="sm"
                variant="destructive"
                onClick={stopAllAudio}
                className="h-8 text-xs font-bold rounded-xl gap-1.5 px-3 animate-pulse"
              >
                <Square className="size-3.5 fill-current" />
                Arrêter l&apos;audio
              </Button>
            )}
            <Badge
              variant="outline"
              className={`text-[10px] font-bold px-2 py-0.5 ${
                isNativeAndroidPlatform()
                  ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                  : "border-sky-500 text-sky-500 bg-sky-500/10"
              }`}
            >
              {isNativeAndroidPlatform() ? "📱 Android APK" : "🌐 Navigateur / PWA"}
            </Badge>
          </div>
        </div>

        {/* ACTIVE COUNTDOWN BANNER IF SCHEDULED */}
        {countdownRemaining !== null && (
          <div className="p-3.5 rounded-2xl bg-sky-500/15 border border-sky-500/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <Timer className="size-4 text-sky-500 animate-spin shrink-0" />
              <div className="min-w-0">
                <span className="font-black text-sky-600 dark:text-sky-400 block truncate">
                  Test {scheduledType === "adhan" ? "Azan" : "Rappel"} en cours de déclenchement :
                </span>
                <span className="text-[11px] text-muted-foreground truncate block">
                  {scheduledTargetInfo} · Déclenchement dans{" "}
                  <strong className="text-foreground font-mono font-bold">
                    {countdownRemaining}s
                  </strong>
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={cancelScheduledTest}
              className="h-7 text-xs font-bold rounded-lg border-sky-500/40 hover:bg-sky-500/20 shrink-0"
            >
              Annuler le test
            </Button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2-EVENT REAL-TIME INSPECTOR & SEQUENCE SIMULATOR */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h4 className="text-sm font-black text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
              Inspection Séparée des 2 Événements
            </h4>
            <p className="text-xs text-muted-foreground">
              Vérification stricte : le Rappel ne joue jamais l&apos;Azan, l&apos;Azan ne joue
              jamais le rappel vocal.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleScheduleFullSequence}
            disabled={countdownRemaining !== null}
            className="h-9 text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl px-4 gap-2 shadow-sm shrink-0"
          >
            <RefreshCw className="size-3.5 shrink-0" />
            <span className="truncate">Simuler Séquence (Rappel 10s ➔ Azan 25s)</span>
          </Button>
        </div>

        {/* SIDE-BY-SIDE EVENT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* CARD 1: PROCHAIN RAPPEL AVANT AZAN */}
          <div className="p-4 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Bell className="size-3.5" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    1. Prochain Rappel
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold"
                >
                  T - {settings.reminder} min
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Prière ciblée :</span>
                  <span className="text-amber-600 dark:text-amber-400">{selectedPrayer}</span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Mode actif :</span>
                  <span className="font-bold text-foreground">
                    {settings.reminderMode === "both"
                      ? "🔔+🔊 Notification + Audio"
                      : settings.reminderMode === "audio"
                        ? "🔊 Audio seul"
                        : "🔔 Notification seule"}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-card border border-border/60 text-[11px] space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Texte de Notification :
                  </span>
                  <p className="font-semibold text-foreground break-words">
                    &ldquo;{resolvedReminder.notifText}&rdquo;
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-card border border-border/60 text-[11px] space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Rappel Vocal (TTS) :
                  </span>
                  <p className="font-semibold text-foreground truncate">
                    🔊 {resolvedReminder.audioLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => void handleTestReminderNow()}
                className="h-8 text-xs font-bold rounded-xl border-amber-500/40 hover:bg-amber-500/10 text-foreground"
              >
                Tester maintenant
              </Button>
              <Button
                size="sm"
                onClick={() => void handleScheduleTest("reminder", 10)}
                disabled={countdownRemaining !== null}
                className="h-8 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                <Timer className="size-3 mr-1" />
                Dans 10s
              </Button>
            </div>
          </div>

          {/* CARD 2: PROCHAIN AZAN EXACT */}
          <div className="p-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Zap className="size-3.5" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    2. Prochain Azan
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold"
                >
                  T = 0 (Heure exacte)
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Prière ciblée :</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{selectedPrayer}</span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Récitateur / Muezzin :</span>
                  <span className="font-bold text-foreground flex items-center gap-1 truncate">
                    <span>{currentImam.flag}</span>
                    <span className="truncate">{currentImam.name}</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-card border border-border/60 text-[11px] space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Source Audio Unique :
                  </span>
                  <p className="font-mono text-sky-600 dark:text-sky-400 text-[10px] truncate">
                    {currentImam.audio}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-card border border-border/60 text-[11px] flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Vibration Azan :</span>
                  <span className="font-bold text-foreground">
                    {settings.vibrateAdhan ? "✅ OUI" : "❌ NON"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => void handleTestAdhanNow(currentImam)}
                className="h-8 text-xs font-bold rounded-xl border-emerald-500/40 hover:bg-emerald-500/10 text-foreground"
              >
                Tester maintenant
              </Button>
              <Button
                size="sm"
                onClick={() => void handleScheduleTest("adhan", 10)}
                disabled={countdownRemaining !== null}
                className="h-8 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950"
              >
                <Timer className="size-3 mr-1" />
                Dans 10s
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS: 2 MAIN CORE SECTIONS + RECITERS + ANDROID */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as typeof activeTab)}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-muted/60 rounded-2xl h-auto border border-border">
          <TabsTrigger
            value="adhan"
            className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
          >
            <Zap className="size-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">🕌 Azan (Exact)</span>
          </TabsTrigger>
          <TabsTrigger
            value="reminder"
            className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
          >
            <Bell className="size-3.5 text-amber-500 shrink-0" />
            <span className="truncate">🕐 Rappel (-15m)</span>
          </TabsTrigger>
          <TabsTrigger
            value="reciters"
            className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
          >
            <Headphones className="size-3.5 text-sky-500 shrink-0" />
            <span className="truncate">👥 6 Récitateurs</span>
          </TabsTrigger>
          <TabsTrigger
            value="android"
            className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
          >
            <Smartphone className="size-3.5 text-purple-500 shrink-0" />
            <span className="truncate">📱 Android APK</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: 🕌 AZAN (À L'HEURE EXACTE DE PRIÈRE) */}
        {/* ========================================================================= */}
        <TabsContent value="adhan" className="space-y-4 m-0">
          {/* SECTION INFO & CURRENT RECITER STATUS */}
          <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Récitateur Actuel & Muezzin Actif
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentImam.flag}</span>
                  <p className="text-base font-black text-foreground truncate">
                    {currentImam.name}
                  </p>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">
                    {currentImam.country}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block font-semibold">
                    Vibration Azan :
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {settings.vibrateAdhan ? "✅ Activée" : "❌ Désactivée"}
                  </span>
                </div>
              </div>
            </div>

            {/* AUDIO STREAM INFO */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase block">
                  Source Audio Utilisée (Unique & Partagée) :
                </span>
                <p className="font-mono text-[11px] text-sky-600 dark:text-sky-400 break-all">
                  {currentImam.audio}
                </p>
              </div>

              <a
                href={currentImam.audio}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold shrink-0"
              >
                <ExternalLink className="size-3" />
                Ouvrir flux externe
              </a>
            </div>

            {/* NEXT REAL AZAN INFO CARD */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <Clock className="size-4 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block uppercase">
                    Prochain Azan Réel Prévu
                  </span>
                  <p className="text-xs text-foreground font-bold truncate">
                    {nextPrayer
                      ? `${nextPrayer.key} à ${prayerData?.timings?.[nextPrayer.key] || "—"}`
                      : "Calcul en cours..."}
                    {cd ? ` (dans ${cd.label})` : ""}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-muted-foreground block">Muezzin :</span>
                <span className="text-xs font-bold text-foreground">{currentImam.name}</span>
              </div>
            </div>
          </div>

          {/* SIMULATION PRAYER SELECTOR */}
          <div className="p-4 rounded-3xl border border-border bg-card/70 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-amber-500" />
                Prière ciblée pour le test
              </h4>
              <span className="text-[11px] text-muted-foreground">
                Aujourd&apos;hui : {prayerData?.timings?.[selectedPrayer as "Fajr"] || "—"}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {PRAYER_KEYS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPrayer(p)}
                  className={`py-2 px-1.5 rounded-2xl text-xs font-bold transition text-center min-w-0 truncate ${
                    selectedPrayer === p
                      ? "bg-amber-500 text-slate-950 shadow-xs font-black"
                      : "bg-muted/60 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="block truncate">{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ACTION 1: IMMEDIATE AZAN TEST */}
          <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Zap className="size-4 text-emerald-500 shrink-0" />
                <span>Tester l&apos;Azan maintenant (Test Immédiat)</span>
              </h4>
              <span className="text-[11px] text-muted-foreground">
                Récitateur : {currentImam.name}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Déclenche immédiatement l&apos;audio de l&apos;Azan et la vibration en utilisant
              exactement le même lecteur audio que l&apos;application en direct.
            </p>

            {/* REAL-TIME PLAYBACK PROGRESS IF PLAYING */}
            {audioStatus.isPlaying && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1.5 truncate">
                    <Music className="size-3.5 animate-pulse" />
                    Lecture en cours : {audioStatus.imamName} ({audioStatus.prayerName})
                  </span>
                  <span className="font-mono text-[11px] shrink-0">
                    {formatSeconds(audioStatus.currentTime)} / {formatSeconds(audioStatus.duration)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-emerald-500/20 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${
                        audioStatus.duration > 0
                          ? (audioStatus.currentTime / audioStatus.duration) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                size="lg"
                onClick={() => void handleTestAdhanNow()}
                disabled={audioStatus.isLoading}
                className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md gap-2"
              >
                <Play className="size-4 fill-current shrink-0" />
                <span className="truncate">
                  ▶ Tester l&apos;Azan maintenant ({currentImam.name})
                </span>
              </Button>

              {audioStatus.isPlaying && (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopAllAudio}
                  className="h-12 font-bold text-xs rounded-2xl gap-2 px-5 shrink-0"
                >
                  <Square className="size-4 fill-current shrink-0" />
                  Arrêter
                </Button>
              )}
            </div>
          </div>

          {/* ACTION 2: SCHEDULED DELAY AZAN TEST */}
          <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Timer className="size-4 text-sky-500 shrink-0" />
                <span>Programmer un test Azan (Arrière-plan & Écran Verrouillé)</span>
              </h4>
              <span className="text-[11px] text-muted-foreground">AlarmManager Android</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Programmez un compte à rebours, puis{" "}
              <strong>verrouillez le téléphone ou fermez l&apos;application</strong>. L&apos;Azan se
              déclenchera à la seconde près avec le récitateur <strong>{currentImam.name}</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { id: "10s" as const, label: "10 sec" },
                { id: "30s" as const, label: "30 sec" },
                { id: "1m" as const, label: "1 min" },
                { id: "5m" as const, label: "5 min" },
              ].map((d) => (
                <Button
                  key={d.id}
                  type="button"
                  size="sm"
                  variant={delayType === d.id ? "default" : "outline"}
                  onClick={() => setDelayType(d.id)}
                  className="text-xs h-8 rounded-xl font-bold px-3"
                >
                  {d.label}
                </Button>
              ))}

              <div className="flex items-center gap-1.5 ml-auto">
                <Input
                  type="number"
                  min={2}
                  max={3600}
                  value={customDelaySeconds}
                  onChange={(e) => {
                    setCustomDelaySeconds(Number(e.target.value));
                    setDelayType("custom");
                  }}
                  className="h-8 w-16 text-xs font-mono text-center font-bold"
                  placeholder="sec"
                />
                <span className="text-[11px] text-muted-foreground">sec</span>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleScheduleTest("adhan")}
                  disabled={countdownRemaining !== null}
                  className="h-8 text-xs font-bold bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl px-3"
                >
                  <Timer className="size-3.5 mr-1 shrink-0" />
                  <span className="truncate">Programmer l&apos;Azan</span>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: 🕐 RAPPEL AVANT AZAN (ÉVÉNEMENT SÉPARÉ) */}
        {/* ========================================================================= */}
        <TabsContent value="reminder" className="space-y-4 m-0">
          <div className="p-4 sm:p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-2.5">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-amber-500 shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Rappel Avant Azan (Événement Distinct)
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ce système se déclenche <strong>{settings.reminder} minutes avant</strong>{" "}
              l&apos;Azan. Il utilise une notification et/ou un rappel vocal personnalisé selon les
              paramètres de l&apos;utilisateur.
            </p>
          </div>

          {/* ACTIVE REMINDER CONFIGURATION */}
          <div className="p-4 sm:p-5 rounded-3xl border border-border bg-card space-y-3.5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                  Délai avant Prière :
                </span>
                <span className="font-bold text-foreground">
                  ⏱️ {settings.reminder} minutes avant
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                  Mode Actif :
                </span>
                <span className="font-bold text-foreground">
                  {settings.reminderMode === "both"
                    ? "🔔+🔊 Notification + Audio"
                    : settings.reminderMode === "audio"
                      ? "🔊 Audio seul"
                      : "🔔 Notification seule"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                  Rappel Vocal Sélectionné :
                </span>
                <span className="font-bold text-foreground truncate block">
                  {resolvedReminder.audioLabel}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 text-xs space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Texte de la notification qui sera envoyée :
              </span>
              <p className="font-bold text-foreground break-words">
                &ldquo;{resolvedReminder.notifText}&rdquo;
              </p>
            </div>

            {/* ACTION 1: IMMEDIATE REMINDER TEST */}
            <Button
              size="lg"
              onClick={() => void handleTestReminderNow()}
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md gap-2"
            >
              <Play className="size-4 fill-current shrink-0" />
              <span className="truncate">
                ▶ Tester le Rappel Avant Azan maintenant (-{settings.reminder}min)
              </span>
            </Button>
          </div>

          {/* ACTION 2: SCHEDULED REMINDER TEST */}
          <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Timer className="size-4 text-amber-500 shrink-0" />
                <span>Programmer un test de Rappel (Arrière-plan / Verrouillé)</span>
              </h4>
              <span className="text-[11px] text-muted-foreground">Notification & Vocal</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { id: "10s" as const, label: "10 sec" },
                { id: "30s" as const, label: "30 sec" },
                { id: "1m" as const, label: "1 min" },
                { id: "5m" as const, label: "5 min" },
              ].map((d) => (
                <Button
                  key={d.id}
                  type="button"
                  size="sm"
                  variant={delayType === d.id ? "default" : "outline"}
                  onClick={() => setDelayType(d.id)}
                  className="text-xs h-8 rounded-xl font-bold px-3"
                >
                  {d.label}
                </Button>
              ))}

              <div className="flex items-center gap-1.5 ml-auto">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleScheduleTest("reminder")}
                  disabled={countdownRemaining !== null}
                  className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl px-3"
                >
                  <Timer className="size-3.5 mr-1 shrink-0" />
                  <span className="truncate">Programmer le Rappel</span>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: 👥 LES 6 RÉCITATEURS (CATALOGUE & VÉRIFICATION INDIVIDUELLE) */}
        {/* ========================================================================= */}
        <TabsContent value="reciters" className="space-y-4 m-0">
          <div className="p-4 rounded-3xl border border-border bg-card/70 space-y-1.5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Headphones className="size-3.5 text-sky-500" />
              Catalogue & Vérification Individuelle des 6 Récitateurs
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Testez individuellement chaque audio d&apos;Azan. Vous pouvez définir n&apos;importe
              quel récitateur comme Muezzin officiel de l&apos;application en un clic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {IMAMS.map((imam) => {
              const isSelected = settings.imamId === imam.id;
              const isPlayingThis = audioStatus.isPlaying && audioStatus.imamId === imam.id;

              return (
                <div
                  key={imam.id}
                  className={`p-4 rounded-3xl border transition-all space-y-3 ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30"
                      : "bg-card border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{imam.flag}</span>
                      <div className="min-w-0">
                        <h5 className="text-sm font-black text-foreground truncate">{imam.name}</h5>
                        <p className="text-xs text-muted-foreground truncate">{imam.country}</p>
                      </div>
                    </div>

                    {isSelected ? (
                      <Badge className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase shrink-0">
                        <Check className="size-3 mr-1" /> Muezzin Actif
                      </Badge>
                    ) : (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleSelectImamForApp(imam.id)}
                        className="text-[11px] h-7 font-bold rounded-lg shrink-0"
                      >
                        Définir pour l&apos;app
                      </Button>
                    )}
                  </div>

                  <div className="p-2.5 rounded-2xl bg-muted/40 border border-border/50 text-[11px] font-mono text-muted-foreground break-all">
                    {imam.audio}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {isPlayingThis ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={stopAllAudio}
                        className="flex-1 text-xs font-bold rounded-xl h-8 gap-1.5"
                      >
                        <Square className="size-3.5 fill-current shrink-0" />
                        Arrêter la lecture
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => void handleTestAdhanNow(imam)}
                        className="flex-1 text-xs font-bold rounded-xl h-8 gap-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950"
                      >
                        <Play className="size-3.5 fill-current shrink-0" />
                        Écouter / Tester cet Azan
                      </Button>
                    )}

                    <a
                      href={imam.audio}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground p-1.5 rounded-lg border border-border/40 shrink-0"
                      title="Ouvrir le flux directement"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: 📱 ANDROID APK DIAGNOSTIC & CHECKLIST */}
        {/* ========================================================================= */}
        <TabsContent value="android" className="space-y-4 m-0">
          <div className="p-4 sm:p-5 rounded-3xl border border-sky-500/30 bg-sky-500/5 space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-sky-500 shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Diagnostic Android APK, AlarmManager & Doze
                </h4>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] font-bold ${
                  isNativeAndroidPlatform()
                    ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                    : "border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/10"
                }`}
              >
                {isNativeAndroidPlatform()
                  ? "📱 APK Android Connecté"
                  : "🌐 Mode PWA / Web Prêt pour APK"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                    Alarmes Exactes Android
                  </span>
                  <span className="font-bold text-[11px] text-emerald-500">
                    {nativeStatus?.canScheduleExactAlarms !== false ? "Accordé ✅" : "Requis ⚠️"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Permet de déclencher l&apos;Azan à la seconde exacte même en veille profonde ou
                  écran verrouillé.
                </p>
                {isNativeAndroidPlatform() && (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={async () => {
                      await requestNativeExactAlarmPermissions();
                      void getNativeStatus().then(setNativeStatus);
                    }}
                    className="w-full h-7 text-[11px] font-bold rounded-lg"
                  >
                    Vérifier l&apos;autorisation
                  </Button>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Battery className="size-3.5 text-amber-500 shrink-0" />
                    Exemption Batterie (Doze)
                  </span>
                  <span className="font-bold text-[11px] text-emerald-500">
                    {nativeStatus?.isIgnoringBatteryOptimizations ? "Exempté ✅" : "Standard"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Empêche le système Android de tuer le service audio lors de longues périodes de
                  veille.
                </p>
                {isNativeAndroidPlatform() && (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={async () => {
                      await requestNativeBatteryExemption();
                      void getNativeStatus().then(setNativeStatus);
                    }}
                    className="w-full h-7 text-[11px] font-bold rounded-lg"
                  >
                    Désactiver l&apos;optimisation
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 6-POINT VALIDATION CHECKLIST */}
          <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              Protocole de Validation des 6 Tests
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                {
                  title: "1. App ouverte (Foreground)",
                  desc: "Lecture Azan directe avec le récitateur actif.",
                },
                {
                  title: "2. App en arrière-plan",
                  desc: "Programmer 30s et mettre l'app en arrière-plan.",
                },
                {
                  title: "3. App fermée (Killed)",
                  desc: "Programmer 30s et quitter complètement l'application.",
                },
                {
                  title: "4. Écran verrouillé",
                  desc: "Programmer 30s et verrouiller l'écran du téléphone.",
                },
                {
                  title: "5. Changement de récitateur",
                  desc: "Changer le muezzin et vérifier la synchronisation.",
                },
                {
                  title: "6. Test des 6 récitateurs",
                  desc: "Écouter individuellement les 6 flux audio.",
                },
              ].map((test, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl bg-muted/30 border border-border/50 space-y-0.5"
                >
                  <span className="font-bold text-foreground block">{test.title}</span>
                  <span className="text-[11px] text-muted-foreground block">{test.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* SECTION: LIVE TEST LOGS */}
      <div className="p-4 sm:p-5 rounded-3xl border border-border bg-card space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Info className="size-3.5 text-amber-500 shrink-0" />
            Journal des Tests Exécutés
          </h4>
          {testLogs.length > 0 && (
            <button
              onClick={() => setTestLogs([])}
              className="text-[10px] text-muted-foreground hover:text-rose-500 flex items-center gap-1 font-semibold"
            >
              <Trash2 className="size-3" />
              Effacer le journal
            </button>
          )}
        </div>

        {testLogs.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Aucun test exécuté pour le moment. Cliquez sur un bouton de test ci-dessus pour vérifier
            l&apos;Azan.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {testLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-2xl bg-muted/40 border border-border/40 text-xs flex items-start justify-between gap-2 animate-in fade-in"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-foreground">{log.title}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 h-4 uppercase font-black shrink-0 ${
                        log.type === "adhan"
                          ? "text-amber-500 border-amber-500/40"
                          : log.type === "scheduled"
                            ? "text-sky-500 border-sky-500/40"
                            : log.type === "reciter"
                              ? "text-purple-500 border-purple-500/40"
                              : "text-emerald-500 border-emerald-500/40"
                      }`}
                    >
                      {log.type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground break-words">{log.details}</p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap shrink-0">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
