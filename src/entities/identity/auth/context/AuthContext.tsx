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
import { toast } from "@/shared/ui/toast";

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

  const refreshUser = useCallback(async () => {
    if (refreshInFlight.current) {
      await refreshInFlight.current;
      return;
    }

    const refreshPromise = (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/me", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.ok) {
          const nextUser = (await res.json()) as User;
          setUser(nextUser);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
        refreshInFlight.current = null;
      }
    })();

    refreshInFlight.current = refreshPromise;
    await refreshPromise;
  }, []);

  useEffect(() => {
    if (!initialUser) {
      void refreshUser();
    }
  }, [initialUser, refreshUser]);

  const login = useCallback((data: AuthResponse) => {
    setUser(data.user);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
      });
      toast.success(t(messages.notifications.auth.logoutSuccess));
    } finally {
      setUser(null);
      setLoading(false);
      router.replace("/auth/sign-in");
    }
  }, [router, t]);

  const value = useMemo<Ctx>(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
