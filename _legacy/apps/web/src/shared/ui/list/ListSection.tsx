"use client";

import React from "react";

import type { Paginated, sortEnum } from "@packages/api/types/pagination";
import { messages } from "@packages/locales";

import { FiltersBar } from "@/shared/ui/list/FiltersBar";
import { EmptyState } from "@/shared/ui/list/EmptyState";
import { Pagination } from "@/shared/ui/list/Pagination";
import { DangerZoneSection } from "@/shared/ui/section/DangerZoneSection";
import { NoPermissionNotice } from "@/shared/ui/section/NoPermissionNotice";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";

type FiltersConfig = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue?: sortEnum;
  onSortChange?: (value: sortEnum) => void;
  extraFilters?: React.ReactNode;
  onClearAll?: () => void;
};

type ListSectionProps<T> = {
  canView: boolean;
  authLoading: boolean;

  isError: boolean;
  isLoading: boolean;
  onRetry?: () => void;

  data?: Paginated<T>;

  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;

  filters?: FiltersConfig;

  emptyTitleKey?: string;
  emptyDescriptionKey?: string;

  renderItem: (item: T) => React.ReactNode;
  getItemKey?: (item: T) => React.Key;
};

export function ListSection<T>({
  canView,
  authLoading,
  isError,
  isLoading,
  onRetry,
  data,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  filters,
  emptyTitleKey = messages.common.empty.title,
  emptyDescriptionKey = messages.common.empty.description,
  renderItem,
  getItemKey,
}: ListSectionProps<T>) {
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.page ?? page;

  const showList = canView && !authLoading;

  return (
    <section className="bg-card rounded-lg border border-border p-4 md:p-6 space-y-4">
      {filters && <FiltersBar {...filters} />}

      {!showList && !authLoading && <NoPermissionNotice />}

      {showList && (
        <div className="space-y-4 pt-4">
          {isError && onRetry && (
            <DangerZoneSection
              titleKey={messages.errors.generic}
              buttonLabelKey={messages.common.actions.tryAgain}
              onClick={onRetry}
            />
          )}

          {!isError && items.length === 0 && !isLoading && (
            <EmptyState
              titleKey={emptyTitleKey}
              descriptionKey={emptyDescriptionKey}
            />
          )}

          <div className="relative">
            <LoadingOverlay loading={isLoading} />

            {!isError && items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <React.Fragment
                    key={getItemKey ? getItemKey(item) : index}
                  >
                    {renderItem(item)}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {!isError && items.length > 0 && totalPages > 1 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          )}
        </div>
      )}
    </section>
  );
}
