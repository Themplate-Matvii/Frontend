"use client";

import React, { useMemo } from "react";
import clsx from "clsx";
import {
  Select as AriaSelect,
  Button as AriaButton,
  ListBox,
  ListBoxItem,
  Popover,
  SelectValue,
} from "react-aria-components";
import { ChevronDown, X } from "lucide-react";
import { useI18n } from "@/shared/lib/i18n";
import { messages } from "@/i18n/messages";

export type Option = {
  value: string;
  label: string;
};

export type SelectProps = {
  value: string | string[];
  options: Option[];
  onChange: (value: string | string[]) => void;

  isMulti?: boolean;
  isDisabled?: boolean;
  isClearable?: boolean;

  id?: string;
  className?: string;

  /** When true, renders error focus and border colors */
  invalid?: boolean;
};



export function Select({
  value,
  options,
  onChange,
  isMulti = false,
  isDisabled = false,
  isClearable = true,
  id,
  className,
  invalid = false,
}: SelectProps) {
  const { t } = useI18n();
  const placeholderOption = options.find((opt) => opt.value === "");

  const hasValue = isMulti
    ? Array.isArray(value) && value.length > 0
    : value !== "" && value !== undefined && value !== null;

  const wrapperClassName = ["w-full text-sm", className]
    .filter(Boolean)
    .join(" ");

  const selectedKeys = useMemo(() => {
    if (!isMulti) return undefined;
    return new Set(Array.isArray(value) ? value : []);
  }, [isMulti, value]);

  const selectedKey = useMemo(() => {
    if (isMulti) return undefined;
    return typeof value === "string" && value !== "" ? value : null;
  }, [isMulti, value]);

  return (
    <div className={clsx("relative", wrapperClassName)}>
      <AriaSelect
        id={id}
        aria-labelledby={id ? `${id}-label` : undefined}
        aria-label={!id ? placeholderOption?.label || t(messages.common.actions.select) : undefined}
        isDisabled={isDisabled}
        isInvalid={invalid}
        selectionMode={isMulti ? "multiple" : "single"}
        selectedKey={selectedKey ?? undefined}
        selectedKeys={selectedKeys}
        onSelectionChange={(selection) => {
          if (isMulti) {
            if (selection === "all") {
              onChange(options.filter((opt) => opt.value !== "").map((opt) => opt.value));
              return;
            }
            onChange(Array.from(selection) as string[]);
            return;
          }
          if (!selection) {
            onChange("");
            return;
          }
          onChange(selection as string);
        }}
        className="relative w-full"
      >
        <AriaButton
          className={clsx(
            "relative flex h-[38px] w-full items-center gap-2 rounded-md border bg-background px-3 text-sm",
            "text-text shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30",
            isDisabled ? "opacity-60" : "cursor-pointer",
            invalid ? "border-danger" : "border-border",
            isClearable && hasValue ? "pr-16" : "pr-10",
          )}
        >
          <SelectValue>
            {({ selectedText }) => (
              <span className="flex-1 min-w-0 truncate">
                {selectedText || placeholderOption?.label || t(messages.common.actions.select)}
              </span>
            )}
          </SelectValue>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            <ChevronDown size={16} className="shrink-0" />
          </span>
        </AriaButton>

        {isClearable && hasValue && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChange(isMulti ? [] : "");
            }}
            className="absolute right-9 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-danger focus:outline-none focus:ring-2 focus:ring-danger/40"
            aria-label={t(messages.common.actions.clear)}
          >
            <X size={12} />
          </button>
        )}

        <Popover
          className="z-50 mt-2 w-[--trigger-width] rounded-lg border border-border bg-background shadow-lg"
          placement="bottom start"
        >
          <ListBox
            className="max-h-60 overflow-auto p-1 text-sm text-text outline-none"
            items={options.filter((opt) => opt.value !== "")}
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
  );
};
