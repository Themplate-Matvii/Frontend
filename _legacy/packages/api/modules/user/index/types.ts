import { Paginated, PaginationParams } from "@packages/api/types/pagination";
import { Permissions } from "@packages/api/types/permissions";
import { Languages } from "@packages/locales/translations";
import { Theme } from "@packages/ui";
import { UserSettings } from "../settings";
import { MediaItem } from "../../assets/media";

export interface AuthProvider {
  provider: string; // e.g. "google"
  providerId: string; // e.g. "1234567890"
}

export enum UserRoleEnum {
  ADMIN = "admin",
  USER = "user"
}

export interface UsersPaginationParams extends PaginationParams {
  role?: UserRole,
  plan?: string
}

export interface UserRole {
  key: UserRoleEnum,
  name: string,
}

export interface User {
  id: string;
  email: string;
  name: string;
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
