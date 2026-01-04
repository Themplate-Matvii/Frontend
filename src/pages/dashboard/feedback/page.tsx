"use client";

import React, { useMemo, useState } from "react";

import { useAuth, useAppPermissions, usePermissionGuard } from "@/entities/user";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";

import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { PageShell } from "@/shared/layout/PageShell";

import { usePageSize } from "@/shared/lib/hooks/usePageSize";
import { FeedbackApi, type Feedback } from "@/entities/feedback";

import { ItemCard } from "@/shared/ui/list/ItemCard";
import { FeedbackPreview } from "@/entities/feedback";
import { ListSection } from "@/shared/ui/list/ListSection";
import { sortEnum } from "@/shared/types/api/pagination";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";

export const DashboardFeedbackPage = () => {
  const { t } = useI18n();
  const { loading: authLoading } = useAuth();
  const { feedback: feedbackPermissions } = useAppPermissions();

  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<sortEnum>(sortEnum.desc);
  const [search, setSearch] = useState<string>("");

  const { pageSize, setPageSize } = usePageSize({
    defaultSize: 5,
  });

  const canView = !!feedbackPermissions?.view;
  const { canAccess } = usePermissionGuard({
    canAccess: canView,
  });

  

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      s: search || undefined,
      sort,
    }),
    [page, pageSize, search, sort],
  );

  const {
    data: feedbackPage,
    isLoading,
    isError,
    refetch,
  } = FeedbackApi.useAllFeedbacks(queryParams);

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  if (!canAccess && !authLoading) {
    return null;
  }

  return (
    <PageShell>
      <Container>
        <PageHeader
          title={t(messages.dashboard.feedback.list.title)}
          subtitle={t(messages.dashboard.feedback.list.subtitle)}
        />

        <ListSection<Feedback>
          canView={canView}
          authLoading={authLoading}
          isError={isError}
          isLoading={isLoading}
          onRetry={refetch}
          data={feedbackPage}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          filters={{
            searchValue: search,
            onSearchChange: (value: string) => {
              setSearch(value);
              setPage(1);
            },
            sortValue: sort,
            onSortChange: setSort,
          }}
          emptyTitleKey={messages.dashboard.feedback.list.emptyTitle}
          emptyDescriptionKey={
            messages.dashboard.feedback.list.emptyDescription
          }
          renderItem={(fb) => (
            <ItemCard
              
              canEdit={false}
              canDelete={false}
              actionsSide="right"
            >
              <FeedbackPreview feedback={fb} />
            </ItemCard>
          )}
          getItemKey={(fb) => fb.id}
        />
      </Container>
    </PageShell>
  );
};
