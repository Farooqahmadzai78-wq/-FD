import React from "react";
import type { ToastCategory, ToastType } from "@/components/AppToast";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  description?: string;
  category?: ToastCategory;
  icon?: React.ReactNode;
  duration?: number;
  dir?: "ltr" | "rtl";
  action?: ToastAction;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  category?: ToastCategory;
  icon?: React.ReactNode;
  duration: number;
  dir?: "ltr" | "rtl";
  action?: ToastAction;
  customRender?: (id: string) => React.ReactNode;
  createdAt: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastStore {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private maxVisibleToasts = 2;

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSnapshot(): ToastItem[] {
    return this.toasts;
  }

  private notify() {
    for (const listener of this.listeners) {
      listener([...this.toasts]);
    }
  }

  public addToast(
    type: ToastType,
    title: string,
    options: ToastOptions = {},
    customRender?: (id: string) => React.ReactNode,
  ): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = options.duration ?? (type === "error" ? 3800 : 2600);

    const newToast: ToastItem = {
      id,
      type,
      title: title || "",
      description: options.description,
      category: options.category,
      icon: options.icon,
      duration,
      dir: options.dir,
      action: options.action,
      customRender,
      createdAt: Date.now(),
    };

    // Keep at most (maxVisibleToasts - 1) before appending new one to maintain clean viewport
    if (this.toasts.length >= this.maxVisibleToasts) {
      this.toasts = this.toasts.slice(this.toasts.length - (this.maxVisibleToasts - 1));
    }

    this.toasts = [...this.toasts, newToast];
    this.notify();

    return id;
  }

  public dismiss(id?: string | number) {
    if (!id) {
      this.toasts = [];
    } else {
      const strId = String(id);
      this.toasts = this.toasts.filter((t) => t.id !== strId);
    }
    this.notify();
  }

  public dismissAll() {
    this.toasts = [];
    this.notify();
  }
}

export const toastStore = new ToastStore();

export const appToast = {
  success: (title: string, options?: ToastOptions) =>
    toastStore.addToast("success", title, options),
  error: (title: string, options?: ToastOptions) => toastStore.addToast("error", title, options),
  info: (title: string, options?: ToastOptions) => toastStore.addToast("info", title, options),
  warning: (title: string, options?: ToastOptions) =>
    toastStore.addToast("warning", title, options),
  custom: (renderFn: (id: string) => React.ReactNode, options?: { duration?: number }) =>
    toastStore.addToast("info", "", options, renderFn),
  dismiss: (id?: string | number) => toastStore.dismiss(id),
  dismissAll: () => toastStore.dismissAll(),
};

// Aliases for convenient drop-in usage across components
export const showToast = appToast;
export const toast = appToast;
