import { ApiResponse } from "@/shared/types/api/global";
import { Theme } from "@/shared/ui";
import { User } from "@/entities/identity/users/model/user/types";

export type OAuthProvider = "google" | "github" | "apple";

export enum OAuthIntent {
  login = "login",
  register = "register"
};

// Optional params for /authorize
export type OauthAuthorizeParams = {
  redirect?: string;
  state?: string;
  intent?: OAuthIntent;
  scope?: string;
  code_challenge?: string;
  code_challenge_method?: "S256" | "plain";
  prompt?: string;
  access_type?: "online" | "offline";
};

// Generic auth response used by login, register, oauth login
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export type AuthResponseEnvelope = ApiResponse<AuthResponse>;

// OAuth login
export type OauthLoginRequest = {
  idToken?: string; // OIDC id_token from provider (e.g., Google One Tap)
  code?: string; // Authorization code from provider
  code_verifier?: string; // PKCE code_verifier if used
  redirect_uri?: string; // Exact redirect_uri used during provider authorization if override is required
  locale?: string; // Optional user locale
  theme?: Theme; // Optional theme preference
  intent?: OAuthIntent | null; // "login" or "register"
};

// Register
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  locale?: string; // optional user locale/language
  theme?: Theme; // optional theme preference
  avatar?: string;
  avatarUrl?: string;
  avatarFile?: File | null;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
}

// Refresh
export interface RefreshRequest {
  refreshToken?: string; // optional fallback if cookie is not available
}

export interface RefreshResponse {
  accessToken: string;
  user?: User;
}

// Forgot password
export interface ForgotPasswordRequest {
  email: string;
}

export type ForgotPasswordResponse = ApiResponse<null>;

// Reset password
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  ok: boolean;
}
