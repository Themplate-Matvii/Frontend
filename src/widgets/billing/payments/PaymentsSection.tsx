"use client";

import React, { useState } from "react";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import type { Payment } from "@/entities/monetization/subscriptions";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import { Skeleton } from "@/shared/ui/loading/Skeleton";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";
import {
  formatDate,
  formatPrice,
  getProductLabel,
  getSourceLabel,
  getPaymentStatusLabel,
} from "@/entities/monetization/billing";

type Props = {
  payments: Payment[];
  loading: boolean;
};

export function PaymentsSection({ payments, loading }: Props) {
  const { t } = useI18n();
  const [limit, setLimit] = useState(5);

  const skeletonContent = (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`payments-skeleton-${index}`}
          className="flex items-center gap-3 px-2 py-3"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );

  const visible = payments.slice(0, limit);
  const canShowMore = payments.length > limit;

  return (
    <LoadingOverlay
      loading={loading}
      variant="skeleton"
      skeleton={skeletonContent}
      className="rounded-xl min-h-[220px]"
    >
      <SectionCard
        id="payments"
        title={t(messages.dashboard.billing.payments.title)}
        description={t(messages.dashboard.billing.payments.subtitle)}
        bodyClassName="overflow-x-auto"
      >
        {!payments.length ? (
          <div className="space-y-2">
            <P className="font-semibold">
              {t(messages.dashboard.billing.payments.emptyTitle)}
            </P>
            <Small color={TextColorEnum.Secondary}>
              {t(messages.dashboard.billing.payments.emptyDescription)}
            </Small>
          </div>
        ) : (
          <>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted">
                  <th className="px-2 py-2 font-semibold">
                    {t(messages.dashboard.billing.payments.headers.date)}
                  </th>
                  <th className="px-2 py-2 font-semibold">
                    {t(messages.dashboard.billing.payments.headers.product)}
                  </th>
                  <th className="px-2 py-2 font-semibold">
                    {t(messages.dashboard.billing.payments.headers.amount)}
                  </th>
                  <th className="px-2 py-2 font-semibold">
                    {t(messages.dashboard.billing.payments.headers.status)}
                  </th>
                  <th className="px-2 py-2 font-semibold">
                    {t(messages.dashboard.billing.payments.headers.documents)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((payment) => {
                  const hasInvoiceHtml = !!payment.invoiceUrl;
                  const hasInvoicePdf = !!payment.invoicePdfUrl;
                  const hasReceipt = !!payment.receiptUrl;

                  return (
                    <tr key={payment.id} className="align-top">
                      <td className="px-2 py-2 whitespace-nowrap">
                        <Small>{formatDate(payment.createdAt)}</Small>
                      </td>
                      <td className="px-2 py-2">
                        <P className="font-medium text-sm">
                          {getProductLabel(
                            t,
                            payment.planKey || payment.productKey,
                          )}
                        </P>
                        <Small color={TextColorEnum.Muted}>
                          {getSourceLabel(t, payment.sourceType)}
                        </Small>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <P className="font-semibold">
                          {formatPrice(payment.amount, payment.currency)}
                        </P>
                      </td>
                      <td className="px-2 py-2">
                        <Small>
                          {getPaymentStatusLabel(t, payment.status, payment)}
                        </Small>
                      </td>
                      <td className="px-2 py-2">
                        {hasInvoiceHtml || hasInvoicePdf || hasReceipt ? (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {hasInvoiceHtml && (
                              <a
                                href={payment.invoiceUrl as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                              >
                                {t(
                                  messages.dashboard.billing.payments.documents
                                    .invoiceHtml,
                                )}
                              </a>
                            )}
                            {hasInvoicePdf && (
                              <a
                                href={payment.invoicePdfUrl as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                              >
                                {t(
                                  messages.dashboard.billing.payments.documents
                                    .invoicePdf,
                                )}
                              </a>
                            )}
                            {hasReceipt && (
                              <a
                                href={payment.receiptUrl as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                              >
                                {t(
                                  messages.dashboard.billing.payments.documents
                                    .receipt,
                                )}
                              </a>
                            )}
                          </div>
                        ) : (
                          <Small color={TextColorEnum.Muted}>—</Small>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {canShowMore && (
              <div className="pt-4">
                <Button
                  type="button"
                  size={ButtonSizeEnum.sm}
                  variant={ButtonVariantEnum.secondary}
                  onClick={() => setLimit(payments.length)}
                >
                  {t(messages.dashboard.billing.payments.viewAll)}
                </Button>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </LoadingOverlay>
  );
}
