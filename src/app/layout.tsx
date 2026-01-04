import type { Metadata } from "next";
import { AppProviders } from "@/app-providers";
import { getI18n } from "@/shared/lib/i18n/server";
import { messages } from "@/i18n/messages";
import { FaviconDark } from "@/shared/ui/assets";
import { NoFlashThemeScript } from "@/shared/ui";
import { getUser } from "@/shared/lib/auth/server";
import NetworkStatusToast from "@/shared/ui/NetworkStatusToast";
import "@/shared/styles/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.title),
    description: t(messages.meta.description),
    icons: FaviconDark,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = await getI18n();
  const initialUser = await getUser();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <NoFlashThemeScript />
      </head>
      <body className="bg-background">
        <AppProviders locale={locale} initialUser={initialUser}>
          {children}
        </AppProviders>
        <NetworkStatusToast />
      </body>
    </html>
  );
}
