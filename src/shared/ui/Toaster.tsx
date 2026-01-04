"use client";

import React from "react";
import { useSyncExternalStore } from "react";
import clsx from "clsx";
import { toastStore } from "@/shared/ui/toast";

export function AppToaster() {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot,
  );

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[70] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur",
            toast.variant === "success" &&
              "border-success/30 bg-successSoft text-success",
            toast.variant === "error" &&
              "border-danger/30 bg-dangerSoft text-danger",
            toast.variant === "info" &&
              "border-border bg-surface text-text",
          )}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
