import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  SlidersHorizontal,
  Sparkles,
  BookmarkCheck,
} from "lucide-react";
import { appToast } from "@/lib/app-toast";
import { audio } from "@/lib/audio-player";
import { getSurahMeta } from "@/lib/quran-data";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import { QuranAudioMenuModal, QURAN_RECITERS } from "./QuranAudioMenuModal";
import { vibrate } from "@/lib/vibration";

interface MainQuranInlinePlayerProps {
  onOpenSurah?: (num: number) => void;
  className?: string;
}

export function MainQuranInlinePlayer({ onOpenSurah, className = "" }: MainQuranInlinePlayerProps) {
  const [s, setS] = useState(audio.state);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [lastPlayed, setLastPlayed] = useState<{
    surahNum: number;
    time: number;
    reciterId: string;
  } | null>(null);
  const { settings } = useSettings();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    return audio.subscribe(setS);
  }, []);

  useEffect(() => {
    setLastPlayed(audio.getLastPlayedSurah());
  }, [s.id, s.playing]);

  // Autoplay next surah in background when current surah ends
  useEffect(() => {
    audio.setOnEndedCallback(() => {
      if (s.id && s.id.startsWith("surah-")) {
        const surahNum = parseInt(s.id.replace("surah-", ""), 10);
        if (!isNaN(surahNum)) {
          const nextNum = surahNum < 114 ? surahNum + 1 : 1;
          const reciter = settings.quranReciter || "ar.alafasy";
          void audio.playSurah(nextNum, { reciterId: reciter }).catch(() =>
            appToast.error(t.nextSurahUnavailable || "Next surah unavailable", {
              category: "reciter",
            }),
          );
        }
      }
    });
  }, [s.id, settings.quranReciter, t]);

  // ACTIVE PLAYBACK VIEW (when a surah, ayah or invocation is loaded)
  if (s.id && s.metadata) {
    const { type, title, subtitle, arabic, badge, surahNumber } = s.metadata;
    const isPlaying = s.playing;
    const progressPercent =
      s.duration > 0 ? Math.min(100, Math.max(0, (s.time / s.duration) * 100)) : 0;

    const handleTogglePlay = (e: React.MouseEvent) => {
      e.stopPropagation();
      vibrate("button", settings);
      audio.toggle();
    };

    const handleClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      vibrate("button", settings);
      audio.stop();
    };

    const handlePrevSurah = (e: React.MouseEvent) => {
      e.stopPropagation();
      vibrate("button", settings);
      if (surahNumber) {
        const prev = surahNumber > 1 ? surahNumber - 1 : 114;
        void audio.playSurah(prev, { reciterId: settings.quranReciter }).catch(() =>
          appToast.error(t.recitationUnavailable || "Recitation currently unavailable", {
            category: "reciter",
          }),
        );
      }
    };

    const handleNextSurah = (e: React.MouseEvent) => {
      e.stopPropagation();
      vibrate("button", settings);
      if (surahNumber) {
        const next = surahNumber < 114 ? surahNumber + 1 : 1;
        void audio.playSurah(next, { reciterId: settings.quranReciter }).catch(() =>
          appToast.error(t.recitationUnavailable || "Recitation currently unavailable", {
            category: "reciter",
          }),
        );
      }
    };

    const handleOpenSource = () => {
      if (surahNumber && onOpenSurah) {
        onOpenSurah(surahNumber);
      } else if (type === "surah" || type === "ayah") {
        navigate({ to: "/quran" });
      }
    };

    return (
      <>
        <div
          data-widget-card
          className={`relative w-full my-3 sm:my-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 dark:border-emerald-500/30 rounded-2xl sm:rounded-3xl shadow-sm sm:shadow-md p-2.5 sm:p-3 overflow-hidden flex items-center justify-between gap-2.5 transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${className}`}
        >
          {/* Top Thin Progress Line for audio tracks */}
          {type !== "invocation" && s.duration > 0 && (
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500/15 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Left: Metadata & Click to open */}
          <div
            onClick={handleOpenSource}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group select-none"
          >
            {/* Badge */}
            <div
              className={`grid size-9 sm:size-10 shrink-0 place-items-center rounded-xl sm:rounded-2xl font-black text-xs text-white shadow-xs ${
                type === "invocation"
                  ? "bg-gradient-to-br from-amber-500 to-amber-700"
                  : type === "ayah"
                    ? "bg-gradient-to-br from-teal-600 to-emerald-700"
                    : "bg-gradient-to-br from-emerald-600 to-teal-800"
              }`}
            >
              {type === "invocation" ? (
                <Sparkles className="size-4" />
              ) : (
                <span className="font-extrabold">{badge || surahNumber || "1"}</span>
              )}
            </div>

            {/* Title, Arabic, Equalizer, Subtitle */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <h4 className="font-extrabold text-foreground text-xs sm:text-sm truncate group-hover:text-emerald-600 transition-colors">
                  {title}
                </h4>
                {arabic && (
                  <span className="font-[var(--font-arabic)] text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 shrink-0 truncate max-w-[100px]">
                    {arabic}
                  </span>
                )}
                {isPlaying && (
                  <div
                    className="flex items-end gap-0.5 h-3 w-3 shrink-0 pb-0.5"
                    title="Lecture en cours"
                  >
                    <span className="w-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-eq-bar-1" />
                    <span className="w-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-eq-bar-2" />
                    <span className="w-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-eq-bar-3" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate font-medium mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Surah Prev Button */}
            {type === "surah" && (
              <button
                type="button"
                onClick={handlePrevSurah}
                aria-label="Sourate précédente"
                title="Sourate précédente"
                className="grid size-8 place-items-center rounded-full text-foreground/80 hover:text-emerald-600 hover:bg-emerald-500/10 transition active:scale-90 cursor-pointer"
              >
                <SkipBack className="size-4 fill-current" />
              </button>
            )}

            {/* Play / Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? "Mettre en pause" : "Reprendre la lecture"}
              title={isPlaying ? "Pause" : "Lecture"}
              className="grid size-9 sm:size-10 place-items-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Surah Next Button */}
            {type === "surah" && (
              <button
                type="button"
                onClick={handleNextSurah}
                aria-label="Sourate suivante"
                title="Sourate suivante"
                className="grid size-8 place-items-center rounded-full text-foreground/80 hover:text-emerald-600 hover:bg-emerald-500/10 transition active:scale-90 cursor-pointer"
              >
                <SkipForward className="size-4 fill-current" />
              </button>
            )}

            {/* Audio Options Modal Trigger (Surah only) */}
            {type === "surah" && surahNumber && (
              <button
                type="button"
                onClick={() => setShowAudioMenu(true)}
                className="grid size-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition active:scale-90 cursor-pointer"
                title="Menu Audio"
                aria-label="Menu Audio"
              >
                <SlidersHorizontal className="size-3.5" />
              </button>
            )}

            {/* Close "X" Button */}
            <button
              type="button"
              onClick={handleClose}
              className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition active:scale-90 cursor-pointer"
              title="Fermer le lecteur"
              aria-label="Fermer le lecteur"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {type === "surah" && surahNumber && (
          <QuranAudioMenuModal
            isOpen={showAudioMenu}
            onClose={() => setShowAudioMenu(false)}
            currentSurahNum={surahNumber}
          />
        )}
      </>
    );
  }

  // IDLE RESUME VIEW (when no audio is actively loaded, offer to resume previous playback if available)
  if (!lastPlayed || !lastPlayed.surahNum) return null;
  const savedSurah = getSurahMeta(lastPlayed.surahNum);
  if (!savedSurah) return null;

  const reciter =
    QURAN_RECITERS.find(
      (r) => r.id === (lastPlayed.reciterId || settings.quranReciter || "ar.alafasy"),
    ) || QURAN_RECITERS[0];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleResume = () => {
    vibrate("button", settings);
    const reciterId = settings.quranReciter || "ar.alafasy";
    void audio
      .playSurah(lastPlayed.surahNum, { reciterId })
      .then(() => {
        if (lastPlayed.time > 0) {
          audio.seekTo(lastPlayed.time);
        }
      })
      .catch(() =>
        appToast.error(t.cannotResumePlayback || "Cannot resume playback", {
          category: "reciter",
        }),
      );
  };

  const handleClearLastPlayed = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem("nur.quran.last_played");
    setLastPlayed(null);
  };

  return (
    <div
      data-widget-card
      className={`relative w-full my-3 sm:my-3.5 p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl glass border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-sm animate-in fade-in duration-300 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          onClick={() => onOpenSurah && onOpenSurah(lastPlayed.surahNum)}
          className="flex items-center gap-3 min-w-0 cursor-pointer group"
        >
          <div className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-xl sm:rounded-2xl bg-emerald-600/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
            <BookmarkCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Dernière écoute
              </span>
              <span className="text-[10px] text-muted-foreground">•</span>
              <span className="text-[10px] font-mono font-bold text-foreground">
                {formatTime(lastPlayed.time)}
              </span>
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-foreground truncate group-hover:text-emerald-600 transition-colors">
              Sourate {savedSurah.englishName} ({savedSurah.name})
            </h4>
            <p className="text-[10px] text-muted-foreground truncate">
              {reciter.name.replace("Sheikh ", "")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleResume}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Play className="size-3.5 fill-current" />
            <span>Reprendre</span>
          </button>
          <button
            type="button"
            onClick={handleClearLastPlayed}
            className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:text-foreground transition cursor-pointer"
            title="Supprimer l'historique"
            aria-label="Supprimer l'historique"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
