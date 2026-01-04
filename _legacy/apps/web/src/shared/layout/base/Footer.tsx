// src/shared/navigation/Footer.tsx
"use client";

import React from "react";
import { Container } from "@/shared/layout/Container";
import { Logo } from "@/shared/layout/Logo";
import { Small } from "@/shared/ui/Typography";
import { LanguageSwitcher } from "../../controls/LanguageSwitcher";
import { ThemeToggle } from "../../controls/ThemeToggle";
import { messages } from "@packages/locales";
import { t } from "i18next";
import { footerColumns, FooterSection, titleKeyMap } from "../../navigation/nav.config";
import { NavLinks } from "../../navigation/NavLinks";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface text-text">
      <Container className="pt-8 pb-6 sm:pt-10 sm:pb-4">
        {/* Grid: brand + links + utilities */}
        <div className="grid gap-8 sm:grid-cols-12">
          {/* Brand + utilities */}
          <div className="sm:col-span-4 lg:col-span-3 flex flex-col gap-4">
            <div>
              <Logo width={120} height={40} />
            </div>

            {/* Utilities appear directly under logo on mobile */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          {/* Link columns */}
          <div className="sm:col-span-8 lg:col-span-9">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(footerColumns).map(([sectionKey, links]) => {
                const key = sectionKey as FooterSection;  
                
                return (
                  <div key={sectionKey}>
                    {/* Localized section title */}
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      {t(messages.footer[titleKeyMap[key]])}
                    </div>

                    <NavLinks links={links} className="flex flex-col gap-2" />
                  </div>
                );
              }
              )}
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <Small className="mt-8 text-center block border-t border-border pt-4 text-muted">
          © {new Date().getFullYear()} SaaS Template
        </Small>
      </Container>
    </footer>
  );
};
