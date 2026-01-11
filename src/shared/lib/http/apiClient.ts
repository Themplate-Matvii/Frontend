import axios from "axios";
import { I18N, ENV } from "@/shared/config";
import { getCookie } from "@/shared/lib/cookies";
import { notifySessionExpired } from "@/shared/lib/auth/session";

declare module "axios" {
  export interface AxiosRequestConfig {
    __skipAuthRefresh?: boolean;
  }
}

const AUTH_PUBLIC = [
  /^\/api\/auth\/login/,
  /^\/api\/auth\/register/,
  /^\/api\/auth\/oauth\//,
  /^\/api\/auth\/forgot-password/,
  /^\/api\/auth\/reset-password/,
];
const AUTH_ANY = [/^\/api\/auth\//];

export const apiClient = axios.create({
  baseURL: "",
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const url = (config.url || "").replace(ENV.API_URL || "", "");

  // i18n locale from cookie
  const lng = getCookie(I18N.LOCALE_COOKIE_KEY) || I18N.DEFAULT_LOCALE;
  config.headers["Accept-Language"] = lng;

  const isAuthPublic = AUTH_PUBLIC.some((re) => re.test(url));
  (config as any).__skipAuthRefresh = isAuthPublic;
  return config;
});

// refresh on 401 except auth endpoints or opted-out requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (t: string | null) => void;
  reject: (e: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config || {};
    const url = (originalRequest.url || "").replace(ENV.API_URL || "", "");

    const skip =
      (originalRequest as any).__skipAuthRefresh ||
      AUTH_ANY.some((re) => re.test(url));

    const isMeRequest = /^\/api\/me/.test(url);

    if (!skip && error.response?.status === 401 && originalRequest._retry) {
      if (isMeRequest) {
        return Promise.reject(error);
      }
      notifySessionExpired();
      return Promise.reject(error);
    }

    if (!skip && error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) =>
          failedQueue.push({ resolve, reject }),
        ).then((token) => {
          if (token) {
            originalRequest.headers =
              originalRequest.headers || ({} as typeof originalRequest.headers);
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`REFRESH_${res.status}`);
        }

        processQueue(null, null);
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        notifySessionExpired();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
