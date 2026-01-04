import { ApiResponse } from "@packages/api/types/global";

/**
 * Feedback entity as returned by the backend.
 */
export interface Feedback {
  id: string;
  name?: string;
  email?: string;
  phone: string;
  comment?: string;
  createdAt: string;
}

export interface FeedbackPaginatedPayload {
  items: Feedback[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateFeedbackRequest {
  phone: string;
  name?: string;
  email?: string;
  comment?: string;
}

export type FeedbackListResponse = ApiResponse<FeedbackPaginatedPayload>;
