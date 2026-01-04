"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/shared/layout/Logo";
import { Container } from "@/shared/layout/Container";
import { headerLinks } from "@/shared/config/navigation";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { LanguageSwitcher } from "@/widgets/app-shell/controls/LanguageSwitcher";
import { ThemeToggle } from "@/widgets/app-shell/controls/ThemeToggle";
import { NavLinks } from "@/widgets/site-shell/NavLinks";
import UserMenu from "@/widgets/app-shell/controls/UserMenu";

export const Header = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [userMenuEpoch, setUserMenuEpoch] = useState(0);

  const toggleBurger = () => {
    setOpen((v) => {
      const next = !v;
      if (next) setUserMenuEpoch((e) => e + 1);
      return next;
    });
  };

  const closeBurgerBeforeUserMenu = () => {
    if (open) setOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-background text-text border-b border-secondary backdrop-blur-md bg-background/90">
        <Container className="flex items-center justify-between py-3 px-3 md:py-4">
          <div className="shrink-0">
            <Logo />
          </div>

          {/* desktop */}
          <nav className="hidden md:flex items-center gap-6 !mt-0">
            <NavLinks links={headerLinks} />
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu key={userMenuEpoch} />
          </nav>

          {/* mobile */}
          <div className="flex items-center gap-2 md:hidden !mt-0">
            <div className="scale-90 origin-right" onPointerDown={closeBurgerBeforeUserMenu}>
              <UserMenu key={userMenuEpoch} />
            </div>

            <button
              className="p-2 rounded-lg hover:bg-primary/10"
              onClick={toggleBurger}
              aria-label={t(messages.common.actions.toggleMenu)}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </Container>

        {open && (
          <div
            id="mobile-menu"
            className="absolute top-full left-0 w-full z-40 border-t border-secondary bg-background"
          >
            <Container className="py-3 space-y-3">
              <NavLinks
                links={headerLinks}
                onClick={() => setOpen(false)}
                className="flex flex-col gap-3"
              />
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </Container>
          </div>
        )}
      </header>

      <div className="h-[64px] md:h-[72px]" />
    </>
  );
};
