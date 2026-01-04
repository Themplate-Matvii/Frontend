import { ReactNode } from "react";
import clsx from "clsx";

import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { H1, Lead, TextColorEnum } from "@/shared/ui/Typography";
import { messages, useI18n } from "@packages/locales";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  onBack?: () => void;
  addLabel?: string;
  onAdd?: () => void;
  actions?: ReactNode;
  subtitleColor?: TextColorEnum;
}

export function PageHeader({
  title,
  subtitle,
  className,
  onBack,
  addLabel,
  onAdd,
  actions,
  subtitleColor,
}: PageHeaderProps) {
  const hasActions = Boolean(onBack || onAdd || actions);
  const { t } = useI18n();

  return (
    <header
      className={clsx(
        "space-y-2",
        hasActions && "sm:flex sm:items-center sm:justify-between sm:space-y-0",
        className,
      )}
    >
      <div className="space-y-2">
        <H1>{title}</H1>
        {subtitle ? <Lead color={subtitleColor}>{subtitle}</Lead> : null}
      </div>

      {hasActions ? (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {onBack ? (
            <Button
              type="button"
              size={ButtonSizeEnum.md}
              variant={ButtonVariantEnum.secondary}
              onClick={onBack}
            >
              {t(messages.common.actions.back)}
            </Button>
          ) : null}

          {onAdd && addLabel ? (
            <Button
              type="button"
              size={ButtonSizeEnum.md}
              variant={ButtonVariantEnum.primary}
              onClick={onAdd}
            >
              {addLabel}
            </Button>
          ) : null}

          {actions}
        </div>
      ) : null}
    </header>
  );
}
