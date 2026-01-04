"use client";

import React from "react";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";

type EmptyStateProps = {
  titleKey?: string;
  descriptionKey?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actionSlot?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  titleKey = messages.common.empty.title,
  descriptionKey = messages.common.empty.description,
  title,
  description,
  actionSlot,
  className,
}: EmptyStateProps) {
  const { t } = useI18n();

  const resolvedTitle = title ?? t(titleKey);
  const resolvedDescription =
    descriptionKey || description
      ? (description ?? (descriptionKey ? t(descriptionKey) : null))
      : null;

  return (
    <div className={`py-8 text-center space-y-2 ${className ?? ""}`}>
      {resolvedTitle && (
        <h3 className="text-sm font-semibold">{resolvedTitle}</h3>
      )}
      {resolvedDescription && (
        <p className="text-xs text-muted">{resolvedDescription}</p>
      )}
      {actionSlot && <div className="pt-2">{actionSlot}</div>}
    </div>
  );
};
