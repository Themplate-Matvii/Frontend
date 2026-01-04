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

export default function CookiesClient() {
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
          <H1 className="mb-6">{t(messages.cookies.title)}</H1>
          <Lead className="mb-6">{t(messages.cookies.intro)}</Lead>

          <section className="space-y-8">
            <div>
              <H2 className="mb-2">{t(messages.cookies.whatAreTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.cookies.whatAreText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.cookies.typesTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.cookies.typesText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.cookies.usageTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.cookies.usageText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.cookies.manageTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.cookies.manageText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.cookies.thirdPartyTitle)}</H2>
              <P color={TextColorEnum.Secondary}>
                {t(messages.cookies.thirdPartyText)}
              </P>
            </div>

            <div>
              <H2 className="mb-2">{t(messages.cookies.contactTitle)}</H2>
              <P className="mb-2" color={TextColorEnum.Secondary}>
                {t(messages.cookies.contactText)}
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
            {t(messages.cookies.updated)} {COMPANY.lastUpdated}
          </Small>
        </div>
      </Container>
    </PageShell>
  );
}
