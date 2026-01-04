"use client";

import React from "react";
import dynamic from "next/dynamic";
import Spinner from "@/shared/ui/loading/Spinner";

// dynamically import react-select (no SSR)
const ReactSelect = dynamic(() => import("react-select"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[38px] w-full items-center justify-start rounded-md border border-border bg-background px-2">
      <Spinner size={18} />
    </div>
  ),
});

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
  const placeholderOption = options.find((opt) => opt.value === "");

  // dropdown options — without placeholder
  const renderedOptions = options.filter((opt) => opt.value !== "");

  const hasValue = isMulti
    ? Array.isArray(value) && value.length > 0
    : value !== "" && value !== undefined && value !== null;

  const selectedValue = isMulti
    ? options.filter(
        (opt) => Array.isArray(value) && value.includes(opt.value),
      )
    : !hasValue
    ? null
    : options.find((opt) => opt.value === value) || null;

  const handleChange = (option: any) => {
    if (isMulti) {
      const vals = (option || []).map((o: Option) => o.value);
      onChange(vals);
    } else {
      onChange(option?.value ?? "");
    }
  };

  const wrapperClassName = ["w-full text-sm", className]
    .filter(Boolean)
    .join(" ");

  return (
    <ReactSelect
      inputId={id}
      value={selectedValue}
      options={renderedOptions}
      onChange={handleChange}
      isMulti={isMulti}
      isDisabled={isDisabled}
      className={wrapperClassName}
      classNamePrefix="app-select"
      isClearable={true}
      placeholder={placeholderOption?.label}
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: "var(--color-background)",
          borderWidth: "1px",
          outline: state.isFocused ? "2px solid var(--color-primary)" : "",
          borderColor: invalid
            ? "var(--color-danger)"
            : state.isFocused
            ? "var(--color-primary)"
            : hasValue
            ? "var(--color-border)"
            : "var(--color-border)",
          borderRadius: 6,
          minHeight: "38px",
          boxShadow: "none",
          cursor: "pointer",
          ":hover": {
            borderColor: invalid
              ? "var(--color-danger)"
              : "var(--color-border)",
          },
        }),
        valueContainer: (base) => ({
          ...base,
          paddingInline: 12,
          paddingBlock: 4,
        }),
        placeholder: (base) => ({
          ...base,
          color: "var(--color-muted)",
        }),
        singleValue: (base) => ({
          ...base,
          color: "var(--color-text)",
        }),
        input: (base) => ({
          ...base,
          color: "var(--color-text)",
        }),
        menu: (base) => ({
          ...base,
          zIndex: 9999,
          backgroundColor: "var(--color-background)",
          borderRadius: 6,
          padding: "0px",
          border: "1px solid var(--color-border)",
          overflow: "hidden",
        }),
        option: (base, state) => ({
          ...base,
          cursor: "pointer",
          backgroundColor: state.isSelected
            ? "var(--color-primary)"
            : state.isFocused
            ? "var(--color-muted)"
            : "var(--color-background)",
          color: state.isSelected || state.isFocused
            ? "rgb(255, 255, 255, 1)"
            : "var(--color-text)",
          fontSize: "0.875rem",
        }),
        indicatorSeparator: () => ({
          display: "none",
        }),
        clearIndicator: (base) => ({
          ...base,
          display: isClearable && hasValue ? "flex" : "none",
          cursor: "pointer",
          color: "var(--color-muted)",
          padding: "0 8px",
          ":hover": {
            color: "var(--color-danger)",
          },
        }),
        dropdownIndicator: (base, state) => ({
          ...base,
          cursor: "pointer",
          padding: "0 8px",
          color: "var(--color-muted)",
          ":hover": {
            color: "var(--color-primary)",
          },
        }),
      }}
    />
  );
};
