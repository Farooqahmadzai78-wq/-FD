import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Check,
  AlertCircle,
  Info,
  AlertTriangle,
  Layers,
  Palette,
  Square,
  Image as ImageIcon,
  Volume2,
  Bell,
  Heart,
  Sparkles,
  BookOpen,
  Scan,
  ShieldCheck,
  X,
} from "lucide-react";
import { vibrate } from "@/lib/vibration";

export type ToastType = "success" | "info" | "error" | "warning";
export type ToastCategory =
  | "general"
  | "widget"
  | "background"
  | "border"
  | "gallery"
  | "audio"
  | "azan"
  | "quran"
  | "prayer"
  | "scanner"
  | "settings"
  | "dev"
  | "favorite"
  | "reminder"
  | "reciter";

export interface AppToastProps {
  id: string;
  type?: ToastType;
  category?: ToastCategory;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dir?: "ltr" | "rtl";
  onDismiss: () => void;
}

export const AppToast: React.FC<AppToastProps> = ({
  type = "info",
  category = "general",
  icon: customIcon,
  title,
  description,
  duration = 2600,
  action,
  dir = "ltr",
  onDismiss,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger gentle haptic feedback on creation
  useEffect(() => {
    vibrate("button");
  }, []);

  // Precise auto-dismiss timer that pauses on hover/touch
  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss();
    }, remainingTimeRef.current);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPaused, onDismiss]);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(500, remainingTimeRef.current - elapsed);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Determine accent classes, icon badges & glow colors
  let borderClass = "border-sky-500/30 dark:border-sky-400/35";
  let iconBadgeClass =
    "bg-sky-500/20 text-sky-400 border border-sky-400/35 shadow-[0_0_12px_rgba(56,189,248,0.25)]";
  let glowColor = "rgba(56, 189, 248, 0.18)";
  let defaultIcon = <Info className="size-3.5 stroke-[2.5]" />;

  switch (type) {
    case "success":
      borderClass = "border-emerald-500/35 dark:border-emerald-400/40";
      iconBadgeClass =
        "bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]";
      glowColor = "rgba(16, 185, 129, 0.2)";
      defaultIcon = <Check className="size-3.5 stroke-[3]" />;
      break;
    case "error":
      borderClass = "border-rose-500/40 dark:border-rose-400/45";
      iconBadgeClass =
        "bg-rose-500/20 text-rose-400 border border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]";
      glowColor = "rgba(244, 63, 94, 0.22)";
      defaultIcon = <AlertCircle className="size-3.5 stroke-[2.5]" />;
      break;
    case "warning":
      borderClass = "border-amber-500/40 dark:border-amber-400/45";
      iconBadgeClass =
        "bg-amber-500/20 text-amber-400 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]";
      glowColor = "rgba(245, 158, 11, 0.2)";
      defaultIcon = <AlertTriangle className="size-3.5 stroke-[2.5]" />;
      break;
    case "info":
    default:
      borderClass = "border-sky-500/30 dark:border-sky-400/35";
      iconBadgeClass =
        "bg-sky-500/20 text-sky-400 border border-sky-400/35 shadow-[0_0_12px_rgba(56,189,248,0.25)]";
      glowColor = "rgba(56, 189, 248, 0.18)";
      defaultIcon = <Info className="size-3.5 stroke-[2.5]" />;
      break;
  }

  // Adaptive category icon
  if (!customIcon) {
    if (category === "widget") {
      defaultIcon = <Palette className="size-3.5 stroke-[2.5]" />;
    } else if (category === "background") {
      defaultIcon = <Layers className="size-3.5 stroke-[2.5]" />;
    } else if (category === "border") {
      defaultIcon = <Square className="size-3.5 stroke-[2.5]" />;
    } else if (category === "gallery") {
      defaultIcon = <ImageIcon className="size-3.5 stroke-[2.5]" />;
    } else if (category === "audio" || category === "azan" || category === "reciter") {
      defaultIcon = <Volume2 className="size-3.5 stroke-[2.5]" />;
    } else if (category === "prayer" || category === "reminder") {
      defaultIcon = <Bell className="size-3.5 stroke-[2.5]" />;
    } else if (category === "quran") {
      defaultIcon = <BookOpen className="size-3.5 stroke-[2.5]" />;
    } else if (category === "scanner") {
      defaultIcon = <Scan className="size-3.5 stroke-[2.5]" />;
    } else if (category === "favorite") {
      defaultIcon = <Heart className="size-3.5 stroke-[2.5] fill-rose-500 text-rose-500" />;
      iconBadgeClass =
        "bg-rose-500/20 text-rose-400 border border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]";
    } else if (category === "settings") {
      defaultIcon = <ShieldCheck className="size-3.5 stroke-[2.5]" />;
    } else if (category === "dev") {
      defaultIcon = <Sparkles className="size-3.5 stroke-[2.5]" />;
    }
  }

  const activeIcon = customIcon || defaultIcon;
  const isMultiLine = Boolean(
    (description && description.trim().length > 0) || (title && title.length > 55),
  );

  return (
    <motion.div
      layout
      dir={dir}
      initial={{ opacity: 0, y: -22, scale: 0.94, filter: "blur(4px)" }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
          type: "spring",
          stiffness: 450,
          damping: 28,
          mass: 0.75,
        },
      }}
      exit={{
        opacity: 0,
        y: -16,
        scale: 0.92,
        filter: "blur(3px)",
        transition: {
          duration: 0.22,
          ease: [0.32, 0, 0.67, 0],
        },
      }}
      whileTap={{ scale: 0.98 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.6, bottom: 0.1 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -30 || info.velocity.y < -300) {
          onDismiss();
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      className={`group/toast pointer-events-auto relative inline-flex items-center gap-2.5 sm:gap-3 min-w-[200px] max-w-[min(92vw,440px)] w-fit ${
        isMultiLine
          ? "rounded-2xl py-2.5 px-3.5 sm:px-4 sm:py-3"
          : "rounded-full py-2 px-3 sm:px-3.5 sm:py-2.5"
      } border bg-zinc-900/92 dark:bg-zinc-950/94 text-zinc-100 backdrop-blur-2xl cursor-pointer select-none ${borderClass}`}
      style={{
        boxShadow: `0 14px 34px -4px rgba(0, 0, 0, 0.5), 0 0 20px -2px ${glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.12)`,
      }}
      onClick={onDismiss}
    >
      {/* Icon Badge - Guaranteed Fixed Proportions */}
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.04, type: "spring", stiffness: 500, damping: 25 }}
        className={`flex items-center justify-center size-6 sm:size-6.5 rounded-full shrink-0 ${iconBadgeClass}`}
      >
        {activeIcon}
      </motion.div>

      {/* Main Text Content Area */}
      <div className="flex-1 min-w-0 flex flex-col justify-center pr-1 text-left">
        <p className="text-xs sm:text-[13px] font-semibold text-zinc-100 leading-snug tracking-tight break-words">
          {title}
        </p>
        {description && (
          <p className="text-[11px] sm:text-xs text-zinc-300/80 mt-0.5 leading-tight font-normal break-words">
            {description}
          </p>
        )}
      </div>

      {/* Action Button if specified */}
      {action && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
            onDismiss();
          }}
          className="shrink-0 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-zinc-100 font-semibold text-[11px] transition shadow-sm"
        >
          {action.label}
        </button>
      )}

      {/* Close button indicator */}
      <button
        type="button"
        aria-label="Fermer"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="shrink-0 size-5 sm:size-5.5 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition opacity-65 group-hover/toast:opacity-100"
      >
        <X className="size-3 stroke-[2.5]" />
      </button>
    </motion.div>
  );
};
