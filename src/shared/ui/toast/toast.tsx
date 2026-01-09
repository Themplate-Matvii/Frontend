"use client";

import { toast as sonnerToast } from "sonner";
import { ToastCard } from "@/shared/ui/toast/ToastCard";
import type { ToastVariant } from "@/shared/ui/toast/types";

type ToastOptions = {
  duration?: number;
};

const showToast = (
  variant: ToastVariant,
  title: string,
  description?: string,
  options?: ToastOptions,
) => {
  sonnerToast.custom(
    (id) => (
      <ToastCard
        toast={{
          id: String(id),
          title,
          description,
          variant,
        }}
        onClose={() => sonnerToast.dismiss(id)}
      />
    ),
    {
      duration: options?.duration,
      className: "w-full max-w-sm bg-transparent border-0 shadow-none p-0",
    },
  );
};

export const toast = {
  success: (title: string, description?: string, options?: ToastOptions) =>
    showToast("success", title, description, options),
  error: (title: string, description?: string, options?: ToastOptions) =>
    showToast("error", title, description, options),
  warning: (title: string, description?: string, options?: ToastOptions) =>
    showToast("warning", title, description, options),
  info: (title: string, description?: string, options?: ToastOptions) =>
    showToast("info", title, description, options),
};
