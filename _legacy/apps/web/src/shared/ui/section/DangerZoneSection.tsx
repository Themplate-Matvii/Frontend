"use client";

import React from "react";

import { messages, useI18n } from "@packages/locales";
import {
  P,
  Small,
  TextColorEnum,
} from "@/shared/ui/Typography";
import {
  Button,
  ButtonSizeEnum,
  ButtonVariantEnum,
} from "@/shared/ui/Button";

type DangerZoneSectionProps = {
  titleKey: string;
  descriptionKey?: string;
  buttonLabelKey: string;
  onClick: () => void;
  disabled?: boolean;
};

export function DangerZoneSection({
  titleKey,
  descriptionKey = "",
  buttonLabelKey,
  onClick,
  disabled,
}: DangerZoneSectionProps) {
  const { t } = useI18n();

  return (
    <section className="rounded-xl border border-danger bg-dangerSoft p-4 lg:p-5">
      <div className="flex flex-wrap items-center gap-4">
        {/* TEXT BLOCK – minimum 50% */}
        <div className="flex-1 min-w-[50%] space-y-1">
          <P className="text-sm font-semibold" color={TextColorEnum.Danger}>
            {t(titleKey)}
          </P>
          <Small color={TextColorEnum.Danger}>{t(descriptionKey)}</Small>
        </div>

        {/* BUTTON BLOCK */}
        <div className="flex-shrink-0 min-w-[200px] lg:min-w-[auto] lg:flex-none w-full lg:w-auto self-end lg:self-center">
          <Button
            type="button"
            size={ButtonSizeEnum.md}
            variant={ButtonVariantEnum.danger}
            onClick={onClick}
            disabled={disabled}
            className="w-full lg:w-auto"
          >
            {t(buttonLabelKey)}
          </Button>
        </div>
      </div>
    </section>
  );
};
