"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  UpdateUserRequest,
  User,
  UsersPaginationParams,
} from "@/entities/identity/users/model/user/types";
import { userService } from "./service";
import { Paginated } from "@/shared/types/api/pagination";
import { notifySessionExpired } from "@/shared/lib/auth/session";

// getAll expects: UsersPaginationParams plus role/plan as strings
type UsersGetAllServiceParams =
  | (UsersPaginationParams & { role?: string; plan?: string })
  | undefined;

const normalizeUsersParams = (
  params?: UsersPaginationParams,
): UsersGetAllServiceParams => {
  if (!params) return undefined;

  // делаем копию + приводим role/plan к string, не меняя базовый тип
  const p: UsersPaginationParams & { role?: unknown; plan?: unknown } =
    params as any;

  return {
    ...params,
    role: params.role ?? undefined,
    plan: params.plan ?? undefined,
  };
};

// Get current user
export const useCurrentUser = (options?: Partial<UseQueryOptions<User>>) => {
  return useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/me", {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          notifySessionExpired();
        }
        throw new Error(`ME_${res.status}`);
      }

      return (await res.json()) as User;
    },
    retry: false,
    enabled: false,
    ...options,
  });
};

// Get all users
export const useUsers = (
  params?: UsersPaginationParams,
  options?: Partial<UseQueryOptions<Paginated<User>>>,
) =>
  useQuery<Paginated<User>>({
    queryKey: ["users", params],
    queryFn: async () => {
      const normalized = normalizeUsersParams(params);
      const { data } = await userService.getAll(normalized);
      return data.data;
    },
    ...options,
  });

// Get user by ID
export const useUserById = (userId: string) =>
  useQuery<User>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data } = await userService.getById(userId);
      return data.data;
    },
    enabled: !!userId,
  });

// Update user by ID
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      body,
    }: {
      userId: string;
      body: UpdateUserRequest;
    }) => {
      const { data } = await userService.updateById(userId, body);
      return data;
    },
    onSuccess: ({ data: updatedUser }) => {
      if (updatedUser) {
        queryClient.setQueryData(["currentUser"], updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

// Delete user by ID
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await userService.deleteById(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
