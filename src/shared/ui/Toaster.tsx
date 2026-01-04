"use client";

import React from "react";
import { Toaster } from "sonner";
import { Theme } from "@/shared/ui";
import { useTheme } from "@/shared/lib/theme";

export function AppToaster() {
  const { theme } = useTheme();
  const resolvedTheme =
    theme === Theme.SYSTEM
      ? "system"
      : theme === Theme.DARK
      ? "dark"
      : "light";

  return (
    <Toaster
      theme={resolvedTheme}
      position="top-right"
      richColors
      closeButton
    />
  );
}
