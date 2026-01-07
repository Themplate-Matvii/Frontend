"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthProvider";
import { I18nProvider } from "./I18nProvider";
import { ThemeProvider } from "./ThemeProvider";
import type { User } from "@/entities/identity";
import { AppToaster } from "@/shared/ui/toast/Toaster";

type AppProvidersProps = {
  children: ReactNode;
  locale?: string;
  initialUser?: User | null;
};

export const AppProviders = ({
  children,
  locale = "ru",
  initialUser = null,
}: AppProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider initialLocale={locale}>
        <AuthProvider initialUser={initialUser}>
          <ThemeProvider>
            {children}
            <AppToaster />
          </ThemeProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};
