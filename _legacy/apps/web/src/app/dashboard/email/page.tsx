import { Metadata } from "next";
import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import EmailClientPage from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.email.title),
    description: t(messages.meta.dashboard.email.description),
  };
}

export default function EmailPage() {
  return <EmailClientPage />;
}
