"use client";

import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { useEffect, useRef, useState } from "react";

export default function NetworkStatusToast() {
  const { t } = useI18n();

  const [visible, setVisible] = useState(false);
  const [mode, setMode] =
    useState<"offline" | "online" | "weak">("online");

  const timerRef = useRef<number | null>(null);
  const checkRef = useRef<number | null>(null);

  const showWeak = () => {
    setMode("weak");
    setVisible(true);

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, 3000);
  };

  const showOffline = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setMode("offline");
    setVisible(true);
  };

  const showOnline = () => {
    setMode("online");
    setVisible(true);

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
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

      if (weak && mode === "online") showWeak();
      if (!weak && mode === "weak") showOnline();
    };

    const handleOffline = () => showOffline();
    const handleOnline = () => showOnline();

    if (typeof navigator !== "undefined" && !navigator.onLine)
      showOffline();

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
  }, [mode]);

  if (!visible) return null;

  const isOffline = mode === "offline";
  const isWeak = mode === "weak";

  const bg =
    isOffline
      ? "bg-dangerSoft text-danger border-danger"
      : isWeak
      ? "bg-warningSoft text-warning border-warning"
      : "bg-successSoft text-success border-success";

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md pointer-events-none bg-background rounded-xl">
      <div
        className={[
          "pointer-events-auto w-full rounded-xl border shadow-lg px-4 py-3 text-sm font-medium",
          bg,
        ].join(" ")}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
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
                isOffline
                  ? "bg-danger"
                  : isWeak
                  ? "bg-warning"
                  : "bg-success",
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
            aria-label="Закрыть"
            onClick={() => setVisible(false)}
            className="ml-2 rounded-md p-1 text-current/70 hover:text-current hover:bg-black/5 dark:hover:bg-white/5 transition"
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
    </div>
  );
}
