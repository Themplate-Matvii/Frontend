import { Metadata } from "next";
import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import UnsubscribeClientPage from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.email.unsubscribe.title),
    description: t(messages.meta.email.unsubscribe.description),
  };
}

export default function UnsubscribePage({
  params,
}: {
  params: { token: string };
}) {
  return <UnsubscribeClientPage token={params.token} />;
}
