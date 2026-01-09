"use client";

import type { ToastItem } from "@/shared/ui/toast/types";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";

const variantStyles = {
  success: {
    container: "bg-successSoft text-success border-success",
    dotOuter: "bg-successSoft",
    dotInner: "bg-success",
  },
  error: {
    container: "bg-dangerSoft text-danger border-danger",
    dotOuter: "bg-dangerSoft",
    dotInner: "bg-danger",
  },
  warning: {
    container: "bg-warningSoft text-warning border-warning",
    dotOuter: "bg-warningSoft",
    dotInner: "bg-warning",
  },
  info: {
    container: "bg-surface text-text border-border",
    dotOuter: "bg-surface/70",
    dotInner: "bg-text/70",
  },
} as const;

type ToastCardProps = {
  toast: ToastItem;
  onClose: () => void;
};

export function ToastCard({ toast, onClose }: ToastCardProps) {
  const { t } = useI18n();
  const styles = variantStyles[toast.variant];

  return (
    <div
      className={[
        "pointer-events-auto w-full rounded-xl border shadow-lg text-sm font-medium overflow-hidden",
        styles.container,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1">
          <p className="leading-5">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-xs opacity-80">{toast.description}</p>
          )}
        </div>

        <button
          type="button"
          aria-label={t(messages.common.actions.close)}
          onClick={onClose}
          className="ml-2 rounded-md p-1 text-current/70 hover:text-current hover:bg-surface/60 transition"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
