"use client";

import { useCallback, useEffect, useMemo } from "react";
import { analyticsTrafficService } from "@packages/api/modules/analytics/traffic/service";
import {
  TrafficEventType,
  type TrackEventRequest,
} from "@packages/api/modules/analytics/traffic/types";

const STORAGE_KEY = "traffic_session_id";

function getOrCreateSessionId() {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const next = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
  window.localStorage.setItem(STORAGE_KEY, next);
  return next;
}

const getReferrer = () =>
  typeof document !== "undefined" ? document.referrer || undefined : undefined;

const getLanguage = () =>
  typeof navigator !== "undefined" ? navigator.language : undefined;

const getDevice = () =>
  typeof navigator !== "undefined" ? navigator.userAgent : undefined;

const getUrl = () =>
  typeof window !== "undefined" ? window.location.href : undefined;

type UseTrafficTrackingOptions = {
  landingId?: string;
  autoTrackPageView?: boolean;
  referrerOverride?: string;
  language?: string;
  device?: string;
};

export function useTrafficTracking(options?: UseTrafficTrackingOptions) {
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  const basePayload = useMemo<
    Pick<
      TrackEventRequest,
      "sessionId" | "landingId" | "referrer" | "language" | "device" | "url"
    >
  >(
    () => ({
      sessionId,
      landingId: options?.landingId,
      referrer: options?.referrerOverride ?? getReferrer(),
      language: options?.language ?? getLanguage(),
      device: options?.device ?? getDevice(),
      url: getUrl(),
    }),
    [
      options?.device,
      options?.language,
      options?.landingId,
      options?.referrerOverride,
      sessionId,
    ],
  );

  const track = useCallback(
    async (eventType: TrafficEventType, overrides?: Partial<TrackEventRequest>) => {
      if (!basePayload.sessionId) return;
      try {
        await analyticsTrafficService.track({
          eventType,
          ...basePayload,
          ...overrides,
        });
      } catch (error) {
        console.error("traffic:track", error);
      }
    },
    [basePayload],
  );

  useEffect(() => {
    if (options?.autoTrackPageView) {
      track(TrafficEventType.PageView);
    }
  }, [options?.autoTrackPageView, track]);

  return {
    sessionId,
    trackPageView: () => track(TrafficEventType.PageView),
    trackClick: () => track(TrafficEventType.Click),
    trackFormSubmit: () => track(TrafficEventType.FormSubmit),
    track,
  };
}
