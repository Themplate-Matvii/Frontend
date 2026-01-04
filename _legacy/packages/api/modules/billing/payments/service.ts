import { apiClient } from "@packages/api/client";
import type { AxiosRequestConfig } from "axios";
import type {
  PaymentsListResponse,
  CheckoutRequest,
  CheckoutResponse,
  OneTimeCheckoutRequest,
} from "./types";

/**
 * Axios-based payments service.
 * Endpoints return raw payloads (no envelope).
 */
export const paymentsService = {
  /** GET /api/payments/my */
  my: (config?: AxiosRequestConfig) =>
    apiClient.get<PaymentsListResponse>("/api/payments/my", config),

  /** GET /api/payments/user/{userId} */
  byUser: (userId: string, config?: AxiosRequestConfig) =>
    apiClient.get<PaymentsListResponse>(
      `/api/payments/user/${encodeURIComponent(userId)}`,
      config,
    ),

  /** POST /api/payments/checkout */
  checkout: (body: CheckoutRequest, config?: AxiosRequestConfig) =>
    apiClient.post<CheckoutResponse>("/api/payments/checkout", body, config),

  /** POST /api/payments/checkout/one-time */
  oneTimeCheckout: (
    body: OneTimeCheckoutRequest,
    config?: AxiosRequestConfig,
  ) => apiClient.post<CheckoutResponse>("/api/payments/checkout/one-time", body, config),
};
