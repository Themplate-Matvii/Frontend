import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import type { Metadata } from "next";
import UserDetailClientPage from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.users.detail.title),
    description: t(messages.meta.dashboard.users.detail.description),
  };
}

export default function UserDetailPage() {
  return <UserDetailClientPage />;
}
