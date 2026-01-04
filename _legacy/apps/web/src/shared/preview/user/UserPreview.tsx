"use client";

import clsx from "clsx";
import { User, UserRoleEnum } from "@packages/api/modules/user/index/types";
import { UserAvatar } from "./UserAvatar";
import { messages, useI18n } from "@packages/locales";
import Tooltip, { TooltipPosition } from "@/shared/ui/Tooltip";
import { getProductLabel } from "@/app/dashboard/subscription/utils/billing";

type UserPreviewProps = {
  user: User;
  showEmail?: boolean;
  showPlan?: boolean;
  showRoleBadge?: boolean;
  showAiCredits?: boolean;
  size?: "sm" | "md" | "lg";
  hideText?: boolean;
  className?: string;
};

export const UserPreview = ({
  user,
  showEmail = true,
  showPlan = true,
  showRoleBadge = true,
  showAiCredits = true,
  hideText = false,
  className,
}: UserPreviewProps) => {
  const { t } = useI18n();
  const displayName = user?.name || user?.email || "";
  const isAdmin = user?.role.key === UserRoleEnum.ADMIN;
  const planLabel = getProductLabel(t, user?.plan);
  const roleLabel = isAdmin
    ? t(messages.roles.admin.name)
    : t(messages.roles.user.name);

  return (
    <div
      className={clsx("flex flex-col min-w-0 gap-2", className)}
    >
      {!hideText && (
        <div className="flex flex-row flex-wrap gap-2">
          {showRoleBadge && isAdmin && (
            <Tooltip
              content={t(messages.tooltips.role)}
              placement={TooltipPosition.bottom}
            >
              <span className="inline-flex shrink-0 items-center rounded-full border border-primary/60 bg-primary/10 px-2 py-[2px] text-[10px] font-medium uppercase tracking-wide text-primary">
                {roleLabel}
              </span>
            </Tooltip>
          )}

          {showPlan && user?.plan && (
            <Tooltip
              content={t(messages.tooltips.plan)}
              placement={TooltipPosition.bottom}
            >
              <span className="inline-flex shrink-0 items-center rounded-full border border-border/60 bg-muted/40 px-2 py-[2px] text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {planLabel}
              </span>
            </Tooltip>
          )}

          {showAiCredits && !!user?.aiCredits && (
            <Tooltip
              content={t(messages.tooltips.aiCredits)}
              placement={TooltipPosition.bottom}
            >
              <span className="inline-flex shrink-0 items-center rounded-full border border-primary/40 bg-primary/10 px-2 py-[2px] text-[10px] font-medium uppercase tracking-wide text-primary">
                {t(messages.common.aiCreditsLabel)}: {user.aiCredits}
              </span>
            </Tooltip>
          )}
        </div>
      )}
      <div
        className={clsx(
          "flex items-center min-w-0",
          !hideText && "gap-2",
        )}
      >
        <div className="shrink-0">
          <UserAvatar
            user={user}
            aria-label={user?.email || "User avatar"}
            className="w-full h-full"
          />
        </div>
        {!hideText && (
          <div className="min-w-0">
            <div className={clsx("flex items-center gap-2 truncate")}>
              <span className="font-medium truncate">{displayName || "—"}</span>
            </div>

            {showEmail && user?.email && user?.name && (
              <div className="text-xs text-muted truncate">{user.email}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
