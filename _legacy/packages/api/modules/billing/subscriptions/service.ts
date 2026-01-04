import { AxiosRequestConfig } from "axios";
import { apiClient } from "@packages/api/client";
import type {
  GetMySubscriptionResponse,
  CancelSubscriptionResponse,
  ResumeSubscriptionResponse,
  GetUserSubscriptionResponse,
  CancelUserSubscriptionResponse,
  ResumeUserSubscriptionResponse,
} from "./types";

/**
 * Axios-based subscriptions service.
 * Uses shared apiClient with auth interceptors and cookies.
 */
export const subscriptionsService = {
  /** GET /api/subscriptions/me */
  me: (config?: AxiosRequestConfig) =>
    apiClient.get<GetMySubscriptionResponse>("/api/subscriptions/me", config),

  /** POST /api/subscriptions/cancel */
  cancel: (config?: AxiosRequestConfig) =>
    apiClient.post<CancelSubscriptionResponse>(
      "/api/subscriptions/cancel",
      undefined,
      config,
    ),

  /** POST /api/subscriptions/resume */
  resume: (config?: AxiosRequestConfig) =>
    apiClient.post<ResumeSubscriptionResponse>(
      "/api/subscriptions/resume",
      undefined,
      config,
    ),

  /** GET /api/subscriptions/user/{userId} */
  byUser: (userId: string, config?: AxiosRequestConfig) =>
    apiClient.get<GetUserSubscriptionResponse>(
      `/api/subscriptions/user/${encodeURIComponent(userId)}`,
      config,
    ),

  /** POST /api/subscriptions/user/{userId}/cancel */
  cancelByUser: (userId: string, config?: AxiosRequestConfig) =>
    apiClient.post<CancelUserSubscriptionResponse>(
      `/api/subscriptions/user/${encodeURIComponent(userId)}/cancel`,
      undefined,
      config,
    ),

  /** POST /api/subscriptions/user/{userId}/resume */
  resumeByUser: (userId: string, config?: AxiosRequestConfig) =>
    apiClient.post<ResumeUserSubscriptionResponse>(
      `/api/subscriptions/user/${encodeURIComponent(userId)}/resume`,
      undefined,
      config,
    ),
};
