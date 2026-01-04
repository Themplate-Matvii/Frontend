import { apiClient } from "@/shared/lib/http/apiClient";
import { ApiResponse } from "@/shared/types/api/global";
import { User, UpdateUserRequest, UsersPaginationParams } from "@/entities/identity/users/model/user/types";
import { Paginated } from "@/shared/types/api/pagination";

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
