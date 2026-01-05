import type { Metadata } from "next";
import { getI18n } from "@/shared/lib/i18n/server";
import { messages } from "@/i18n/messages";
import DashboardUserDetailPage from "@/page-components/dashboard/users/detail/page";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.users.detail.title),
    description: t(messages.meta.dashboard.users.detail.description),
  };
}

export default function Page() {
  return <DashboardUserDetailPage />;
}
