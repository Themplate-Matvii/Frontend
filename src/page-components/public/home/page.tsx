"use client";

import React from "react";
import { useI18n } from "@/shared/lib/i18n";
import { PageShell } from "@/shared/layout/PageShell";
import {
  FeatureSection,
  HeroSection,
  ShowcaseSection,
  MetricsSection,
  FaqSection,
  ContactSection,
} from "@/widgets/site/sections";
import { useTrafficTracking } from "@/entities/analytics";

const LANDING_ID = "site-home";

export const PublicHomePage = () => {
  const { i18n } = useI18n();
  const { trackClick, trackFormSubmit } = useTrafficTracking({
    landingId: LANDING_ID,
    language: i18n.language,
    autoTrackPageView: true,
  });

  return (
    <PageShell>
      <HeroSection onPrimaryClick={trackClick} onSecondaryClick={trackClick} />
      <FeatureSection />
      <ShowcaseSection onCtaClick={trackClick} />
      <MetricsSection />
      <FaqSection />
      <ContactSection onSubmit={trackFormSubmit} />
    </PageShell>
  );
};
