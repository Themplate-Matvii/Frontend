"use client";

import { SiGoogle } from "react-icons/si";
import Spinner from "@/shared/ui/loading/Spinner";
import { useGoogleOAuth } from "@/hooks/oauth/google";

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
                 bg-white text-gray-900 hover:bg-gray-50
                 dark:bg-[#111111] dark:text-white dark:hover:bg-black"
      aria-label="Continue with Google"
      title="Google"
    >
      <SiGoogle size={16} />
      <span>Google</span>
      {isRunning && <Spinner size={16} />}
    </button>
  );
}
