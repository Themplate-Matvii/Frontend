// packages/api/modules/billing/subscriptions/queries.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsService } from "./service";
import type { Subscription } from "./types";
import axios from "axios";

/** Stable query keys for this module. */
export const subscriptionKeys = {
  root: ["subscriptions"] as const,
  me: () => [...subscriptionKeys.root, "me"] as const,
  byUser: (userId: string | undefined) =>
    [...subscriptionKeys.root, "user", userId] as const,
};

export interface MySubscriptionResult {
  subscription: Subscription | null;
  message?: string | null;
  success: boolean;
}

/** Fetch current user's subscription. */
export function useMySubscription(options?: { enabled?: boolean }) {
  return useQuery<MySubscriptionResult>({
    queryKey: subscriptionKeys.me(),
    queryFn: async () => {
      try {
        const { data } = await subscriptionsService.me();

        const subscription = data?.data ?? null;
        const success = Boolean(data?.success);
        const message = data?.message ?? null;

        return {
          subscription: success ? subscription : null,
          message,
          success,
        } as MySubscriptionResult;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return {
            subscription: null,
            message: null,
            success: true,
          } as MySubscriptionResult;
        }

        throw error;
      }
    },
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: options?.enabled ?? true,
  });
}


/** Cancel subscription and refetch "me". */
export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await subscriptionsService.cancel();
      return data.data; // envelope.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.me() });
    },
  });
}

export function useResumeSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await subscriptionsService.resume();
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.me() });
    },
  });
}

export function useUserSubscription(userId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery<MySubscriptionResult>({
    queryKey: subscriptionKeys.byUser(userId),
    enabled: (options?.enabled ?? true) && !!userId,
    queryFn: async () => {
      if (!userId) throw new Error("userId is required");
      try {
        const { data } = await subscriptionsService.byUser(userId);
        const subscription = data?.data ?? null;
        const success = Boolean(data?.success);
        const message = data?.message ?? null;

        return {
          subscription: success ? subscription : null,
          message,
          success,
        } as MySubscriptionResult;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return {
            subscription: null,
            message: null,
            success: true,
          } as MySubscriptionResult;
        }

        throw error;
      }
    },
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useCancelUserSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await subscriptionsService.cancelByUser(userId);
      return data.data;
    },
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.byUser(userId) });
    },
  });
}

export function useResumeUserSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await subscriptionsService.resumeByUser(userId);
      return data.data;
    },
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.byUser(userId) });
    },
  });
}
