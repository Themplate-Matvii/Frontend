"use client";

import type { PropsWithChildren } from "react";
import clsx from "clsx";
import { Pencil, Trash2 } from "lucide-react";

import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import Tooltip from "../Tooltip";
import { Button, ButtonVariantEnum } from "../Button";

type ItemCardProps = PropsWithChildren<{
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  actionsSide?: "left" | "right";
  className?: string;
}>;

export function ItemCard({
  children,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  actionsSide = "right",
  className,
}: ItemCardProps) {
  const { t } = useI18n();

  const hasEdit = !!onEdit && !!canEdit;
  const hasDelete = !!onDelete && !!canDelete;
  const clickable = hasEdit;

  const handleCardClick = () => {
    if (hasEdit && onEdit) onEdit();
  };

  const stopAnd = (fn?: () => void) =>
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (fn) fn();
    };

  const actions = (position: "left" | "right") => {
    if (!hasEdit && !hasDelete) return null;
    if (position !== actionsSide) return null;

    return (
      <div className="flex items-center gap-2 shrink-0">
        {hasEdit && (
          <Tooltip content={t(messages.common.actions.edit)}>
            <Button
              variant={ButtonVariantEnum.primary}
              onClick={stopAnd(onEdit)}
              className={clsx(
                "!min-w-10 min-h-10 !p-0",
              )}
            >
              <Pencil size={16} className="text-muted-foreground" />
            </Button>
          </Tooltip>
        )}

        {hasDelete && (
          <Tooltip content={t(messages.common.actions.delete)}>
            <Button
              variant={ButtonVariantEnum.danger}
              onClick={stopAnd(onDelete)}
              className={clsx(
                "!min-w-10 min-h-10 !p-0",
              )}
            >
              <Trash2 size={16} className="text-white" />
            </Button>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm",
        "transition-colors transition-shadow duration-150",
        clickable &&
          "cursor-pointer hover:bg-muted/40 hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)] hover:dark:shadow-[0_8px_20px_rgba(0,0,0,0.35)]",
        className,
      )}
      onClick={handleCardClick}
    >
      {actions("left")}
      <div className="flex-1 min-w-0">{children}</div>
      {actions("right")}
    </div>
  );
}
