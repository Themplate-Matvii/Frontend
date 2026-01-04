import { apiClient } from "@packages/api/client";
import { ApiResponse } from "@packages/api/types/global";
import { User, UpdateUserRequest, UsersPaginationParams } from "./types";
import { Paginated } from "@packages/api/types/pagination";

export const userService = {
  me: () => apiClient.get<ApiResponse<User>>("/api/users/me"),

  getAll: (params?: UsersPaginationParams & { role?: string; plan?: string }) =>
    apiClient.get<ApiResponse<Paginated<User>>>("/api/users/all", {
      params,
    }),

  getById: (userId: string) => apiClient.get<ApiResponse<User>>(`/api/users/id/${userId}`),

  updateById: (userId: string, body: UpdateUserRequest) =>
    apiClient.put<ApiResponse<User>>(`/api/users/id/${userId}`, body),

  deleteById: (userId: string) =>
    apiClient.delete<void>(`/api/users/id/${userId}`),
};
