"use client";

import React from "react";
import type { EmailBranding } from "@/entities/email";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { Small } from "@/shared/ui/Typography";
import { Skeleton } from "@/shared/ui/loading/Skeleton";

type EmailBrandingFormProps = {
  value: EmailBranding;
  onChange: (next: EmailBranding) => void;
  onSave: () => void;
  saving?: boolean;
  isDirty?: boolean;
  loading?: boolean;
};

const colorFields: Array<{ key: keyof EmailBranding; labelKey: string }> = [
  { key: "primaryColor", labelKey: messages.dashboard.email.branding.primaryColor },
  { key: "secondaryColor", labelKey: messages.dashboard.email.branding.secondaryColor },
  { key: "accentColor", labelKey: messages.dashboard.email.branding.accentColor },
  { key: "backgroundColor", labelKey: messages.dashboard.email.branding.backgroundColor },
  { key: "textColor", labelKey: messages.dashboard.email.branding.textColor },
];

const textFields: Array<{ key: keyof EmailBranding; labelKey: string; type?: string }> = [
  { key: "brandName", labelKey: messages.dashboard.email.branding.brandName },
  { key: "logoUrl", labelKey: messages.dashboard.email.branding.logoUrl },
  { key: "darkLogoUrl", labelKey: messages.dashboard.email.branding.darkLogoUrl },
  { key: "supportEmail", labelKey: messages.dashboard.email.branding.supportEmail, type: "email" },
  { key: "supportUrl", labelKey: messages.dashboard.email.branding.supportUrl },
  { key: "footerText", labelKey: messages.dashboard.email.branding.footerText },
];

export function EmailBrandingForm({
  value,
  onChange,
  onSave,
  saving,
  isDirty = false,
  loading = false,
}: EmailBrandingFormProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`branding-text-${index}`} className="h-10 w-full" />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`branding-color-${index}`} className="h-10 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  const updateField = (key: keyof EmailBranding, next: string) => {
    onChange({
      ...value,
      [key]: next,
    });
  };

  const updateSocialLink = (
    index: number,
    key: "label" | "url",
    next: string,
  ) => {
    const socialLinks = [...(value.socialLinks ?? [])];
    socialLinks[index] = {
      ...(socialLinks[index] ?? {}),
      [key]: next,
    };
    onChange({ ...value, socialLinks });
  };

  const addSocialLink = () => {
    const socialLinks = [...(value.socialLinks ?? [])];
    socialLinks.push({ label: "", url: "" });
    onChange({ ...value, socialLinks });
  };

  const removeSocialLink = (index: number) => {
    const socialLinks = [...(value.socialLinks ?? [])];
    socialLinks.splice(index, 1);
    onChange({ ...value, socialLinks });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {textFields.map((field) => (
          <Field key={field.key} id={field.key} label={t(field.labelKey)}>
            <Input
              id={field.key}
              type={field.type ?? "text"}
              value={(value[field.key] as string) ?? ""}
              onChange={(e) => updateField(field.key, e.target.value)}
            />
          </Field>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {colorFields.map((field) => (
          <Field key={field.key} id={field.key} label={t(field.labelKey)}>
            <div className="flex items-center gap-2">
              <Input
                id={field.key}
                type="color"
                className="h-10 w-14 p-1"
                value={(value[field.key] as string) ?? "#4f46e5"}
                onChange={(e) => updateField(field.key, e.target.value)}
              />
              <Input
                type="text"
                value={(value[field.key] as string) ?? ""}
                onChange={(e) => updateField(field.key, e.target.value)}
              />
            </div>
          </Field>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Small className="uppercase tracking-wide text-secondary">
            {t(messages.dashboard.email.branding.socialLinks)}
          </Small>

          <Button
            size={ButtonSizeEnum.sm}
            variant={ButtonVariantEnum.secondary}
            type="button"
            onClick={addSocialLink}
          >
            {t(messages.dashboard.email.actions.addSocialLink)}
          </Button>
        </div>

        <div className="space-y-2">
          {(value.socialLinks ?? []).map((link, idx) => (
            <div
              key={`${idx}-${link.label ?? "link"}`}
              className="grid gap-2 sm:grid-cols-2"
            >
              <Input
                placeholder={t(messages.dashboard.email.branding.socialLabelPlaceholder)}
                value={link.label ?? ""}
                onChange={(e) => updateSocialLink(idx, "label", e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder={t(messages.dashboard.email.branding.urlPlaceholder)}
                  value={link.url ?? ""}
                  onChange={(e) => updateSocialLink(idx, "url", e.target.value)}
                />
                <Button
                  size={ButtonSizeEnum.sm}
                  variant={ButtonVariantEnum.secondary}
                  type="button"
                  onClick={() => removeSocialLink(idx)}
                >
                  {t(messages.dashboard.email.actions.remove)}
                </Button>
              </div>
            </div>
          ))}
          {(value.socialLinks ?? []).length === 0 && (
            <Small className="text-secondary">
              {t(messages.dashboard.email.branding.socialLinksEmpty)}
            </Small>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          size={ButtonSizeEnum.md}
          variant={ButtonVariantEnum.primary}
          type="button"
          disabled={!isDirty || saving}
          onClick={onSave}
        >
          {saving
            ? t(messages.dashboard.email.branding.saving)
            : t(messages.dashboard.email.branding.save)}
        </Button>
      </div>
    </div>
  );
}
