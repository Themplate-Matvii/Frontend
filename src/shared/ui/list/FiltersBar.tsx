"use client";

import React from "react";
import { ArrowUpDown, Search, X } from "lucide-react";
import {
  Button as AriaButton,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
} from "react-aria-components";

import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import {
  Button,
  ButtonVariantEnum,
} from "@/shared/ui/Button";
import { sortEnum } from "@/shared/types/api/pagination";

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

  const sortLabel = t(messages.common.pagination.sortLabel);
  const sortOptions = [
    {
      value: sortEnum.desc,
      label: t(messages.common.pagination.sortDesc),
    },
    {
      value: sortEnum.asc,
      label: t(messages.common.pagination.sortAsc),
    },
  ];
  const currentSortLabel =
    sortValue === sortEnum.asc
      ? t(messages.common.pagination.sortAsc)
      : t(messages.common.pagination.sortDesc);

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
            <div className="flex items-end justify-end">
              <AriaSelect
                aria-label={sortLabel}
                selectedKey={sortValue ?? sortEnum.desc}
                onSelectionChange={(selection) =>
                  onSortChange?.(selection as sortEnum)
                }
                className="relative"
              >
                <AriaButton
                  aria-label={`${sortLabel}: ${currentSortLabel}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:bg-secondary hover:text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </AriaButton>

                <Popover
                  className="z-50 mt-2 w-44 rounded-lg border border-border bg-background shadow-lg"
                  placement="bottom end"
                >
                  <ListBox
                    className="max-h-60 overflow-auto p-1 text-sm text-text outline-none"
                    items={sortOptions}
                  >
                    {(item) => (
                      <ListBoxItem
                        id={item.value}
                        textValue={item.label}
                        className="cursor-pointer rounded-md px-3 py-2 outline-none transition-colors focus:bg-primary/10 focus:text-text data-[hovered]:bg-primary/10 data-[selected]:bg-primary data-[selected]:text-onPrimary data-[focus-visible]:ring-2 data-[focus-visible]:ring-primary/40"
                      >
                        {item.label}
                      </ListBoxItem>
                    )}
                  </ListBox>
                </Popover>
              </AriaSelect>
            </div>
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
