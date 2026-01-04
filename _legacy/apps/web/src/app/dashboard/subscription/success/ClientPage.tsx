"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { messages, useI18n } from "@packages/locales";
import { Container } from "@/shared/layout/Container";
import { PageShell } from "@/shared/layout/PageShell";
import {
  Button,
  ButtonSizeEnum,
  ButtonVariantEnum,
} from "@/shared/ui/Button";
import { H1, Lead, P, TextColorEnum } from "@/shared/ui/Typography";
import { useAuth } from "@packages/api/context/AuthContext";

export default function SubscriptionSuccessClientPage() {
  const { t } = useI18n();
  const params = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const type = params.get("type");
  const isSubscription = type !== "one_time";

  const title = isSubscription
    ? t(messages.dashboard.billing.success.subscriptionTitle)
    : t(messages.dashboard.billing.success.oneTimeTitle);

  const description = isSubscription
    ? t(messages.dashboard.billing.success.subscriptionDescription)
    : t(messages.dashboard.billing.success.oneTimeDescription);

  const note = isSubscription
    ? t(messages.dashboard.billing.success.subscriptionNote)
    : t(messages.dashboard.billing.success.oneTimeNote);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  return (
    <PageShell>
      <Container className="py-12 space-y-6 max-w-2xl">
        <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-success">
          <CheckCircle2 size={24} />
          <P className="font-semibold text-success">
            {t(messages.dashboard.billing.success.title)}
          </P>
        </div>

        <header className="space-y-3">
          <H1>{title}</H1>
          <Lead color={TextColorEnum.Secondary}>
            {description}
          </Lead>
        </header>

        <P>
          {note}
        </P>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            size={ButtonSizeEnum.md}
            variant={ButtonVariantEnum.primary}
            onClick={() => router.push("/dashboard/subscription")}
          >
            {t(messages.dashboard.billing.success.backToBilling)}
          </Button>
        </div>
      </Container>
    </PageShell>
  );
}
