import { useQuery } from "@tanstack/react-query";
import { pricingService } from "./service";
import type { BillingMode, PricingProduct } from "./types";

/** Stable query keys for pricing module. */
export const pricingKeys = {
  root: ["pricing"] as const,
  all: (mode?: BillingMode) => [...pricingKeys.root, "all", mode || ""] as const,
  byKey: (key: string) => [...pricingKeys.root, "byKey", key] as const,
};

/** Fetch all pricing products. */
export function usePricing(options?: {
  mode?: BillingMode;
  enabled?: boolean;
  select?: (p: PricingProduct[]) => any;
}) {
  return useQuery({
    queryKey: pricingKeys.all(options?.mode),
    queryFn: async () => {
      const { data } = await pricingService.list({
        params: options?.mode ? { mode: options.mode } : undefined,
      });
      return data.data;
    },
    select: options?.select,
    enabled: options?.enabled ?? true,
  });
}

/** Fetch a single pricing product by key. */
export function usePricingProduct(
  key: string | undefined,
  options?: { enabled?: boolean; select?: (p: PricingProduct) => any }
) {
  return useQuery({
    queryKey: pricingKeys.byKey(String(key)),
    queryFn: async () => {
      if (!key) throw new Error("pricing product key is required");
      const { data } = await pricingService.byKey(key);
      return data;
    },
    enabled: (options?.enabled ?? true) && Boolean(key),
    select: options?.select,
  });
}
