"use client";

import React, { useEffect, useState } from "react";

import {
  useUnsubscribePreferences,
  useUpdateUnsubscribePreferences,
} from "@packages/api/modules/communication/email";
import { messages, useI18n } from "@packages/locales";

import { Container } from "@/shared/layout/Container";
import { PageShell } from "@/shared/layout/PageShell";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";

type Props = {
  token: string;
};

export default function UnsubscribeClientPage({ token }: Props) {
  const { t } = useI18n();

  const {
    data: preferences,
    isLoading,
    isError,
    refetch,
  } = useUnsubscribePreferences(token, {
    enabled: Boolean(token),
  });

  const updatePreferences = useUpdateUnsubscribePreferences(token);

  const [marketing, setMarketing] = useState<boolean>(true);
  const [billing, setBilling] = useState<boolean>(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!preferences?.preferences) return;
    setMarketing(preferences.preferences.marketing !== false);
    setBilling(preferences.preferences.billing !== false);
  }, [preferences]);

  const handleSave = () => {
    setStatus(null);
    updatePreferences.mutate(
      {
        marketing,
        billing,
      },
      {
        onSuccess: () => {
          setStatus(t(messages.email.unsubscribe.saved));
        },
        onError: () => {
          setStatus(t(messages.email.unsubscribe.failed));
        },
      },
    );
  };

  const unsubscribeAll = () => {
    setMarketing(false);
    setBilling(false);
    updatePreferences.mutate(
      { marketing: false, billing: false },
      {
        onSuccess: () => setStatus(t(messages.email.unsubscribe.saved)),
        onError: () => setStatus(t(messages.email.unsubscribe.failed)),
      },
    );
  };

  const loading = isLoading || updatePreferences.isPending;

  return (
    <PageShell>
      <LoadingOverlay loading={loading} />
      <Container>
        <div className="mx-auto max-w-3xl space-y-4 py-6">
          <div className="space-y-1 text-center">
            <P className="text-2xl font-semibold">
              {t(messages.email.unsubscribe.title)}
            </P>
            <Small color={TextColorEnum.Secondary}>
              {t(messages.email.unsubscribe.subtitle)}
            </Small>
          </div>

          <SectionCard
            title={t(messages.email.unsubscribe.preferencesTitle)}
            description={t(messages.email.unsubscribe.preferencesSubtitle)}
          >
            {isError ? (
              <div className="space-y-2">
                <Small color={TextColorEnum.Danger}>
                  {t(messages.email.unsubscribe.error)}
                </Small>
                <Button
                  type="button"
                  size={ButtonSizeEnum.md}
                  variant={ButtonVariantEnum.primary}
                  onClick={() => refetch()}
                >
                  {t(messages.common.actions.tryAgain)}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-background p-4">
                  <Small className="block text-secondary">
                    {t(messages.email.unsubscribe.sendingTo)}
                  </Small>
                  <P className="text-sm font-medium">
                    {preferences?.email ?? "—"}
                  </P>
                  {preferences?.name ? (
                    <Small color={TextColorEnum.Secondary}>
                      {preferences.name}
                    </Small>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <P className="text-sm font-semibold">
                        {t(messages.email.unsubscribe.marketingLabel)}
                      </P>
                      <Small color={TextColorEnum.Secondary}>
                        {t(messages.email.unsubscribe.marketingDescription)}
                      </Small>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3">
                    <input
                      type="checkbox"
                      checked={billing}
                      onChange={(e) => setBilling(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <P className="text-sm font-semibold">
                        {t(messages.email.unsubscribe.billingLabel)}
                      </P>
                      <Small color={TextColorEnum.Secondary}>
                        {t(messages.email.unsubscribe.billingDescription)}
                      </Small>
                    </div>
                  </label>
                </div>

                <Small color={TextColorEnum.Secondary}>
                  {t(messages.email.unsubscribe.securityNote)}
                </Small>

                {status ? (
                  <Small
                    color={
                      status === t(messages.email.unsubscribe.failed)
                        ? TextColorEnum.Danger
                        : TextColorEnum.Success
                    }
                  >
                    {status}
                  </Small>
                ) : null}

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    size={ButtonSizeEnum.md}
                    variant={ButtonVariantEnum.secondary}
                    onClick={unsubscribeAll}
                  >
                    {t(messages.email.unsubscribe.unsubscribeAll)}
                  </Button>
                  <Button
                    type="button"
                    size={ButtonSizeEnum.md}
                    variant={ButtonVariantEnum.primary}
                    onClick={handleSave}
                  >
                    {t(messages.dashboard.email.branding.save)}
                  </Button>
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </Container>
    </PageShell>
  );
}
