"use client";

import React from "react";
import { messages, useI18n } from "@packages/locales";
import { Container } from "@/shared/layout/Container";
import { H2, Lead, P, Small, TextColorEnum } from "@/shared/ui/Typography";

const featureKeys: Array<{ title: string; description: string }> = [
  {
    title: messages.landing.features.items.first.title,
    description: messages.landing.features.items.first.description,
  },
  {
    title: messages.landing.features.items.second.title,
    description: messages.landing.features.items.second.description,
  },
  {
    title: messages.landing.features.items.third.title,
    description: messages.landing.features.items.third.description,
  },
];

export const FeatureSection = () => {
  const { t } = useI18n();

  return (
    <section className="bg-surface/40 py-16">
      <Container className="space-y-10">
        <div className="space-y-3 text-center">
          <H2>{t(messages.landing.features.title)}</H2>
          <Lead className="mx-auto max-w-3xl">
            {t(messages.landing.features.subtitle)}
          </Lead>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featureKeys.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-background/60 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10" />
              <P className="font-semibold text-lg">{t(item.title)}</P>
              <Small color={TextColorEnum.Secondary} className="mt-2 block">
                {t(item.description)}
              </Small>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
