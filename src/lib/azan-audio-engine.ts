import { Imam, IMAMS } from "@/lib/nur-data";
import { stopReminderSpeech } from "@/lib/reminder-speaker";

export interface AzanPlaybackStatus {
  isPlaying: boolean;
  imamId: string | null;
  imamName: string | null;
  prayerName: string | null;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
}

export interface PlayAzanOptions {
  prayerName?: string;
  onPlay?: () => void;
  onEnded?: () => void;
  onError?: (err: Error) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

/**
 * AdhanAudioManager - Global Single Source of Truth for Azan Audio Playback.
 *
 * ABSOLUTE RULE: At any moment in time, only ONE single audio playback can be active.
 * When switching reciters or triggering a new playback:
 * 1. The previous HTMLAudioElement is immediately paused, unloaded, and destroyed.
 * 2. An incremental session ID (`playbackSessionId`) prevents late-resolving network promises or fallback streams from reviving old reciters.
 * 3. Any active reminder speech or external audio is cleanly stopped.
 */
class AdhanAudioManagerClass {
  private activeAudio: HTMLAudioElement | null = null;
  private currentSessionId = 0;
  private status: AzanPlaybackStatus = {
    isPlaying: false,
    imamId: null,
    imamName: null,
    prayerName: null,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
  };
  private listeners = new Set<(status: AzanPlaybackStatus) => void>();

  public subscribe(listener: (status: AzanPlaybackStatus) => void): () => void {
    this.listeners.add(listener);
    listener({ ...this.status });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getStatus(): AzanPlaybackStatus {
    return { ...this.status };
  }

  private notify(): void {
    const copy = { ...this.status };
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (err) {
        console.warn("[AdhanAudioManager] Listener callback error:", err);
      }
    });
  }

  private updateStatus(patch: Partial<AzanPlaybackStatus>): void {
    this.status = { ...this.status, ...patch };
    this.notify();
  }

  /**
   * Complete, immediate teardown of any active audio element.
   * Cancels in-flight network requests, detaches listeners, pauses sound,
   * and clears media session.
   */
  public stop(): void {
    // Invalidate any in-flight asynchronous operations
    this.currentSessionId++;

    if (this.activeAudio) {
      try {
        // Detach all listeners to prevent any delayed event firing
        this.activeAudio.onplay = null;
        this.activeAudio.onpause = null;
        this.activeAudio.onended = null;
        this.activeAudio.onerror = null;
        this.activeAudio.ontimeupdate = null;
        this.activeAudio.onloadedmetadata = null;
        this.activeAudio.oncanplay = null;

        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio.removeAttribute("src");
        this.activeAudio.load();
      } catch (err) {
        console.warn("[AdhanAudioManager] Error stopping active audio:", err);
      }
      this.activeAudio = null;
    }

    this.updateStatus({
      isPlaying: false,
      imamId: null,
      imamName: null,
      prayerName: null,
      currentTime: 0,
      duration: 0,
      isLoading: false,
      error: null,
    });

    if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
      try {
        navigator.mediaSession.playbackState = "none";
      } catch {
        // ignore
      }
    }
  }

  /**
   * Pauses the current audio without resetting imam identity.
   */
  public pause(): void {
    if (this.activeAudio && this.status.isPlaying) {
      try {
        this.activeAudio.pause();
      } catch (err) {
        console.warn("[AdhanAudioManager] Pause error:", err);
      }
      this.updateStatus({ isPlaying: false });
    }
  }

  /**
   * Resumes playback if already loaded and paused for the same Imam.
   */
  public async resume(): Promise<void> {
    if (this.activeAudio && !this.status.isPlaying && this.status.imamId) {
      try {
        await this.activeAudio.play();
        this.updateStatus({ isPlaying: true });
      } catch (err) {
        console.warn("[AdhanAudioManager] Resume failed:", err);
      }
    }
  }

  /**
   * Guaranteed single playback of an Imam's Azan.
   * Immediately terminates any previously playing or loading audio.
   */
  public async play(imam: Imam, options?: PlayAzanOptions): Promise<HTMLAudioElement | null> {
    // 1. Immediately stop reminder speech to prevent concurrent voice
    try {
      stopReminderSpeech();
    } catch {
      // ignore
    }

    // 2. Stop and release previous audio completely
    this.stop();

    // 3. Register new exclusive session ID
    const sessionId = ++this.currentSessionId;

    this.updateStatus({
      isPlaying: false,
      imamId: imam.id,
      imamName: imam.name,
      prayerName: options?.prayerName || "Prière",
      currentTime: 0,
      duration: 0,
      isLoading: true,
      error: null,
    });

    const audio = new Audio();
    audio.preload = "auto";
    this.activeAudio = audio;

    const setupMediaSession = () => {
      if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: `Azan ${options?.prayerName || ""}`.trim(),
            artist: imam.name,
            album: `Islam-Noor (${imam.country})`,
            artwork: [
              { src: "/favicon.ico", sizes: "96x96", type: "image/png" },
              { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
              { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
            ],
          });

          navigator.mediaSession.setActionHandler("stop", () => {
            this.stop();
          });
          navigator.mediaSession.setActionHandler("pause", () => {
            this.stop();
          });
          navigator.mediaSession.playbackState = "playing";
        } catch {
          // ignore
        }
      }
    };

    const attemptPlaySource = (url: string): Promise<boolean> => {
      return new Promise((resolve) => {
        // If superseded by a newer click, abort immediately
        if (this.currentSessionId !== sessionId) {
          resolve(false);
          return;
        }

        audio.onloadedmetadata = () => {
          if (this.currentSessionId !== sessionId) return;
          const dur = audio.duration || 0;
          if (Number.isFinite(dur) && !Number.isNaN(dur)) {
            this.updateStatus({ duration: dur });
          }
        };

        audio.ontimeupdate = () => {
          if (this.currentSessionId !== sessionId) return;
          const cur = audio.currentTime || 0;
          const dur = audio.duration || 0;
          this.updateStatus({ currentTime: cur, duration: dur });
          options?.onTimeUpdate?.(cur, dur);
        };

        audio.onplay = () => {
          if (this.currentSessionId !== sessionId) {
            try {
              audio.pause();
              audio.removeAttribute("src");
              audio.load();
            } catch {
              // ignore
            }
            resolve(false);
            return;
          }
          this.updateStatus({ isPlaying: true, isLoading: false, error: null });
          setupMediaSession();
          options?.onPlay?.();
          resolve(true);
        };

        audio.onended = () => {
          if (this.currentSessionId !== sessionId) return;
          this.stop();
          options?.onEnded?.();
        };

        audio.onerror = () => {
          if (this.currentSessionId !== sessionId) {
            resolve(false);
            return;
          }
          console.warn(`[AdhanAudioManager] Stream error for URL: ${url}`);
          resolve(false);
        };

        audio.src = url;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (this.currentSessionId !== sessionId) {
                try {
                  audio.pause();
                  audio.removeAttribute("src");
                  audio.load();
                } catch {
                  // ignore
                }
                resolve(false);
              } else {
                resolve(true);
              }
            })
            .catch((playErr) => {
              if (this.currentSessionId !== sessionId) {
                resolve(false);
              } else {
                console.warn(`[AdhanAudioManager] play() rejected for ${url}:`, playErr);
                resolve(false);
              }
            });
        }
      });
    };

    // Attempt primary audio stream
    let success = await attemptPlaySource(imam.audio);

    // If another reciter was selected while waiting for primary, abort immediately
    if (this.currentSessionId !== sessionId) {
      return null;
    }

    // If primary failed, try fallback if available
    if (!success && imam.fallbackAudio && imam.fallbackAudio !== imam.audio) {
      console.warn(
        `[AdhanAudioManager] Primary URL failed for ${imam.name}, trying fallback: ${imam.fallbackAudio}`,
      );
      success = await attemptPlaySource(imam.fallbackAudio);
    }

    // If another reciter was selected while waiting for fallback, abort immediately
    if (this.currentSessionId !== sessionId) {
      return null;
    }

    if (!success) {
      const errorMsg = `Impossible de charger l'audio d'Azan pour ${imam.name}`;
      console.error(`[AdhanAudioManager] ${errorMsg}`);
      this.updateStatus({
        isPlaying: false,
        isLoading: false,
        error: errorMsg,
      });
      options?.onError?.(new Error(errorMsg));
      return null;
    }

    return audio;
  }
}

export const AdhanAudioManager = new AdhanAudioManagerClass();

/**
 * Plays the Azan stream for a given Imam with automatic single-instance guarantee.
 */
export function playAzan(imam: Imam, options?: PlayAzanOptions): Promise<HTMLAudioElement | null> {
  return AdhanAudioManager.play(imam, options);
}

/**
 * Stops any actively playing or loading Azan audio stream.
 */
export function stopAzan(): void {
  AdhanAudioManager.stop();
}

/**
 * Pauses the active Azan audio stream.
 */
export function pauseAzan(): void {
  AdhanAudioManager.pause();
}

/**
 * Resumes playback if previously paused.
 */
export function resumeAzan(): Promise<void> {
  return AdhanAudioManager.resume();
}

/**
 * Subscribes to real-time Azan playback state changes.
 */
export function subscribeAzanStatus(listener: (status: AzanPlaybackStatus) => void): () => void {
  return AdhanAudioManager.subscribe(listener);
}

/**
 * Gets the current snapshot of Azan playback.
 */
export function getAzanStatus(): AzanPlaybackStatus {
  return AdhanAudioManager.getStatus();
}

/**
 * Resolves an Imam object from imamId, defaulting to Makkah (IMAMS[0]).
 */
export function resolveImam(imamId?: string | null): Imam {
  if (!imamId) return IMAMS[0];
  return IMAMS.find((i) => i.id === imamId) ?? IMAMS[0];
}
