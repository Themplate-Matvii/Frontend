import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { landingsService } from "./service";
import type { Landing } from "@/entities/content/assets/landings/model/types";

/** Stable query keys for this module. */
export const landingKeys = {
  root: ["landings"] as const,
  mine: () => [...landingKeys.root, "mine"] as const,
};

/** Fetch current user's landings. */
export function useMyLandings(options?: {
  enabled?: boolean;
  select?: (rows: Landing[]) => any;
}) {
  return useQuery({
    queryKey: landingKeys.mine(),
    queryFn: async () => {
      const { data } = await landingsService.list();
      return data; // raw array
    },
    enabled: options?.enabled ?? true,
    select: options?.select,
  });
}

/** Create landing and refresh the list. */
export function useCreateLanding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { title: string; description?: string }) =>
      landingsService.create(vars).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: landingKeys.mine() });
    },
  });
}
