"use client";

import React from "react";
import { messages, useI18n } from "@packages/locales";
import { COMPANY } from "@packages/config";
import { Container, ContainerSizeEnum } from "@/shared/layout/Container";
import { PageShell } from "@/shared/layout/PageShell";
import {
  H1,
  H2,
  Lead,
  P,
  Small,
  UL,
  TextColorEnum,
} from "@/shared/ui/Typography";

export default function TermsClient() {
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
          <H1 className="mb-6">{t(messages.terms.title)}</H1>
          <Lead className="mb-6">{t(messages.terms.intro)}</Lead>

          <section className="space-y-8">
            <div>
              <H2 className="mb-2">{t(messages.terms.acceptanceTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.terms.acceptanceText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.terms.useTitle)}</H2>
              <P color={TextColorEnum.Secondary}>{t(messages.terms.useText)}</P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.terms.paymentsTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.terms.paymentsText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.terms.ipTitle)}</H2>
              <P color={TextColorEnum.Secondary}>{t(messages.terms.ipText)}</P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.terms.terminationTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.terms.terminationText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.terms.disclaimerTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.terms.disclaimerText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.terms.governingLawTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.terms.governingLawText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.terms.contactTitle)}</H2>
              <P className="mb-2" color={TextColorEnum.Secondary}>
                {t(messages.terms.contactText)}
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
            {t(messages.terms.updated)} {COMPANY.lastUpdated}
          </Small>
        </div>
      </Container>
    </PageShell>
  );
}
