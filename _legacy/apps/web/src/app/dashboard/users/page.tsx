import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import type { Metadata } from "next";
import UsersClientPage from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.users.list.title),
    description: t(messages.meta.dashboard.users.list.description),
  };
}

export default function UsersPage() {
  return <UsersClientPage />;
}
