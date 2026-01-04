"use client";

import * as React from "react";
import { PageShell } from "@/shared/layout/PageShell";
import { Container, ContainerSizeEnum } from "@/shared/layout/Container";
import { H1, Lead, Small, TextColorEnum } from "@/shared/ui/Typography";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";

type AuthViewProps = {
  /** Title node (i18n outside) */
  title: React.ReactNode;
  /** Subtitle/lead under the title */
  description?: React.ReactNode;
  /** Main form element to render */
  form: React.ReactNode;
  /** Alerts above the form */
  topAlertSlot?: React.ReactNode;
  /** Divider label above social block */
  dividerLabel?: React.ReactNode;
  /** Social block */
  socialSlot?: React.ReactNode;
  /** Row with links under social block */
  linksRowSlot?: React.ReactNode;
  /** Footer muted note */
  footerNote?: React.ReactNode;
  /** Optional card classes and max width */
  className?: string;
  maxWidthClassName?: string;
  /** Shows a translucent overlay with a spinner */
  loading?: boolean;
};

/**
 * AuthView: shared shell for all auth pages.
 * Visual layout matches existing Sign In card.
 */
export const AuthView = ({
  title,
  description,
  form,
  topAlertSlot,
  dividerLabel,
  socialSlot,
  linksRowSlot,
  footerNote,
  className,
  maxWidthClassName = "max-w-lg",
  loading = false,
}: AuthViewProps) => {
  return (
    <PageShell>
      <Container size={ContainerSizeEnum.Narrow} className="py-16">
        <div
          className={[
            "relative bg-surface border border-border rounded-xl",
            "shadow-[0_8px_20px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.35)]",
            "p-8 sm:p-10 w-full mx-auto",
            maxWidthClassName,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Loading overlay */}
          <LoadingOverlay loading={loading} />

          {/* Header */}
          <H1 className="mb-2">{title}</H1>
          {description ? <Lead className="mb-6">{description}</Lead> : null}

          {/* Alerts above the form */}
          {topAlertSlot}

          {/* Injected form */}
          {form}

          {/* Social section */}
          {socialSlot ? (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                {dividerLabel ? (
                  <Small color={TextColorEnum.Muted}>{dividerLabel}</Small>
                ) : null}
                <div className="h-px flex-1 bg-border" />
              </div>
              {socialSlot}
            </>
          ) : null}

          {/* Links row */}
          {linksRowSlot ? (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm gap-2 sm:gap-0 text-center">
              {linksRowSlot}
            </div>
          ) : null}

          {/* Footer note */}
          {footerNote ? (
            <Small
              color={TextColorEnum.Muted}
              className="block text-center mt-6 border-t border-border pt-4"
            >
              {footerNote}
            </Small>
          ) : null}
        </div>
      </Container>
    </PageShell>
  );
};
