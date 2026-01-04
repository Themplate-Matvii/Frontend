"use client";

import { useCallback, useMemo, useState } from "react";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { AnalyticsApi, TrafficEventType } from "@/entities/analytics";
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
import { DateRangeInput, DateRange } from "@/shared/ui/charts/DateRangeInput";
import { useAppPermissions, usePermissionGuard } from "@/entities/user";

export const DashboardTrafficAnalyticsPage = () => {
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
  const [showAllEvents, setShowAllEvents] = useState(false);

  const apiRange = useMemo(() => {
    if (!appliedRange?.from || !appliedRange?.to) return undefined;
    return {
      dateFrom: startOfDay(appliedRange.from).toISOString(),
      dateTo: endOfDay(appliedRange.to).toISOString(),
    };
  }, [appliedRange]);

  const { data, isLoading, isError, refetch } =
    AnalyticsApi.Traffic.useTrafficEvents(apiRange);

  const handleApplyRange = useCallback(() => {
    if (draftRange?.from && draftRange?.to) {
      setAppliedRange({ from: draftRange.from, to: draftRange.to });
      setShowAllEvents(false);
    }
  }, [draftRange]);

  const rangeLabel = useMemo(() => {
    if (!appliedRange?.from || !appliedRange?.to) return "";
    const formatter = new Intl.DateTimeFormat(language, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${formatter.format(appliedRange.from)} – ${formatter.format(appliedRange.to)}`;
  }, [appliedRange?.from, appliedRange?.to, language]);

  const events = data?.events ?? [];
  const totals = data?.stats?.totals;

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(language, { month: "short", day: "numeric" }),
    [language],
  );

  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [language],
  );

  const eventsByDay = useMemo(() => {
    if (!events.length) return [] as { label: string; value: number }[];

    const grouped = events.reduce(
      (acc: Record<string, number>, event: any) => {
        const day = String(event.createdAt).slice(0, 10);
        acc[day] = (acc[day] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({
        label: dateFormatter.format(new Date(date)),
        value: count,
      }));
  }, [dateFormatter, events]);

  const feedbackSeries = useMemo(() => {
    const feedback = data?.stats?.feedbackByDate ?? [];
    return feedback
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((row) => ({ label: dateFormatter.format(new Date(row.date)), value: row.count }));
  }, [data?.stats?.feedbackByDate, dateFormatter]);

  const aggregatedTotals = useMemo(() => {
    const base = {
      [TrafficEventType.PageView]: { total: 0, unique: 0 },
      [TrafficEventType.Click]: { total: 0, unique: 0 },
      [TrafficEventType.FormSubmit]: { total: 0, unique: 0 },
    } as const;

    const calculated = events.reduce(
      (acc, event) => {
        const type = event.eventType as TrafficEventType;
        if (!acc[type]) return acc;
        acc[type].total += 1;
        acc[type].unique += event.isUnique ? 1 : 0;
        return acc;
      },
      {
        [TrafficEventType.PageView]: { ...base[TrafficEventType.PageView] },
        [TrafficEventType.Click]: { ...base[TrafficEventType.Click] },
        [TrafficEventType.FormSubmit]: { ...base[TrafficEventType.FormSubmit] },
      },
    );

    return {
      pageView: totals?.pageView ?? calculated[TrafficEventType.PageView],
      click: totals?.click ?? calculated[TrafficEventType.Click],
      formSubmit: totals?.formSubmit ?? calculated[TrafficEventType.FormSubmit],
    };
  }, [events, totals]);

  const totalEvents = useMemo(
    () =>
      aggregatedTotals.pageView.total +
      aggregatedTotals.click.total +
      aggregatedTotals.formSubmit.total,
    [aggregatedTotals],
  );

  const uniqueEvents = useMemo(
    () =>
      aggregatedTotals.pageView.unique +
      aggregatedTotals.click.unique +
      aggregatedTotals.formSubmit.unique,
    [aggregatedTotals],
  );

  const formatUniqueLabel = useCallback(
    (count: number) => t(messages.dashboard.analytics.traffic.uniqueCount, { count }),
    [t],
  );

  const eventsByType = useMemo(() => {
    return [
      {
        label: `${t(messages.dashboard.analytics.traffic.eventTypes.pageView)} · ${formatUniqueLabel(
          aggregatedTotals.pageView.unique,
        )}`,
        value: aggregatedTotals.pageView.total,
        color: chartPalette.info,
      },
      {
        label: `${t(messages.dashboard.analytics.traffic.eventTypes.click)} · ${formatUniqueLabel(
          aggregatedTotals.click.unique,
        )}`,
        value: aggregatedTotals.click.total,
        color: chartPalette.success,
      },
      {
        label: `${t(messages.dashboard.analytics.traffic.eventTypes.formSubmit)} · ${formatUniqueLabel(
          aggregatedTotals.formSubmit.unique,
        )}`,
        value: aggregatedTotals.formSubmit.total,
        color: chartPalette.warning,
      },
    ];
  }, [aggregatedTotals, chartPalette.info, chartPalette.success, chartPalette.warning, formatUniqueLabel, t]);

  const topCountries = useMemo(() => {
    if (!events.length) return [] as { label: string; value: number }[];

    const counts = events.reduce(
      (acc: Record<string, number>, event: any) => {
        const key = event.country || "?";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([country, count]) => ({
        label: country === "?" ? "-" : country,
        value: count,
      }));
  }, [events]);

  const topDevices = useMemo(() => {
    if (!events.length) return [] as { label: string; value: number }[];

    const counts = events.reduce(
      (acc: Record<string, number>, event: any) => {
        const key = event.device || t(messages.dashboard.analytics.traffic.columns.device);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([device, count]) => ({ label: device, value: count }));
  }, [events, t]);

  const sortedEvents = useMemo(
    () =>
      events
        .slice()
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [events],
  );

  const displayedEvents = useMemo(
    () => (showAllEvents ? sortedEvents : sortedEvents.slice(0, 5)),
    [showAllEvents, sortedEvents],
  );

  const trafficTooltips = useMemo(
    () => ({
      volume: t(messages.dashboard.analytics.traffic.tooltips.volume),
      unique: t(messages.dashboard.analytics.traffic.tooltips.unique),
      countries: t(messages.dashboard.analytics.traffic.tooltips.countries),
      devices: t(messages.dashboard.analytics.traffic.tooltips.devices),
      ctr: t(messages.dashboard.analytics.traffic.tooltips.ctr),
    }),
    [t],
  );

  const statCards = useMemo(
    () => [
      {
        label: "Traffic volume",
        value: totalEvents.toString(),
        tooltip: trafficTooltips.volume,
      },
      {
        label: "Unique events",
        value: uniqueEvents.toString(),
        tooltip: trafficTooltips.unique,
      },
      {
        label: "Countries",
        value: new Set(events.map((d: any) => d.country || "")).size.toString(),
        tooltip: trafficTooltips.countries,
      },
      {
        label: "Devices",
        value: new Set(events.map((d: any) => d.device || "")).size.toString(),
        tooltip: trafficTooltips.devices,
      },
      {
        label: "CTR",
        value:
          aggregatedTotals.pageView.total === 0
            ? "0%"
            : `${Math.min(
                100,
                Math.round((aggregatedTotals.click.total / aggregatedTotals.pageView.total) * 100),
              )}%`,
        tooltip: trafficTooltips.ctr,
      },
    ],
    [aggregatedTotals, events, totalEvents, trafficTooltips, uniqueEvents],
  );

  const { analitycs_traffic: analitycsTrafficPermissions } =
    useAppPermissions();
  const { canAccess } = usePermissionGuard({
    canAccess: analitycsTrafficPermissions.view,
  });
  if (!canAccess) {
    return null;
  }

  return (
    <PageShell>
      <Container className="py-8 space-y-6 relative">
        <PageHeader
          title={t(messages.dashboard.analytics.traffic.title)}
          subtitle={t(messages.dashboard.analytics.traffic.subtitle)}
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
            <SectionCard title={t(messages.dashboard.analytics.traffic.title)}>
              <div className="grid gap-4 grid-cols-5">
                {statCards.map((card) => (
                  <StatCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    tooltip={card.tooltip}
                    accent="70%"
                  />
                ))}
              </div>
            </SectionCard>

            <div className="grid gap-4 lg:grid-cols-3">
              <SectionCard
                title={t(messages.dashboard.analytics.traffic.volumeTitle)}
                description={t(
                  messages.dashboard.analytics.traffic.volumeDescription,
                )}
              >
                <LineChart
                  data={eventsByDay}
                  lines={[{ dataKey: "value", color: chartPalette.info }]}
                  emptyLabel={t(messages.dashboard.analytics.traffic.empty)}
                />
              </SectionCard>
              <SectionCard
                title={t(messages.dashboard.analytics.traffic.feedbackTitle)}
                description={t(
                  messages.dashboard.analytics.traffic.feedbackDescription,
                )}
              >
                <LineChart
                  data={feedbackSeries}
                  lines={[{ dataKey: "value", color: chartPalette.warning }]}
                  emptyLabel={t(messages.dashboard.analytics.traffic.empty)}
                />
              </SectionCard>
              <SectionCard
                title={t(messages.dashboard.analytics.traffic.devicesTitle)}
                description={t(
                  messages.dashboard.analytics.traffic.devicesDescription,
                )}
              >
                <BarChart
                  data={topDevices}
                  emptyLabel={t(messages.dashboard.analytics.traffic.empty)}
                />
              </SectionCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard
                title={t(messages.dashboard.analytics.traffic.byTypeTitle)}
                description={t(
                  messages.dashboard.analytics.traffic.byTypeDescription,
                )}
              >
                <BarChart
                  data={eventsByType}
                  emptyLabel={t(messages.dashboard.analytics.traffic.empty)}
                />
              </SectionCard>

              <SectionCard
                title={t(messages.dashboard.analytics.traffic.geographyTitle)}
                description={t(
                  messages.dashboard.analytics.traffic.geographyDescription,
                )}
              >
                <BarChart
                  data={topCountries}
                  emptyLabel={t(messages.dashboard.analytics.traffic.empty)}
                />
              </SectionCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-1">
              <SectionCard
                title={t(messages.dashboard.analytics.traffic.lastEvents)}
                description={t(
                  messages.dashboard.analytics.traffic.volumeDescription,
                )}
              >
                {displayedEvents.length === 0 ? (
                  <EmptyState
                    title={t(messages.dashboard.analytics.traffic.empty)}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted border-b border-border">
                          <th className="py-2 pr-4">
                            {t(
                              messages.dashboard.analytics.traffic.columns
                                .event,
                            )}
                          </th>
                          <th className="py-2 pr-4">
                            {t(
                              messages.dashboard.analytics.traffic.columns.url,
                            )}
                          </th>
                          <th className="py-2 pr-4">
                            {t(
                              messages.dashboard.analytics.traffic.columns
                                .eventName,
                            )}
                          </th>
                          <th className="py-2 pr-4">
                            {t(
                              messages.dashboard.analytics.traffic.columns
                                .referrer,
                            )}
                          </th>
                          <th className="py-2 pr-4">
                            {t(
                              messages.dashboard.analytics.traffic.columns
                                .device,
                            )}
                          </th>
                          <th className="py-2 pr-4">
                            {t(
                              messages.dashboard.analytics.traffic.columns
                                .country,
                            )}
                          </th>
                          <th className="py-2">
                            {t(
                              messages.dashboard.analytics.traffic.columns.date,
                            )}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {displayedEvents.map((event) => (
                          <tr
                            key={event.id}
                            className="hover:bg-surface/50 transition-colors"
                          >
                            <td className="py-2 pr-4 font-medium text-text max-w-[180px]">
                              <div className="flex items-center gap-2">
                                <span
                                  className="truncate"
                                  title={event.eventType}
                                >
                                  {t(
                                    (
                                      messages.dashboard.analytics.traffic
                                        .eventTypes as any
                                    )[event.eventType] ?? "",
                                  )}
                                </span>
                                {event.isUnique && (
                                  <span className="text-[10px] uppercase tracking-wide rounded-full bg-emerald-50 text-emerald-600 px-2 py-0.5 border border-emerald-100">
                                    {t(
                                      messages.dashboard.analytics.traffic
                                        .uniqueBadge,
                                    )}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              className="py-2 pr-4 text-muted max-w-[220px] truncate"
                              title={event.url || "-"}
                            >
                              {event.url || "-"}
                            </td>
                            <td
                              className="py-2 pr-4 text-muted max-w-[200px] truncate"
                              title={event.eventName || "-"}
                            >
                              {event.eventName || "-"}
                            </td>
                            <td
                              className="py-2 pr-4 text-muted max-w-[200px] truncate"
                              title={event.referrer || "-"}
                            >
                              {event.referrer || "-"}
                            </td>
                            <td
                              className="py-2 pr-4 text-muted max-w-[140px] truncate"
                              title={event.device || "-"}
                            >
                              {event.device || "-"}
                            </td>
                            <td className="py-2 pr-4 text-muted">
                              {event.country || "-"}
                            </td>
                            <td className="py-2 text-muted">
                              {dateTimeFormatter.format(
                                new Date(event.createdAt),
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sortedEvents.length > 5 && (
                      <div className="mt-3 flex justify-center">
                        <Button
                          variant={ButtonVariantEnum.secondary}
                          size={ButtonSizeEnum.sm}
                          onClick={() => setShowAllEvents((prev) => !prev)}
                        >
                          {showAllEvents
                            ? t(messages.common.actions.showLess)
                            : t(messages.common.actions.showAll)}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        )}
      </Container>
    </PageShell>
  );
};
