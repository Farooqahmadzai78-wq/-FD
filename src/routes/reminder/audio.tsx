import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Edit3, Loader2, Mic, Pause, Play, Volume2 } from "lucide-react";
import { appToast } from "@/lib/app-toast";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import { AUDIO_REMINDERS, isArabicText, resolveEffectiveReminder } from "@/lib/reminder-data";
import {
  speakReminderText,
  stopReminderSpeech,
  subscribeSpeakerState,
  type SpeakerState,
} from "@/lib/reminder-speaker";

type AudioSearch = {
  from?: string;
};

export const Route = createFileRoute("/reminder/audio")({
  validateSearch: (search: Record<string, unknown>): AudioSearch => {
    return {
      from: typeof search.from === "string" ? search.from : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Rappels audio — Islam-Noor" },
      {
        name: "description",
        content: "Choisissez ou personnalisez le rappel vocal joué avant l'adhan.",
      },
      { property: "og:title", content: "Rappels audio — Islam-Noor" },
      { property: "og:description", content: "Rappels vocaux avant l'adhan." },
    ],
  }),
  component: AudioRemindersPage,
});

function AudioRemindersPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const fromCombo = search.from === "combo";
  const { t } = useI18n();
  const { settings, update } = useSettings();
  const [speakerState, setSpeakerState] = useState<SpeakerState>({
    activeId: null,
    isPlaying: false,
    isLoading: false,
  });

  const [customAudio, setCustomAudio] = useState(settings.customAudioText || "");
  const isCustomActive = settings.audioReminder === "custom";

  useEffect(() => {
    const unsub = subscribeSpeakerState(setSpeakerState);
    return () => {
      unsub();
      stopReminderSpeech();
    };
  }, []);

  const handlePlayToggle = (id: string, text: string, isArabic: boolean) => {
    if (speakerState.activeId === id && speakerState.isPlaying) {
      stopReminderSpeech();
    } else {
      speakReminderText(id, text, isArabic);
    }
  };

  const handleSelectPreset = (id: string) => {
    update({ audioReminder: id });
  };

  const handleSelectCustom = () => {
    const textToUse = customAudio.trim() || "Il est temps de se préparer pour la prière.";
    update({ audioReminder: "custom", customAudioText: textToUse });
    if (!customAudio.trim()) {
      setCustomAudio(textToUse);
    }
  };

  const handleCustomChange = (val: string) => {
    setCustomAudio(val);
    update({ audioReminder: "custom", customAudioText: val });
  };

  const handleBack = () => {
    stopReminderSpeech();
    if (fromCombo) {
      navigate({ to: "/reminder/combo" });
    } else if (search.from === "settings") {
      navigate({ to: "/settings" });
    } else {
      navigate({ to: "/prayers" });
    }
  };

  const handleValidate = () => {
    stopReminderSpeech();
    if (isCustomActive && customAudio.trim()) {
      update({ customAudioText: customAudio.trim(), audioReminder: "custom" });
    }
    if (fromCombo) {
      appToast.success(t.audioReminderSaved || "Audio reminder saved", {
        category: "reminder",
      });
      navigate({ to: "/reminder/combo" });
    } else if (search.from === "settings") {
      appToast.success(t.audioReminderSaved || "Audio reminder saved", {
        category: "reminder",
      });
      navigate({ to: "/settings" });
    } else {
      update({ reminderMode: "audio" });
      appToast.success(t.audioReminderSaved || "Audio reminder saved", {
        category: "reminder",
      });
      navigate({ to: "/prayers" });
    }
  };

  const resolved = resolveEffectiveReminder(settings, "Fajr", t);
  const isCustomPlaying = speakerState.activeId === "custom-audio-test" && speakerState.isPlaying;
  const isCustomLoading = speakerState.activeId === "custom-audio-test" && speakerState.isLoading;

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
        <h1 className="text-lg font-extrabold">{t.audioRemindersTitle}</h1>
      </header>

      <p className="mt-2 text-xs text-center text-muted-foreground">{t.audioRemindersSub}</p>

      {/* Active Audio Banner */}
      <div className="mt-4 p-3.5 rounded-2xl bg-card/60 border border-border shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Volume2 className="size-4 text-[var(--halal)] shrink-0" />
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Rappel vocal sélectionné
            </span>
            <span className="text-xs font-bold truncate block">{resolved.audioLabel}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            handlePlayToggle("banner-test", resolved.audioText, resolved.isArabicAudio)
          }
          className="px-3 py-1.5 rounded-xl bg-[var(--halal)] text-white text-xs font-bold shrink-0 hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
        >
          {speakerState.isPlaying && speakerState.activeId === "banner-test" ? (
            <>
              <Pause className="size-3.5" /> Stop
            </>
          ) : (
            <>
              <Play className="size-3.5" /> Écouter
            </>
          )}
        </button>
      </div>

      {/* Section: Custom Audio Text */}
      <div className="mt-5 space-y-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
          Option vocale personnalisée
        </h2>

        <div
          onClick={handleSelectCustom}
          className={`cursor-pointer rounded-2xl border transition-all p-3.5 ${
            isCustomActive
              ? "border-[var(--halal)] bg-[var(--halal)]/10 shadow-sm"
              : "border-border bg-card/40 hover:bg-card/70"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mic className="size-4 text-[var(--halal)]" />
              <span className="text-sm font-bold">Message vocal personnalisé</span>
            </div>
            <span
              className={`grid size-5 place-items-center rounded-full border ${
                isCustomActive
                  ? "bg-[var(--halal)] text-white border-[var(--halal)]"
                  : "bg-card border-border"
              }`}
            >
              {isCustomActive && <Check className="size-3.5" />}
            </span>
          </div>

          <textarea
            value={customAudio}
            onChange={(e) => handleCustomChange(e.target.value)}
            onFocus={() => handleSelectCustom()}
            placeholder="Ex: Dans dix minutes l'adhan retentira. Faites vos ablutions."
            rows={2}
            className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-[var(--halal)] resize-none"
            dir={isArabicText(customAudio) ? "rtl" : "ltr"}
          />

          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              Sera lu avec une voix de synthèse haute fidélité.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const text = customAudio.trim() || "Il est temps de se préparer pour la prière.";
                handlePlayToggle("custom-audio-test", text, isArabicText(text));
              }}
              className="text-xs font-bold text-[var(--halal)] hover:underline flex items-center gap-1"
            >
              {isCustomLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : isCustomPlaying ? (
                <>
                  <Pause className="size-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="size-3.5" /> Tester la voix
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Section: Preset Invocations */}
      <div className="mt-6 space-y-2.5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
          Invocations et rappels prédéfinis
        </h2>

        <ul className="space-y-2.5">
          {AUDIO_REMINDERS.map((a) => {
            const active = settings.audioReminder === a.id;
            const isThisActive = speakerState.activeId === a.id;
            const isThisPlaying = isThisActive && speakerState.isPlaying;
            const isThisLoading = isThisActive && speakerState.isLoading;

            return (
              <li
                key={a.id}
                onClick={() => handleSelectPreset(a.id)}
                className={`glass cursor-pointer flex items-center gap-3 p-3 transition-all ${
                  active ? "ring-2 ring-[var(--halal)] bg-[var(--halal)]/10" : ""
                }`}
              >
                <button
                  type="button"
                  aria-label={isThisPlaying ? t.stop : t.listen}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayToggle(a.id, a.text, a.arabic);
                  }}
                  className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors ${
                    isThisPlaying
                      ? "bg-[var(--halal)] text-white shadow-sm"
                      : "bg-muted hover:bg-accent"
                  }`}
                >
                  {isThisLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isThisPlaying ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4 ml-0.5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-[13px] font-semibold ${
                      a.arabic ? "font-[var(--font-arabic)] text-base font-bold" : ""
                    }`}
                    dir={a.arabic ? "rtl" : "ltr"}
                  >
                    {a.label}
                  </span>
                  <span className="block truncate text-[11px] opacity-75">{a.text}</span>
                </div>
                <span className="shrink-0 text-[11px] opacity-85">{a.seconds} s</span>
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full border border-border ${
                    active ? "bg-[var(--halal)] text-white" : "bg-card text-foreground"
                  }`}
                >
                  {active && <Check className="size-4" />}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        type="button"
        variant="default"
        onClick={handleValidate}
        className="mt-6 w-full py-6 text-center text-base font-semibold rounded-2xl shadow-md"
      >
        {t.validateAudioReminder || "Enregistrer ce rappel vocal"}
      </Button>
    </div>
  );
}
