import { appToast, type ToastOptions } from "./app-toast";
import type { ToastCategory } from "@/components/AppToast";

export type CustomizationToastCategory = "widget" | "background" | "border" | "gallery" | "general";

export interface CustomizationToastOptions {
  category?: CustomizationToastCategory;
  accentColor?: "amber" | "sky" | "emerald" | "purple" | "rose";
  icon?: React.ReactNode;
}

export function showCustomizationToast(message: string, options: CustomizationToastOptions = {}) {
  const categoryMap: Record<CustomizationToastCategory, ToastCategory> = {
    widget: "widget",
    background: "background",
    border: "border",
    gallery: "gallery",
    general: "general",
  };

  const toastOptions: ToastOptions = {
    category: categoryMap[options.category || "general"],
    icon: options.icon,
  };

  appToast.success(message, toastOptions);
}
