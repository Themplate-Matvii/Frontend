"use client";

import React, { ReactNode, useState } from "react";
import { I18nProvider } from "@packages/locales";
import { ThemeProvider } from "@packages/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@packages/api/context/AuthContext";
import { User } from "@packages/api/modules/user/index/types";

interface AppProvidersProps {
  children: ReactNode;
  locale?: string;
  initialUser?: User | null; // server-provided user
}

export const AppProviders = ({
  children,
  locale = "ru",
  initialUser = null,
}: AppProvidersProps) => {
  // Create a single QueryClient instance
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialUser}>
        <I18nProvider initialLocale={locale}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
