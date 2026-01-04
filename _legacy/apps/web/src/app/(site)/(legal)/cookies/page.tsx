import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales/messages";
import type { Metadata } from "next";
import CookiesClient from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.cookies.title),
    description: t(messages.cookies.intro),
  };
}

export default function CookiesPage() {
  return <CookiesClient />;
}
