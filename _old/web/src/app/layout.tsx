import "../styles/globals.css";
import type { Metadata } from "next";
import { AppProviders } from "@/providers/AppProviders";
import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import { FaviconDark } from "@packages/assets";
import { NoFlashThemeScript } from "@packages/ui";
import NetworkStatusToast from "@/shared/ui/toast/NetworkStatusToast";

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

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <NoFlashThemeScript />
      </head>
      <body className="bg-background">
        <AppProviders locale={locale}>{children}</AppProviders>
        <NetworkStatusToast />
      </body>
    </html>
  );
}
