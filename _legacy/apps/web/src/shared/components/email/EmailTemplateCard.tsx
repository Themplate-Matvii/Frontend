"use client";

import React from "react";
import { Mail, Send } from "lucide-react";
import {
  EmailCategory,
  MarketingTemplate,
  SystemTemplate,
} from "@packages/api/modules/communication/email";
import { messages, useI18n } from "@packages/locales";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";

type TemplateCardProps = {
  template: SystemTemplate | MarketingTemplate;
  type: "system" | "marketing";
  onPreview: () => void;
  onSend: () => void;
  onEdit?: () => void;
};

const getCategoryLabel = (category?: EmailCategory, t?: (key: string) => string) => {
  if (!t) return category ?? "";
  switch (category) {
    case "marketing":
      return t(messages.dashboard.email.categories.marketing);
    case "billing":
      return t(messages.dashboard.email.categories.billing);
    case "transactional":
      return t(messages.dashboard.email.categories.transactional);
    default:
      return t(messages.dashboard.email.categories.generic);
  }
};

export function EmailTemplateCard({
  template,
  type,
  onPreview,
  onSend,
  onEdit,
}: TemplateCardProps) {
  const { t } = useI18n();
  const title =
    template.name ||
    ("key" in template ? template.key : undefined) ||
    ("file" in template ? template.file : undefined) ||
    ("id" in template ? template.id : undefined) ||
    template.subjectKey ||
    "";
  const subject = template.subjectKey;
  const description = template.description;
  const category = template.category;

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <P className="text-base font-semibold">{title}</P>
          {description ? (
            <Small color={TextColorEnum.Secondary}>{description}</Small>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            {category ? (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {getCategoryLabel(category, t)}
              </span>
            ) : null}
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-secondary">
              {type === "marketing"
                ? t(messages.dashboard.email.marketing.label)
                : t(messages.dashboard.email.templates.systemLabel)}
            </span>
          </div>
          {subject ? (
            <Small className="block text-xs text-secondary">
              {t(messages.dashboard.email.templates.subjectKey, { key: subject })}
            </Small>
          ) : null}
        </div>

        <div className="flex gap-2">
          {onEdit ? (
            <Button
              size={ButtonSizeEnum.sm}
              variant={ButtonVariantEnum.secondary}
              type="button"
              onClick={onEdit}
            >
              {t(messages.dashboard.email.actions.edit)}
            </Button>
          ) : null}
          <Button
            size={ButtonSizeEnum.sm}
            variant={ButtonVariantEnum.secondary}
            type="button"
            onClick={onPreview}
          >
            <Mail size={16} className="mr-1" />
            {t(messages.dashboard.email.actions.preview)}
          </Button>
          <Button
            size={ButtonSizeEnum.sm}
            variant={ButtonVariantEnum.primary}
            type="button"
            onClick={onSend}
          >
            <Send size={16} className="mr-1" />
            {t(messages.dashboard.email.actions.send)}
          </Button>
        </div>
      </div>
    </div>
  );
}
