import { useMutation, useQuery } from "@tanstack/react-query";

import { feedbackService } from "./service";
import type {
  Feedback,
  CreateFeedbackRequest,
  FeedbackPaginatedPayload,
} from "./types";

import type { Paginated } from "@packages/api/types/pagination";

/** Query Keys */
export const feedbackKeys = {
  root: ["feedback"] as const,
  list: (params: { page?: number; limit?: number; s?: string }) =>
    [...feedbackKeys.root, "list", params] as const,
};

/**
 * Admin: paginated feedback list
 */
export function useAllFeedbacks(
  params: { page?: number; limit?: number; s?: string },
  options?: {
    enabled?: boolean;
    select?: (data: Paginated<Feedback>) => any;
  },
) {
  return useQuery({
    queryKey: feedbackKeys.list(params),
    queryFn: async () => {
      const res = await feedbackService.all(params);
      return mapPaginatedFeedback(res.data.data);
    },
    enabled: options?.enabled ?? true,
    select: options?.select,
  });
}

/**
 * Public: create feedback
 */
export function useCreateFeedback() {
  return useMutation({
    mutationFn: async (vars: CreateFeedbackRequest) => {
      const res = await feedbackService.create(vars);
      return res.data;
    },
  });
}

function mapPaginatedFeedback(payload: FeedbackPaginatedPayload): Paginated<Feedback> {
  return {
    items: payload.items,
    page: payload.page,
    totalPages: payload.totalPages,
    sort: undefined,
    total: payload.total,
    limit: payload.limit,
  };
}
