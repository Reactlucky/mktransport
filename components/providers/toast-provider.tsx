"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, X, AlertCircle, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 lg:bottom-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border px-4 py-3 shadow-sm",
              t.variant === "success" &&
                "border-success/30 bg-success-muted text-success",
              t.variant === "error" &&
                "border-danger/30 bg-danger-muted text-danger",
              t.variant === "info" && "border-border bg-card text-foreground"
            )}
            role="status"
          >
            {t.variant === "success" && (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            )}
            {t.variant === "error" && (
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
            )}
            {t.variant === "info" && (
              <Info className="mt-0.5 size-5 shrink-0" />
            )}
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              type="button"
              className="rounded p-0.5 opacity-70 hover:opacity-100"
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
