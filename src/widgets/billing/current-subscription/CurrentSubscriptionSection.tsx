"use client";

import React from "react";
import { CreditCard } from "lucide-react";

import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import Spinner from "@/shared/ui/loading/Spinner";
import {
  Button,
  ButtonSizeEnum,
  ButtonVariantEnum,
} from "@/shared/ui/Button";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import { Skeleton } from "@/shared/ui/loading/Skeleton";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";
import {
  formatDate,
  getProductLabel,
  getStatusLabel,
} from "@/entities/monetization/billing";
import type { Subscription } from "@/entities/monetization/subscriptions";

type Props = {
  subscription: Subscription | null;
  loading: boolean;
  canManage: boolean;
  message?: string | null;
  onCancel: () => void;
  onResume?: () => void;
  isCancelling: boolean;
  isResuming?: boolean;
};

const statusClasses: Record<string, string> = {
  active: "bg-successSoft text-success border-success",
  trialing: "bg-primarySoft text-primary border-primary",
  past_due: "bg-warningSoft text-warning border-warning",
  canceled: "bg-border text-secondary border-border",
  cancel_at_period_end: "bg-warningSoft text-warning border-warning",
  expired: "bg-border text-secondary border-border",
};

export function CurrentSubscriptionSection({
  subscription,
  loading,
  canManage,
  message,
  onCancel,
  onResume,
  isCancelling,
  isResuming,
}: Props) {
  const { t } = useI18n();
  const planLabel = subscription ? getProductLabel(t, subscription.planKey) : "";

  const skeletonContent = (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );

  return (
    <LoadingOverlay
      loading={loading}
      variant="skeleton"
      skeleton={skeletonContent}
      className="rounded-xl min-h-[220px]"
    >
      <SectionCard
        title={t(messages.dashboard.billing.current.title)}
        description={t(messages.dashboard.billing.current.description)}
        bodyClassName="space-y-4"
      >
        {!subscription ? (
          <div className="space-y-1">
            <P color={TextColorEnum.Muted}>
              {t(messages.dashboard.billing.current.noSubscription)}
            </P>
            {message ? (
              <Small color={TextColorEnum.Secondary}>{message}</Small>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primarySoft text-primary">
                  <CreditCard size={18} />
                </div>

                <div>
                  <P className="text-base font-semibold text-text">
                    {t(messages.dashboard.billing.current.plan)}:{" "}
                    <span className="font-bold">{planLabel}</span>
                  </P>

                  <Small color={TextColorEnum.Secondary}>
                    {t(messages.dashboard.billing.current.manage)}
                  </Small>
                </div>
              </div>

              {/* Status badge */}
              <div>
                {(() => {
                  const key = (subscription.status || "").toLowerCase();
                  const cls =
                    statusClasses[key] ?? "bg-border text-secondary border-border";

                  return (
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${cls}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {getStatusLabel(t, subscription.status)}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-0.5">
                <Small color={TextColorEnum.Secondary}>
                  {t(messages.dashboard.billing.current.trialEnds)}
                </Small>
                <P className="text-sm text-text">
                  {formatDate(subscription.trialEnd)}
                </P>
              </div>

              <div className="space-y-0.5">
                <Small color={TextColorEnum.Secondary}>
                  {t(messages.dashboard.billing.current.periodEnds)}
                </Small>
                <P className="text-sm text-text">
                  {formatDate(subscription.currentPeriodEnd)}
                </P>
              </div>

              <div className="space-y-0.5">
                <Small color={TextColorEnum.Secondary}>
                  {t(messages.dashboard.billing.current.lastPayment)}
                </Small>
                <P className="text-sm text-text">
                  {formatDate(subscription.lastPaymentAt)}
                </P>
              </div>
            </div>

            {/* Actions */}
            {canManage && (
              <div className="flex justify-end gap-2 pt-1">
                {subscription.cancelAt ? (
                  <Button
                    type="button"
                    size={ButtonSizeEnum.md}
                    variant={ButtonVariantEnum.primary}
                    disabled={isResuming}
                    onClick={onResume}
                  >
                    {isResuming && <Spinner size={16} />}
                    <span className={isResuming ? "ml-2" : ""}>
                      {t(messages.dashboard.billing.current.resume)}
                    </span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size={ButtonSizeEnum.md}
                    variant={ButtonVariantEnum.danger}
                    disabled={isCancelling}
                    onClick={onCancel}
                  >
                    {isCancelling && <Spinner size={16} />}
                    <span className={isCancelling ? "ml-2" : ""}>
                      {t(messages.dashboard.billing.current.cancel)}
                    </span>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </LoadingOverlay>
  );
}
