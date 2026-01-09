"use client";

import React from "react";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { Container } from "@/shared/layout/Container";
import { PageShell } from "@/shared/layout/PageShell";
import { Button, ButtonVariantEnum } from "@/shared/ui/Button";
import { toast } from "@/shared/ui/toast/toast";

export const DashboardHomePage = () => {
  const { t } = useI18n();
  const showDevToast = process.env.NODE_ENV !== "production";

  return (
    <PageShell>
      <Container className="p-8">
        <h1 className="text-3xl font-bold">{t(messages.dashboard.index.title)}</h1>
        <p className="mt-4 text-lg">{t(messages.dashboard.index.subtitle)}</p>
        {showDevToast && (
          <div className="mt-6">
            <Button
              type="button"
              variant={ButtonVariantEnum.secondary}
              onClick={() => toast.info("Manual QA toast")}
            >
              Show toast
            </Button>
          </div>
        )}
      </Container>
    </PageShell>
  );
};
