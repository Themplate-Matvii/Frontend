import { Paginated, PaginationParams } from "@/shared/types/api/pagination";
import { Permissions } from "@/shared/types/api/permissions";
import { Languages } from "@/i18n/translations";
import { Theme } from "@/shared/ui";
import { UserSettings } from "@/entities/identity/users/model/settings/types";
import { MediaItem } from "@/entities/content/media";

export interface AuthProvider {
  provider: string; // e.g. "google"
  providerId?: string; // e.g. "1234567890"
  email?: string;
  addedAt?: string;
  lastUsedAt?: string;
}

export enum UserRoleEnum {
  ADMIN = "admin",
  USER = "user"
}

export interface UsersPaginationParams extends PaginationParams {
  role?: UserRoleEnum;
  plan?: string;
}

export interface UserRole {
  key: UserRoleEnum,
  name: string,
}

export interface User {
  id: string;
  email: string;
  name: string;
  birthday?: string | null;
  phone?: string | null;
  country?: string | null;
  timezone?: string | null;
  emailVerified?: boolean;
  hasPassword?: boolean;
  aiCredits?: number;
  role: UserRole;
  plan: string;
  authProviders?: AuthProvider[];
  settings?: UserSettings;
  permissions: Permissions;
  createdAt: string;
  updatedAt: string;
  avatar?: MediaItem;
}

export interface UpdateUserRequest {
  avatar?: string;
  name?: string;
  settings?: {
    theme: Theme,
    locale: Languages
  }
}
