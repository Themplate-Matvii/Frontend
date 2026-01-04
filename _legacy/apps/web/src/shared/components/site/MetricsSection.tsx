"use client";

import React from "react";
import { messages, useI18n } from "@packages/locales";
import { Container } from "@/shared/layout/Container";
import { H2, Lead, P, Small, TextColorEnum } from "@/shared/ui/Typography";

const metricKeys: Array<{ label: string; value: string; hint: string }> = [
  {
    label: messages.landing.metrics.items.first.label,
    value: messages.landing.metrics.items.first.value,
    hint: messages.landing.metrics.items.first.hint,
  },
  {
    label: messages.landing.metrics.items.second.label,
    value: messages.landing.metrics.items.second.value,
    hint: messages.landing.metrics.items.second.hint,
  },
  {
    label: messages.landing.metrics.items.third.label,
    value: messages.landing.metrics.items.third.value,
    hint: messages.landing.metrics.items.third.hint,
  },
];

export const MetricsSection = () => {
  const { t } = useI18n();

  return (
    <section className="bg-gradient-to-b from-background via-surface/40 to-background py-16">
      <Container className="space-y-10">
        <div className="space-y-3 text-center">
          <H2>{t(messages.landing.metrics.title)}</H2>
          <Lead className="mx-auto max-w-2xl">{t(messages.landing.metrics.subtitle)}</Lead>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {metricKeys.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-background/60 p-6 text-center shadow-sm"
            >
              <P className="text-4xl font-bold">{t(item.value)}</P>
              <Small className="mt-1 block" color={TextColorEnum.Primary}>
                {t(item.label)}
              </Small>
              <Small className="mt-2 block" color={TextColorEnum.Secondary}>
                {t(item.hint)}
              </Small>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
