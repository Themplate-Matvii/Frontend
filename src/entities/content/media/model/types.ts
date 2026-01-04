import { ApiResponse } from "@/shared/types/api/global";
import type { Paginated } from "@/shared/types/api/pagination";

export interface MediaItem {
  id: string;
  filename: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string
  };
  mimeType: string;
  size: number;
  name?: string;
  description?: string;
  createdAt: string;
  url: string;
}

export interface UploadMediaRequest {
  file?: File | Blob;
  url?: string;
  name?: string;
  description?: string;
}


export type MediaResponse = ApiResponse<MediaItem>;
export type MediaDetailResponse = ApiResponse<MediaItem>;

export interface UpdateMediaRequest {
  name?: string;
  description?: string;
}

export interface MediaPaginatedPayload extends Paginated<MediaItem> {
  total: number;
  limit: number;
  pages?: number;
}

export type MediaPaginatedResponse = ApiResponse<MediaPaginatedPayload>;

export type UploadMediaResponse = ApiResponse<{ media: MediaItem; url: string }>;

export type UpdateMediaResponse = UploadMediaResponse;

export type DeleteMediaResponse = ApiResponse<null>;
