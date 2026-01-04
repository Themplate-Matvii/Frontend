import { apiClient } from "@packages/api/client";
import type { AxiosRequestConfig } from "axios";
import type {
  LandingsListResponse,
  CreateLandingRequest,
  CreateLandingResponse,
} from "./types";

/**
 * Axios-based landings service.
 * Uses raw payloads as defined by the API.
 */
export const landingsService = {
  /** GET /api/landings/ -> list current user's landings */
  list: (config?: AxiosRequestConfig) =>
    apiClient.get<LandingsListResponse>("/api/landings/", config),

  /** POST /api/landings/ -> create landing */
  create: (body: CreateLandingRequest, config?: AxiosRequestConfig) =>
    apiClient.post<CreateLandingResponse>("/api/landings/", body, config),
};
