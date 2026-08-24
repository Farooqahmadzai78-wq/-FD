import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowDown, X, Camera, Palette, Compass, Check, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// ==========================================
// 1. HALAL INGREDIENTS PHOTO HINT
// ==========================================
const HALAL_HINT_KEY = "nur.has_seen_halal_photo_hint_v1";

export function isHalalHintSeen(): boolean {
  try {
    return localStorage.getItem(HALAL_HINT_KEY) === "true";
  } catch {
    return true;
  }
}

export function markHalalHintAsSeen() {
  try {
    localStorage.setItem(HALAL_HINT_KEY, "true");
  } catch {
    // ignore
  }
}

interface HalalIngredientsHintProps {
  onTakePhoto?: () => void;
}

export function HalalIngredientsHint({ onTakePhoto }: HalalIngredientsHintProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isHalalHintSeen()) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    markHalalHintAsSeen();
    setVisible(false);
  };

  const handleAction = () => {
    markHalalHintAsSeen();
    setVisible(false);
    if (onTakePhoto) onTakePhoto();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="halal-ingredients-hint-container"
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-30 w-full mx-auto my-1 px-1 select-none"
        >
          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/95 via-teal-900/95 to-slate-900/95 text-white border border-emerald-500/30 shadow-xl shadow-emerald-950/40 backdrop-blur-md p-3.5">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mt-0.5">
                <Camera className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-emerald-200 tracking-wide uppercase">
                    {t.halalHintTitle || "Photo des ingrédients (Halal / Haram)"}
                  </h4>
                  <button
                    id="dismiss-halal-hint-btn"
                    onClick={handleDismiss}
                    aria-label="Fermer"
                    className="p-1 -mr-1 -mt-1 rounded-lg text-emerald-300/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="mt-1 text-xs text-emerald-50/90 leading-relaxed font-normal">
                  {t.halalHintText ||
                    "Si le code-barres ne marche pas, si le produit n'est pas détecté ou s'il comporte un doute, vous pouvez ajouter une photo des ingrédients pour détecter directement s'il est Halal ou Haram."}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    id="halal-hint-action-btn"
                    onClick={handleAction}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold text-xs transition-all shadow-sm active:scale-95 text-center flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t.takeIngredientsPhoto || "Prendre une photo"}</span>
                  </button>
                  <button
                    id="confirm-halal-hint-btn"
                    onClick={handleDismiss}
                    className="py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{t.understood || "Compris"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Animated pointer arrow pointing DOWN directly to the options below */}
          <div className="flex justify-center -mt-2.5 relative z-10">
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-emerald-950 font-bold border-2 border-emerald-300/80 shadow-lg shadow-emerald-900/50"
            >
              <ArrowDown className="w-4 h-4" strokeWidth={3} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// 2. SETTINGS CUSTOMIZATION HINT
// ==========================================
const SETTINGS_HINT_KEY = "nur.has_seen_settings_customization_hint_v1";

export function isSettingsHintSeen(): boolean {
  try {
    return localStorage.getItem(SETTINGS_HINT_KEY) === "true";
  } catch {
    return true;
  }
}

export function markSettingsHintAsSeen() {
  try {
    localStorage.setItem(SETTINGS_HINT_KEY, "true");
  } catch {
    // ignore
  }
}

interface SettingsCustomizationHintProps {
  onExplore?: () => void;
}

export function SettingsCustomizationHint({ onExplore }: SettingsCustomizationHintProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isSettingsHintSeen()) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    markSettingsHintAsSeen();
    setVisible(false);
  };

  const handleAction = () => {
    markSettingsHintAsSeen();
    setVisible(false);
    if (onExplore) onExplore();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="settings-customization-hint-container"
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-30 w-full mx-auto my-1 px-1 select-none"
        >
          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/95 via-teal-900/95 to-slate-900/95 text-white border border-emerald-500/30 shadow-xl shadow-emerald-950/40 backdrop-blur-md p-3.5">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mt-0.5">
                <Palette className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-emerald-200 tracking-wide uppercase">
                    {t.settingsHintTitle || "Personnalisation Complète"}
                  </h4>
                  <button
                    id="dismiss-settings-hint-btn"
                    onClick={handleDismiss}
                    aria-label="Fermer"
                    className="p-1 -mr-1 -mt-1 rounded-lg text-emerald-300/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="mt-1 text-xs text-emerald-50/90 leading-relaxed font-normal">
                  {t.settingsHintText ||
                    "Vous pouvez changer la couleur des widgets, de l'arrière-plan, ou encore activer les bordures allumées (LED) et d'autres paramètres personnalisés."}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    id="settings-hint-action-btn"
                    onClick={handleAction}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold text-xs transition-all shadow-sm active:scale-95 text-center flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.customizeNow || "Personnaliser"}</span>
                  </button>
                  <button
                    id="confirm-settings-hint-btn"
                    onClick={handleDismiss}
                    className="py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{t.understood || "Compris"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Animated pointer arrow pointing DOWN directly to the options below */}
          <div className="flex justify-center -mt-2.5 relative z-10">
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-emerald-950 font-bold border-2 border-emerald-300/80 shadow-lg shadow-emerald-900/50"
            >
              <ArrowDown className="w-4 h-4" strokeWidth={3} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// 3. PRAYERS QIBLA & AR HINT
// ==========================================
const PRAYERS_QIBLA_HINT_KEY = "nur.has_seen_prayers_qibla_hint_v1";

export function isPrayersQiblaHintSeen(): boolean {
  try {
    return localStorage.getItem(PRAYERS_QIBLA_HINT_KEY) === "true";
  } catch {
    return true;
  }
}

export function markPrayersQiblaHintAsSeen() {
  try {
    localStorage.setItem(PRAYERS_QIBLA_HINT_KEY, "true");
  } catch {
    // ignore
  }
}

interface PrayersQiblaARHintProps {
  onScrollToCompass?: () => void;
}

export function PrayersQiblaARHint({ onScrollToCompass }: PrayersQiblaARHintProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isPrayersQiblaHintSeen()) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    markPrayersQiblaHintAsSeen();
    setVisible(false);
  };

  const handleAction = () => {
    markPrayersQiblaHintAsSeen();
    setVisible(false);
    if (onScrollToCompass) onScrollToCompass();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="prayers-qibla-ar-hint-container"
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-30 w-full mx-auto my-1 px-1 select-none"
        >
          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/95 via-teal-900/95 to-slate-900/95 text-white border border-emerald-500/30 shadow-xl shadow-emerald-950/40 backdrop-blur-md p-3.5">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mt-0.5">
                <Compass className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-emerald-200 tracking-wide uppercase">
                    {t.qiblaHintTitle || "Boussole & Réalité Augmentée"}
                  </h4>
                  <button
                    id="dismiss-prayers-qibla-hint-btn"
                    onClick={handleDismiss}
                    aria-label="Fermer"
                    className="p-1 -mr-1 -mt-1 rounded-lg text-emerald-300/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="mt-1 text-xs text-emerald-50/90 leading-relaxed font-normal">
                  {t.qiblaHintText ||
                    "Vous pouvez changer le style de la boussole et passer en mode Réalité Augmentée (AR) avec votre caméra pour repérer la direction de la Mecque."}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    id="prayers-qibla-hint-action-btn"
                    onClick={handleAction}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold text-xs transition-all shadow-sm active:scale-95 text-center flex items-center justify-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{t.openQiblaCompass || "Boussole & AR"}</span>
                  </button>
                  <button
                    id="confirm-prayers-qibla-hint-btn"
                    onClick={handleDismiss}
                    className="py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{t.understood || "Compris"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Animated pointer arrow pointing DOWN directly to the options below */}
          <div className="flex justify-center -mt-2.5 relative z-10">
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-emerald-950 font-bold border-2 border-emerald-300/80 shadow-lg shadow-emerald-900/50"
            >
              <ArrowDown className="w-4 h-4" strokeWidth={3} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
