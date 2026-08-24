const STORAGE_KEY = "islam_noor_onboarding_completed";
const ONBOARDING_EVENT = "islam_noor_open_onboarding";

export function isOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setOnboardingCompleted(completed = true) {
  if (typeof window === "undefined") return;
  if (completed) {
    localStorage.setItem(STORAGE_KEY, "true");
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function openOnboardingGuide() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ONBOARDING_EVENT));
}

export function subscribeToOnboardingOpen(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(ONBOARDING_EVENT, handler);
  return () => {
    window.removeEventListener(ONBOARDING_EVENT, handler);
  };
}
