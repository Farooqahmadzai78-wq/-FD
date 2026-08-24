import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bell, Check, Loader2, Pause, Play, Volume2 } from "lucide-react";
import { appToast } from "@/lib/app-toast";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import { resolveEffectiveReminder } from "@/lib/reminder-data";
import {
  speakReminderText,
  stopReminderSpeech,
  subscribeSpeakerState,
  type SpeakerState,
} from "@/lib/reminder-speaker";
import { sendSystemNotification } from "@/lib/sw-register";

type ComboSearch = {
  from?: string;
};

export const Route = createFileRoute("/reminder/combo")({
  validateSearch: (search: Record<string, unknown>): ComboSearch => {
    return {
      from: typeof search.from === "string" ? search.from : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Notification + Audio — Islam-Noor" },
      {
        name: "description",
        content: "Combinez une notification et un rappel vocal avant l'adhan.",
      },
      { property: "og:title", content: "Notification + Audio — Islam-Noor" },
      {
        property: "og:description",
        content: "Notification suivie d'un rappel vocal avant l'adhan.",
      },
    ],
  }),
  component: ComboPage,
});

function ComboPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { t } = useI18n();
  const { settings, update } = useSettings();
  const [speakerState, setSpeakerState] = useState<SpeakerState>({
    activeId: null,
    isPlaying: false,
    isLoading: false,
  });

  useEffect(() => {
    const unsub = subscribeSpeakerState(setSpeakerState);
    return () => {
      unsub();
      stopReminderSpeech();
    };
  }, []);

  const resolved = resolveEffectiveReminder(settings, "Fajr", t);

  const handlePlayAudio = () => {
    if (speakerState.activeId === "combo-audio" && speakerState.isPlaying) {
      stopReminderSpeech();
    } else {
      speakReminderText("combo-audio", resolved.audioText, resolved.isArabicAudio);
    }
  };

  const handleTestCombo = async () => {
    if (speakerState.isPlaying) {
      stopReminderSpeech();
      appToast.info(t.reminderStopped || "Reminder stopped.", { category: "reminder" });
      return;
    }

    // 1. System Notification + In-app notification
    try {
      void sendSystemNotification("Islam-Noor — Rappel de prière", {
        body: resolved.notifText,
        tag: `combo-test-${Date.now()}`,
      });
    } catch {
      // ignore
    }
    appToast.info(resolved.notifText, {
      category: "reminder",
      duration: 6000,
      icon: <Bell className="size-4 text-emerald-500" />,
    });

    // 2. Play exact selected voice reminder
    speakReminderText("combo-audio", resolved.audioText, resolved.isArabicAudio);
  };

  const isAudioPlaying = speakerState.activeId === "combo-audio" && speakerState.isPlaying;

  const handleBack = () => {
    stopReminderSpeech();
    if (search.from === "settings") {
      navigate({ to: "/settings" });
    } else {
      navigate({ to: "/prayers" });
    }
  };

  const handleConfirm = () => {
    stopReminderSpeech();
    update({ reminderMode: "both" });
    appToast.success(t.comboSaved || "Combination mode saved", {
      category: "reminder",
    });
    if (search.from === "settings") {
      navigate({ to: "/settings" });
    } else {
      navigate({ to: "/prayers" });
    }
  };

  return (
    <div className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-8 max-w-lg mx-auto">
      <header className="relative flex items-center justify-center py-2">
        <button
          aria-label={t.back}
          onClick={handleBack}
          className="absolute left-0 grid size-9 place-items-center rounded-full hover:bg-card/40 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-extrabold">{t.comboTitle}</h1>
      </header>

      {/* Step 1: Notification Text */}
      <h2 className="mt-4 text-sm font-bold flex items-center gap-2 text-foreground">
        {t.comboNotifStep}
      </h2>
      <div className="glass mt-2 flex items-center gap-3 p-3">
        <span className="text-lg shrink-0">{resolved.notifIcon}</span>
        <span
          className={`flex-1 text-[13px] leading-snug font-medium ${
            resolved.isArabicNotif ? "font-[var(--font-arabic)] text-base font-bold text-right" : ""
          }`}
          dir={resolved.isArabicNotif ? "rtl" : "ltr"}
        >
          {resolved.notifText}
        </span>
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--halal)] text-white">
          <Check className="size-4" />
        </span>
      </div>
      <Link
        to="/reminder/notification"
        search={{ from: "combo" }}
        className="mt-2 block text-center text-xs font-semibold underline underline-offset-4 text-[var(--halal)] hover:opacity-90 transition-opacity"
      >
        {t.changeNotifText}
      </Link>

      {/* Step 2: Audio Voice Reminder */}
      <h2 className="mt-6 text-sm font-bold flex items-center gap-2 text-foreground">
        {t.comboAudioStep}
      </h2>
      <div className="glass mt-2 flex items-center gap-3 p-3">
        <button
          type="button"
          aria-label={t.listenVoiceReminder}
          onClick={handlePlayAudio}
          className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors ${
            isAudioPlaying ? "bg-[var(--halal)] text-white shadow-sm" : "bg-muted hover:bg-accent"
          }`}
        >
          {speakerState.activeId === "combo-audio" && speakerState.isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isAudioPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4 ml-0.5" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <span
            className={`block truncate text-[13px] font-semibold ${
              resolved.isArabicAudio ? "font-[var(--font-arabic)] text-base font-bold" : ""
            }`}
            dir={resolved.isArabicAudio ? "rtl" : "ltr"}
          >
            {resolved.audioLabel}
          </span>
          <span className="block truncate text-[11px] opacity-75">{resolved.audioText}</span>
        </div>
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--halal)] text-white">
          <Check className="size-4" />
        </span>
      </div>
      <Link
        to="/reminder/audio"
        search={{ from: "combo" }}
        className="mt-2 block text-center text-xs font-semibold underline underline-offset-4 text-[var(--halal)] hover:opacity-90 transition-opacity"
      >
        {t.changeAudioReminder}
      </Link>

      {/* Interactive Combo Test Button */}
      <div className="mt-6 glass p-4 rounded-2xl flex items-center justify-between gap-3 border border-amber-500/20 shadow-xs">
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground">{t.testCombo}</p>
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{t.testComboSub}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTestCombo}
          className="shrink-0 text-xs font-semibold flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
        >
          {speakerState.isLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : speakerState.isPlaying ? (
            <>
              <Pause className="size-3.5 fill-current" />
              <span>{t.stop}</span>
            </>
          ) : (
            <>
              <Volume2 className="size-3.5" />
              <span>{t.listen}</span>
            </>
          )}
        </Button>
      </div>

      <Button
        type="button"
        variant="default"
        onClick={handleConfirm}
        className="mt-6 w-full py-6 text-center text-base font-semibold rounded-2xl shadow-md"
      >
        {t.confirmCombo}
      </Button>
    </div>
  );
}
