import type { Metadata } from "next";
import { getI18n } from "@/shared/lib/i18n/server";
import { messages } from "@/i18n/messages";
import { FaviconDark } from "@/shared/ui/assets";
import { Sidebar } from "@/widgets/app-shell/sidebar";
import { LanguageSwitcher } from "@/widgets/app-shell/controls";
import AuthGate from "@/widgets/auth/AuthGate";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.index.title),
    description: t(messages.meta.dashboard.index.description),
    icons: FaviconDark,
  };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate mode="private">
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex pt-12 md:pt-0">
          <Sidebar />
          <div className="flex-1 relative dashboard-content">
            <div className="hidden md:flex fixed top-2 right-2 z-40">
              <LanguageSwitcher />
            </div>
            {children}
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
