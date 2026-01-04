import { apiClient } from "@packages/api/client";
import type { AxiosRequestConfig } from "axios";
import type { BonusAdjustRequest, BonusHistoryResponse, SuccessEnvelopeData } from "./types";

export const bonusService = {
  /** GET /api/bonus/history */
  myHistory: (config?: AxiosRequestConfig) =>
    apiClient.get<BonusHistoryResponse>("/api/bonus/history", config),

  /** GET /api/bonus/history/{userId} */
  historyByUser: (userId: string, config?: AxiosRequestConfig) =>
    apiClient.get<BonusHistoryResponse>(
      `/api/bonus/history/${encodeURIComponent(userId)}`,
      config,
    ),

  /** PATCH /api/bonus/{userId} */
  adjustByUser: (
    userId: string,
    body: BonusAdjustRequest,
    config?: AxiosRequestConfig,
  ) =>
    apiClient.patch<SuccessEnvelopeData>(
      `/api/bonus/${encodeURIComponent(userId)}`,
      body,
      config,
    ),
};
