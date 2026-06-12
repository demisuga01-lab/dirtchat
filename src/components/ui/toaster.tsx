"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "destructive";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    // No-op fallback for components rendered outside a provider.
    return {
      toasts: [] as Toast[],
      push: () => undefined,
      dismiss: () => undefined,
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = React.useCallback(
    (t: Omit<Toast, "id">) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      const toast: Toast = { id, duration: 4000, ...t };
      setToasts((prev) => [...prev, toast]);
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => dismiss(id), toast.duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

function variantClass(variant: ToastVariant = "default") {
  switch (variant) {
    case "success":
      return "border-success/30 bg-success/10 text-foreground";
    case "destructive":
      return "border-destructive/30 bg-destructive/10 text-foreground";
    default:
      return "border-border bg-card text-card-foreground";
  }
}

export function Toaster() {
  const ctx = React.useContext(ToastContext);
  const toasts = ctx?.toasts ?? [];
  if (!ctx) return null;
  const { dismiss } = ctx;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-4 sm:top-auto sm:right-4 sm:left-auto sm:items-end"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg backdrop-blur",
            "animate-fade-in",
            variantClass(t.variant)
          )}
        >
          {t.title ? (
            <div className="text-sm font-semibold">{t.title}</div>
          ) : null}
          {t.description ? (
            <div className="mt-1 text-sm text-muted-foreground">
              {t.description}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
