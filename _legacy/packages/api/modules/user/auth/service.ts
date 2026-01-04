import { AxiosRequestConfig } from "axios";
import {
  OauthLoginRequest,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  AuthResponseEnvelope,
  OauthAuthorizeParams,
  RefreshResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse, // ApiResponse<null>
  ResetPasswordRequest,
} from "./types";
import { apiClient } from "@packages/api/client";

export const authService = {
  // Build provider authorization URL
  oauthAuthorize: (provider: string, params?: OauthAuthorizeParams) =>
    apiClient.get<{ url: string }>(`/api/auth/oauth/${provider}/authorize`, {
      params,
    }),

  // SPA direct login with idToken or code
  oauthLogin: (provider: string, data: OauthLoginRequest) =>
    apiClient.post<AuthResponse>(`/api/auth/oauth/${provider}`, data),

  register: (data: RegisterRequest) => {
    const { avatarFile, ...rest } = data;

    if (avatarFile) {
      const formData = new FormData();

      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      formData.append("avatar", avatarFile);

      return apiClient.post<AuthResponseEnvelope>("/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    return apiClient.post<AuthResponseEnvelope>("/api/auth/register", rest);
  },

  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>("/api/auth/login", data),

  // Returns { accessToken } only
  refresh(config?: AxiosRequestConfig) {
    return apiClient.post<RefreshResponse>("/api/auth/refresh", undefined, {
      ...config,
      __skipAuthRefresh: true, // prevent infinite loop in interceptors
    });
  },

  logout: () => apiClient.post<void>("/api/auth/logout"),

  // Forgot password: allow 4xx body passthrough
  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<ForgotPasswordResponse>("/api/auth/forgot-password", data, {
      // return response for any status < 500 so UI can read server message
      validateStatus: (s) => s < 500,
    }),

  // Reset password: allow 4xx body passthrough
  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<ForgotPasswordResponse>("/api/auth/reset-password", data, {
      validateStatus: (s) => s < 500,
    }),
};
