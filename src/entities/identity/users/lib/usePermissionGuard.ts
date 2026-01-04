"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/entities/identity";

type UsePermissionGuardOptions = {
  canAccess: boolean;
  redirectTo?: string;
};

type UsePermissionGuardResult = {
  canAccess: boolean;
  authLoading: boolean;
};

export function usePermissionGuard(
  options: UsePermissionGuardOptions,
): UsePermissionGuardResult {
  const { canAccess, redirectTo = "/dashboard" } = options;
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !canAccess) {
      router.replace(redirectTo);
    }
  }, [authLoading, canAccess, redirectTo, router]);

  return { canAccess, authLoading };
}
