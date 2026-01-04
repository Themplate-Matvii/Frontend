import { LanguageSwitcher } from "@/shared/controls/LanguageSwitcher";
import { getI18n } from "@packages/locales/server";
import { Metadata } from "next";
import { messages } from "@packages/locales";
import { FaviconDark } from "@packages/assets";
import { Sidebar } from "@/shared/layout/base/sidebar";


export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t(messages.meta.dashboard.index.title),
    description: t(messages.meta.dashboard.index.description),
    icons: FaviconDark,
  };
}

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex pt-12 md:pt-0">
        <Sidebar />
        <div className="flex-1 relative dashboard-content">
          {/* Desktop language switcher, top-right */}
          <div className="hidden md:flex fixed top-2 right-2 z-40">
            <LanguageSwitcher />
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
