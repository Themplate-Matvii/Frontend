"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { getCookie, setCookie } from "@packages/utils/cookies";

type UsePageSizeOptions = {
  defaultSize?: number;
  id?: string;
};

export function usePageSize(options?: UsePageSizeOptions) {
  const pathname = usePathname();
  const defaultSize = options?.defaultSize ?? 5;

  const cookieKey = useMemo(() => {
    const base = options?.id || pathname || "root";
    const normalized = base.replace(/[^a-zA-Z0-9_-]/g, "_");
    return `page_size_${normalized}`;
  }, [options?.id, pathname]);

  const [pageSize, setPageSizeState] = useState<number>(defaultSize);

  useEffect(() => {
    const cookieValue = getCookie(cookieKey);
    if (!cookieValue) return;

    const parsed = Number(cookieValue);
    if (Number.isFinite(parsed)) {
      setPageSizeState(parsed);
    }
  }, [cookieKey]);

  const setPageSize = useCallback(
    (value: number) => {
      setPageSizeState(value);
      setCookie(cookieKey, String(value));
    },
    [cookieKey],
  );

  return {
    pageSize,
    setPageSize,
    cookieKey,
  };
}
