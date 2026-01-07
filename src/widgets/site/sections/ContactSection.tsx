"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { FeedbackApi } from "@/entities/communication/feedback";
import { Container } from "@/shared/layout/Container";
import { Button, ButtonSizeEnum } from "@/shared/ui/Button";
import { H2, Lead, P, Small, TextColorEnum } from "@/shared/ui/Typography";
import Input from "@/shared/ui/forms/Input";
import { toast } from "@/shared/ui/toast/toast";

interface ContactSectionProps {
  onSubmit?: () => void;
}

export const ContactSection = ({ onSubmit }: ContactSectionProps) => {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () =>
      FeedbackApi.feedbackService.create({
        name: name || undefined,
        email: email || undefined,
        phone,
        comment: message || undefined,
      }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!phone.trim()) {
      setStatus(t(messages.validation.required));
      return;
    }

    try {
      onSubmit?.();
      await mutateAsync();
      setStatus(t(messages.landing.contact.success));
      toast.success(t(messages.notifications.contact.success));
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (error: any) {
      const msg = error?.response?.data?.message as string;
      const message = msg || t(messages.errors.generic);
      setStatus(message);
      toast.error(t(messages.notifications.contact.error));
    }
  };

  return (
    <section className="bg-surface/40 py-16" id="contact">
      <Container className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <H2>{t(messages.landing.contact.title)}</H2>
          <Lead>{t(messages.landing.contact.subtitle)}</Lead>
          <P color={TextColorEnum.Secondary}>
            {t(messages.landing.contact.helper)}
          </P>
        </div>

        <div className="rounded-2xl border border-border bg-background/70 p-6 shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Small className="mb-1 block" color={TextColorEnum.Secondary}>
                {t(messages.landing.contact.form.name)}
              </Small>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t(messages.landing.contact.form.namePlaceholder)}
              />
            </div>

            <div>
              <Small className="mb-1 block" color={TextColorEnum.Secondary}>
                {t(messages.landing.contact.form.email)}
              </Small>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t(messages.landing.contact.form.emailPlaceholder)}
              />
            </div>

            <div>
              <Small className="mb-1 block" color={TextColorEnum.Secondary}>
                {t(messages.landing.contact.form.phone)}
              </Small>
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t(messages.landing.contact.form.phonePlaceholder)}
              />
            </div>

            <div>
              <Small className="mb-1 block" color={TextColorEnum.Secondary}>
                {t(messages.landing.contact.form.message)}
              </Small>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t(
                  messages.landing.contact.form.messagePlaceholder,
                )}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                rows={4}
              />
            </div>

            {status && (
              <Small color={TextColorEnum.Secondary} className="block text-sm">
                {status}
              </Small>
            )}

            <Button
              type="submit"
              size={ButtonSizeEnum.md}
              disabled={isPending}
              className="w-full"
            >
              {isPending
                ? t(messages.landing.contact.form.pending)
                : t(messages.landing.contact.form.submit)}
            </Button>
          </form>
        </div>
      </Container>
    </section>
  );
};
