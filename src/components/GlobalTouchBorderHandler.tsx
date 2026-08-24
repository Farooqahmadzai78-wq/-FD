import { useEffect } from "react";
import { useSettings } from "@/lib/app-settings";
import { getWidgetBorderThemeById } from "@/lib/customization-themes";

export function GlobalTouchBorderHandler() {
  const { settings } = useSettings();

  useEffect(() => {
    const activeTheme = getWidgetBorderThemeById(settings.widgetBorderTheme);
    const category = activeTheme?.category;

    // Helper selector for all widget containers across the application
    const widgetSelector =
      "[data-widget-card], .widget, .widget-glass, .widget-card, .widget-bordered, .glass, .setting-card, [data-card], .card";

    const isTouchCategory =
      category === "touch" || category === "glow" || activeTheme?.id.startsWith("wb-interact-");

    let scrollTimeout: NodeJS.Timeout | null = null;

    // --- 1 & 2: Touch / Pointer Down (Contour + Contact Point Pulse) ---
    const handlePointerDown = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest?.(widgetSelector) as HTMLElement | null;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isTouchCategory) {
        // Set tactile glow coordinates and activate glow state (Animation 1: Border Contour)
        target.style.setProperty("--touch-x", `${x}px`);
        target.style.setProperty("--touch-y", `${y}px`);
        target.setAttribute("data-touch-active", "true");

        // Animation 2: Point of Contact Localized Ripple / Pulse
        // Clean up previous ripples on this target to prevent overflow
        target.querySelectorAll(".touch-contact-pulse").forEach((el) => el.remove());

        const ripple = document.createElement("span");
        ripple.className = "touch-contact-pulse";
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        target.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 750);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isTouchCategory) return;

      const target = (e.target as HTMLElement)?.closest?.(widgetSelector) as HTMLElement | null;
      if (!target || !target.hasAttribute("data-touch-active")) return;

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      target.style.setProperty("--touch-x", `${x}px`);
      target.style.setProperty("--touch-y", `${y}px`);
    };

    const handlePointerUp = () => {
      if (!isTouchCategory) return;
      document.querySelectorAll("[data-touch-active]").forEach((el) => {
        el.removeAttribute("data-touch-active");
      });
    };

    // --- 3: Scroll & Navigation Wave Animation ---
    const handleScroll = () => {
      if (!isTouchCategory) return;

      document.body.setAttribute("data-scrolling", "true");

      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.removeAttribute("data-scrolling");
      }, 450);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial trigger for page load / route change
    handleScroll();

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [settings.widgetBorderTheme]);

  return null;
}
