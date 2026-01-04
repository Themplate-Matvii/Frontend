"use client";

import clsx from "clsx";
import { LogOut, X } from "lucide-react";
import { Logo } from "@/shared/layout/Logo";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { messages, useI18n } from "@packages/locales";
import { SidebarNavList } from "./SidebarNavList";
import { SidebarAccount } from "./SidebarAccount";
import { NavItem } from "./types";

type SidebarMobileDrawerProps = {
  open: boolean;
  items: NavItem[];
  onClose: () => void;
  onLogout: () => void;
};

export const SidebarMobileDrawer = ({
  open,
  items,
  onClose,
  onLogout,
}: SidebarMobileDrawerProps) => {
  const { t } = useI18n();

  return (
    <div
      className={clsx(
        "md:hidden fixed inset-0 z-50 transition-opacity duration-300",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        className={clsx(
          "absolute inset-0 transition-opacity duration-300 bg-black/40",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          "absolute inset-y-0 left-0 w-72 bg-background text-text border-r border-border transition-transform duration-300 ease-in-out flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="h-14 px-3 py-2 flex items-center justify-between border-b border-border">
          <Logo width={120} height={24} />
          <Button
            type="button"
            variant={ButtonVariantEnum.secondary}
            size={ButtonSizeEnum.sm}
            onClick={onClose}
            className={clsx(
              "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border",
              "hover:bg-surface transition-all duration-300",
              "!px-0 !py-0" // removes default padding
            )}
          >
            <X size={18} />
          </Button>
        </div>

        <SidebarAccount
          isExpanded
          variant="mobile"
          onAfterNavigate={onClose}
        />

        <nav className="flex-1 overflow-y-auto py-2">
          <SidebarNavList
            items={items}
            isExpanded
            translate={t}
            onItemClick={onClose}
          />
        </nav>

        <div className="p-3 border-t border-border">
          <Button
            size={ButtonSizeEnum.md}
            variant={ButtonVariantEnum.primary}
            onClick={onLogout}
            aria-label={t(messages.auth.logout)}
            title={t(messages.auth.logout)}
            className="w-full"
          >
            <LogOut size={18} className="shrink-0" />
            <span className="ml-2">{t(messages.auth.logout)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
