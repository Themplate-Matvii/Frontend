"use client";

import React, { useMemo, useState } from "react";

import { useAuth } from "@packages/api/context/AuthContext";
import { messages, useI18n } from "@packages/locales";

import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { PageShell } from "@/shared/layout/PageShell";

import { useAppPermissions } from "@/hooks/auth/usePermissions";
import { usePageSize } from "@/hooks/layout/usePageSize";

import {
  useAllFeedbacks,
  type Feedback,
} from "@packages/api/modules/communication/feedback";

import { ItemCard } from "@/shared/ui/list/ItemCard";
import { FeedbackPreview } from "@/shared/preview/feedback/FeedbackPreview";
import { ListSection } from "@/shared/ui/list/ListSection";
import { usePermissionGuard } from "@/hooks/auth/usePermissionGuard";
import { sortEnum } from "@packages/api/types/pagination";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";

export default function FeedbackClientPage() {
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
  } = useAllFeedbacks(queryParams);

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
}
