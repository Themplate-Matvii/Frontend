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

// userService.getAll expects role/plan as strings (query params).
// UsersPaginationParams in UI may type role as enum (UserRole), which conflicts.
// Override role/plan via Omit to avoid intersection (UserRole & string).
type UsersGetAllParams = Omit<UsersPaginationParams, "role" | "plan"> & {
  role?: string;
  plan?: string;
};

const normalizeUsersParams = (
  params?: UsersPaginationParams,
): UsersGetAllParams | undefined => {
  if (!params) return undefined;

  const anyParams = params as any;

  return {
    ...(params as Omit<UsersPaginationParams, "role" | "plan">),
    role:
      typeof anyParams.role === "undefined" || anyParams.role === null
        ? undefined
        : String(anyParams.role),
    plan:
      typeof anyParams.plan === "undefined" || anyParams.plan === null
        ? undefined
        : String(anyParams.plan),
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
    ...options, // allow override from outside (for example enabled: !user && !!accessToken)
  });
};

// Get all users (paginated, with filters)
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
