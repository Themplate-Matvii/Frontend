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
} from "@/entities/identity/auth/model/types";
import { apiClient } from "@/shared/lib/http/apiClient";
import { I18N } from "@/shared/config";
import { getCookie } from "@/shared/lib/cookies";

const localeHeaders = (): Record<string, string> => {
  const lng = getCookie(I18N.LOCALE_COOKIE_KEY) || I18N.DEFAULT_LOCALE;
  return lng ? { "Accept-Language": lng } : {};
};

const mergeHeadersToRecord = (
  base: Record<string, string>,
  extra?: HeadersInit,
): Record<string, string> => {
  const out: Record<string, string> = { ...base };

  if (!extra) return out;

  if (extra instanceof Headers) {
    extra.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }

  if (Array.isArray(extra)) {
    for (const [key, value] of extra) {
      out[key] = String(value);
    }
    return out;
  }

  for (const [key, value] of Object.entries(extra)) {
    if (typeof value !== "undefined") out[key] = value;
  }

  return out;
};

const bffRequest = async <T>(
  url: string,
  options: RequestInit & { headers?: HeadersInit } = {},
) => {
  const body = options.body;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const base: Record<string, string> = {
    ...localeHeaders(),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  // Normalize any HeadersInit into a plain Record<string,string>
  // so fetch() receives predictable headers and TS is satisfied.
  const headers: Record<string, string> = mergeHeadersToRecord(
    base,
    options.headers,
  );

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
    credentials: "include",
  });

  const contentType = res.headers.get("Content-Type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => ({}))
    : await res.text();

  if (!res.ok) {
    const err: any = new Error("BFF_REQUEST_FAILED");
    err.response = { data, status: res.status };
    throw err;
  }

  return { data: data as T };
};

const buildSearchParams = (params?: OauthAuthorizeParams) => {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const authService = {
  // Build provider authorization URL
  oauthAuthorize: (provider: string, params?: OauthAuthorizeParams) =>
    bffRequest<{ url: string }>(
      `/api/auth/oauth/${provider}/authorize${buildSearchParams(params)}`,
      { method: "GET" },
    ),

  // SPA direct login with idToken or code
  oauthLogin: (provider: string, data: OauthLoginRequest) =>
    bffRequest<AuthResponse>(`/api/auth/oauth/${provider}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

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

      return bffRequest<AuthResponseEnvelope>("/api/auth/register", {
        method: "POST",
        body: formData,
      });
    }

    return bffRequest<AuthResponseEnvelope>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(rest),
    });
  },

  login: (data: LoginRequest) =>
    bffRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Returns { accessToken } only
  refresh(config?: AxiosRequestConfig) {
    // Axios headers can be non-plain (AxiosHeaders), normalize via HeadersInit path
    return bffRequest<RefreshResponse>("/api/auth/refresh", {
      method: "POST",
      headers: (config?.headers as unknown as HeadersInit) ?? undefined,
    });
  },

  logout: () => bffRequest<void>("/api/auth/logout", { method: "POST" }),

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
