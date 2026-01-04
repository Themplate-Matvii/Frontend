"use client";

import React from "react";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { Container } from "@/shared/layout/Container";
import { Button, ButtonVariantEnum } from "@/shared/ui/Button";
import { H2, Lead, P, TextColorEnum } from "@/shared/ui/Typography";

interface ShowcaseSectionProps {
  onCtaClick?: () => void;
}

export const ShowcaseSection = ({ onCtaClick }: ShowcaseSectionProps) => {
  const { t } = useI18n();

  return (
    <section className="py-16">
      <Container className="flex flex-col gap-10 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <H2>{t(messages.landing.showcase.title)}</H2>
          <Lead>{t(messages.landing.showcase.subtitle)}</Lead>
          <div className="space-y-2">
            <P color={TextColorEnum.Secondary}>{t(messages.landing.showcase.pointOne)}</P>
            <P color={TextColorEnum.Secondary}>{t(messages.landing.showcase.pointTwo)}</P>
            <P color={TextColorEnum.Secondary}>{t(messages.landing.showcase.pointThree)}</P>
          </div>
          <Button variant={ButtonVariantEnum.secondary} onClick={onCtaClick}>
            {t(messages.landing.showcase.cta)}
          </Button>
        </div>

        <div className="flex flex-1 justify-end">
          <div className="relative h-full w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-surface to-secondary/10 p-8 shadow-lg">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-background/60 p-4 shadow-sm">
                <P className="font-semibold">{t(messages.landing.showcase.cardOne.title)}</P>
                <P color={TextColorEnum.Secondary} className="mt-2">
                  {t(messages.landing.showcase.cardOne.body)}
                </P>
              </div>
              <div className="rounded-lg border border-dashed border-border p-4">
                <P className="font-semibold">{t(messages.landing.showcase.cardTwo.title)}</P>
                <P color={TextColorEnum.Secondary} className="mt-2">
                  {t(messages.landing.showcase.cardTwo.body)}
                </P>
              </div>
              <div className="col-span-2 rounded-lg bg-primary/10 p-4">
                <P className="font-semibold text-primary">{t(messages.landing.showcase.cardThree.title)}</P>
                <P color={TextColorEnum.Secondary} className="mt-2">
                  {t(messages.landing.showcase.cardThree.body)}
                </P>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
