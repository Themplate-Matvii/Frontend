"use client";

import React from "react";
import Image from "next/image";
import clsx from "clsx";
import type { EmailBranding, TemplatePreviewResult } from "@/entities/email";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";

type HeaderFooterPreviewProps = {
  branding?: EmailBranding;
  headerHtml?: string;
  footerHtml?: string;
  body?: TemplatePreviewResult | null;
  showUnsubscribe?: boolean;
};

export function HeaderFooterPreview({
  branding,
  headerHtml,
  footerHtml,
  body,
  showUnsubscribe = true,
}: HeaderFooterPreviewProps) {
  const { t } = useI18n();

  const primary = branding?.primaryColor ?? "#2563eb";
  const background = branding?.backgroundColor ?? "#0b1224";
  const textColor = branding?.textColor ?? "#e5e7eb";
  const accent = branding?.accentColor ?? "#22d3ee";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div
        className="p-5"
        style={{
          background: `linear-gradient(135deg, ${primary}, ${accent})`,
          color: "#fff",
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <P className="text-base font-semibold text-white">
              {branding?.brandName || t(messages.dashboard.email.preview.brandingFallback)}
            </P>
            <Small className="text-white/80">
              {t(messages.dashboard.email.preview.brandingDescription)}
            </Small>
          </div>
          {(branding?.logoUrl || branding?.darkLogoUrl) && (
            <Image
              src={branding?.darkLogoUrl || branding?.logoUrl || ""}
              alt="logo"
              width={120}
              height={40}
              unoptimized
              className="h-10 w-auto rounded bg-white/10 p-2 shadow"
            />
          )}
        </div>
        {headerHtml ? (
          <div
            className="mt-4 rounded-lg bg-white/10 p-3 text-sm text-white/90"
            dangerouslySetInnerHTML={{ __html: headerHtml }}
          />
        ) : (
          <Small className="mt-3 block text-white/80">
            {t(messages.dashboard.email.preview.headerPlaceholder)}
          </Small>
        )}
      </div>

      <div
        className="space-y-3 p-5"
        style={{
          backgroundColor: background,
        }}
      >
        {body?.subject && (
          <P className="text-base font-semibold" style={{ color: textColor }}>
            {body.subject}
          </P>
        )}
        {body?.html ? (
          <div
            className="rounded-lg border border-border bg-background p-4"
            style={{ color: textColor }}
            dangerouslySetInnerHTML={{ __html: body.html }}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-background p-4 text-sm">
            <P className="text-sm" color={TextColorEnum.Secondary}>
              {t(messages.dashboard.email.preview.bodyPlaceholder)}
            </P>
          </div>
        )}
      </div>

      <div
        className={clsx(
          "space-y-2 border-t border-border p-5 text-sm",
        )}
        style={{
          backgroundColor: "#0b1224",
          color: "#cbd5e1",
        }}
      >
        {footerHtml ? (
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: footerHtml }}
          />
        ) : (
          <>
            {branding?.footerText ? (
              <P className="text-sm font-medium">{branding.footerText}</P>
            ) : (
              <P className="text-sm font-medium">
                {t(messages.dashboard.email.preview.footerPlaceholder)}
              </P>
            )}
            <Small className="text-xs text-slate-400">
              {branding?.supportEmail || branding?.supportUrl
                ? t(messages.dashboard.email.preview.footerSupport, {
                    email: branding.supportEmail ?? "support@example.com",
                    url: branding.supportUrl ?? "https://example.com",
                  })
                : t(messages.dashboard.email.preview.footerSupportDefault)}
            </Small>
          </>
        )}

        {showUnsubscribe && (
          <div className="pt-2">
            <Small className="text-xs text-slate-400">
              {t(messages.dashboard.email.preview.unsubscribeHint)}
            </Small>
          </div>
        )}
      </div>
    </div>
  );
}
