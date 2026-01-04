"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { messages, useI18n } from "@packages/locales";
import { Container } from "@/shared/layout/Container";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { H1, Lead, Small, TextColorEnum } from "@/shared/ui/Typography";

interface HeroSectionProps {
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export const HeroSection = ({ onPrimaryClick, onSecondaryClick }: HeroSectionProps) => {
  const { t } = useI18n();
  const router = useRouter();

  const goToPricing = () => {
    onSecondaryClick?.();
    router.push("/pricing");
  };

  const goToContact = () => {
    onPrimaryClick?.();
    const node = document.getElementById("contact");
    if (node) node.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
      <Container className="relative flex flex-col gap-8 pb-16 pt-12 md:flex-row md:items-center md:pt-16">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>{t(messages.landing.hero.eyebrow)}</span>
          </div>
          <div className="space-y-4">
            <H1>{t(messages.landing.hero.title)}</H1>
            <Lead>{t(messages.landing.hero.subtitle)}</Lead>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size={ButtonSizeEnum.md} onClick={goToContact}>
              {t(messages.landing.hero.primaryCta)}
            </Button>
            <Button
              size={ButtonSizeEnum.md}
              variant={ButtonVariantEnum.secondary}
              onClick={goToPricing}
            >
              {t(messages.landing.hero.secondaryCta)}
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <Small color={TextColorEnum.Secondary}>{t(messages.landing.hero.badgePrimary)}</Small>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <Small color={TextColorEnum.Secondary}>{t(messages.landing.hero.badgeSecondary)}</Small>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex flex-1 justify-end md:mt-0">
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between text-sm text-muted">
              <span>{t(messages.landing.hero.previewTitle)}</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {t(messages.landing.hero.previewBadge)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-3 rounded-xl bg-secondary/5 p-4">
                <Small className="font-semibold text-primary">{t(messages.landing.hero.previewBlockA)}</Small>
                <div className="h-10 rounded-md bg-primary/10" />
                <div className="h-10 rounded-md bg-primary/10" />
              </div>
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4">
                <Small className="font-semibold text-secondary">{t(messages.landing.hero.previewBlockB)}</Small>
                <div className="h-16 rounded-md bg-muted/40" />
                <div className="h-8 rounded-md bg-muted/40" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
