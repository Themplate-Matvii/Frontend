import { ApiResponse } from "@packages/api/types/global";

export interface BusinessKPI {
  currency: string;
  totalRevenue: number;
  subscriptionRevenue: number;
  oneTimeRevenue: number;
  mrr: number;
  arr: number;
  churnRate: number;
  arpu: number;
  arppu: number;
  conversionToPaid: number;
  averageSubscriptionLifetimeDays: number;
  totalUsersAtEnd: number;
  newUsersInRange: number;
  payingUsersInRange: number;
  activeLikeSubscriptionsAtStart: number;
  activeLikeSubscriptionsAtEnd: number;
}

export interface DailyRevenue {
  date: string; // YYYY-MM-DD
  totalAmount: number;
  subscriptionAmount: number;
  oneTimeAmount: number;
}

export interface DailySubscriptions {
  date: string; // YYYY-MM-DD
  new: number; // created on this day
  canceled: number; // canceled on this day
  activeLike: number; // active-like on this day
}

export interface DailyRegistrations {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface DailySubscriptionsByStatus {
  date: string; // YYYY-MM-DD
  active: number;
  trialing: number;
  cancel_at_period_end: number;
  canceled: number;
  expired: number;
}

export interface SubscriptionStatusTotals {
  active: number;
  trialing: number;
  cancel_at_period_end: number;
  canceled: number;
  expired: number;
}

export interface BusinessAnalyticsResponse {
  kpi: BusinessKPI;
  dailyRevenue: DailyRevenue[];
  dailySubscriptions: DailySubscriptions[];
  dailyRegistrations: DailyRegistrations[];
  dailySubscriptionsByStatus: DailySubscriptionsByStatus[];
  subscriptionStatusTotals: SubscriptionStatusTotals;
}

export type BusinessAnalyticsResponseEnvelope = ApiResponse<
  BusinessAnalyticsResponse
>;
