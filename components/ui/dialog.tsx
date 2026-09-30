"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  fullScreenMobile?: boolean;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
  fullScreenMobile = false,
}: DialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#070b14]/40 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "dialog-panel relative z-10 flex w-full max-h-[92vh] flex-col overflow-hidden border border-border bg-card shadow-[var(--shadow-floating)]",
          fullScreenMobile
            ? "h-full max-h-full rounded-none sm:h-auto sm:max-h-[92vh] sm:max-w-lg sm:rounded-[24px]"
            : "max-w-lg rounded-t-[24px] sm:rounded-[24px]",
          className
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />
        <div className="flex items-center justify-between px-6 py-4">
          <h2 id={titleId} className="font-display text-lg font-semibold tracking-tight">
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  loading,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} className="max-w-md">
      <p className="mb-6 text-sm text-muted-foreground">{description}</p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          loading={loading}
          onClick={onConfirm}
        >
          {loading ? "Deleting..." : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
