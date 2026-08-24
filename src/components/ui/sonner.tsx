import React, { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { AppToast } from "@/components/AppToast";
import { toastStore, type ToastItem } from "@/lib/app-toast";

export interface ToasterProps {
  position?: "top-center" | "top-left" | "top-right" | "bottom-center";
}

export const Toaster: React.FC<ToasterProps> = () => {
  const [toasts, setToasts] = useState<ToastItem[]>(() => toastStore.getSnapshot());

  useEffect(() => {
    const unsubscribe = toastStore.subscribe((updatedToasts) => {
      setToasts(updatedToasts);
    });
    return unsubscribe;
  }, []);

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed inset-x-0 top-0 z-[999999] pointer-events-none flex flex-col items-center justify-start gap-2.5 px-3 pt-[max(env(safe-area-inset-top,0px)+12px,16px)] transition-all"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((item) => {
          if (item.customRender) {
            return <React.Fragment key={item.id}>{item.customRender(item.id)}</React.Fragment>;
          }

          return (
            <AppToast
              key={item.id}
              id={item.id}
              type={item.type}
              category={item.category}
              icon={item.icon}
              title={item.title}
              description={item.description}
              duration={item.duration}
              action={item.action}
              dir={item.dir}
              onDismiss={() => toastStore.dismiss(item.id)}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};
