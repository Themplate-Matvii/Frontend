"use client";

import React from "react";
import { messages, useI18n } from "@packages/locales";
import { Container } from "@/shared/layout/Container";
import { H2, Lead, P, Small, TextColorEnum } from "@/shared/ui/Typography";

const faqKeys: Array<{ question: string; answer: string }> = [
  {
    question: messages.landing.faq.items.first.question,
    answer: messages.landing.faq.items.first.answer,
  },
  {
    question: messages.landing.faq.items.second.question,
    answer: messages.landing.faq.items.second.answer,
  },
  {
    question: messages.landing.faq.items.third.question,
    answer: messages.landing.faq.items.third.answer,
  },
];

export const FaqSection = () => {
  const { t } = useI18n();

  return (
    <section className="py-16" id="faq">
      <Container className="space-y-8">
        <div className="space-y-3 text-center">
          <H2>{t(messages.landing.faq.title)}</H2>
          <Lead className="mx-auto max-w-2xl">{t(messages.landing.faq.subtitle)}</Lead>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {faqKeys.map((item) => (
            <div
              key={item.question}
              className="rounded-2xl border border-border bg-background/60 p-5 shadow-sm"
            >
              <P className="font-semibold">{t(item.question)}</P>
              <Small color={TextColorEnum.Secondary} className="mt-2 block">
                {t(item.answer)}
              </Small>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
