"use client";

import { SiGoogle } from "react-icons/si";
import Spinner from "@/shared/ui/loading/Spinner";
import { useGoogleOAuth } from "@/features/auth/lib/useGoogleOAuth";
import { useI18n } from "@/shared/lib/i18n";
import { messages } from "@/i18n/messages";

type GoogleButtonProps = {
  google?: ReturnType<typeof useGoogleOAuth> | null;
  disabled?: boolean;
  /** When true, renders visual preview only (no click / no loading) */
  preview?: boolean;
};

export function GoogleButton({
  google,
  disabled,
  preview,
}: GoogleButtonProps) {
  const { t } = useI18n();
  const isInteractive = !!google && !preview;
  const isRunning = isInteractive && google!.isRunning;
  const isReady = isInteractive && google!.isReady;

  const handleClick = () => {
    if (!isInteractive) return;
    google!.reset();
    google!.start();
  };

  return (
    <button
      type="button"
      onClick={isInteractive ? handleClick : undefined}
      disabled={preview ? false : disabled || !isReady}
      className="w-full rounded-md border border-border px-3 py-2 text-sm transition flex items-center justify-center gap-2 disabled:opacity-60
                 bg-background text-text hover:bg-surface"
      aria-label={t(messages.auth.oauth.googleLabel)}
      title={t(messages.auth.oauth.googleLabel)}
    >
      <SiGoogle size={16} />
      <span>{t(messages.auth.oauth.google)}</span>
      {isRunning && <Spinner size={16} />}
    </button>
  );
}
