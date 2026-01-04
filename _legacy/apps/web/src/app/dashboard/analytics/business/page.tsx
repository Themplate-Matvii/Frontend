import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import type { Metadata } from "next";
import BusinessAnalyticsClientPage from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.analytics.business.title),
    description: t(messages.meta.dashboard.analytics.business.description),
  };
}

export default function BusinessAnalyticsPage() {
  return <BusinessAnalyticsClientPage />;
}
