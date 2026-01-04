import { useMutation, useQuery } from "@tanstack/react-query";
import { paymentsService } from "./service";
import type { Payment } from "@/entities/monetization/subscriptions/model/payments/types";

/** Stable query keys for this module. */
export const paymentKeys = {
  root: ["payments"] as const,
  my: () => [...paymentKeys.root, "my"] as const,
  user: (userId: string | undefined) => [...paymentKeys.root, "user", userId] as const,
};

/** Fetch current user's payments history. */
export function useMyPayments(options?: {
  enabled?: boolean;
  select?: (p: Payment[]) => any;
}) {
  return useQuery({
    queryKey: paymentKeys.my(),
    queryFn: async () => {
      const { data } = await paymentsService.my();
      return data.data; // raw array
    },
    enabled: options?.enabled ?? true,
    select: options?.select,
  });
}

export function useUserPayments(
  userId: string | undefined,
  options?: { enabled?: boolean; select?: (data: Payment[]) => any },
) {
  return useQuery({
    queryKey: paymentKeys.user(userId),
    enabled: (options?.enabled ?? true) && !!userId,
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await paymentsService.byUser(userId);
      return data.data; // raw array
    },
    select: options?.select,
  });
}

/**
 * Create checkout session for a subscription plan and get redirect URL.
 */
export function useCheckout() {
  return useMutation({
    mutationFn: async (vars: { planKey: string }) => {
      const { data } = await paymentsService.checkout({ planKey: vars.planKey });
      return data.data.url;
    },
  });
}

/**
 * Create checkout session for one-time product and get redirect URL.
 */
export function useOneTimeCheckout() {
  return useMutation({
    mutationFn: async (vars: { productKey: string }) => {
      const { data } = await paymentsService.oneTimeCheckout({
        productKey: vars.productKey,
      });
      return data.data.url;
    },
  });
}
