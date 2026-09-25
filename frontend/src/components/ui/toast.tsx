"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "danger" | "info";

interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

const toneIcon: Record<ToastTone, { Icon: React.ElementType; className: string }> = {
  success: { Icon: CheckCircle2, className: "text-success" },
  danger: { Icon: AlertCircle, className: "text-danger" },
  info: { Icon: Info, className: "text-info" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = ++nextId.current;
      setToasts((current) => [...current.slice(-2), { ...options, id }]);
      window.setTimeout(() => dismiss(id), options.duration ?? 5000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((item) => {
          const { Icon, className } = toneIcon[item.tone ?? "info"];
          return (
            <div
              key={item.id}
              role={item.tone === "danger" ? "alert" : "status"}
              className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm shadow-lg"
            >
              <Icon className={cn("mt-0.5 size-4 shrink-0", className)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-fg">{item.title}</p>
                {item.description && <p className="mt-0.5 text-fg-muted">{item.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="-mr-1 rounded-md p-1 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
