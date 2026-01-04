import { useQuery } from "@tanstack/react-query";
import { analyticsBusinessService } from "./service";
import type { BusinessAnalyticsResponse } from "./types";

/** Stable query keys for business analytics. */
export const businessAnalyticsKeys = {
  root: ["analytics", "business"] as const,
  range: (dateFrom: string, dateTo: string) =>
    [...businessAnalyticsKeys.root, "range", dateFrom, dateTo] as const,
};

/** Fetch business analytics for a date range [ISO strings]. */
export function useBusinessAnalytics(
  vars: { dateFrom: string; dateTo: string } | undefined,
  options?: {
    enabled?: boolean;
    select?: (data: BusinessAnalyticsResponse) => any;
  }
) {
  const enabled = Boolean(vars) && (options?.enabled ?? true);
  const df = vars?.dateFrom ?? "";
  const dt = vars?.dateTo ?? "";

  return useQuery({
    queryKey: businessAnalyticsKeys.range(df, dt),
    queryFn: async () => {
      if (!vars) throw new Error("date range is required");
      const { data } = await analyticsBusinessService.get(vars);
      const payload = (data as any).data ?? data;

      if ((payload as any).success === false) {
        throw new Error(
          (payload as any).message || "Failed to load business analytics",
        );
      }

      return payload as BusinessAnalyticsResponse;
    },
    enabled,
    select: options?.select,
  });
}
