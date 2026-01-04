import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "./service";
import type {
  MediaItem,
  MediaPaginatedPayload,
  UploadMediaRequest,
} from "./types";
import { sortEnum } from "@packages/api/types/pagination";
import type { Paginated } from "@packages/api/types/pagination";

export const mediaKeys = {
  root: ["media"] as const,
  detail: (id: string | undefined) => [...mediaKeys.root, "detail", id] as const,
  list: (params: {
    page?: number;
    limit?: number;
    mime?: string;
    s?: string;
    sort?: sortEnum;
  }) => [...mediaKeys.root, "list", params] as const,
};

export function useMediaList(
  params: {
    page?: number;
    limit?: number;
    mime?: string;
    s?: string;
    sort?: sortEnum;
  },
  options?: { enabled?: boolean; select?: (data: Paginated<MediaItem>) => any },
) {
  return useQuery({
    queryKey: mediaKeys.list(params),
    queryFn: async () => {
      const { data } = await mediaService.list(params);
      return data.data;
    },
    enabled: options?.enabled ?? true,
    select: options?.select,
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UploadMediaRequest) => {
      const { data } = await mediaService.upload(body);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKeys.root });
    },
  });
}

export function useMediaById(id: string | undefined) {
  return useQuery<MediaItem>({
    queryKey: mediaKeys.detail(id),
    queryFn: async () => {
      if (!id) throw new Error("media id is required");
      const { data } = await mediaService.getById(id);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useUpdateMedia(id: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      body: Parameters<typeof mediaService.update>[1],
    ) => {
      if (!id) throw new Error("media id is required");
      const { data } = await mediaService.update(id, body);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKeys.root });
    },
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await mediaService.remove(id);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKeys.root });
    },
  });
}
