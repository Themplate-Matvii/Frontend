"use client";

import React from "react";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { Container } from "@/shared/layout/Container";
import { PageShell } from "@/shared/layout/PageShell";

export const DashboardHomePage = () => {
  const { t } = useI18n();

  return (
    <PageShell>
      <Container className="p-8">
        <h1 className="text-3xl font-bold">{t(messages.dashboard.index.title)}</h1>
        <p className="mt-4 text-lg">{t(messages.dashboard.index.subtitle)}</p>
      </Container>
    </PageShell>
  );
};
