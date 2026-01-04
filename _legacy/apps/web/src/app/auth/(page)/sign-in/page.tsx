import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales/messages";
import type { Metadata } from "next";
import SignInClient from "./ClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.auth.signIn.title),
    description: t(messages.meta.auth.signIn.description),
  };
}

export default function SingInPage() {
  return <SignInClient />;
}
