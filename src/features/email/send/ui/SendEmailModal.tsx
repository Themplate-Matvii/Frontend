"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MailCheck } from "lucide-react";
import {
  EmailApi,
  type BroadcastEmailRequest,
  type EmailCategory,
  type SendEmailRequest,
} from "@/entities/email";
import type { User } from "@/entities/user";
import { Languages } from "@/i18n/translations";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { Modal } from "@/shared/ui/modal/Modal";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { Select, Option } from "@/shared/ui/forms/Select";
import { Small, TextColorEnum } from "@/shared/ui/Typography";
import { toast } from "@/shared/ui/toast";

type RecipientMode = "all" | "selected" | "custom";

type SendEmailModalProps = {
  open: boolean;
  onClose: () => void;
  templateKey?: string;
  templateName: string;
  marketingTemplateId?: string;
  subjectKey?: string;
  category?: EmailCategory;
  defaultData?: Record<string, unknown>;
  users?: User[];
  canSendOne: boolean;
  canBroadcast: boolean;
};

const categories: EmailCategory[] = ["transactional", "marketing", "billing"];

export function SendEmailModal({
  open,
  onClose,
  templateKey,
  templateName,
  marketingTemplateId,
  subjectKey,
  category,
  defaultData = {},
  users = [],
  canSendOne,
  canBroadcast,
}: SendEmailModalProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<RecipientMode>(
    canBroadcast ? "all" : "custom",
  );
  const [userIds, setUserIds] = useState<string[]>([]);
  const [email, setEmail] = useState<string>("");
  const [payload, setPayload] = useState<string>(
    JSON.stringify(defaultData ?? {}, null, 2),
  );
  const [locale, setLocale] = useState<string>(Languages.en);
  const [subject, setSubject] = useState<string>(subjectKey ?? templateName);
  const [selectedCategory, setSelectedCategory] = useState<EmailCategory>(
    category ?? "transactional",
  );
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const sendEmail = EmailApi.useSendEmail();
  const broadcastEmail = EmailApi.useBroadcastEmail();

  useEffect(() => {
    if (!open) return;
    setUserIds([]);
    setEmail("");
    setPayload(JSON.stringify(defaultData ?? {}, null, 2));
    setLocale(Languages.en);
    setSubject(subjectKey ?? templateName);
    setSelectedCategory(category ?? "transactional");
    setStatus(null);
    setError(null);
    setMode(canBroadcast ? "all" : "custom");
  }, [open, defaultData, subjectKey, templateName, category, canBroadcast]);

  const userOptions: Option[] = useMemo(
    () =>
      users.map((u) => ({
        value: u.id,
        label: `${u.name || u.email} (${u.settings?.locale?.toUpperCase() ?? "?"})`,
      })),
    [users],
  );

  const parsedPayload = useMemo(() => {
    try {
      return payload?.trim() ? JSON.parse(payload) : {};
    } catch {
      return null;
    }
  }, [payload]);

  const modeOptions = useMemo(() => {
    const list: { value: RecipientMode; label: string }[] = [];
    if (canBroadcast) {
      list.push({
        value: "all",
        label: t(messages.dashboard.email.send.modes.all),
      });
      list.push({
        value: "selected",
        label: t(messages.dashboard.email.send.modes.selected),
      });
    }
    if (canSendOne) {
      list.push({
        value: "custom",
        label: t(messages.dashboard.email.send.modes.custom),
      });
    }
    return list;
  }, [canBroadcast, canSendOne, t]);

  const handleSend = async () => {
    setError(null);
    setStatus(null);

    if (!parsedPayload) {
      setError(t(messages.dashboard.email.send.invalidJson));
      return;
    }

    if (!canBroadcast && mode !== "custom") {
      setMode("custom");
      setError(t(messages.dashboard.email.send.broadcastNotAllowed));
      return;
    }

    if (mode === "selected" && (!userIds || userIds.length === 0)) {
      setError(t(messages.dashboard.email.send.usersRequired));
      return;
    }

    if (mode === "custom" && !email) {
      setError(t(messages.dashboard.email.send.emailRequired));
      return;
    }

    const base = {
      subjectKey: subject,
      category: selectedCategory,
      locale,
      data: parsedPayload,
    };

    try {
      if (marketingTemplateId) {
        const payload: BroadcastEmailRequest = {
          ...base,
          marketingTemplateId,
          userIds: mode === "selected" ? userIds : undefined,
        };
        await broadcastEmail.mutateAsync(payload);
      } else if (mode === "custom" || !canBroadcast) {
        const payload: SendEmailRequest = {
          ...base,
          to: email,
          template: templateKey ?? templateName,
          userId: userIds[0],
        };
        await sendEmail.mutateAsync(payload);
      } else {
        const payload: BroadcastEmailRequest = {
          ...base,
          template: templateKey ?? templateName,
          userIds: mode === "selected" ? userIds : undefined,
        };
        await broadcastEmail.mutateAsync(payload);
      }

      setStatus(t(messages.dashboard.email.send.success));
      toast.success(t(messages.notifications.email.sendSuccess));
    } catch {
      setError(t(messages.dashboard.email.send.failed));
      toast.error(t(messages.notifications.email.sendError));
    }
  };

  const loading = sendEmail.isPending || broadcastEmail.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(messages.dashboard.email.send.title, { template: templateName })}
      description={t(messages.dashboard.email.send.description)}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            id="mode"
            label={t(messages.dashboard.email.send.recipient)}
            footer={
              mode === "all" ? (
                <Small color={TextColorEnum.Secondary}>
                  {t(messages.dashboard.email.send.allHint)}
                </Small>
              ) : null
            }
          >
            <select
              id="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as RecipientMode)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text"
            >
              {modeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="category"
            label={t(messages.dashboard.email.send.category)}
          >
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as EmailCategory)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(messages.dashboard.email.categories[cat] ?? cat)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {mode === "selected" ? (
          <Field
            label={t(messages.dashboard.email.send.usersLabel)}
            footer={
              <Small color={TextColorEnum.Secondary}>
                {t(messages.dashboard.email.send.usersHint)}
              </Small>
            }
          >
            <Select
              value={userIds}
              options={userOptions}
              isMulti
              onChange={(val) => setUserIds(Array.isArray(val) ? val : [])}
            />
          </Field>
        ) : null}

        {mode === "custom" ? (
          <Field id="email" label={t(messages.dashboard.email.send.emailLabel)}>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t(messages.dashboard.email.send.emailPlaceholder)}
            />
          </Field>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            id="subjectKey"
            label={t(messages.dashboard.email.templates.subjectLabel)}
          >
            <Input
              id="subjectKey"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field>
          <Field
            id="locale"
            label={t(messages.dashboard.email.send.locale)}
          >
            <select
              id="locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text"
            >
              {Object.values(Languages).map((lng) => (
                <option key={lng} value={lng}>
                  {lng.toUpperCase()}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          id="payload"
          label={t(messages.dashboard.email.send.payloadLabel)}
          footer={
            <Small color={TextColorEnum.Secondary}>
              {t(messages.dashboard.email.send.payloadHint)}
            </Small>
          }
        >
          <textarea
            id="payload"
            className="h-40 w-full rounded-md border border-border bg-background p-3 font-mono text-sm text-text"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
        </Field>

        {error ? (
          <Small className="text-red-500">{error}</Small>
        ) : null}
        {status ? (
          <div className="flex items-center gap-2 text-green-500">
            <MailCheck size={16} />
            <Small>{status}</Small>
          </div>
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
            onClick={handleSend}
            disabled={loading}
          >
            {loading
              ? t(messages.dashboard.email.send.sending)
              : t(messages.dashboard.email.actions.send)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
