"use client";

import { useEffect } from "react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Centered confirmation dialog used in place of window.confirm for
// destructive admin actions.
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={busy ? undefined : onCancel}
        className="absolute inset-0 cursor-default bg-black/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative z-10 w-full max-w-md border-2 border-wheat-900 bg-elevated p-6 text-ink shadow-2xl"
      >
        <h2
          id="confirm-modal-title"
          className="text-lg font-black uppercase tracking-[0.12em]"
        >
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="border-2 border-wheat-900 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] hover:bg-accent-soft disabled:pointer-events-none disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="border-2 border-accent bg-accent px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
