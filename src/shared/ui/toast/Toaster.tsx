"use client";

import React from "react";
import { useSyncExternalStore } from "react";
import { toastStore } from "@/shared/ui/toast/toast";
import { ToastCard } from "@/shared/ui/toast/ToastCard";

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
        <ToastCard
          key={toast.id}
          toast={toast}
          onClose={() => toastStore.remove(toast.id)}
        />
      ))}
    </div>
  );
}
