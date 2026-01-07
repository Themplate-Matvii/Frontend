import type { Metadata } from "next";
import { getI18n } from "@/shared/lib/i18n/server";
import { messages } from "@/i18n/messages";
import { DashboardMediaCreatePage } from "@/page-components/dashboard/media/create/page";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.media.create.title),
    description: t(messages.meta.dashboard.media.create.description),
  };
}

export default function Page() {
  return <DashboardMediaCreatePage />;
}
