"use client";

import React from "react";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import type { PricingProduct } from "@/entities/monetization/pricing";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { PricingGrid } from "./PricingGrid";

type Props = {
  products: PricingProduct[];
  loading: boolean;
  onSelect: (product: PricingProduct) => void;
  isProcessing: boolean;
  isFullWidth?: boolean;
};

export function PlansSection({
  products,
  loading,
  onSelect,
  isProcessing,
  isFullWidth = false,
}: Props) {
  const { t } = useI18n();

  return (
    <SectionCard
      title={t(messages.dashboard.billing.plans.title)}
      description={t(messages.dashboard.billing.plans.subtitle)}
      bodyClassName="space-y-4"
    >
      <PricingGrid
        products={products}
        loading={loading}
        onSelect={onSelect}
        currentKey={null}
        ctaLabel={t(messages.dashboard.billing.plans.cta)}
        currentLabel={t(messages.dashboard.billing.plans.current)}
        intervalLabel={t(messages.dashboard.billing.plans.intervalLabel)}
        trialLabel={t(messages.dashboard.billing.plans.trial)}
        emptyLabel={t(messages.dashboard.billing.plans.empty)}
        isProcessing={isProcessing}
        isFullWidth={isFullWidth}
      />
    </SectionCard>
  );
}
