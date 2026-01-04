"use client";

import React, { useState } from "react";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import type { BonusHistoryItem } from "@/entities/monetization/bonus";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { formatDate, getSourceLabel } from "@/entities/monetization/billing";
import { Skeleton } from "@/shared/ui/loading/Skeleton";

type Props = {
  bonusHistory: BonusHistoryItem[];
  loading: boolean;
};

export function BonusSection({ bonusHistory, loading }: Props) {
  const { t } = useI18n();
  const [limit, setLimit] = useState(5);

  const visible = bonusHistory.slice(0, limit);
  const canShowMore = bonusHistory.length > limit;

  if (loading) {
    return (
      <SectionCard
        title={t(messages.dashboard.billing.bonus.title)}
        description={t(messages.dashboard.billing.bonus.subtitle)}
        bodyClassName="overflow-x-auto"
      >
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`bonus-skeleton-${index}`}
              className="flex items-center gap-3 px-2 py-3"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  if (!bonusHistory.length) {
    return (
      <SectionCard
        title={t(messages.dashboard.billing.bonus.title)}
        description={t(messages.dashboard.billing.bonus.subtitle)}
        bodyClassName="overflow-x-auto"
      >
        <div className="space-y-1">
          <P className="font-semibold">
            {t(messages.dashboard.billing.bonus.emptyTitle)}
          </P>
          <Small color={TextColorEnum.Secondary}>
            {t(messages.dashboard.billing.bonus.emptyDescription)}
          </Small>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={t(messages.dashboard.billing.bonus.title)}
      description={t(messages.dashboard.billing.bonus.subtitle)}
      bodyClassName="overflow-x-auto"
    >
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase text-muted">
            <th className="px-2 py-2 font-semibold">
              {t(messages.dashboard.billing.bonus.headers.date)}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t(messages.dashboard.billing.bonus.headers.source)}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t(messages.dashboard.billing.bonus.headers.change)}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {visible.map((item) => {
            const changes = Object.entries(item.fieldsDelta || {});

            return (
              <tr key={item.id} className="align-top">
                <td className="px-2 py-2 whitespace-nowrap">
                  <Small>{formatDate(item.createdAt)}</Small>
                </td>
                <td className="px-2 py-2">
                  <P className="font-medium text-sm">
                    {getSourceLabel(t, item.sourceType)}
                  </P>
                </td>
                <td className="px-2 py-2">
                  {changes.length ? (
                    <div className="space-y-1">
                      {changes.map(([field, delta]) => (
                        <P key={field} className="text-sm font-semibold text-primary">
                          {field}: {delta > 0 ? "+" : ""}
                          {delta}
                        </P>
                      ))}
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
            onClick={() => setLimit(bonusHistory.length)}
          >
            {t(messages.dashboard.billing.bonus.viewAll)}
          </Button>
        </div>
      )}
    </SectionCard>
  );
}
