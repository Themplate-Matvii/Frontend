import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales/messages";
import type { Metadata } from "next";
import TermsClient from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.terms.title),
    description: t(messages.terms.intro),
  };
}

export default function TermsPage() {
  return <TermsClient />;
}
