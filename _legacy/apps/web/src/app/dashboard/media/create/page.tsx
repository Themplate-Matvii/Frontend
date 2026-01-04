import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import type { Metadata } from "next";

import MediaCreateClientPage from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.media.create.title),
    description: t(messages.meta.dashboard.media.create.description),
  };
}

export default function MediaCreatePage() {
  return <MediaCreateClientPage />;
}

