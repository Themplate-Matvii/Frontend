import { useMutation, useQuery } from "@tanstack/react-query";
import { analyticsTrafficService } from "./service";
import type {
  TrafficAnalyticsResponse,
  TrafficEvent,
  TrackEventRequest,
} from "@/entities/analytics/tracking/model/types";

/** Stable query keys for traffic analytics. */
export const trafficAnalyticsKeys = {
  root: ["analytics", "traffic"] as const,
  list: (f: {
    dateFrom: string;
    dateTo: string;
    landingId?: string;
    userId?: string;
  }) =>
    [
      ...trafficAnalyticsKeys.root,
      "list",
      f.dateFrom,
      f.dateTo,
      f.landingId || "",
      f.userId || "",
    ] as const,
};

/** Admin: fetch traffic events within a range and optional filters. */
export function useTrafficEvents(
  filters:
    | { dateFrom: string; dateTo: string; landingId?: string; userId?: string }
    | undefined,
  options?: {
    enabled?: boolean;
    select?: (rows: TrafficAnalyticsResponse) => any;
  }
) {
  const enabled = Boolean(filters) && (options?.enabled ?? true);
  const key = filters
    ? trafficAnalyticsKeys.list(filters)
    : trafficAnalyticsKeys.list({
        dateFrom: "",
        dateTo: "",
        landingId: "",
        userId: "",
      });

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      if (!filters) throw new Error("filters are required");
      const { data } = await analyticsTrafficService.list(filters);
      const payload = (data as any).data ?? data;
      const normalized = (payload as any).data ?? payload;

      if ((normalized as any).success === false) {
        throw new Error(
          (normalized as any).message || "Failed to load traffic analytics",
        );
      }

      return normalized as TrafficAnalyticsResponse;
    },
    enabled,
    select: options?.select,
  });
}

/** Public: track a traffic event. */
export function useTrackTraffic() {
  return useMutation({
    mutationFn: async (vars: TrackEventRequest) => {
      const { data } = await analyticsTrafficService.track(vars);
      return data; // created event
    },
  });
}
