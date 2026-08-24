/**
 * Single-instance high-precision AI speech audio player for Arabic invocations.
 * Features:
 * - Play / Pause toggle with position retention (never restarts automatically on pause).
 * - Single-instance guarantee: rapidly clicking never overlays audio instances.
 * - Reset button capability: explicitly resets position to 0.
 * - Reactive state subscriptions so UI components stay 100% synchronized with actual audio state.
 * - Web Speech API with clause chunking for natural, un-truncated Classical Arabic recitation.
 */

interface InvocationPlayerState {
  id: string;
  arabicText: string;
  chunks: string[];
  currentChunkIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
}

type StateChangeListener = (activeId: string | null, isPlaying: boolean) => void;

let playerState: InvocationPlayerState | null = null;
let currentChunkTimeout: ReturnType<typeof setTimeout> | null = null;
const stateListeners = new Set<StateChangeListener>();

/**
 * Subscribe to audio state changes (play, pause, stop, finish).
 */
export function subscribePlayerState(listener: StateChangeListener): () => void {
  stateListeners.add(listener);
  // Send current state immediately upon subscribing
  listener(playerState ? playerState.id : null, playerState ? playerState.isPlaying : false);
  return () => {
    stateListeners.delete(listener);
  };
}

function notifyListeners() {
  const activeId = playerState ? playerState.id : null;
  const isPlaying = playerState ? playerState.isPlaying : false;
  stateListeners.forEach((fn) => {
    try {
      fn(activeId, isPlaying);
    } catch {
      // ignore
    }
  });
}

// Pre-load Web Speech voices if available in browser
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

/**
 * Clean Arabic text for vocal recitation:
 * Strips bracketed source notes, non-recited instructions, and parenthetical markers
 * while retaining 100% of the Classical Arabic invocation words and diacritics.
 */
export function cleanArabicForSpeech(rawText: string): string {
  if (!rawText) return "";

  let cleaned = rawText;

  // Remove parenthetical annotations / instructions
  cleaned = cleaned.replace(/\(ويرد[^)]*\)/g, "");
  cleaned = cleaned.replace(/\(ويرد السامع[^)]*\)/g, "");
  cleaned = cleaned.replace(/\(Response[^)]*\)/g, "");
  cleaned = cleaned.replace(/\([0-9١-٩]+x\)/gi, "");
  cleaned = cleaned.replace(/\(ثلاثاً\)/g, "");
  cleaned = cleaned.replace(/\(ثلاث مرات\)/g, "");
  cleaned = cleaned.replace(/\([^)]*\)/g, "");
  cleaned = cleaned.replace(/\[[^\]]*\]/g, "");

  // Normalize spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/**
 * Split text into small natural clauses (<= 120 chars) so speech synthesis
 * never truncates long sentences and pronounces every single word clearly.
 */
function chunkArabicText(text: string, maxLen = 120): string[] {
  const cleaned = cleanArabicForSpeech(text);
  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  const clauses = cleaned.split(/(?<=[،.؛!?])/);
  const chunks: string[] = [];
  let current = "";

  for (const clause of clauses) {
    if ((current + " " + clause).trim().length <= maxLen) {
      current = (current + " " + clause).trim();
    } else {
      if (current) chunks.push(current);
      if (clause.length > maxLen) {
        const words = clause.split(" ");
        let sub = "";
        for (const w of words) {
          if ((sub + " " + w).trim().length <= maxLen) {
            sub = (sub + " " + w).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        current = sub;
      } else {
        current = clause.trim();
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.filter((c) => c.length > 0);
}

function getBestArabicVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const arVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("ar"));

  if (arVoices.length === 0) return null;

  const preferredNames = [
    "maged",
    "tarek",
    "google",
    "natural",
    "laila",
    "zeina",
    "salma",
    "saudi",
  ];
  for (const keyword of preferredNames) {
    const found = arVoices.find((v) => v.name.toLowerCase().includes(keyword));
    if (found) return found;
  }

  const saudiVoice = arVoices.find((v) => v.lang.toLowerCase().includes("sa"));
  if (saudiVoice) return saudiVoice;

  return arVoices[0];
}

function playChunk(index: number) {
  if (!playerState || !playerState.isPlaying) return;

  if (index >= playerState.chunks.length) {
    // End of recitation reached!
    resetInvocationAudio();
    return;
  }

  playerState.currentChunkIndex = index;

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    resetInvocationAudio();
    return;
  }

  const chunkText = playerState.chunks[index];
  const targetId = playerState.id;

  try {
    const u = new SpeechSynthesisUtterance(chunkText);
    u.lang = "ar-SA";
    u.rate = 0.85;
    u.pitch = 1.0;

    const bestVoice = getBestArabicVoice();
    if (bestVoice) {
      u.voice = bestVoice;
    }

    u.onend = () => {
      if (playerState && playerState.id === targetId && playerState.isPlaying) {
        const nextIndex = index + 1;
        currentChunkTimeout = setTimeout(() => {
          playChunk(nextIndex);
        }, 120);
      }
    };

    u.onerror = (e) => {
      // Crucial: Ignore 'canceled' or 'interrupted' errors triggered when paused or stopped
      if (e.error === "canceled" || e.error === "interrupted") {
        return;
      }
      if (playerState && playerState.id === targetId && playerState.isPlaying) {
        const nextIndex = index + 1;
        playChunk(nextIndex);
      }
    };

    window.speechSynthesis.speak(u);
  } catch {
    if (playerState && playerState.id === targetId && playerState.isPlaying) {
      const nextIndex = index + 1;
      playChunk(nextIndex);
    }
  }
}

/**
 * Completely stops audio and resets playback position to 0 for a given invocation (or all).
 */
export function resetInvocationAudio(id?: string) {
  if (id && playerState && playerState.id !== id) {
    return;
  }

  if (currentChunkTimeout) {
    clearTimeout(currentChunkTimeout);
    currentChunkTimeout = null;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  playerState = null;
  notifyListeners();
}

/**
 * Legacy stop function alias that resets audio state.
 */
export function stopInvocationAudio() {
  resetInvocationAudio();
}

/**
 * Checks if a given invocation is currently actively playing (not paused).
 */
export function isInvocationPlaying(id: string): boolean {
  return !!(playerState && playerState.id === id && playerState.isPlaying);
}

/**
 * Checks if a given invocation is active (either playing or paused).
 */
export function isInvocationActive(id: string): boolean {
  return !!(playerState && playerState.id === id);
}

/**
 * Pauses active audio recitation.
 */
export function pauseActiveAudio() {
  if (!playerState) return;

  if (currentChunkTimeout) {
    clearTimeout(currentChunkTimeout);
    currentChunkTimeout = null;
  }

  playerState.isPlaying = false;
  playerState.isPaused = true;

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  notifyListeners();
}

/**
 * Resumes active audio recitation from paused position.
 */
export function resumeActiveAudio(): boolean {
  if (!playerState) return false;

  playerState.isPlaying = true;
  playerState.isPaused = false;

  notifyListeners();
  playChunk(playerState.currentChunkIndex);
  return true;
}

/**
 * Toggles play / pause for the specified invocation ID.
 * Returns true if now playing, or false if now paused.
 */
export function toggleInvocationAudio(id: string, arabicText: string): boolean {
  // Scenario 1: Same invocation already active
  if (playerState && playerState.id === id) {
    if (playerState.isPlaying) {
      pauseActiveAudio();
      return false;
    } else {
      return resumeActiveAudio();
    }
  }

  // Scenario 2: Different invocation or brand new play -> Reset previous & start fresh
  resetInvocationAudio();

  const chunks = chunkArabicText(arabicText);
  if (chunks.length === 0) {
    return false;
  }

  playerState = {
    id,
    arabicText,
    chunks,
    currentChunkIndex: 0,
    isPlaying: true,
    isPaused: false,
  };

  notifyListeners();
  playChunk(0);
  return true;
}

/**
 * Legacy play function wrapper that delegates to toggle.
 */
export function playInvocationAudio(id: string, arabicText: string): boolean {
  return toggleInvocationAudio(id, arabicText);
}
