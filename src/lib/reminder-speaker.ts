import { getTtsAudio } from "./tts.functions";
import { stopAzan } from "./azan-audio-engine";

export interface SpeakerState {
  activeId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
}

type Listener = (state: SpeakerState) => void;

let activeId: string | null = null;
let isPlaying = false;
let isLoading = false;
let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
const listeners = new Set<Listener>();

export function subscribeSpeakerState(listener: Listener): () => void {
  listeners.add(listener);
  listener({ activeId, isPlaying, isLoading });
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  const state: SpeakerState = { activeId, isPlaying, isLoading };
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch {
      // ignore
    }
  });
}

/** Preload Web Speech voices */
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  } catch {
    // ignore
  }
}

export function stopReminderSpeech() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  currentUtterance = null;
  activeId = null;
  isPlaying = false;
  isLoading = false;
  notify();
}

function getBestVoice(isArabic: boolean): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const targetLang = isArabic ? "ar" : "fr";
  const matched = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(targetLang));

  if (matched.length === 0) {
    // Fallback search
    return (
      voices.find((v) => v.lang && v.lang.toLowerCase().includes(isArabic ? "ar" : "fr")) || null
    );
  }

  if (isArabic) {
    const keywords = ["maged", "tarek", "google", "natural", "laila", "zeina", "salma", "saudi"];
    for (const kw of keywords) {
      const found = matched.find((v) => v.name.toLowerCase().includes(kw));
      if (found) return found;
    }
  } else {
    const keywords = [
      "thomas",
      "audrey",
      "aurelie",
      "hortense",
      "nicolas",
      "google",
      "natural",
      "julie",
      "fr-fr",
    ];
    for (const kw of keywords) {
      const found = matched.find((v) => v.name.toLowerCase().includes(kw));
      if (found) return found;
    }
  }

  return matched[0];
}

function speakWithWebSpeech(id: string, text: string, isArabic: boolean) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    stopReminderSpeech();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isArabic ? "ar-SA" : "fr-FR";
    utterance.rate = isArabic ? 0.85 : 0.95;
    utterance.pitch = 1.0;

    const voice = getBestVoice(isArabic);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      activeId = id;
      isLoading = false;
      isPlaying = true;
      notify();
    };

    utterance.onend = () => {
      stopReminderSpeech();
    };

    utterance.onerror = (e) => {
      if (e.error === "canceled" || e.error === "interrupted") return;
      console.error("[ReminderSpeaker] SpeechSynthesis error:", e);
      stopReminderSpeech();
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("[ReminderSpeaker] WebSpeech failed:", err);
    stopReminderSpeech();
  }
}

export async function speakReminderText(
  id: string,
  text: string,
  isArabic = false,
): Promise<boolean> {
  // If clicking same active item while playing: toggle pause/stop
  if (activeId === id) {
    if (isPlaying || isLoading) {
      stopReminderSpeech();
      return false;
    }
  }

  stopReminderSpeech();
  try {
    stopAzan();
  } catch {
    // ignore
  }

  const cleanText = text
    .replace(/\{prayer\}/g, "Fajr")
    .replace(/\{min\}/g, "15")
    .trim();
  if (!cleanText) return false;

  activeId = id;
  isLoading = true;
  isPlaying = false;
  notify();

  // 1. Try Server TTS
  try {
    const audioUrl = await getTtsAudio({
      data: {
        text: cleanText,
        voice: isArabic ? "onyx" : "alloy",
      },
    });

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onended = () => {
        stopReminderSpeech();
      };

      audio.onerror = (e) => {
        console.warn("[ReminderSpeaker] Server Audio failed, attempting Web Speech fallback:", e);
        speakWithWebSpeech(id, cleanText, isArabic);
      };

      await audio.play();
      isLoading = false;
      isPlaying = true;
      notify();
      return true;
    }
  } catch (err) {
    console.warn("[ReminderSpeaker] Server TTS unavailable, falling back to Web Speech:", err);
  }

  // 2. Fallback to Web Speech
  speakWithWebSpeech(id, cleanText, isArabic);
  return true;
}

export function isSpeakerPlaying(id?: string): boolean {
  if (!id) return isPlaying;
  return activeId === id && isPlaying;
}

export function isSpeakerLoading(id?: string): boolean {
  if (!id) return isLoading;
  return activeId === id && isLoading;
}
