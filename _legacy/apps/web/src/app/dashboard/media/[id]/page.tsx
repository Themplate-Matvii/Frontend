import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import type { Metadata } from "next";
import MediaDetailClient from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.media.detail.title),
    description: t(messages.meta.dashboard.media.detail.description),
  };
}

export default function MediaDetailPage() {
  return <MediaDetailClient />;
}
