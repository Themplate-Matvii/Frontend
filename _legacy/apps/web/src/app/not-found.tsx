"use client";

import Link from "next/link";
import { Header } from "@/shared/layout/base/Header";
import { Footer } from "@/shared/layout/base/Footer";
import { Button, ButtonSizeEnum } from "@/shared/ui/Button";
import { useI18n, messages } from "@packages/locales";
import { H1, Lead, Small } from "@/shared/ui/Typography";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <Header />
      <main className="flex-1 flex">
        <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide text-muted">
              404
            </div>

            <H1 className="mt-4">{t(messages.notFound.title)}</H1>

            <Lead className="mt-3">{t(messages.notFound.description)}</Lead>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/">
                <Button size={ButtonSizeEnum.md}>
                  {t(messages.notFound.goHome)}
                </Button>
              </Link>
            </div>

            <Small className="mt-8">{t(messages.notFound.hint)}</Small>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
