import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bonusService } from "./service";
import type { BonusAdjustRequest, BonusHistoryItem } from "@/entities/monetization/bonus/model/types";

export const bonusKeys = {
  root: ["bonus"] as const,
  myHistory: () => [...bonusKeys.root, "history", "me"] as const,
  userHistory: (userId: string | undefined) =>
    [...bonusKeys.root, "history", userId] as const,
};

export function useMyBonusHistory(options?: { enabled?: boolean }) {
  return useQuery<BonusHistoryItem[]>({
    queryKey: bonusKeys.myHistory(),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const { data } = await bonusService.myHistory();
      return data.data ?? [];
    },
    select: (data) => data ?? [],
  });
}

export function useUserBonusHistory(
  userId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery<BonusHistoryItem[]>({
    queryKey: bonusKeys.userHistory(userId),
    enabled: (options?.enabled ?? true) && !!userId,
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await bonusService.historyByUser(userId);
      return data.data ?? [];
    },
    select: (data) => data ?? [],
  });
}

export function useAdjustUserBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      body,
    }: {
      userId: string;
      body: BonusAdjustRequest;
    }) => {
      const { data } = await bonusService.adjustByUser(userId, body);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bonusKeys.userHistory(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
