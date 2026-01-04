import { Metadata } from "next";
import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import SubscriptionSuccessClientPage from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.subscriptionSuccess.title),
    description: t(messages.meta.dashboard.subscriptionSuccess.description),
  };
}

export default function SubscriptionSuccessPage() {
  return <SubscriptionSuccessClientPage />;
}
