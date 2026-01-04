import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import type { Metadata } from "next";
import MediaClientPage from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.media.list.title),
    description: t(messages.meta.dashboard.media.list.description),
  };
}

export default function MediaPage() {
  return <MediaClientPage />;
}
