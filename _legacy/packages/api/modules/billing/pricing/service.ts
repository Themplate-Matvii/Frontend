import { ApiResponse } from '@packages/api/types/global';
import { apiClient } from "@packages/api/client";
import type { AxiosRequestConfig } from "axios";
import type {PricingProduct } from "./types";

/**
 * Axios-based pricing service.
 * Endpoints return raw payloads (no envelope).
 */
export const pricingService = {
  /** GET /api/pricing */
  list: (config?: AxiosRequestConfig) =>
    apiClient.get<ApiResponse<PricingProduct[]>>("/api/pricing", config),

  /** GET /api/pricing/{key} */
  byKey: (key: string, config?: AxiosRequestConfig) =>
    apiClient.get<PricingProduct>(`/api/pricing/${encodeURIComponent(key)}`, config),
};
