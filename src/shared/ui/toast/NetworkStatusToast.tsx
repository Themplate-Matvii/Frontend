"use client";

import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

type NetworkMode = "offline" | "online" | "weak";

function NetworkStatusToastContent({
  mode,
  onClose,
}: {
  mode: NetworkMode;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const isOffline = mode === "offline";
  const isWeak = mode === "weak";

  const bg =
    isOffline
      ? "bg-dangerSoft text-danger border-danger"
      : isWeak
      ? "bg-warningSoft text-warning border-warning"
      : "bg-successSoft text-success border-success";

  return (
    <div
      className={[
        "pointer-events-auto w-full rounded-xl border shadow-lg px-4 py-3 text-sm font-medium",
        bg,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div
        className={
          "flex gap-3 " +
          (!isOffline && !isWeak ? "items-center" : "items-start")
        }
      >
        <span
          className={[
            "mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full",
            isOffline
              ? "bg-dangerSoft"
              : isWeak
              ? "bg-warningSoft"
              : "bg-successSoft",
          ].join(" ")}
        >
          <span
            className={[
              "block h-2.5 w-2.5 rounded-full",
              isOffline ? "bg-danger" : isWeak ? "bg-warning" : "bg-success",
            ].join(" ")}
          />
        </span>

        <div className="flex-1">
          <p className="leading-5">
            {isOffline
              ? t(messages.network.connectionLostTitle)
              : isWeak
              ? t(messages.network.connectionWeakTitle)
              : t(messages.network.connectionRestoredTitle)}
          </p>

          {isOffline && (
            <p className="mt-1 text-xs opacity-80">
              {t(messages.network.connectionLostSubtitle)}
            </p>
          )}

          {isWeak && (
            <p className="mt-1 text-xs opacity-80">
              {t(messages.network.connectionWeakSubtitle)}
            </p>
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

export default function NetworkStatusToast() {
  const modeRef = useRef<NetworkMode>("online");
  const toastRef = useRef<{ id: string | number; timeout?: number } | null>(
    null,
  );
  const checkRef = useRef<number | null>(null);

  const clearToastRef = () => {
    if (toastRef.current?.timeout) {
      window.clearTimeout(toastRef.current.timeout);
    }
    toastRef.current = null;
  };

  const showToast = (mode: NetworkMode, duration: number | undefined) => {
    if (toastRef.current && modeRef.current === mode) return;

    if (toastRef.current) {
      toast.dismiss(toastRef.current.id);
      clearToastRef();
    }

    modeRef.current = mode;
    const id = toast.custom(
      (toastId) => (
        <NetworkStatusToastContent
          mode={mode}
          onClose={() => {
            toast.dismiss(toastId);
            clearToastRef();
          }}
        />
      ),
      {
        duration,
        className: "w-full max-w-md bg-transparent border-0 shadow-none p-0",
      },
    );

    toastRef.current = { id };
    if (typeof duration === "number" && Number.isFinite(duration)) {
      toastRef.current.timeout = window.setTimeout(() => {
        clearToastRef();
      }, duration);
    }
  };

  const showWeak = () => showToast("weak", 3000);
  const showOffline = () => showToast("offline", Infinity);
  const showOnline = () => showToast("online", 2500);

  useEffect(() => {
    return () => {
      if (toastRef.current) {
        toast.dismiss(toastRef.current.id);
      }
      if (checkRef.current) window.clearInterval(checkRef.current);
    };
  }, []);

  useEffect(() => {
    const connection =
      typeof navigator !== "undefined"
        ? (navigator as any).connection
        : null;

    const checkWeak = () => {
      if (!connection) return;

      const type = connection.effectiveType;
      const down = connection.downlink;
      const rtt = connection.rtt;

      const weak =
        type === "2g" ||
        type === "slow-2g" ||
        type === "3g" ||
        down < 1 ||
        rtt > 300;

      if (weak && modeRef.current === "online") showWeak();
      if (!weak && modeRef.current === "weak") showOnline();
    };

    const handleOffline = () => showOffline();
    const handleOnline = () => showOnline();

    if (typeof navigator !== "undefined" && !navigator.onLine) showOffline();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (connection) {
      connection.addEventListener("change", checkWeak);
      checkWeak();
    }

    checkRef.current = window.setInterval(() => {
      if (navigator.onLine) {
        if (connection) checkWeak();
        else showOnline();
      } else showOffline();
    }, 8000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) connection.removeEventListener("change", checkWeak);
      if (checkRef.current) window.clearInterval(checkRef.current);
    };
  }, []);

  return null;
}
