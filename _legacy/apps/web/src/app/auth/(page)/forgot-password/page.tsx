import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import type { Metadata } from "next";
import ForgotPasswordClient from "./ClientPage";

/** Server metadata for the Forgot Password page */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.auth.forgotPassword.title),
    description: t(messages.meta.auth.forgotPassword.description),
  };
}

/** Server entry for the Forgot Password page */
export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
