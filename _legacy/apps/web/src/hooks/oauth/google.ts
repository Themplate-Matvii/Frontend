"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type GoogleOAuthOptions = {
  clientId: string;
  scope?: string;
  onCode: (code: string, locale: string) => Promise<void> | void;
  uxMode?: "popup" | "redirect";
};

/** Singleton loader for GIS script */
let gisLoader: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (gisLoader) return gisLoader;

  gisLoader = new Promise<void>((resolve, reject) => {
    if ((window as any).google?.accounts) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google GIS"));
    document.body.appendChild(s);
  });

  return gisLoader;
}

export function useGoogleOAuth(options: GoogleOAuthOptions) {
  const {
    clientId,
    scope = "openid email profile",
    onCode,
    uxMode = "popup",
  } = options;

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const codeClientRef = useRef<any>(null);
  const startedAtRef = useRef<number>(0);
  const fallbackTimerRef = useRef<number | null>(null);

  const onCodeRef = useRef(onCode);
  useEffect(() => {
    onCodeRef.current = onCode;
  }, [onCode]);

  const clearFallback = () => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  const handleFocusBack = useCallback(() => {
    if (!running) return;
    clearFallback();
    fallbackTimerRef.current = window.setTimeout(() => {
      if (running && Date.now() - startedAtRef.current > 800) {
        setRunning(false);
        setError(null);
      }
    }, 350);
  }, [running]);

  useEffect(() => {
    window.addEventListener("focus", handleFocusBack);
    document.addEventListener("visibilitychange", handleFocusBack);
    return () => {
      window.removeEventListener("focus", handleFocusBack);
      document.removeEventListener("visibilitychange", handleFocusBack);
      clearFallback();
    };
  }, [handleFocusBack]);

  useEffect(() => {
    let mounted = true;

    if (!clientId) {
      setError("Missing Google client id");
      setReady(false);
      return;
    }

    loadGis()
      .then(() => {
        if (!mounted) return;
        const g = (window as any).google;
        if (!g?.accounts?.oauth2?.initCodeClient) {
          setError("Google GIS is unavailable");
          setReady(false);
          return;
        }

        codeClientRef.current = g.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope,
          ux_mode: uxMode,
          callback: async (resp: { code?: string; error?: string }) => {
            clearFallback();

            if (resp?.error || !resp?.code) {
              setRunning(false);
              if (resp?.error && resp.error !== "popup_closed") {
                setError(resp.error || "OAuth failed");
              } else {
                setError(null);
              }
              return;
            }

            try {
              const locale =
                typeof navigator !== "undefined" ? navigator.language : "en";
              await onCodeRef.current(resp.code, locale);
            } catch {
              setError("OAuth handler failed");
            } finally {
              setRunning(false);
            }
          },
        });

        setReady(true);
        setError(null);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load Google GIS");
        setReady(false);
      });

    return () => {
      mounted = false;
    };
  }, [clientId, scope, uxMode]); // onCode убран из deps

  const start = useCallback(() => {
    if (!codeClientRef.current) {
      setError("OAuth is not initialized");
      return;
    }
    setError(null);
    setRunning(true);
    startedAtRef.current = Date.now();
    clearFallback();
    codeClientRef.current.requestCode();
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setRunning(false);
    clearFallback();
  }, []);

  return useMemo(
    () => ({
      isReady: ready,
      isRunning: running,
      error,
      start,
      reset,
    }),
    [ready, running, error, start, reset],
  );
}
