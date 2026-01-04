export enum BillingMode {
  subscription = "subscription",
  one_time = "one_time"
}

/**
 * Pricing product as returned by the backend.
 * Matches /api/pricing and /api/pricing/{key} responses.
 */
export interface PricingProduct {
  key: string;
  nameKey?: string;
  name?: string;
  priceCents: number;
  currency: string;
  mode: BillingMode;
  trialDays?: number | null;
  interval?: string | null;
  permissions?: string[] | null;
  bonus?: Record<string, unknown>[] | null;
  provider?: string | null;
  providerProductId?: string | null;
  providerPriceId?: string | null;
}
