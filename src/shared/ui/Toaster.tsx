"use client";

import React from "react";
import { useSyncExternalStore } from "react";
import clsx from "clsx";
import { toastStore } from "@/shared/ui/toast";
import { X } from "lucide-react";
import { useI18n } from "@/shared/lib/i18n";
import { messages } from "@/i18n/messages";

export function AppToaster() {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot,
  );
  const { t } = useI18n();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[70] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "rounded-xl border px-4 py-3 text-sm shadow-lg",
            toast.variant === "success" &&
              "border-success/40 bg-success text-white",
            toast.variant === "error" &&
              "border-danger/40 bg-danger text-white",
            toast.variant === "info" &&
              "border-border bg-card text-text",
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">{toast.message}</div>
            <button
              type="button"
              onClick={() => toastStore.remove(toast.id)}
              className={clsx(
                "rounded-full p-1 transition-colors focus:outline-none focus:ring-2",
                toast.variant === "info"
                  ? "hover:bg-primary/10 focus:ring-primary/30"
                  : "hover:bg-white/20 focus:ring-white/40",
              )}
              aria-label={t(messages.common.actions.close)}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
