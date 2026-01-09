"use client";

import React from "react";
import clsx from "clsx";

import { useI18n } from "@/shared/lib/i18n";
import { messages } from "@/i18n/messages";
import Spinner from "./Spinner";
import { Skeleton } from "./Skeleton";

type Props = {
  loading?: boolean;
  isGlobal?: boolean; // show loader full-screen
  variant?: "spinner" | "skeleton";
  label?: string;
  skeleton?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export const LoadingOverlay = ({
  loading = false,
  isGlobal = false,
  variant = "spinner",
  label,
  skeleton,
  className,
  children,
}: Props) => {
  const { t } = useI18n();
  const labelText = label ?? t(messages.common.loading);

  if (!loading && !children) return null;

  const overlay = loading ? (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        isGlobal
          ? "fixed inset-0 z-50 bg-background"
          : "absolute inset-0 z-20 bg-surface rounded-[inherit]",
        variant === "spinner"
          ? "flex items-center justify-center"
          : "flex items-stretch justify-stretch p-4",
      )}
    >
      <span className="sr-only">{labelText}</span>
      {variant === "spinner" ? (
        <Spinner size={28} />
      ) : (
        <div className="h-full w-full">
          {skeleton ?? (
            <Skeleton className="h-full w-full rounded-[inherit]" />
          )}
        </div>
      )}
    </div>
  ) : null;

  if (isGlobal) {
    return overlay;
  }

  return (
    <div
      className={clsx("relative overflow-hidden", className)}
      aria-busy={loading || undefined}
    >
      {children}
      {overlay}
    </div>
  );
};
