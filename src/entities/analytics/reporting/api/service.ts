import { apiClient } from "@/shared/lib/http/apiClient";
import type { AxiosRequestConfig } from "axios";
import type { BusinessAnalyticsResponse } from "@/entities/analytics/reporting/model/types";

/**
 * Axios-based business analytics service.
 * Endpoint returns analytics payload. New backend may wrap it
 * in the standard ApiResponse envelope, so keep response generic.
 */
export const analyticsBusinessService = {
  /** GET /api/analytics/business/?dateFrom&dateTo */
  get: (
    params: { dateFrom: string; dateTo: string },
    config?: AxiosRequestConfig,
  ) =>
    apiClient.get<BusinessAnalyticsResponse | { data: BusinessAnalyticsResponse }>(
      "/api/analytics/business/",
      {
        params,
        ...(config || {}),
      },
    ),
};
