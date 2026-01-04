import { ApiResponse } from '@/shared/types/api/global';
import { apiClient } from "@/shared/lib/http/apiClient";
import type { AxiosRequestConfig } from "axios";
import type {PricingProduct } from "@/entities/monetization/pricing/model/types";

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
