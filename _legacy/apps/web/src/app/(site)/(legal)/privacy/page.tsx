import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales/messages";
import type { Metadata } from "next";
import PrivacyPolicyClient from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.privacyPolicy.title),
    description: t(messages.privacyPolicy.intro),
  };
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient/>
}
