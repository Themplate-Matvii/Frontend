"use client";

import { useRouter } from "next/navigation";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";

export const AnalyticsOverview = () => {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <SectionCard
        title={t(messages.dashboard.analytics.business.title)}
        description={t(messages.dashboard.analytics.business.subtitle)}
        bodyClassName="flex items-center justify-between"
      >
        <div className="text-sm text-secondary">
          {t(messages.dashboard.analytics.business.subtitle)}
        </div>
        <Button
          size={ButtonSizeEnum.md}
          variant={ButtonVariantEnum.primary}
          onClick={() => router.push("/dashboard/analytics/business")}
        >
          {t(messages.dashboard.analytics.business.title)}
        </Button>
      </SectionCard>

      <SectionCard
        title={t(messages.dashboard.analytics.traffic.title)}
        description={t(messages.dashboard.analytics.traffic.subtitle)}
        bodyClassName="flex items-center justify-between"
      >
        <div className="text-sm text-secondary">
          {t(messages.dashboard.analytics.traffic.subtitle)}
        </div>
        <Button
          size={ButtonSizeEnum.md}
          variant={ButtonVariantEnum.primary}
          onClick={() => router.push("/dashboard/analytics/traffic")}
        >
          {t(messages.dashboard.analytics.traffic.title)}
        </Button>
      </SectionCard>
    </section>
  );
};
