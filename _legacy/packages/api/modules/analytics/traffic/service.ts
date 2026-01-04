import { apiClient } from "@packages/api/client";
import type { AxiosRequestConfig } from "axios";
import type {
  TrackEventRequest,
  TrackEventResponse,
  TrafficEventsListResponse,
} from "./types";

/**
 * Axios-based traffic analytics service.
 * Note: path uses backend spelling: /api/analytics/traffic/
 */
export const analyticsTrafficService = {
  /** POST /api/analytics/traffic/track -> record public event */
  track: (body: TrackEventRequest, config?: AxiosRequestConfig) =>
    apiClient.post<TrackEventResponse>("/api/analytics/traffic/track", body, {
      // allow 4xx body passthrough so UI can react to validation messages if needed
      validateStatus: (s) => s < 500,
      ...(config || {}),
    }),

  /**
   * GET /api/analytics/traffic/
   * Requires permissions on backend. Accepts optional filters.
   */
  list: (
    params: {
      dateFrom: string; // ISO date-time
      dateTo: string; // ISO date-time
      landingId?: string;
      userId?: string;
    },
    config?: AxiosRequestConfig,
  ) =>
    apiClient.get<TrafficEventsListResponse>("/api/analytics/traffic/", {
      params,
      ...(config || {}),
    }),
};
