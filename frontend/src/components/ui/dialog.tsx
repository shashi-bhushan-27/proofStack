"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const sizes = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Rendered next to the title, e.g. a status badge. */
  titleAddon?: React.ReactNode;
  footer?: React.ReactNode;
  size?: keyof typeof sizes;
  /** When false, Escape and backdrop clicks are ignored (e.g. while a request is running). */
  dismissible?: boolean;
  children?: React.ReactNode;
}

/**
 * Modal built on the native <dialog> element, which provides focus trapping,
 * Escape handling and top-layer rendering without extra dependencies.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  titleAddon,
  footer,
  size = "sm",
  dismissible = true,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Prefer an explicitly marked control (e.g. "Cancel" on destructive confirms) over the first focusable one.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose();
      }}
      className={cn(
        "m-auto max-h-[min(85vh,52rem)] w-[calc(100%-2rem)] overflow-hidden rounded-xl border border-border bg-surface p-0 text-fg shadow-2xl backdrop:bg-overlay open:animate-slide-up",
        sizes[size]
      )}
    >
      <div className="flex max-h-[inherit] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id={titleId} className="text-base font-semibold text-fg">
                {title}
              </h2>
              {titleAddon}
            </div>
            {description && (
              <div id={descriptionId} className="mt-1 text-sm text-fg-muted">
                {description}
              </div>
            )}
          </div>
          {dismissible && (
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close dialog" className="-mr-2 -mt-1">
              <X />
            </Button>
          )}
        </div>
        {children && <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>}
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface-2/50 px-5 py-3 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      dismissible={!isLoading}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading} data-autofocus>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
