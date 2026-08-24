import { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react";

/**
 * Small side banner shown next to a feature whose permission was denied.
 * Always auto-dismisses after 5 seconds maximum.
 * Disappears immediately if returned from background after >5 seconds.
 */
export function PermissionBanner({
  message,
  actionLabel,
  onRetry,
  onDismiss,
  side = "right",
  autoDismissMs = 5000,
}: {
  message: string;
  actionLabel: string;
  onRetry: () => void;
  onDismiss?: () => void;
  side?: "left" | "right";
  autoDismissMs?: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mountedAt = Date.now();

    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoDismissMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const elapsed = Date.now() - mountedAt;
        if (elapsed >= autoDismissMs) {
          setVisible(false);
          onDismiss?.();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [autoDismissMs, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className={`pointer-events-auto absolute top-3 z-20 max-w-[62%] rounded-2xl border border-border bg-background/95 p-2.5 text-left shadow-lg backdrop-blur animate-in fade-in duration-200 ${
        side === "right" ? "right-2" : "left-2"
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-[11px] leading-snug font-medium">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
          className="text-muted-foreground hover:text-foreground p-0.5"
          aria-label="Fermer"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="widget mt-2 w-full rounded-full px-2 py-1 text-[11px] font-bold"
      >
        {actionLabel}
      </button>
    </div>
  );
}
