"use client";

import React from "react";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import type { PricingProduct } from "@/entities/monetization/pricing";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { PricingGrid } from "../pricing/PricingGrid";

type Props = {
  products: PricingProduct[];
  loading: boolean;
  onSelect: (product: PricingProduct) => void;
  isProcessing: boolean;
};

export function OneTimeSection({ products, loading, onSelect, isProcessing }: Props) {
  const { t } = useI18n();

  return (
    <SectionCard
      title={t(messages.dashboard.billing.oneTime.title)}
      description={t(messages.dashboard.billing.oneTime.subtitle)}
      bodyClassName="space-y-4"
    >
      <PricingGrid
        products={products}
        loading={loading}
        onSelect={onSelect}
        currentKey={null}
        isFullWidth={false}
        ctaLabel={t(messages.dashboard.billing.oneTime.cta)}
        currentLabel={t(messages.dashboard.billing.oneTime.purchased)}
        intervalLabel={t(messages.dashboard.billing.plans.intervalLabel)}
        trialLabel={t(messages.dashboard.billing.plans.trial)}
        emptyLabel={t(messages.dashboard.billing.oneTime.empty)}
        isProcessing={isProcessing}
      />
    </SectionCard>
  );
}
