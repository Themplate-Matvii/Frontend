"use client";

import React from "react";
import { messages, useI18n } from "@packages/locales";
import { COMPANY } from "@packages/config";
import { Container, ContainerSizeEnum } from "@/shared/layout/Container";
import {
  H1,
  H2,
  Lead,
  P,
  Small,
  UL,
  TextColorEnum,
} from "@/shared/ui/Typography";
import { PageShell } from "@/shared/layout/PageShell";

export default function PrivacyPolicyClient() {
  const { t } = useI18n();

  return (
    <PageShell>
      <Container size={ContainerSizeEnum.Narrow} className="py-16">
        <div
          className="
            bg-surface border border-border rounded-xl
            shadow-[0_8px_20px_rgba(0,0,0,0.10)]
            dark:shadow-[0_8px_20px_rgba(0,0,0,0.35)]
            p-8 sm:p-10
          "
        >
          <H1 className="mb-6">{t(messages.privacyPolicy.title)}</H1>
          <Lead className="mb-6">{t(messages.privacyPolicy.intro)}</Lead>

          <section className="space-y-8">
            <div>
              <H2 className="mb-2">
                {t(messages.privacyPolicy.dataCollectionTitle)}
              </H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.privacyPolicy.dataCollectionText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.privacyPolicy.usageTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.privacyPolicy.usageText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.privacyPolicy.cookiesTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.privacyPolicy.cookiesText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.privacyPolicy.rightsTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.privacyPolicy.rightsText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">
                {t(messages.privacyPolicy.securityTitle)}
              </H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.privacyPolicy.securityText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.privacyPolicy.contactTitle)}</H2>
              <P className="mb-2" color={TextColorEnum.Secondary}>
                {t(messages.privacyPolicy.contactText)}
              </P>
              <UL color={TextColorEnum.Muted}>
                <li>Email: {COMPANY.email}</li>
                <li>Address: {COMPANY.address}</li>
              </UL>
            </div>
          </section>

          <Small
            className="mt-10 border-t border-border pt-4 block"
            color={TextColorEnum.Muted}
          >
            {t(messages.privacyPolicy.updated)} {COMPANY.lastUpdated}
          </Small>
        </div>
      </Container>
    </PageShell>
  );
}
