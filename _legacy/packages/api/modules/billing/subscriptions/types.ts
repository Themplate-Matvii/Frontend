import { ApiResponse } from "@packages/api/types/global";

export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCEL_AT_PERIOD_END = "cancel_at_period_end",
  CANCELED = "canceled",
  TRIALING = "trialing",
  EXPIRED = "expired",
}


/**
 * Subscription object shape from backend.
 * Dates are ISO strings produced by the API.
 * Keep `status` as string to avoid tight coupling with provider enums.
 */
export interface Subscription {
  id: string;
  userId: string;
  planKey: string; // e.g. "basic" | "pro"
  provider: string; // e.g. "stripe"
  providerSubscriptionId: string;
  status: SubscriptionStatus; // e.g. "active", "trialing", "past_due", "canceled"
  trialEnd?: string | null; // ISO date or null
  currentPeriodStart?: string | null; // ISO date
  currentPeriodEnd?: string | null; // ISO date
  cancelAt?: string | null; // ISO date when scheduled to cancel
  canceledAt?: string | null; // ISO date when canceled
  lastPaymentAt?: string | null; // ISO date of latest successful charge
  metadata?: Record<string, unknown>;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

/**
 * GET /api/subscriptions/me
 */
export type GetMySubscriptionResponse = ApiResponse<Subscription>;

/**
 * POST /api/subscriptions/cancel
 * Backend returns the updated subscription.
 */
export type CancelSubscriptionResponse = ApiResponse<Subscription>;

/** POST /api/subscriptions/resume */
export type ResumeSubscriptionResponse = ApiResponse<Subscription>;

/** GET /api/subscriptions/user/{userId} */
export type GetUserSubscriptionResponse = ApiResponse<Subscription>;

/** POST /api/subscriptions/user/{userId}/cancel */
export type CancelUserSubscriptionResponse = ApiResponse<Subscription>;

/** POST /api/subscriptions/user/{userId}/resume */
export type ResumeUserSubscriptionResponse = ApiResponse<Subscription>;
