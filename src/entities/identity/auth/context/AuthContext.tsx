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
  loading: boolean; // "auth is resolving" flag
  login: (data: AuthResponse) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(!initialUser);
  const refreshInFlight = useRef<Promise<void> | null>(null);
  const sessionExpiredHandled = useRef(false);
  const hasSessionRef = useRef<boolean>(!!initialUser);

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
      setLoading(true);
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          cache: "no-store",
          credentials: "include",
        });
      } finally {
        setUser(null);
        setLoading(false);
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

  const refreshUser = useCallback(async () => {
    if (refreshInFlight.current) {
      await refreshInFlight.current;
      return;
    }

    const refreshPromise = (async () => {
      // setLoading(true);
      try {
        const res = await fetch("/api/me", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.ok) {
          const nextUser = (await res.json()) as User;
          setUser(nextUser);
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
          }
        }
      } catch {
        setUser(null);
      } finally {
        // setLoading(false);
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
    }
    if (!initialUser) {
      void refreshUser();
    }
  }, [initialUser, refreshUser]);

  const login = useCallback((data: AuthResponse) => {
    setUser(data.user);
    setLoading(false);
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

  const value = useMemo<Ctx>(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
