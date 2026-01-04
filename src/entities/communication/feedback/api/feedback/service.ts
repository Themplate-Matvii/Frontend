import { apiClient } from "@/shared/lib/http/apiClient";
import type { AxiosRequestConfig } from "axios";

import type {
  CreateFeedbackRequest,
  FeedbackListResponse,
  Feedback,
} from "@/entities/communication/feedback/model/types";

/**
 * Feedback axios service
 */
export const feedbackService = {
  /** POST /api/feedback/ (public) */
  create: (body: CreateFeedbackRequest, config?: AxiosRequestConfig) =>
    apiClient.post<Feedback>("/api/feedback/", body, {
      validateStatus: (s) => s < 500,
      ...(config ?? {}),
    }),

  /** GET /api/feedback -> paginated (requires feedback.view) */
  all: (
    params: { page?: number; limit?: number; s?: string },
    config?: AxiosRequestConfig,
  ) =>
    apiClient.get<FeedbackListResponse>("/api/feedback/all", {
      params,
      ...(config ?? {}),
    }),
};
