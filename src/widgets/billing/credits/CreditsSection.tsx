"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { P, Small } from "@/shared/ui/Typography";
import Tooltip from "@/shared/ui/Tooltip";

type Props = {
  aiCredits: number;
};

export function CreditsSection({ aiCredits }: Props) {
  const { t } = useI18n();

  return (
    <SectionCard
      title={t(messages.dashboard.billing.credits.title)}
      description={t(messages.dashboard.billing.credits.description)}
      bodyClassName="flex items-center justify-between gap-4"
    >
      <div className="space-y-2">
        <P className="font-semibold">
          {t(messages.common.aiCreditsLabel)}
        </P>
        <Small>
          {t(messages.dashboard.billing.credits.hint)}
        </Small>
      </div>
      <Tooltip content={t(messages.tooltips.aiCredits)}>
        <div className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3">
          <Sparkles className="text-primary" size={20} />
          <div className="text-xl font-bold text-primary">
            {aiCredits}
          </div>
        </div>
      </Tooltip>
    </SectionCard>
  );
}
