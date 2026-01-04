import { Metadata } from "next";
import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import SubscriptionClientPage from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.subscription.title),
    description: t(messages.meta.dashboard.subscription.description),
  };
}

export default function SubscriptionPage() {
  return <SubscriptionClientPage />;
}
