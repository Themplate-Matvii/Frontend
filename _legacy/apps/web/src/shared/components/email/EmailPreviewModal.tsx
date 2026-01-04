"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  EmailBranding,
  EmailCategory,
  TemplatePreviewResult,
} from "@packages/api/modules/communication/email";
import {
  usePreviewMarketingTemplate,
  usePreviewTemplate,
} from "@packages/api/modules/communication/email";
import { Languages } from "@packages/locales/translations";
import { messages, useI18n } from "@packages/locales";
import { Modal, ModalSize } from "@/shared/ui/modal/Modal";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { HeaderFooterPreview } from "./HeaderFooterPreview";
import { Small, TextColorEnum } from "@/shared/ui/Typography";

type EmailPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  type: "system" | "marketing";
  templateKey: string;
  templateName: string;
  marketingTemplateId?: string;
  branding?: EmailBranding;
  subjectKey?: string;
  category?: EmailCategory;
  defaultData?: Record<string, unknown>;
};

const languages = Object.values(Languages);

export function EmailPreviewModal({
  open,
  onClose,
  type,
  templateKey,
  templateName,
  marketingTemplateId,
  branding,
  subjectKey,
  category,
  defaultData = {},
}: EmailPreviewModalProps) {
  const { t } = useI18n();

  const [payload, setPayload] = useState<string>(
    JSON.stringify(defaultData ?? {}, null, 2),
  );
  const [locale, setLocale] = useState<string>(Languages.en);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<TemplatePreviewResult | null>(null);

  const previewMutation = usePreviewTemplate();
  const marketingPreviewMutation = usePreviewMarketingTemplate(marketingTemplateId);

  useEffect(() => {
    if (!open) return;
    setPayload(JSON.stringify(defaultData ?? {}, null, 2));
    setPreview(null);
    setError(null);
  }, [open, defaultData]);

  const parsedPayload = useMemo(() => {
    try {
      return payload?.trim() ? JSON.parse(payload) : {};
    } catch {
      return null;
    }
  }, [payload]);

  const handleRender = async () => {
    try {
      setError(null);
      const parsed = parsedPayload ?? {};

      if (type === "marketing" && marketingTemplateId) {
        const res = await marketingPreviewMutation.mutateAsync({
          data: parsed,
          locale,
        });
        setPreview({
          html: res.data?.html ?? res.data?.data?.html,
          subject: res.data?.subject ?? subjectKey ?? templateName,
          locale: res.data?.locale ?? locale,
          data: parsed,
        });
      } else {
        const res = await previewMutation.mutateAsync({
          template: templateKey,
          data: parsed,
          locale,
        });
        setPreview({
          html: res.data?.html ?? res.data?.data?.html,
          subject: res.data?.subject ?? subjectKey ?? templateName,
          locale: res.data?.locale ?? locale,
          data: parsed,
        });
      }
    } catch {
      setError(
        parsedPayload === null
          ? t(messages.dashboard.email.preview.invalidJson)
          : t(messages.dashboard.email.preview.failed),
      );
    }
  };

  const loading =
    previewMutation.isPending || marketingPreviewMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(messages.dashboard.email.preview.title, { template: templateName })}
      description={t(messages.dashboard.email.preview.description)}
      size={ModalSize.lg}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            id="locale"
            label={t(messages.dashboard.email.preview.locale)}
          >
            <select
              id="locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text"
            >
              {languages.map((lng) => (
                <option key={lng} value={lng}>
                  {lng.toUpperCase()}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="category"
            label={t(messages.dashboard.email.preview.category)}
          >
            <Input
              id="category"
              disabled
              value={category ?? t(messages.dashboard.email.categories.generic)}
            />
          </Field>
        </div>

        <Field
          id="payload"
          label={t(messages.dashboard.email.preview.payloadLabel)}
          footer={
            error ? (
              <Small className="text-red-500">{error}</Small>
            ) : (
              <Small color={TextColorEnum.Secondary}>
                {t(messages.dashboard.email.preview.payloadHint)}
              </Small>
            )
          }
        >
          <textarea
            id="payload"
            className="h-40 w-full rounded-md border border-border bg-background p-3 font-mono text-sm text-text"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
        </Field>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size={ButtonSizeEnum.md}
            variant={ButtonVariantEnum.secondary}
            onClick={onClose}
          >
            {t(messages.common.actions.cancel)}
          </Button>
          <Button
            type="button"
            size={ButtonSizeEnum.md}
            variant={ButtonVariantEnum.primary}
            onClick={handleRender}
            disabled={parsedPayload === null}
          >
            {loading
              ? t(messages.dashboard.email.preview.rendering)
              : t(messages.dashboard.email.preview.render)}
          </Button>
        </div>

        <HeaderFooterPreview
          branding={branding}
          body={
            preview ?? {
              subject: subjectKey ?? templateName,
              html: "",
            }
          }
        />
      </div>
    </Modal>
  );
}
