import { Metadata } from "next";
import { getI18n } from "@packages/locales/server";
import { messages } from "@packages/locales";
import FeedbackClientPage from "./ClientPage";


/** Server metadata for the Register page */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.feedback.list.title),
    description: t(messages.meta.dashboard.feedback.list.description),
  };
}

export default function FeedbackPage() {
  return <FeedbackClientPage />;
}
