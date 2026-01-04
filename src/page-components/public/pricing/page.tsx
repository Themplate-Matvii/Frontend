"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { BillingMode, PricingApi } from "@/entities/pricing";
import { PageShell } from "@/shared/layout/PageShell";
import { Container } from "@/shared/layout/Container";
import { H1, H2, Lead, P, Small, TextColorEnum } from "@/shared/ui/Typography";
import { PricingGrid } from "@/widgets/billing/pricing";
import { Button, ButtonVariantEnum } from "@/shared/ui/Button";

export const PublicPricingPage = () => {
  const { t } = useI18n();
  const router = useRouter();

  const { data: subscriptionProducts = [], isLoading: subscriptionLoading } =
    PricingApi.usePricing({ mode: BillingMode.subscription });
  const { data: oneTimeProducts = [], isLoading: oneTimeLoading } =
    PricingApi.usePricing({
    mode: BillingMode.one_time,
  });

  const handleSelect = () => router.push("/auth/sign-in");

  return (
    <PageShell>
      <section className="bg-surface/40 py-12">
        <Container className="space-y-3">
          <H1>{t(messages.pricing.title)}</H1>
          <Lead className="max-w-3xl">{t(messages.pricing.description)}</Lead>
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>{t(messages.pricing.badge)}</span>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container className="space-y-6">
          <div className="space-y-2">
            <H2>{t(messages.pricing.subscriptions.title)}</H2>
            <P color={TextColorEnum.Secondary}>{t(messages.pricing.subscriptions.subtitle)}</P>
          </div>
          <PricingGrid
            products={subscriptionProducts}
            loading={subscriptionLoading}
            onSelect={handleSelect}
            currentKey={null}
            ctaLabel={t(messages.pricing.actions.choosePlan)}
            currentLabel={t(messages.pricing.actions.current)}
            intervalLabel={t(messages.pricing.labels.interval)}
            trialLabel={t(messages.pricing.labels.trial)}
            emptyLabel={t(messages.pricing.labels.empty)}
          />
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <Small color={TextColorEnum.Secondary}>{t(messages.pricing.subscriptions.note)}</Small>
          </div>
        </Container>
      </section>

      <section className="bg-surface/30 py-12">
        <Container className="space-y-6">
          <div className="space-y-2">
            <H2>{t(messages.pricing.oneTime.title)}</H2>
            <P color={TextColorEnum.Secondary}>{t(messages.pricing.oneTime.subtitle)}</P>
          </div>
          <PricingGrid
            products={oneTimeProducts}
            loading={oneTimeLoading}
            onSelect={handleSelect}
            currentKey={null}
            ctaLabel={t(messages.pricing.actions.purchase)}
            currentLabel={t(messages.pricing.actions.current)}
            intervalLabel={t(messages.pricing.labels.interval)}
            trialLabel={t(messages.pricing.labels.trial)}
            emptyLabel={t(messages.pricing.labels.empty)}
          />
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-background/60 p-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <P className="font-semibold">{t(messages.pricing.oneTime.helperTitle)}</P>
              <Small color={TextColorEnum.Secondary}>
                {t(messages.pricing.oneTime.helperDescription)}
              </Small>
            </div>
            <Button variant={ButtonVariantEnum.secondary} onClick={handleSelect}>
              {t(messages.pricing.actions.contact)}
            </Button>
          </div>
        </Container>
      </section>
    </PageShell>
  );
};
