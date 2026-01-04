"use client";

import { useCallback, useMemo, useState } from "react";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { TrendingDown, TrendingUp } from "lucide-react";

import {
  AnalyticsApi,
  type DailyRevenue,
} from "@/entities/analytics";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { Theme, colors } from "@/shared/ui";
import { useTheme } from "@/shared/lib/theme";

import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { PageShell } from "@/shared/layout/PageShell";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { EmptyState } from "@/shared/ui/list/EmptyState";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";
import { StatCard } from "@/widgets/analytics/overview";
import { LineChart } from "@/shared/ui/charts/LineChart";
import { BarChart } from "@/shared/ui/charts/BarChart";
import { DateRange, DateRangeInput } from "@/shared/ui/charts/DateRangeInput";
import { useAppPermissions, usePermissionGuard } from "@/entities/user";


export const DashboardBusinessAnalyticsPage = () => {
  const { t, i18n } = useI18n();
  const language = i18n.language;
  const { theme } = useTheme();
  const tone = theme === Theme.DARK ? "dark" : "light";

  const chartPalette = useMemo(
    () => ({
      primary: colors.primary[tone],
      success: colors.success[tone],
      warning: colors.warning[tone],
      info: colors.primaryHover[tone],
      danger: colors.danger[tone],
      muted: colors.secondary[tone],
    }),
    [tone],
  );

  const defaultRange = useMemo(
    () => ({ from: subDays(new Date(), 29), to: new Date() }),
    [],
  );
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(defaultRange);
  const [appliedRange, setAppliedRange] = useState<DateRange | undefined>(defaultRange);

  const apiRange = useMemo(() => {
    if (!appliedRange?.from || !appliedRange?.to) return undefined;

    return {
      dateFrom: startOfDay(appliedRange.from).toISOString(),
      dateTo: endOfDay(appliedRange.to).toISOString(),
    };
  }, [appliedRange]);

  const { data, isLoading, isError, refetch } =
    AnalyticsApi.Business.useBusinessAnalytics(apiRange);

  const rangeLabel = useMemo(() => {
    if (!appliedRange?.from || !appliedRange?.to) return "";
    const formatter = new Intl.DateTimeFormat(language, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${formatter.format(appliedRange.from)} – ${formatter.format(appliedRange.to)}`;
  }, [appliedRange?.from, appliedRange?.to, language]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(language, {
        style: "currency",
        currency: data?.kpi?.currency || "USD",
        maximumFractionDigits: 0,
      }),
    [data?.kpi?.currency, language],
  );

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(language, { maximumFractionDigits: 0 }),
    [language],
  );

  const percentFormatter = useMemo(
    () => new Intl.NumberFormat(language, { maximumFractionDigits: 1 }),
    [language],
  );

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(language, { month: "short", day: "numeric" }),
    [language],
  );

  const formatCurrency = (value: number | undefined) =>
    currencyFormatter.format(Math.round(value ?? 0));
  const formatNumber = (value: number | undefined) =>
    numberFormatter.format(Math.round(value ?? 0));
  const formatPercent = (value: number | undefined) =>
    `${percentFormatter.format(value ?? 0)}%`;

  const handleApplyRange = useCallback(() => {
    if (draftRange?.from && draftRange?.to) {
      setAppliedRange({ from: draftRange.from, to: draftRange.to });
    }
  }, [draftRange]);

  const sortedDailyRevenue = useMemo(
    () =>
      (data?.dailyRevenue ?? [])
        .slice()
        .sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
    [data?.dailyRevenue],
  );

  const revenueSeries = useMemo(
    () =>
      sortedDailyRevenue.map((row: any) => ({
        label: dateFormatter.format(new Date(row.date)),
        total: row.totalAmount,
        subscription: row.subscriptionAmount,
        oneTime: row.oneTimeAmount,
      })),
    [dateFormatter, sortedDailyRevenue],
  );

  const computeTrend = useCallback(
    (accessor: (row: DailyRevenue) => number) => {
      if (sortedDailyRevenue.length < 2) return undefined;
      const first = accessor(sortedDailyRevenue[0]);
      const last = accessor(sortedDailyRevenue[sortedDailyRevenue.length - 1]);
      if (!first) return undefined;

      const change = ((last - first) / Math.abs(first)) * 100;
      return `${change >= 0 ? "+" : ""}${percentFormatter.format(change)}%`;
    },
    [percentFormatter, sortedDailyRevenue],
  );

  const subscriptionTotals = useMemo(() => {
    if (!data?.dailySubscriptions?.length)
      return { new: 0, canceled: 0, activeLike: 0 };

    return data.dailySubscriptions.reduce(
      (acc: any, row: any) => ({
        new: acc.new + row.new,
        canceled: acc.canceled + row.canceled,
        activeLike: Math.max(acc.activeLike, row.activeLike),
      }),
      { new: 0, canceled: 0, activeLike: 0 },
    );
  }, [data?.dailySubscriptions]);

  const activeSeries = useMemo(() => {
    if (!data?.dailySubscriptions?.length)
      return [] as { label: string; value: number }[];

    return [...data.dailySubscriptions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((row) => ({
        label: dateFormatter.format(new Date(row.date)),
        value: row.activeLike,
      }));
  }, [data?.dailySubscriptions, dateFormatter]);

  const subscriptionFlowSeries = useMemo(
    () =>
      (data?.dailySubscriptions ?? [])
        .slice()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((row) => ({
          label: dateFormatter.format(new Date(row.date)),
          new: row.new,
          canceled: row.canceled,
        })),
    [data?.dailySubscriptions, dateFormatter],
  );

  const statusTimeline = useMemo(
    () =>
      (data?.dailySubscriptionsByStatus ?? [])
        .slice()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((row) => ({
          label: dateFormatter.format(new Date(row.date)),
          active: row.active,
          trialing: row.trialing,
          cancelAtPeriodEnd: row.cancel_at_period_end,
          canceled: row.canceled,
          expired: row.expired,
        })),
    [data?.dailySubscriptionsByStatus, dateFormatter],
  );

  const statusTotalsData = useMemo(() => {
    const totals = data?.subscriptionStatusTotals;
    if (!totals) return [] as { label: string; value: number }[];

    return [
      {
        label: t(messages.dashboard.analytics.business.statuses.active),
        value: totals.active,
      },
      {
        label: t(messages.dashboard.analytics.business.statuses.trialing),
        value: totals.trialing,
      },
      {
        label: t(messages.dashboard.analytics.business.statuses.cancelAtPeriodEnd),
        value: totals.cancel_at_period_end,
      },
      {
        label: t(messages.dashboard.analytics.business.statuses.canceled),
        value: totals.canceled,
      },
      {
        label: t(messages.dashboard.analytics.business.statuses.expired),
        value: totals.expired,
      },
    ];
  }, [data?.subscriptionStatusTotals, t]);

  const engagementSeries = useMemo(() => {
    const registrations = data?.dailyRegistrations ?? [];
    const subscriptions = data?.dailySubscriptions ?? [];

    const combinedDates = new Set([
      ...registrations.map((r: any) => r.date),
      ...subscriptions.map((s: any) => s.date),
    ]);

    return Array.from(combinedDates)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((date) => {
        const reg = registrations.find((r: any) => r.date === date)?.count ?? 0;
        const subs = subscriptions.find((s: any) => s.date === date)?.new ?? 0;
        return {
          label: dateFormatter.format(new Date(date)),
          registrations: reg,
          paid: subs,
        };
      });
  }, [data?.dailyRegistrations, data?.dailySubscriptions, dateFormatter]);

  const kpiTooltips = useMemo(
    () => ({
      totalRevenue: t(messages.dashboard.analytics.business.kpiTooltips.totalRevenue),
      subscriptionRevenue: t(
        messages.dashboard.analytics.business.kpiTooltips.subscriptionRevenue,
      ),
      oneTimeRevenue: t(messages.dashboard.analytics.business.kpiTooltips.oneTimeRevenue),
      mrr: t(messages.dashboard.analytics.business.kpiTooltips.mrr),
      arr: t(messages.dashboard.analytics.business.kpiTooltips.arr),
      arpu: t(messages.dashboard.analytics.business.kpiTooltips.arpu),
      arppu: t(messages.dashboard.analytics.business.kpiTooltips.arppu),
      conversionToPaid: t(
        messages.dashboard.analytics.business.kpiTooltips.conversionToPaid,
      ),
      churn: t(messages.dashboard.analytics.business.kpiTooltips.churn),
      averageSubscriptionLifetimeDays: t(
        messages.dashboard.analytics.business.kpiTooltips
          .averageSubscriptionLifetimeDays,
      ),
      totalUsersAtEnd: t(messages.dashboard.analytics.business.kpiTooltips.totalUsersAtEnd),
      newUsersInRange: t(messages.dashboard.analytics.business.kpiTooltips.newUsersInRange),
      payingUsersInRange: t(
        messages.dashboard.analytics.business.kpiTooltips.payingUsersInRange,
      ),
      activeLikeSubscriptionsAtEnd: t(
        messages.dashboard.analytics.business.kpiTooltips
          .activeLikeSubscriptionsAtEnd,
      ),
    }),
    [t],
  );

  const monetizationCards = useMemo(
    () => [
      {
        label: "Total revenue",
        value: formatCurrency(data?.kpi?.totalRevenue),
        tooltip: kpiTooltips.totalRevenue,
        trend: computeTrend((row) => row.totalAmount),
      },
      {
        label: "Subscriptions",
        value: formatCurrency(data?.kpi?.subscriptionRevenue),
        tooltip: kpiTooltips.subscriptionRevenue,
        trend: computeTrend((row) => row.subscriptionAmount),
      },
      {
        label: "One-time",
        value: formatCurrency(data?.kpi?.oneTimeRevenue),
        tooltip: kpiTooltips.oneTimeRevenue,
        trend: computeTrend((row) => row.oneTimeAmount),
      },
      {
        label: "MRR",
        value: formatCurrency(data?.kpi?.mrr),
        tooltip: kpiTooltips.mrr,
      },
      {
        label: "ARR",
        value: formatCurrency(data?.kpi?.arr),
        tooltip: kpiTooltips.arr,
      },
    ],
    [
      computeTrend,
      data?.kpi?.arr,
      data?.kpi?.mrr,
      data?.kpi?.oneTimeRevenue,
      data?.kpi?.subscriptionRevenue,
      data?.kpi?.totalRevenue,
      formatCurrency,
      kpiTooltips.arr,
      kpiTooltips.mrr,
      kpiTooltips.oneTimeRevenue,
      kpiTooltips.subscriptionRevenue,
      kpiTooltips.totalRevenue,
    ],
  );

  const retentionCards = useMemo(
    () => [
      {
        label: "ARPU",
        value: formatCurrency(data?.kpi?.arpu),
        tooltip: kpiTooltips.arpu,
      },
      {
        label: "ARPPU",
        value: formatCurrency(data?.kpi?.arppu),
        tooltip: kpiTooltips.arppu,
      },
      {
        label: "Pay conversion",
        value: formatPercent(data?.kpi?.conversionToPaid),
        tooltip: kpiTooltips.conversionToPaid,
      },
      {
        label: "Churn",
        value: formatPercent(data?.kpi?.churnRate),
        tooltip: kpiTooltips.churn,
      },
      {
        label: "Avg. lifetime",
        value: `${Math.round(data?.kpi?.averageSubscriptionLifetimeDays ?? 0)} ${t(
          messages.dashboard.analytics.business.kpi.days,
        )}`,
        tooltip: kpiTooltips.averageSubscriptionLifetimeDays,
      },
    ],
    [
      data?.kpi?.arpu,
      data?.kpi?.arppu,
      data?.kpi?.averageSubscriptionLifetimeDays,
      data?.kpi?.churnRate,
      data?.kpi?.conversionToPaid,
      formatCurrency,
      formatPercent,
      kpiTooltips.averageSubscriptionLifetimeDays,
      kpiTooltips.arppu,
      kpiTooltips.arpu,
      kpiTooltips.churn,
      kpiTooltips.conversionToPaid,
    ],
  );

  const userCards = useMemo(
    () => [
      {
        label: "Users (end)",
        value: formatNumber(data?.kpi?.totalUsersAtEnd),
        tooltip: kpiTooltips.totalUsersAtEnd,
      },
      {
        label: "New users",
        value: formatNumber(data?.kpi?.newUsersInRange),
        tooltip: kpiTooltips.newUsersInRange,
      },
      {
        label: "Paying users",
        value: formatNumber(data?.kpi?.payingUsersInRange),
        tooltip: kpiTooltips.payingUsersInRange,
      },
      {
        label: "Active subs",
        value: formatNumber(data?.kpi?.activeLikeSubscriptionsAtEnd),
        tooltip: kpiTooltips.activeLikeSubscriptionsAtEnd,
      },
    ],
    [
      data?.kpi?.activeLikeSubscriptionsAtEnd,
      data?.kpi?.newUsersInRange,
      data?.kpi?.payingUsersInRange,
      data?.kpi?.totalUsersAtEnd,
      formatNumber,
      kpiTooltips.activeLikeSubscriptionsAtEnd,
      kpiTooltips.newUsersInRange,
      kpiTooltips.payingUsersInRange,
      kpiTooltips.totalUsersAtEnd,
    ],
  );

  const { analitycs_business: analitycsBusinessPermissions } =
    useAppPermissions();
  const { canAccess } = usePermissionGuard({
    canAccess: analitycsBusinessPermissions.view,
  });
  if (!canAccess) {
    return null;
  }

  return (
    <PageShell>
      <Container className="py-8 space-y-6 relative">
        <PageHeader
          title={t(messages.dashboard.analytics.business.title)}
          subtitle={t(messages.dashboard.analytics.business.subtitle)}
        />

        <SectionCard>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text">
                {t(messages.dashboard.analytics.business.filters.dateFrom)}
              </p>
              <p className="text-sm text-muted">{rangeLabel}</p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
              <DateRangeInput
                value={draftRange}
                onChange={setDraftRange}
                placeholder={t(
                  messages.dashboard.analytics.business.filters.dateFrom,
                )}
                language={language}
                className="min-w-[280px] lg:min-w-[340px]"
              />

              <Button
                onClick={handleApplyRange}
                disabled={!draftRange?.from || !draftRange?.to}
                variant={ButtonVariantEnum.primary}
                size={ButtonSizeEnum.md}
              >
                {t(messages.common.actions.apply)}
              </Button>
            </div>
          </div>
        </SectionCard>

        <LoadingOverlay loading={isLoading} />

        {isError && (
          <SectionCard>
            <EmptyState
              title={t(messages.common.noPermission.title)}
              description={t(messages.common.noPermission.description)}
              actionSlot={
                <Button
                  onClick={() => refetch()}
                  variant={ButtonVariantEnum.primary}
                  size={ButtonSizeEnum.md}
                >
                  {t(messages.common.actions.tryAgain)}
                </Button>
              }
            />
          </SectionCard>
        )}

        {!isError && (
          <div className="space-y-6">
            <SectionCard title={t(messages.dashboard.analytics.business.title)}>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-text">
                    {t(messages.dashboard.analytics.business.revenueTitle)}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {monetizationCards.map((card) => (
                      <StatCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        tooltip={card.tooltip}
                        trend={card.trend}
                        tooltip={card.tooltip}
                        accent="85%"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-text">
                    {t(
                      messages.dashboard.analytics.business.subscriptionsTitle,
                    )}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {retentionCards.map((card) => (
                      <StatCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        helper={card.helper}
                        trend={card.trend}
                        tooltip={card.tooltip}
                        accent="85%"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-text">
                    {t(messages.dashboard.analytics.business.engagementTitle)}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {userCards.map((card) => (
                      <StatCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        helper={card.helper}
                        trend={card.trend}
                        tooltip={card.tooltip}
                        accent="85%"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard
                title={t(messages.dashboard.analytics.business.revenueTitle)}
                description={t(
                  messages.dashboard.analytics.business.revenueDescription,
                )}
              >
                <LineChart
                  data={revenueSeries}
                  lines={[
                    {
                      dataKey: "subscription",
                      name: t(
                        messages.dashboard.analytics.business.kpi
                          .subscriptionRevenue,
                      ),
                      color: chartPalette.success,
                    },
                    {
                      dataKey: "oneTime",
                      name: t(
                        messages.dashboard.analytics.business.kpi
                          .oneTimeRevenue,
                      ),
                      color: chartPalette.warning,
                    },
                    {
                      dataKey: "total",
                      name: t(
                        messages.dashboard.analytics.business.kpi.totalRevenue,
                      ),
                      color: chartPalette.primary,
                    },
                  ]}
                  formatValue={formatCurrency}
                  emptyLabel={t(messages.common.empty.title)}
                />
              </SectionCard>

              <SectionCard
                title={t(
                  messages.dashboard.analytics.business.subscriptionsTitle,
                )}
                description={t(
                  messages.dashboard.analytics.business
                    .subscriptionsDescription,
                )}
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <BarChart
                      data={subscriptionFlowSeries}
                      bars={[
                        {
                          dataKey: "new",
                          name: t(
                            messages.dashboard.analytics.business.totals.new,
                          ),
                          color: chartPalette.success,
                          stackId: "subs",
                        },
                        {
                          dataKey: "canceled",
                          name: t(
                            messages.dashboard.analytics.business.totals
                              .canceled,
                          ),
                          color: chartPalette.danger,
                          stackId: "subs",
                        },
                      ]}
                      emptyLabel={t(messages.common.empty.title)}
                    />
                  </div>
                  <div className="space-y-3">
                    {(["new", "canceled", "activeLike"] as const).map((key) => {
                      const value = subscriptionTotals[key];
                      const positive = key !== "canceled";

                      return (
                        <div
                          key={key}
                          className="rounded-lg border border-border bg-muted/10 p-3 flex items-center gap-3"
                        >
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              positive
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-rose-500/10 text-rose-500"
                            }`}
                          >
                            {positive ? (
                              <TrendingUp size={18} />
                            ) : (
                              <TrendingDown size={18} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-text">
                              {t(
                                messages.dashboard.analytics.business.totals[
                                  key === "activeLike" ? "active" : key
                                ],
                              )}
                            </p>
                            <p className="text-xs text-muted">{value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard
                title={t(messages.dashboard.analytics.business.engagementTitle)}
                description={t(
                  messages.dashboard.analytics.business.engagementDescription,
                )}
              >
                <LineChart
                  data={engagementSeries}
                  lines={[
                    {
                      dataKey: "registrations",
                      name: t(
                        messages.dashboard.analytics.business.totals
                          .registrations,
                      ),
                      color: chartPalette.primary,
                    },
                    {
                      dataKey: "paid",
                      name: t(
                        messages.dashboard.analytics.business.totals.paid,
                      ),
                      color: chartPalette.success,
                    },
                  ]}
                  formatValue={formatNumber}
                  emptyLabel={t(messages.common.empty.title)}
                />
              </SectionCard>

              <SectionCard
                title={t(
                  messages.dashboard.analytics.business.subscriptionsTitle,
                )}
                description={t(
                  messages.dashboard.analytics.business
                    .subscriptionsDescription,
                )}
              >
                <LineChart
                  data={activeSeries}
                  formatValue={formatNumber}
                  emptyLabel={t(messages.common.empty.title)}
                />
              </SectionCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard
                title={t(messages.dashboard.analytics.business.statusesTitle)}
                description={t(
                  messages.dashboard.analytics.business.statusesDescription,
                )}
              >
                <BarChart
                  data={statusTimeline}
                  bars={[
                    {
                      dataKey: "active",
                      name: t(
                        messages.dashboard.analytics.business.statuses.active,
                      ),
                      color: chartPalette.success,
                      stackId: "status",
                    },
                    {
                      dataKey: "trialing",
                      name: t(
                        messages.dashboard.analytics.business.statuses.trialing,
                      ),
                      color: chartPalette.info,
                      stackId: "status",
                    },
                    {
                      dataKey: "cancelAtPeriodEnd",
                      name: t(
                        messages.dashboard.analytics.business.statuses
                          .cancelAtPeriodEnd,
                      ),
                      color: chartPalette.warning,
                      stackId: "status",
                    },
                    {
                      dataKey: "canceled",
                      name: t(
                        messages.dashboard.analytics.business.statuses.canceled,
                      ),
                      color: chartPalette.muted,
                      stackId: "status",
                    },
                    {
                      dataKey: "expired",
                      name: t(
                        messages.dashboard.analytics.business.statuses.expired,
                      ),
                      color: chartPalette.danger,
                      stackId: "status",
                    },
                  ]}
                  emptyLabel={t(messages.common.empty.title)}
                />
              </SectionCard>

              <SectionCard
                title={t(messages.dashboard.analytics.business.title)}
                description={t(messages.dashboard.analytics.business.subtitle)}
              >
                <BarChart
                  data={statusTotalsData}
                  emptyLabel={t(messages.dashboard.analytics.traffic.empty)}
                />
              </SectionCard>
            </div>
          </div>
        )}
      </Container>
    </PageShell>
  );
};
