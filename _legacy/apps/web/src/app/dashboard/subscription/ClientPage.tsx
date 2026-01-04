"use client";

import React, { useState } from "react";
import { useAuth } from "@packages/api/context/AuthContext";
import { messages, useI18n } from "@packages/locales";
import {
  BillingMode,
  PricingProduct,
  usePricing,
} from "@packages/api/modules/billing/pricing";
import {
  useCheckout,
  useMyPayments,
  useOneTimeCheckout,
} from "@packages/api/modules/billing/payments";
import { Payment } from "@packages/api/modules/billing/payments/types";
import {
  useCancelSubscription,
  useMySubscription,
  useResumeSubscription,
} from "@packages/api/modules/billing/subscriptions";
import { useMyBonusHistory } from "@packages/api/modules/bonus";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { PageShell } from "@/shared/layout/PageShell";
import { TextColorEnum } from "@/shared/ui/Typography";
import Spinner from "@/shared/ui/loading/Spinner";
import { useAppPermissions } from "@/hooks/auth/usePermissions";
import { usePermissionGuard } from "@/hooks/auth/usePermissionGuard";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";
import { CurrentSubscriptionSection } from "@/shared/components/billing/CurrentSubscriptionSection";
import { CreditsSection } from "@/shared/components/billing/CreditsSection";
import { PlansSection } from "@/shared/components/billing/PlansSection";
import { OneTimeSection } from "@/shared/components/billing/OneTimeSection";
import { PaymentsSection } from "@/shared/components/billing/PaymentsSection";
import { BonusSection } from "@/shared/components/billing/BonusSection";

export default function SubscriptionClientPage() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { subscriptions: subscriptionPermissions, payments: paymentPermissions, bonus } =
    useAppPermissions();
  const [globalLoading, setGlobalLoading] = useState(false);

  const canViewSubscriptions = subscriptionPermissions.own.view;
  const canManage = subscriptionPermissions.own.manage;
  const canViewPayments = paymentPermissions.own.view;
  const canViewBonus = bonus.history.own.view;

  const canAccessPage =
    canViewSubscriptions || canViewPayments || canViewBonus;

  const { canAccess } = usePermissionGuard({ canAccess: canAccessPage });
  const canShowPage = canAccess || authLoading;

  const {
    data: subscriptionResponse,
    isLoading: subscriptionLoading,
  } = useMySubscription({
    enabled: canShowPage && canViewSubscriptions,
  });

  const { data: payments, isLoading: paymentsLoading } = useMyPayments({
    enabled: canShowPage && canViewPayments,
  });

  const {
    data: subscriptionProducts = [],
    isLoading: subscriptionPricingLoading,
  } = usePricing({
    mode: BillingMode.subscription,
    enabled: canShowPage && canManage,
    select: (data: PricingProduct[]) => data ?? [],
  });

  const {
    data: oneTimeProducts = [],
    isLoading: oneTimePricingLoading,
  } = usePricing({
    mode: BillingMode.one_time,
    enabled: canShowPage && canManage,
    select: (data: PricingProduct[]) => data ?? [],
  });

  const checkoutMutation = useCheckout();
  const oneTimeCheckoutMutation = useOneTimeCheckout();
  const cancelSubscriptionMutation = useCancelSubscription();
  const resumeSubscriptionMutation = useResumeSubscription();
  const { data: bonusHistory = [], isLoading: bonusLoading } = useMyBonusHistory({
    enabled: canShowPage && canViewBonus,
  });

  
  const subscription = subscriptionResponse?.subscription ?? null;
  const subscriptionMessage = subscriptionResponse?.message ?? null;

  const paymentsList: Payment[] = Array.isArray(payments) ? payments : [];

  const handleSubscribe = async (product: PricingProduct) => {
    if (!product?.key) return;
    try {
      setGlobalLoading(true);
      const url = await checkoutMutation.mutateAsync({ planKey: product.key });
      if (url) {
        window.location.assign(url);
      } else {
        setGlobalLoading(false);
      }
    } catch {
      setGlobalLoading(false);
    }
  };

  const handleOneTimePurchase = async (product: PricingProduct) => {
    if (!product?.key) return;
    try {
      setGlobalLoading(true);
      const url = await oneTimeCheckoutMutation.mutateAsync({
        productKey: product.key,
      });
      if (url) {
        window.location.assign(url);
      } else {
        setGlobalLoading(false);
      }
    } catch {
      setGlobalLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    if (!subscription) return;
    cancelSubscriptionMutation.mutate();
  };

  const handleResumeSubscription = () => {
    if (!subscription) return;
    resumeSubscriptionMutation.mutate();
  };

  const aiCredits = typeof user?.aiCredits === "number" ? user?.aiCredits : 0;
  
  if (!canShowPage && !authLoading) {
    return null;
  }

  return (
    <PageShell>
      <LoadingOverlay loading={globalLoading} isGlobal />
      <Container>
        <PageHeader
          title={t(messages.dashboard.billing.title)}
          subtitle={t(messages.dashboard.billing.subtitle)}
          subtitleColor={TextColorEnum.Secondary}
        />

        {canViewSubscriptions && (
          <div className="grid gap-4 lg:grid-cols-2">
            {subscription ? (
              <CurrentSubscriptionSection
                subscription={subscription}
                loading={subscriptionLoading}
                canManage={canManage}
                message={subscriptionMessage}
                onCancel={handleCancelSubscription}
                isCancelling={cancelSubscriptionMutation.isPending}
                onResume={handleResumeSubscription}
                isResuming={resumeSubscriptionMutation.isPending}
              />
            ) : (
              <PlansSection
                products={subscriptionProducts}
                loading={
                  subscriptionPricingLoading || checkoutMutation.isPending
                }
                  onSelect={handleSubscribe}
                isFullWidth={true}
                isProcessing={globalLoading}
              />
            )}
            <CreditsSection aiCredits={aiCredits} />
          </div>
        )}

        {canViewSubscriptions && (
          <OneTimeSection
            products={oneTimeProducts}
            loading={oneTimePricingLoading || oneTimeCheckoutMutation.isPending}
            onSelect={handleOneTimePurchase}
            isProcessing={globalLoading}
          />
        )}

        {canViewPayments && (
          <PaymentsSection payments={paymentsList} loading={paymentsLoading} />
        )}

        {canViewBonus && (
          <BonusSection bonusHistory={bonusHistory} loading={bonusLoading} />
        )}
      </Container>
    </PageShell>
  );
}
