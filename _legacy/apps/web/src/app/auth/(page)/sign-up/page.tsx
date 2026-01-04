import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import type { Metadata } from "next";
import RegisterClient from "./ClientPage";

/** Server metadata for the Register page */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.auth.register.title),
    description: t(messages.meta.auth.register.description),
  };
}

/** Server entry for the Register page */
export default function RegisterPage() {
  return <RegisterClient />;
}
