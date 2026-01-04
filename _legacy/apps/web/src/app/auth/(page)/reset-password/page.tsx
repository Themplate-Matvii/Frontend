import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import type { Metadata } from "next";
import ResetPasswordClient from "./ClientPage";

/** Server metadata for the Reset Password page */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.auth.resetPassword.title),
    description: t(messages.meta.auth.resetPassword.description),
  };
}

/** Server entry for the Reset Password page */
export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
