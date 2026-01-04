"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  EmailApi,
  type CreateMarketingTemplateRequest,
  type EmailCategory,
  type MarketingTemplate,
} from "@/entities/email";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { Modal } from "@/shared/ui/modal/Modal";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { Small, TextColorEnum } from "@/shared/ui/Typography";

type MarketingTemplateModalProps = {
  open: boolean;
  onClose: () => void;
  template?: MarketingTemplate | null;
};

const categories: EmailCategory[] = ["marketing", "billing", "transactional"];

export function MarketingTemplateModal({
  open,
  onClose,
  template,
}: MarketingTemplateModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [subjectKey, setSubjectKey] = useState<string>("");
  const [translations, setTranslations] = useState<string>("{}");
  const [hbs, setHbs] = useState<string>("");
  const [previewData, setPreviewData] = useState<string>("{}");
  const [category, setCategory] = useState<EmailCategory>("marketing");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const isEditing = Boolean(template?.id);

  const createMutation = EmailApi.useCreateMarketingTemplate();
  const updateMutation = EmailApi.useUpdateMarketingTemplate(template?.id);

  useEffect(() => {
    if (!open) return;
    setName(template?.name ?? "");
    setDescription(template?.description ?? "");
    setSubjectKey(template?.subjectKey ?? "");
    setTranslations(
      JSON.stringify(template?.translations ?? { en: {}, ru: {} }, null, 2),
    );
    setHbs(template?.hbs ?? "");
    setPreviewData(JSON.stringify(template?.previewData ?? {}, null, 2));
    setCategory(template?.category ?? "marketing");
    setError(null);
    setStatus(null);
  }, [open, template]);

  const parsedTranslations = useMemo(() => {
    try {
      return translations?.trim() ? JSON.parse(translations) : {};
    } catch {
      return null;
    }
  }, [translations]);

  const parsedPreviewData = useMemo(() => {
    try {
      return previewData?.trim() ? JSON.parse(previewData) : {};
    } catch {
      return null;
    }
  }, [previewData]);

  const handleSave = async () => {
    setError(null);
    setStatus(null);

    if (!name || !subjectKey || !hbs) {
      setError(t(messages.dashboard.email.marketing.required));
      return;
    }
    if (!parsedTranslations) {
      setError(t(messages.dashboard.email.marketing.invalidTranslations));
      return;
    }
    if (!parsedPreviewData) {
      setError(t(messages.dashboard.email.marketing.invalidPreviewData));
      return;
    }

    const payload: CreateMarketingTemplateRequest = {
      name,
      description: description || undefined,
      subjectKey,
      translations: parsedTranslations,
      hbs,
      previewData: parsedPreviewData,
      category,
    };

    try {
      if (isEditing && template?.id) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      setStatus(t(messages.dashboard.email.marketing.saved));
      onClose();
    } catch {
      setError(t(messages.dashboard.email.marketing.failed));
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isEditing
          ? t(messages.dashboard.email.marketing.editTitle)
          : t(messages.dashboard.email.marketing.createTitle)
      }
      description={t(messages.dashboard.email.marketing.description)}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            id="name"
            label={t(messages.dashboard.email.marketing.name)}
          >
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(messages.dashboard.email.marketing.namePlaceholder)}
            />
          </Field>
          <Field
            id="subjectKey"
            label={t(messages.dashboard.email.templates.subjectLabel)}
          >
            <Input
              id="subjectKey"
              value={subjectKey}
              onChange={(e) => setSubjectKey(e.target.value)}
            />
          </Field>
        </div>

        <Field
          id="description"
          label={t(messages.dashboard.email.marketing.descriptionLabel)}
        >
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t(messages.dashboard.email.marketing.descriptionPlaceholder)}
          />
        </Field>

        <Field
          id="category"
          label={t(messages.dashboard.email.marketing.categoryLabel)}
        >
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as EmailCategory)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {t(messages.dashboard.email.categories[cat] ?? cat)}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="translations"
          label={t(messages.dashboard.email.marketing.translationsLabel)}
          footer={
            <Small color={TextColorEnum.Secondary}>
              {t(messages.dashboard.email.marketing.translationsHint)}
            </Small>
          }
        >
          <textarea
            id="translations"
            className="h-40 w-full rounded-md border border-border bg-background p-3 font-mono text-sm text-text"
            value={translations}
            onChange={(e) => setTranslations(e.target.value)}
          />
        </Field>

        <Field
          id="hbs"
          label={t(messages.dashboard.email.marketing.hbsLabel)}
          footer={
            <Small color={TextColorEnum.Secondary}>
              {t(messages.dashboard.email.marketing.hbsHint)}
            </Small>
          }
        >
          <textarea
            id="hbs"
            className="h-32 w-full rounded-md border border-border bg-background p-3 font-mono text-sm text-text"
            value={hbs}
            onChange={(e) => setHbs(e.target.value)}
          />
        </Field>

        <Field
          id="previewData"
          label={t(messages.dashboard.email.marketing.previewDataLabel)}
          footer={
            <Small color={TextColorEnum.Secondary}>
              {t(messages.dashboard.email.marketing.previewDataHint)}
            </Small>
          }
        >
          <textarea
            id="previewData"
            className="h-32 w-full rounded-md border border-border bg-background p-3 font-mono text-sm text-text"
            value={previewData}
            onChange={(e) => setPreviewData(e.target.value)}
          />
        </Field>

        {error ? <Small className="text-red-500">{error}</Small> : null}
        {status ? (
          <Small className="text-green-500">{status}</Small>
        ) : null}

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
            onClick={handleSave}
            disabled={loading}
          >
            {loading
              ? t(messages.dashboard.email.marketing.saving)
              : t(messages.dashboard.email.marketing.save)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
