import React, { useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Home, Settings as SettingsIcon } from "lucide-react";
import { MosqueIcon } from "./NurIcons";
import { useI18n } from "@/lib/i18n";

export const BottomNav = React.memo(function BottomNav() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items = useMemo(
    () =>
      [
        { to: "/", label: t.nav_home, icon: <Home className="size-5" /> },
        { to: "/prayers", label: t.nav_prayers, icon: <MosqueIcon className="size-5" /> },
        { to: "/quran", label: t.nav_quran, icon: <BookOpen className="size-5" /> },
        {
          to: "/halal",
          label: t.nav_halal,
          icon: (
            <span className="grid size-6 place-items-center rounded-full bg-[#388E6C] text-[11px] font-bold text-white font-[var(--font-arabic)]">
              حلال
            </span>
          ),
        },
        { to: "/settings", label: t.nav_settings, icon: <SettingsIcon className="size-5" /> },
      ] as const,
    [t.nav_home, t.nav_prayers, t.nav_quran, t.nav_halal, t.nav_settings],
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2">
      <div className="pointer-events-auto flex w-full max-w-md md:max-w-xl lg:max-w-2xl items-center justify-between rounded-[32px] border border-slate-100/80 bg-white/95 dark:bg-slate-900/95 dark:border-slate-800 px-3 sm:px-6 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all duration-150">
        {items.map((it, idx) => {
          const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
          return (
            <React.Fragment key={it.to}>
              {idx > 0 && <div className="h-7 w-[1px] bg-slate-200/60 dark:bg-slate-800" />}
              <Link
                to={it.to}
                preload="render"
                className="group flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-medium active:scale-95 transition-transform duration-75"
              >
                <div className="relative grid size-10 place-items-center">
                  {active && (
                    <span className="absolute -inset-0.5 rounded-full border border-dashed border-[var(--w-from)] opacity-65" />
                  )}
                  <span
                    className={`grid size-10 place-items-center rounded-full transition-colors duration-100 ${
                      active
                        ? "bg-gradient-to-tr from-[var(--w-from)] to-[var(--w-to)] text-white shadow-sm"
                        : "bg-slate-50/90 dark:bg-slate-800/80 text-[#388E6C] group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
                    }`}
                  >
                    {it.icon}
                  </span>
                </div>
                <span
                  className={`mt-1 text-[11px] whitespace-nowrap transition-colors duration-100 ${
                    active
                      ? "font-bold text-[var(--nav-active-text)]"
                      : "text-slate-600 dark:text-slate-400 font-medium"
                  }`}
                  suppressHydrationWarning
                >
                  {it.label}
                </span>
                <span
                  className={`mt-0.5 h-[3px] w-4 rounded-full transition-opacity duration-100 ${
                    active ? "opacity-100 bg-[var(--nav-active-text)]" : "opacity-0"
                  }`}
                />
              </Link>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
});
