"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import type { AuthResponse } from "@/entities/identity/auth/model/types";
import { User } from "@/entities/identity/users/model/user/types";
import { useRouter } from "next/navigation";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { toast } from "@/shared/ui/toast/toast";
import {
  registerSessionExpiredHandler,
  notifySessionExpired,
  resetSessionExpiredNotification,
} from "@/shared/lib/auth/session";

type Ctx = {
  user: User | null;
  status: "loading" | "authenticated" | "guest" | "error";
  loading: boolean; // "auth is resolving" flag
  login: (data: AuthResponse) => void;
  logout: () => Promise<void>;
  refreshUser: (options?: { silent?: boolean }) => Promise<void>;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: User | null;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(initialUser);
  const [status, setStatus] = useState<Ctx["status"]>(
    initialUser ? "authenticated" : "loading",
  );
  const refreshInFlight = useRef<Promise<void> | null>(null);
  const sessionExpiredHandled = useRef(false);
  const hasSessionRef = useRef<boolean>(!!initialUser);
  const previousStatusRef = useRef<Ctx["status"] | null>(null);

  const persistSessionFlag = useCallback((nextValue: boolean) => {
    hasSessionRef.current = nextValue;
    if (typeof window === "undefined") return;
    if (nextValue) {
      window.localStorage.setItem("auth:has-session", "true");
    } else {
      window.localStorage.removeItem("auth:has-session");
    }
  }, []);

  const performLogout = useCallback(
    async (toastOptions?: {
      variant: "success" | "error" | "info" | "warning";
      title: string;
      description?: string;
    }) => {
      setStatus("loading");
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          cache: "no-store",
          credentials: "include",
        });
      } finally {
        setUser(null);
        setStatus("guest");
        router.replace("/auth/sign-in");
        persistSessionFlag(false);
        if (toastOptions) {
          toast[toastOptions.variant](
            toastOptions.title,
            toastOptions.description,
          );
        }
      }
    },
    [persistSessionFlag, router],
  );

  const refreshUser = useCallback(async (options?: { silent?: boolean }) => {
    if (refreshInFlight.current) {
      await refreshInFlight.current;
      return;
    }

    const refreshPromise = (async () => {
      if (!options?.silent) {
        setStatus((prev) => (prev === "loading" ? prev : "loading"));
      }
      try {
        const res = await fetch("/api/me", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.ok) {
          const nextUser = (await res.json()) as User;
          setUser(nextUser);
          setStatus("authenticated");
          resetSessionExpiredNotification();
          sessionExpiredHandled.current = false;
          persistSessionFlag(true);
        } else {
          setUser(null);
          if (res.status === 401 || res.status === 403) {
            if (hasSessionRef.current) {
              notifySessionExpired();
              persistSessionFlag(false);
            }
            setStatus("guest");
          } else {
            setStatus("error");
          }
        }
      } catch {
        setUser(null);
        setStatus("error");
      } finally {
        refreshInFlight.current = null;
      }
    })();

    refreshInFlight.current = refreshPromise;
    await refreshPromise;
  }, [persistSessionFlag]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      hasSessionRef.current =
        window.localStorage.getItem("auth:has-session") === "true" ||
        hasSessionRef.current;
      if (hasSessionRef.current) {
        persistSessionFlag(true);
      }
    }
    if (!initialUser) {
      void refreshUser();
    }
  }, [initialUser, persistSessionFlag, refreshUser]);

  const login = useCallback((data: AuthResponse) => {
    setUser(data.user);
    setStatus("authenticated");
    resetSessionExpiredNotification();
    sessionExpiredHandled.current = false;
    persistSessionFlag(true);
  }, [persistSessionFlag]);

  const logout = useCallback(async () => {
    await performLogout({
      variant: "success",
      title: t(messages.notifications.auth.logoutSuccess),
    });
  }, [performLogout, persistSessionFlag, t]);

  const handleSessionExpired = useCallback(async () => {
    if (sessionExpiredHandled.current) return;
    sessionExpiredHandled.current = true;
    persistSessionFlag(false);
    await performLogout({
      variant: "warning",
      title: t(messages.notifications.auth.sessionExpiredTitle),
      description: t(messages.notifications.auth.sessionExpiredDescription),
    });
  }, [performLogout, t]);

  useEffect(() => {
    const unregister = registerSessionExpiredHandler(handleSessionExpired);
    return () => unregister();
  }, [handleSessionExpired]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (previousStatusRef.current === status) return;
    console.debug(
      "[auth] status transition",
      previousStatusRef.current ?? "init",
      "->",
      status,
    );
    previousStatusRef.current = status;
  }, [status]);

  const value = useMemo<Ctx>(
    () => ({
      user,
      status,
      loading: status === "loading",
      login,
      logout,
      refreshUser,
    }),
    [user, status, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
