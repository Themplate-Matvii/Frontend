import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import type { Metadata } from "next";
import AccountClient from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.account.title),
    description: t(messages.meta.dashboard.account.description),
  };
}

export default function AccountPage() {
  return <AccountClient />;
}
