"use client";

import React from "react";
import { BadgeCheck } from "lucide-react";
import { messages, useI18n } from "@packages/locales";
import { PricingProduct } from "@packages/api/modules/billing/pricing";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import { formatPrice } from "@/app/dashboard/subscription/utils/billing";

type Props = {
  products: PricingProduct[];
  loading: boolean;
  onSelect: (product: PricingProduct) => void;
  currentKey?: string | null;
  ctaLabel: string;
  currentLabel: string;
  intervalLabel: string;
  trialLabel: string;
  emptyLabel: string;
  isProcessing?: boolean;
  isFullWidth?: boolean;
};

export function PricingGrid({
  products,
  loading,
  onSelect,
  currentKey,
  ctaLabel,
  currentLabel,
  intervalLabel,
  trialLabel,
  emptyLabel,
  isProcessing,
  isFullWidth = false,
}: Props) {
  const { t } = useI18n();

  if (!products?.length) {
    return <P color={TextColorEnum.Muted}>{emptyLabel}</P>;
  }
  
  return (
    <div
      className={
        "grid gap-4" + (!isFullWidth ? "md:grid-cols-2 xl:grid-cols-3" : "")
      }
    >
      {products.map((product) => {
        const isCurrent = currentKey === product.key;

        const intervalText =
          typeof product.interval === "string" &&
          product.interval.toLowerCase() === "month"
            ? t(messages.dashboard.billing.intervals.month)
            : String(product.interval ?? "");

        return (
          <div
            key={product.key}
            className="rounded-lg border border-border bg-background/80 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <P className="font-semibold text-base">
                  {product.name ?? product.nameKey ?? product.key}
                </P>
                {product.interval && (
                  <Small color={TextColorEnum.Secondary}>
                    {intervalLabel.replace("{{interval}}", intervalText)}
                  </Small>
                )}
              </div>

              {isCurrent && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  <BadgeCheck size={14} />
                  {currentLabel}
                </span>
              )}
            </div>

            <div className="mt-3 text-2xl font-bold">
              {formatPrice(product.priceCents, product.currency)}
              {product.interval && (
                <span className="text-sm font-medium text-muted">
                  /{intervalText}
                </span>
              )}
            </div>

            {product.trialDays ? (
              <Small className="mt-1 block" color={TextColorEnum.Secondary}>
                {trialLabel.replace("{{days}}", String(product.trialDays))}
              </Small>
            ) : null}

            <div className="mt-4">
              <Button
                type="button"
                size={ButtonSizeEnum.md}
                variant={
                  isCurrent
                    ? ButtonVariantEnum.secondary
                    : ButtonVariantEnum.primary
                }
                className="w-full justify-center"
                disabled={loading || isCurrent || isProcessing}
                onClick={() => onSelect(product)}
              >
                {isCurrent ? currentLabel : ctaLabel}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
