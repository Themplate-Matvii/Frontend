"use client";

import { PageShell } from "@/shared/layout/PageShell";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { AnalyticsOverview } from "@/widgets/analytics/overview";

export const DashboardAnalyticsPage = () => {
  const { t } = useI18n();

  return (
    <PageShell>
      <Container>
        <PageHeader
          title={t(messages.dashboard.analytics.title)}
          subtitle={t(messages.dashboard.analytics.subtitle)}
        />
        <AnalyticsOverview />
      </Container>
    </PageShell>
  );
};
