"use client";

import React from "react";
import { useI18n } from "@packages/locales";
import { PageShell } from "@/shared/layout/PageShell";
import {
  FeatureSection,
  HeroSection,
  ShowcaseSection,
  MetricsSection,
  FaqSection,
  ContactSection,
} from "@/shared/components/site";
import { useTrafficTracking } from "@/hooks/analytics/useTrafficTracking";

const LANDING_ID = "site-home";

export default function SiteHomePage() {
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
}
