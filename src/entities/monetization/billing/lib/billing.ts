"use client";

import { messages } from "@/i18n/messages";
import type { Payment } from "@/entities/monetization/subscriptions";
import { PaymentStatus } from "@/entities/monetization/subscriptions";

export function formatPrice(priceCents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(priceCents / 100);
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getSourceLabel(t: (k: string) => string, source?: string | null) {
  switch (source) {
    case "subscription":
      return t(messages.dashboard.billing.sources.subscription);
    case "one_time":
      return t(messages.dashboard.billing.sources.oneTime);
    case "referral_signup":
      return t(messages.dashboard.billing.sources.referralSignup);
    case "referral_purchase":
      return t(messages.dashboard.billing.sources.referralPurchase);
    default:
      return t(messages.dashboard.billing.sources.unknown);
  }
}

export function getStatusLabel(t: (k: string) => string, status?: string | null) {
  if (!status) return t(messages.dashboard.billing.current.statusUnknown);
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "active":
      return t(messages.dashboard.billing.statuses.active);
    case "trialing":
      return t(messages.dashboard.billing.statuses.trialing);
    case "past_due":
      return t(messages.dashboard.billing.statuses.pastDue);
    case "canceled":
      return t(messages.dashboard.billing.statuses.canceled);
    case "cancel_at_period_end":
      return t(messages.dashboard.billing.statuses.cancelAtPeriodEnd);
    case "expired":
      return t(messages.dashboard.billing.statuses.expired);
    default:
      return status;
  }
}

export function getPaymentStatusLabel(
  t: (k: string) => string,
  status?: string | null,
  payment?: Payment,
) {
  if (!status) return "—";

  const normalized = status.toLowerCase();

  if (
    normalized === PaymentStatus.SUCCEEDED &&
    payment?.amount === 0 &&
    payment?.sourceType === "subscription"
  ) {
    return t(messages.dashboard.billing.payments.statuses.trialStarted);
  }

  switch (normalized) {
    case PaymentStatus.PENDING:
      return t(messages.dashboard.billing.payments.statuses.pending);
    case PaymentStatus.SUCCEEDED:
      return t(messages.dashboard.billing.payments.statuses.succeeded);
    case PaymentStatus.FAILED:
      return t(messages.dashboard.billing.payments.statuses.failed);
    case PaymentStatus.CANCELED:
      return t(messages.dashboard.billing.payments.statuses.canceled);
    default:
      return status;
  }
}

export function getProductLabel(
  t: (k: string) => string,
  key?: string | null,
) {
  if (!key) return "—";
  const normalizedKey = key.toLowerCase();

  switch (normalizedKey) {
    case "basic":
      return t(messages.dashboard.billing.products.basic);
    case "tokens_30":
    case "tokens30":
      return t(messages.dashboard.billing.products.tokens30);
    default:
      return key;
  }
}
