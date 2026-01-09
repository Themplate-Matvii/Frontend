"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/entities/identity";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";

type AuthGateMode = "private" | "auth";

type AuthGateProps = {
  mode: AuthGateMode;
  children: React.ReactNode;
  redirectTo?: string;
};

export default function AuthGate({
  mode,
  children,
  redirectTo,
}: AuthGateProps) {
  const { user, status } = useAuth();
  const loading = status === "loading";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;

    const isAuthenticated = Boolean(user);
    if (mode === "private" && !isAuthenticated) {
      const next = `${pathname}${searchParams?.toString() ? `?${searchParams}` : ""}`;
      const url = new URL("/auth/sign-in", window.location.origin);
      url.searchParams.set("next", next);
      router.replace(url.pathname + url.search);
    }

    if (mode === "auth" && isAuthenticated) {
      router.replace(redirectTo ?? "/dashboard");
    }
  }, [loading, mode, pathname, redirectTo, router, searchParams, user]);

  if (loading) {
    return <LoadingOverlay loading isGlobal />;
  }

  if (mode === "private" && !user) return null;
  if (mode === "auth" && user) return null;

  return <>{children}</>;
}
