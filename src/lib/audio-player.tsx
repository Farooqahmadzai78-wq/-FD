import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { stopAzan } from "./azan-audio-engine";
import { stopReminderSpeech } from "./reminder-speaker";
import { ALL_SURAHS, getSurahMeta } from "./quran-data";
import {
  toggleInvocationAudio,
  resetInvocationAudio,
  pauseActiveAudio,
  resumeActiveAudio,
  isInvocationPlaying,
  isInvocationActive,
} from "./invocation-speaker";

export type TrackType = "surah" | "ayah" | "invocation";

export type TrackMetadata = {
  type: TrackType;
  title: string;
  subtitle?: string;
  arabic?: string;
  badge?: string | number;
  surahNumber?: number;
  ayahNumber?: number;
  globalAyahNumber?: number;
  reciterName?: string;
  reciterId?: string;
  invId?: string;
  src?: string;
};

export type State = {
  id: string | null;
  playing: boolean;
  time: number;
  duration: number;
  playbackRate: number;
  reciterId: string;
  autoPlayNext: boolean;
  loopSurah: boolean;
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
  metadata: TrackMetadata | null;
};

const RECITERS_NAME_MAP: Record<string, string> = {
  "ar.alafasy": "Mishary Rashid Alafasy",
  "ar.abdulbasitmurattal": "Abdul Basit Murattal",
  "ar.husary": "Mahmoud Khalil Al-Husary",
  "ar.saadghamdi": "Saad Al-Ghamdi",
  "ar.mahermuaiqly": "Maher Al-Muaiqly",
};

export function getReciterDisplayName(id?: string): string {
  if (!id) return "Mishary Rashid Alafasy";
  return RECITERS_NAME_MAP[id] || "Mishary Rashid Alafasy";
}

let el: HTMLAudioElement | null = null;
let currentId: string | null = null;
let currentReciterId: string = (() => {
  try {
    if (typeof window !== "undefined") {
      const raw1 = localStorage.getItem("nur.settings.v1");
      if (raw1) {
        const parsed = JSON.parse(raw1);
        if (parsed.quranReciter) return parsed.quranReciter;
      }
      const raw2 = localStorage.getItem("nur_app_settings");
      if (raw2) {
        const parsed = JSON.parse(raw2);
        if (parsed.quranReciter) return parsed.quranReciter;
      }
    }
  } catch {
    /* ignore */
  }
  return "ar.alafasy";
})();

let currentPlaybackRate: number = 1.0;
let autoPlayNextEnabled: boolean = true;
let loopSurahEnabled: boolean = false;
let sleepTimerMinutesValue: number | null = null;
let sleepTimerSecondsRemaining: number | null = null;
let sleepTimerInterval: ReturnType<typeof setInterval> | null = null;
let onTrackEndedCallback: (() => void) | null = null;

const positions = new Map<string, number>();
const listeners = new Set<(s: State) => void>();

let state: State = {
  id: null,
  playing: false,
  time: 0,
  duration: 0,
  playbackRate: 1.0,
  reciterId: currentReciterId,
  autoPlayNext: true,
  loopSurah: false,
  sleepTimerMinutes: null,
  sleepTimerRemaining: null,
  metadata: null,
};

function emit(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
}

function getSurahAudioCandidates(surahNumber: number, reciterId: string): string[] {
  const pad3 = String(surahNumber).padStart(3, "0");
  const candidates: string[] = [
    `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`,
  ];

  switch (reciterId) {
    case "ar.alafasy":
      candidates.push(
        `https://server8.mp3quran.net/afs/${pad3}.mp3`,
        `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${pad3}.mp3`,
      );
      break;
    case "ar.abdulbasitmurattal":
      candidates.push(
        `https://server7.mp3quran.net/basit/${pad3}.mp3`,
        `https://download.quranicaudio.com/quran/abdulbaset_mujawwad/${pad3}.mp3`,
      );
      break;
    case "ar.husary":
      candidates.push(
        `https://server13.mp3quran.net/hssr/${pad3}.mp3`,
        `https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree_iza3a/${pad3}.mp3`,
      );
      break;
    case "ar.saadghamdi":
      candidates.push(
        `https://server7.mp3quran.net/s_gmd/${pad3}.mp3`,
        `https://download.quranicaudio.com/quran/sa3d_al-ghaamidi/complete/${pad3}.mp3`,
      );
      break;
    case "ar.mahermuaiqly":
      candidates.push(
        `https://server12.mp3quran.net/maher/${pad3}.mp3`,
        `https://download.quranicaudio.com/quran/maher_256/${pad3}.mp3`,
      );
      break;
    default:
      candidates.push(`https://server8.mp3quran.net/afs/${pad3}.mp3`);
      break;
  }

  return candidates;
}

function getAyahAudioCandidates(
  globalAyahNumber: number,
  surahNumber?: number,
  ayahNumberInSurah?: number,
  reciterId: string = "ar.alafasy",
): string[] {
  const candidates: string[] = [
    `https://cdn.islamic.network/quran/audio/128/${reciterId}/${globalAyahNumber}.mp3`,
  ];

  if (surahNumber && ayahNumberInSurah) {
    const padSurah = String(surahNumber).padStart(3, "0");
    const padAyah = String(ayahNumberInSurah).padStart(3, "0");
    const eaBase = "https://everyayah.com/data";

    switch (reciterId) {
      case "ar.alafasy":
        candidates.push(
          `${eaBase}/Alafasy_128kbps/${padSurah}${padAyah}.mp3`,
          `https://verses.quran.com/Alafasy/mp3/${padSurah}${padAyah}.mp3`,
        );
        break;
      case "ar.abdulbasitmurattal":
        candidates.push(`${eaBase}/Abdul_Basit_Murattal_192kbps/${padSurah}${padAyah}.mp3`);
        break;
      case "ar.husary":
        candidates.push(`${eaBase}/Husary_128kbps/${padSurah}${padAyah}.mp3`);
        break;
      case "ar.saadghamdi":
        candidates.push(`${eaBase}/Ghamadi_40kbps/${padSurah}${padAyah}.mp3`);
        break;
      case "ar.mahermuaiqly":
        candidates.push(`${eaBase}/Maher_AlMuaiqly_64kbps/${padSurah}${padAyah}.mp3`);
        break;
      default:
        candidates.push(`${eaBase}/Alafasy_128kbps/${padSurah}${padAyah}.mp3`);
        break;
    }
  }

  return candidates;
}

function element() {
  if (el) return el;
  el = new Audio();
  el.preload = "none";
  el.playbackRate = currentPlaybackRate;

  el.addEventListener("timeupdate", () => {
    if (currentId) {
      positions.set(currentId, el!.currentTime);
      // Persist last played position for Quran surahs
      if (currentId.startsWith("surah-")) {
        try {
          const num = parseInt(currentId.replace("surah-", ""), 10);
          if (!isNaN(num)) {
            localStorage.setItem(
              "nur.quran.last_played",
              JSON.stringify({ surahNum: num, time: el!.currentTime, reciterId: currentReciterId }),
            );
          }
        } catch {
          /* ignore storage error */
        }
      }
    }
    emit({ time: el!.currentTime });
  });

  el.addEventListener("loadedmetadata", () => {
    if (el) {
      el.playbackRate = currentPlaybackRate;
      emit({ duration: el.duration || 0 });
    }
  });

  el.addEventListener("ended", () => {
    if (loopSurahEnabled && currentId) {
      if (el) {
        el.currentTime = 0;
        void el.play().catch(() => emit({ playing: false }));
        emit({ time: 0, playing: true });
      }
      return;
    }
    if (currentId) positions.delete(currentId);
    emit({ playing: false, time: 0 });
    if (autoPlayNextEnabled && onTrackEndedCallback) {
      onTrackEndedCallback();
    }
  });

  el.addEventListener("error", () => {
    if (state.metadata?.type !== "invocation") {
      emit({ playing: false });
    }
  });

  el.addEventListener("pause", () => {
    if (state.metadata?.type !== "invocation") {
      emit({ playing: false });
    }
  });
  el.addEventListener("play", () => {
    if (state.metadata?.type !== "invocation") {
      emit({ playing: true });
    }
  });
  return el;
}

export const audio = {
  subscribe(fn: (s: State) => void) {
    listeners.add(fn);
    fn(state);
    return () => listeners.delete(fn);
  },
  get state() {
    return state;
  },
  setOnEndedCallback(cb: (() => void) | null) {
    onTrackEndedCallback = cb;
  },
  setAutoPlayNext(enabled: boolean) {
    autoPlayNextEnabled = enabled;
    emit({ autoPlayNext: enabled });
  },
  setLoopSurah(enabled: boolean) {
    loopSurahEnabled = enabled;
    emit({ loopSurah: enabled });
  },
  setSleepTimer(minutes: number | null) {
    if (sleepTimerInterval) {
      clearInterval(sleepTimerInterval);
      sleepTimerInterval = null;
    }
    sleepTimerMinutesValue = minutes;

    if (!minutes || minutes <= 0) {
      sleepTimerSecondsRemaining = null;
      emit({ sleepTimerMinutes: null, sleepTimerRemaining: null });
      return;
    }

    sleepTimerSecondsRemaining = minutes * 60;
    emit({ sleepTimerMinutes: minutes, sleepTimerRemaining: sleepTimerSecondsRemaining });

    sleepTimerInterval = setInterval(() => {
      if (sleepTimerSecondsRemaining !== null && sleepTimerSecondsRemaining > 0) {
        sleepTimerSecondsRemaining -= 1;
        emit({ sleepTimerRemaining: sleepTimerSecondsRemaining });

        if (sleepTimerSecondsRemaining <= 0) {
          if (sleepTimerInterval) clearInterval(sleepTimerInterval);
          sleepTimerInterval = null;
          sleepTimerMinutesValue = null;
          sleepTimerSecondsRemaining = null;
          if (el) el.pause();
          try {
            resetInvocationAudio();
          } catch {
            // ignore
          }
          emit({ playing: false, sleepTimerMinutes: null, sleepTimerRemaining: null });
        }
      }
    }, 1000);
  },
  setPlaybackRate(rate: number) {
    currentPlaybackRate = rate;
    const a = element();
    a.playbackRate = rate;
    emit({ playbackRate: rate });
  },
  setReciter(reciterId: string) {
    currentReciterId = reciterId;
    emit({ reciterId });
  },
  seekTo(seconds: number) {
    const a = element();
    if (isFinite(seconds) && seconds >= 0) {
      try {
        if (a.duration && isFinite(a.duration)) {
          a.currentTime = Math.min(seconds, a.duration);
        } else {
          a.currentTime = seconds;
        }
      } catch {
        // ignore if not ready
      }
      if (currentId) positions.set(currentId, seconds);
      emit({ time: seconds });
    }
  },

  /** Resume/start an audio track with optional fallback URLs; stops everything else (including speech). */
  async play(id: string, src: string | string[], metadata?: TrackMetadata) {
    try {
      stopAzan();
      stopReminderSpeech();
      resetInvocationAudio();
    } catch {
      // ignore
    }

    const a = element();
    const candidateUrls = Array.isArray(src) ? src : [src];
    const initialSrc = candidateUrls[0] || "";

    // Auto-derive metadata if not provided
    let meta = metadata;
    if (!meta) {
      if (id.startsWith("surah-")) {
        const sNum = parseInt(id.replace("surah-", ""), 10);
        const sMeta = getSurahMeta(sNum);
        meta = {
          type: "surah",
          title: sMeta ? `Sourate ${sMeta.englishName}` : `Sourate ${sNum}`,
          subtitle: getReciterDisplayName(currentReciterId),
          arabic: sMeta?.name,
          badge: sNum,
          surahNumber: sNum,
          reciterName: getReciterDisplayName(currentReciterId),
          reciterId: currentReciterId,
          src: initialSrc,
        };
      } else if (id.startsWith("ayah-")) {
        const parts = id.replace("ayah-", "").split("-");
        if (parts.length >= 2) {
          const sNum = parseInt(parts[0], 10);
          const aNum = parseInt(parts[1], 10);
          const sMeta = getSurahMeta(sNum);
          meta = {
            type: "ayah",
            title: sMeta ? `Sourate ${sMeta.englishName}` : `Sourate ${sNum}`,
            subtitle: `Verset ${aNum} · ${getReciterDisplayName(currentReciterId)}`,
            arabic: sMeta?.name,
            badge: `V.${aNum}`,
            surahNumber: sNum,
            ayahNumber: aNum,
            reciterName: getReciterDisplayName(currentReciterId),
            reciterId: currentReciterId,
            src: initialSrc,
          };
        } else {
          const gNum = parseInt(parts[0], 10);
          meta = {
            type: "ayah",
            title: `Verset ${gNum}`,
            subtitle: getReciterDisplayName(currentReciterId),
            badge: `V.${gNum}`,
            globalAyahNumber: gNum,
            reciterName: getReciterDisplayName(currentReciterId),
            reciterId: currentReciterId,
            src: initialSrc,
          };
        }
      }
    }

    const savedPosition = positions.get(id) ?? 0;

    // Try each candidate URL sequentially until one plays successfully
    let lastError: unknown = null;

    for (let i = 0; i < candidateUrls.length; i++) {
      const currentCandidate = candidateUrls[i];
      if (!currentCandidate) continue;

      try {
        if (currentId !== id || a.src !== currentCandidate) {
          if (currentId && isFinite(a.currentTime)) positions.set(currentId, a.currentTime);
          a.pause();
          currentId = id;
          a.src = currentCandidate;
          a.playbackRate = currentPlaybackRate;

          // Safely apply saved position after metadata is loaded or if ready
          if (savedPosition > 0) {
            if (a.readyState >= 1 && a.duration && savedPosition < a.duration) {
              try {
                a.currentTime = savedPosition;
              } catch {
                /* ignore */
              }
            } else {
              const applyPosition = () => {
                try {
                  if (a.duration && savedPosition < a.duration) {
                    a.currentTime = savedPosition;
                  }
                } catch {
                  /* ignore */
                }
              };
              a.addEventListener("loadedmetadata", applyPosition, { once: true });
            }
          }

          emit({
            id,
            metadata: meta || null,
            time: savedPosition,
            duration: 0,
            playbackRate: currentPlaybackRate,
          });
        } else if (meta) {
          emit({ metadata: meta });
        }

        await a.play();
        emit({ id, metadata: meta || null, playing: true });
        return; // Success!
      } catch (err) {
        lastError = err;
        console.warn(`[AudioPlayer] Failed playing source #${i + 1} (${currentCandidate}):`, err);
        // Continue to try the next fallback URL in the candidate list
      }
    }

    emit({ playing: false });
    throw lastError || new Error("playback-failed");
  },

  /** Play a full Surah with multiple CDN source fallbacks */
  async playSurah(surahNumber: number, options?: { reciterId?: string }) {
    const reciter = options?.reciterId || currentReciterId || "ar.alafasy";
    currentReciterId = reciter;
    const sMeta = getSurahMeta(surahNumber);
    const candidates = getSurahAudioCandidates(surahNumber, reciter);
    const primaryUrl = candidates[0];

    const metadata: TrackMetadata = {
      type: "surah",
      title: sMeta ? `Sourate ${sMeta.englishName}` : `Sourate ${surahNumber}`,
      subtitle: getReciterDisplayName(reciter),
      arabic: sMeta?.name,
      badge: surahNumber,
      surahNumber,
      reciterName: getReciterDisplayName(reciter),
      reciterId: reciter,
      src: primaryUrl,
    };
    return this.play(`surah-${surahNumber}`, candidates, metadata);
  },

  /** Play an individual Ayah with multiple CDN source fallbacks */
  async playAyah(
    surahNumber: number,
    ayahNumberInSurah: number,
    globalAyahNumber: number,
    options?: { reciterId?: string },
  ) {
    const reciter = options?.reciterId || currentReciterId || "ar.alafasy";
    currentReciterId = reciter;
    const sMeta = getSurahMeta(surahNumber);
    const candidates = getAyahAudioCandidates(
      globalAyahNumber,
      surahNumber,
      ayahNumberInSurah,
      reciter,
    );
    const primaryUrl = candidates[0];
    const id = `ayah-${surahNumber}-${ayahNumberInSurah}`;

    const metadata: TrackMetadata = {
      type: "ayah",
      title: sMeta ? `Sourate ${sMeta.englishName}` : `Sourate ${surahNumber}`,
      subtitle: `Verset ${ayahNumberInSurah} · ${getReciterDisplayName(reciter)}`,
      arabic: sMeta?.name,
      badge: `V.${ayahNumberInSurah}`,
      surahNumber,
      ayahNumber: ayahNumberInSurah,
      globalAyahNumber,
      reciterName: getReciterDisplayName(reciter),
      reciterId: reciter,
      src: primaryUrl,
    };
    return this.play(id, candidates, metadata);
  },

  /** Play an Invocation using vocal speech synthesis */
  playInvocation(
    invId: string,
    meta: { title: string; arabic: string; translit?: string; source?: string },
  ) {
    try {
      stopAzan();
      stopReminderSpeech();
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    } catch {
      // ignore
    }

    const id = `invocation-${invId}`;
    currentId = id;

    const metadata: TrackMetadata = {
      type: "invocation",
      title: meta.title,
      subtitle: meta.translit || meta.source || "Invocation",
      arabic: meta.arabic,
      badge: "INV",
      invId,
    };

    toggleInvocationAudio(invId, meta.arabic);

    emit({
      id,
      metadata,
      playing: true,
      time: 0,
      duration: 0,
    });
  },

  /** Pause whichever audio is active */
  pause() {
    if (state.metadata?.type === "invocation") {
      pauseActiveAudio();
      emit({ playing: false });
      return;
    }
    element().pause();
    if (currentId) positions.set(currentId, element().currentTime);
    emit({ playing: false });
  },

  /** Resume currently active audio */
  async resume() {
    if (state.metadata?.type === "invocation") {
      resumeActiveAudio();
      emit({ playing: true });
      return;
    }
    if (currentId && el) {
      try {
        await el.play();
        emit({ playing: true });
      } catch {
        emit({ playing: false });
      }
    }
  },

  /** Toggle play/pause for active track */
  toggle(id?: string) {
    if (id && currentId !== id) return;
    if (state.playing) {
      this.pause();
    } else {
      void this.resume();
    }
  },

  /** Stop playback completely, remove active player and dismiss bar */
  stop() {
    try {
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
      resetInvocationAudio();
    } catch {
      // ignore
    }
    if (currentId) positions.delete(currentId);
    currentId = null;
    emit({ id: null, metadata: null, playing: false, time: 0, duration: 0 });
  },

  /** Reset a track; if active, removes player entirely */
  reset(id: string) {
    positions.delete(id);
    if (currentId === id || (currentId && currentId.startsWith(id))) {
      this.stop();
    }
  },

  isActive(id: string) {
    if (!currentId) return false;
    if (currentId === id) return true;
    if (state.metadata?.type === "ayah") {
      if (id === `ayah-${state.metadata.globalAyahNumber}`) return true;
      if (id === `ayah-${state.metadata.surahNumber}-${state.metadata.ayahNumber}`) return true;
    }
    if (state.metadata?.type === "invocation" && id === state.metadata.invId) return true;
    return false;
  },

  positionOf(id: string) {
    return currentId === id ? state.time : (positions.get(id) ?? 0);
  },

  getLastPlayedSurah(): { surahNum: number; time: number; reciterId: string } | null {
    try {
      const raw = localStorage.getItem("nur.quran.last_played");
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return null;
  },
};

const AudioContext = createContext<State>(state);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(state);
  useEffect(() => {
    const off = audio.subscribe(setS);
    return () => {
      off();
    };
  }, []);
  const value = useMemo(() => s, [s]);
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

/** Returns the live state of one track id. */
export function useTrack(id: string) {
  const s = useContext(AudioContext);
  const active =
    s.id === id ||
    (s.metadata?.type === "ayah" &&
      (id === `ayah-${s.metadata.globalAyahNumber}` ||
        id === `ayah-${s.metadata.surahNumber}-${s.metadata.ayahNumber}`)) ||
    (s.metadata?.type === "invocation" &&
      (id === `invocation-${s.metadata.invId}` || id === s.metadata.invId));

  return {
    active,
    playing: active && s.playing,
    time: active ? s.time : (positions.get(id) ?? 0),
    duration: active ? s.duration : 0,
    metadata: active ? s.metadata : null,
  };
}
