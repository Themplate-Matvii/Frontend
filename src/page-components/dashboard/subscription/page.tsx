"use client";

import React, { useState } from "react";
import {
  useAuth,
  useAppPermissions,
  usePermissionGuard,
} from "@/entities/identity";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import {
  PricingApi,
  type PricingProduct,
  BillingMode,
} from "@/entities/monetization/pricing";
import {
  PaymentsApi,
  SubscriptionsApi,
  type Payment,
} from "@/entities/monetization/subscriptions";
import { BonusApi } from "@/entities/monetization/bonus";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { PageShell } from "@/shared/layout/PageShell";
import { TextColorEnum } from "@/shared/ui/Typography";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";
import { CurrentSubscriptionSection } from "@/widgets/billing/current-subscription";
import { CreditsSection } from "@/widgets/billing/credits";
import { PlansSection } from "@/widgets/billing/pricing";
import { OneTimeSection } from "@/widgets/billing/one-time";
import { PaymentsSection } from "@/widgets/billing/payments";
import { BonusSection } from "@/widgets/billing/bonus";
import { toast } from "@/shared/ui/toast/toast";

export const DashboardSubscriptionPage = () => {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const {
    subscriptions: subscriptionPermissions,
    payments: paymentPermissions,
    bonus,
  } = useAppPermissions();
  const [globalLoading, setGlobalLoading] = useState(false);

  const canViewSubscriptions = subscriptionPermissions.own.view;
  const canManage = subscriptionPermissions.own.manage;
  const canViewPayments = paymentPermissions.own.view;
  const canViewBonus = bonus.history.own.view;

  const canAccessPage = canViewSubscriptions || canViewPayments || canViewBonus;

  const { canAccess } = usePermissionGuard({ canAccess: canAccessPage });
  const canShowPage = canAccess || authLoading;

  const { data: subscriptionResponse, isLoading: subscriptionLoading } =
    SubscriptionsApi.useMySubscription({
      enabled: canShowPage && canViewSubscriptions,
    });

  const { data: payments, isLoading: paymentsLoading } =
    PaymentsApi.useMyPayments({
      enabled: canShowPage && canViewPayments,
    });

  const {
    data: subscriptionProducts = [],
    isLoading: subscriptionPricingLoading,
  } = PricingApi.usePricing({
    mode: BillingMode.subscription,
    enabled: canShowPage && canManage,
    select: (data: PricingProduct[]) => data ?? [],
  });

  const { data: oneTimeProducts = [], isLoading: oneTimePricingLoading } =
    PricingApi.usePricing({
      mode: BillingMode.one_time,
      enabled: canShowPage && canManage,
      select: (data: PricingProduct[]) => data ?? [],
    });

  const checkoutMutation = PaymentsApi.useCheckout();
  const oneTimeCheckoutMutation = PaymentsApi.useOneTimeCheckout();
  const cancelSubscriptionMutation = SubscriptionsApi.useCancelSubscription();
  const resumeSubscriptionMutation = SubscriptionsApi.useResumeSubscription();
  const { data: bonusHistory = [], isLoading: bonusLoading } =
    BonusApi.useMyBonusHistory({
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
      toast.error(t(messages.notifications.subscription.checkoutError));
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
      toast.error(t(messages.notifications.subscription.checkoutError));
    }
  };

  const handleCancelSubscription = () => {
    if (!subscription) return;
    cancelSubscriptionMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(t(messages.notifications.subscription.cancelSuccess));
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message || t(messages.errors.generic);
        toast.error(message);
      },
    });
  };

  const handleResumeSubscription = () => {
    if (!subscription) return;
    resumeSubscriptionMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(t(messages.notifications.subscription.resumeSuccess));
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message || t(messages.errors.generic);
        toast.error(message);
      },
    });
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
};
