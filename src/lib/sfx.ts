/**
 * Tiny WebAudio sound effects (no asset download, no latency).
 * Used by the tasbih counter and the prayer tracking checkboxes.
 */

let ctx: AudioContext | null = null;

function context() {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  start: number,
  duration: number,
  gain = 0.08,
  type: OscillatorType = "sine",
) {
  const ac = context();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  amp.gain.setValueAtTime(0.0001, ac.currentTime + start);
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.02);
}

/** Short dry click for each tasbih tap. */
export function playClick() {
  try {
    tone(880, 0, 0.06, 0.06, "triangle");
  } catch {
    /* audio unavailable */
  }
}

/** Two-note confirmation used when a prayer is ticked. */
export function playConfirm() {
  try {
    tone(660, 0, 0.12, 0.07);
    tone(990, 0.09, 0.18, 0.07);
  } catch {
    /* audio unavailable */
  }
}
