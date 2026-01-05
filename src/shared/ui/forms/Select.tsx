"use client";

import React from "react";
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

  const selectClassName = [
    "h-[38px] w-full rounded-md border bg-background px-2 text-sm",
    "text-foreground focus:outline-none focus:ring-2",
    isDisabled ? "opacity-60" : "cursor-pointer",
    invalid ? "border-danger focus:ring-danger" : "border-border focus:ring-primary",
    isClearable && hasValue ? "pr-9" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        id={id}
        disabled={isDisabled}
        multiple={isMulti}
        className={selectClassName}
        value={value}
        onChange={(event) => {
          if (isMulti) {
            const selectedValues = Array.from(event.target.selectedOptions).map(
              (option) => option.value,
            );
            onChange(selectedValues);
            return;
          }

          onChange(event.target.value);
        }}
      >
        {!isMulti && placeholderOption && (
          <option value="">{placeholderOption.label}</option>
        )}
        {options
          .filter((opt) => opt.value !== "")
          .map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
      {isClearable && hasValue && (
        <button
          type="button"
          onClick={() => onChange(isMulti ? [] : "")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-danger"
          aria-label={t(messages.common.actions.clear)}
        >
          ×
        </button>
      )}
    </div>
  );
};
