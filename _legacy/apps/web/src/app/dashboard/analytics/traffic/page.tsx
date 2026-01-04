import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import type { Metadata } from "next";
import TrafficAnalyticsClientPage from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.analytics.traffic.title),
    description: t(messages.meta.dashboard.analytics.traffic.description),
  };
}

export default function TrafficAnalyticsPage() {
  return <TrafficAnalyticsClientPage />;
}
