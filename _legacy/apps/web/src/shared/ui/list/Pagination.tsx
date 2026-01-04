"use client";

import React, { useMemo } from "react";
import clsx from "clsx";

import { messages, useI18n } from "@packages/locales";
import { Small } from "@/shared/ui/Typography";

type PaginationProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  pageSize,
  pageSizeOptions = [5, 10, 50, 100],
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useI18n();

  if (totalPages <= 1) return null;

  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const result: (number | "ellipsis")[] = [];
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, page + 1);

    result.push(1);
    if (start > 2) result.push("ellipsis");
    for (let current = start; current <= end; current += 1) {
      if (current !== 1 && current !== totalPages) result.push(current);
    }
    if (end < totalPages - 1) result.push("ellipsis");
    if (totalPages > 1) result.push(totalPages);

    return result;
  }, [page, totalPages]);

  const handlePageClick = (value: number) => {
    if (value === page) return;
    onPageChange(value);
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = Number(event.target.value);
    if (!Number.isFinite(value)) return;
    onPageSizeChange(value);
  };

  return (
    <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <Small className="text-muted">
          {t(messages.common.pagination.perPageLabel)}
        </Small>
        <select
          className="rounded-md border border-border bg-background px-2 py-1 text-xs"
          value={pageSize}
          onChange={handlePageSizeChange}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-end gap-1">
        {pages.map((value, index) => {
          if (value === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-xs text-muted"
              >
                ...
              </span>
            );
          }

          const isActive = value === page;

          return (
            <button
              key={value}
              type="button"
              onClick={() => handlePageClick(value)}
              className={clsx(
                "min-w-[2rem] rounded-md px-2 py-1 text-xs border border-transparent",
                "hover:bg-muted/60 transition-colors",
                isActive &&
                  "bg-primary text-white border-primary",
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
};
