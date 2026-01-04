"use client";

import React from "react";
import { Search, X } from "lucide-react";

import { messages, useI18n } from "@packages/locales";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import {
  Button,
  ButtonVariantEnum,
} from "@/shared/ui/Button";
import { sortEnum } from "@packages/api/types/pagination";
import { Select } from "@/shared/ui/forms/Select";

type FiltersBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue?: sortEnum;
  onSortChange?: (value: sortEnum) => void;
  extraFilters?: React.ReactNode;
  onClearAll?: () => void;
};

export const FiltersBar: React.FC<FiltersBarProps> = ({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  extraFilters,
  onClearAll,
}) => {
  const { t } = useI18n();

  const handleClearSearch = () => onSearchChange("");

  const handleClearAll = () => {
    if (!onClearAll) return;
    onClearAll();
  };

  const hasExtraFilters = !!extraFilters;
  const hasClearButton = !!onClearAll;
  const hasSort = !!onSortChange;

  const searchOnlyMode =
    !hasExtraFilters && !hasClearButton && !hasSort;

  const gridClass =
    searchOnlyMode
      ? "w-full"
      : hasSort && !hasExtraFilters
      ? "grid gap-3 grid-cols-1 lg:grid-cols-2"
      : "grid gap-3 grid-cols-1 lg:grid-cols-3";

  return (
    <div
      className={
        searchOnlyMode
          ? "w-full"
          : "flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
      }
    >
      <div className={searchOnlyMode ? "w-full" : "flex-1"}>
        <div className={gridClass}>
          {/* Search */}
          <Field
            id="filters-search"
            label={t(messages.common.actions.search)}
          >
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Search className="w-4 h-4 text-muted" />
              </span>
              <Input
                id="filters-search"
                type="text"
                value={searchValue}
                onChange={(event) =>
                  onSearchChange(event.target.value)
                }
                className="pl-9 pr-9 w-full"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-2 flex items-center justify-center rounded-md px-1 text-muted hover:text-text hover:bg-muted/40"
                  aria-label={t(messages.common.filters.clearSearch)}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </Field>

          {/* Extra filters */}
          {hasExtraFilters && extraFilters}

          {/* Sort */}
          {hasSort && (
            <Field
              id="filters-sort"
              label={t(messages.common.pagination.sortLabel)}
            >
              <Select
                id="filters-sort"
                value={sortValue ?? sortEnum.desc}
                onChange={(v) => onSortChange(v as sortEnum)}
                isClearable={false}
                options={[
                  {
                    value: sortEnum.desc,
                    label: t(messages.common.pagination.sortDesc),
                  },
                  {
                    value: sortEnum.asc,
                    label: t(messages.common.pagination.sortAsc),
                  },
                ]}
              />
            </Field>
          )}
        </div>
      </div>

      {hasClearButton && (
        <div className="flex items-center justify-end w-full lg:w-auto">
          <Button
            type="button"
            variant={ButtonVariantEnum.primary}
            onClick={handleClearAll}
            className="w-full lg:w-auto"
          >
            {t(messages.common.filters.clearAll)}
          </Button>
        </div>
      )}
    </div>
  );
};
