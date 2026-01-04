import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/entities/identity";
import {
  OauthLoginRequest,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  AuthResponseEnvelope,
  OauthAuthorizeParams,
  ForgotPasswordRequest,
  ForgotPasswordResponse, // ApiResponse<null>
  ResetPasswordRequest,
  RefreshResponse,
} from "@/entities/identity/auth/model/types";
import { authService } from "./service";

// Register
export const useRegister = () => {
  const { login: setAuth } = useAuth();
  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (payload) => {
      const { data } = await authService.register(payload);
      const maybeEnvelope = data as AuthResponseEnvelope;

      const authPayload = (maybeEnvelope as any)?.data ?? maybeEnvelope;

      if (!authPayload?.accessToken || !authPayload?.user) {
        const message = (maybeEnvelope as any)?.message || "Invalid register response";
        throw new Error(message);
      }

      return authPayload as AuthResponse;
    },
    onSuccess: (data) => setAuth(data),
  });
};

// Login
export const useLogin = () => {
  const { login: setAuth } = useAuth();
  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: async (payload) => {
      const { data } = await authService.login(payload);
      return data;
    },
    onSuccess: (data) => setAuth(data),
  });
};

// Build provider authorization URL
export const useOauthAuthorize = (provider: string) => {
  return useMutation<{ url: string }, Error, OauthAuthorizeParams | undefined>({
    mutationFn: async (params) => {
      const { data } = await authService.oauthAuthorize(provider, params);
      return data;
    },
  });
};

// OAuth login (idToken or code)
export const useOauthLogin = (provider: string) => {
  const { login: setAuth } = useAuth();
  return useMutation<AuthResponse, Error, OauthLoginRequest>({
    mutationFn: async (payload) => {
      const { data } = await authService.oauthLogin(provider, payload);
      return data;
    },
    onSuccess: (data) => setAuth(data),
  });
};

// Refresh access token (reads HttpOnly refresh cookie on backend)
export const useRefresh = () => {
  const { refreshUser } = useAuth();
  return useMutation<RefreshResponse, Error>({
    mutationFn: async () => {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) throw new Error(`REFRESH_${res.status}`);
      return res.json();
    },
    onSuccess: async () => {
      await refreshUser();
    },
  });
};

// Logout
export const useLogout = () => {
  const { logout } = useAuth();
  return useMutation<void, Error>({
    mutationFn: async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
      });
    },
    onSuccess: () => {
      void logout();
    },
  });
};

// Forgot password: send reset link
export const useForgotPassword = () => {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordRequest>({
    mutationFn: async (payload) => {
      const { data } = await authService.forgotPassword(payload);
      return data;
    },
  });
};

// Reset password: set new password using emailed token
export const useResetPassword = () => {
  return useMutation<ForgotPasswordResponse, Error, ResetPasswordRequest>({
    mutationFn: async (payload) => {
      const { data } = await authService.resetPassword(payload);
      return data;
    },
  });
};
