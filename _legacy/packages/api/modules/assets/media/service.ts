import { apiClient } from "@packages/api/client";
import type { AxiosRequestConfig } from "axios";
import { sortEnum } from "@packages/api/types/pagination";
import type {
  DeleteMediaResponse,
  MediaDetailResponse,
  MediaPaginatedResponse,
  UpdateMediaRequest,
  UpdateMediaResponse,
  UploadMediaRequest,
  UploadMediaResponse,
} from "./types";

export const mediaService = {
  /** POST /api/media/upload */
  upload: (body: UploadMediaRequest, config?: AxiosRequestConfig) => {
    const formData = new FormData();
    if (body.file) formData.append("file", body.file);
    if (body.url) formData.append("url", body.url);
    if (body.name) formData.append("name", body.name);
    if (body.description) formData.append("description", body.description);

    return apiClient.post<UploadMediaResponse>("/api/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...(config || {}),
    });
  },

  /** GET /api/media/ */
  list: (
    params: {
      page?: number;
      limit?: number;
      mime?: string;
      s?: string;
      sort?: sortEnum;
    },
    config?: AxiosRequestConfig,
  ) =>
    apiClient.get<MediaPaginatedResponse>("/api/media/", {
      params,
      ...(config || {}),
    }),

  /** GET /api/media/:id */
  getById: (id: string, config?: AxiosRequestConfig) =>
    apiClient.get<MediaDetailResponse>(
      `/api/media/${id}`,
      config,
    ),

  /** PATCH /api/media/:id */
  update: (id: string, body: UpdateMediaRequest, config?: AxiosRequestConfig) =>
    apiClient.patch<UpdateMediaResponse>(
      `/api/media/${id}`,
      body,
      config,
    ),

  /** DELETE /api/media/:id */
  remove: (id: string, config?: AxiosRequestConfig) =>
    apiClient.delete<DeleteMediaResponse>(`/api/media/${id}`, config),
};
