"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Activity,
  BarChart3,
  CreditCard,
  Image,
  LayoutDashboard,
  LineChart as LineChartIcon,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Users2,
} from "lucide-react";

import { useAuth } from "@/entities/identity";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import { LanguageSwitcher } from "@/widgets/app-shell/controls/LanguageSwitcher";
import { SidebarNavList } from "./SidebarNavList";
import { SidebarAccount } from "./SidebarAccount";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarMobileDrawer } from "./SidebarMobileDrawer";
import { NavItem, SidebarProps } from "./types";
import { useAppPermissions } from "@/entities/identity";

export function Sidebar({
  onLogoutClick,
  bottomSlot,
  defaultCollapsed = false,
}: SidebarProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const { logout } = useAuth();
  const {
    users: usersPermissions,
    feedback: feedbackPermissions,
    subscriptions: subscriptionsPermissions,
    analitycs_traffic: analitycsTrafficPermissions,
    analitycs_business: analitycsBusinessPermissions,
    email: emailPermissions,
  } = useAppPermissions();

  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);
  const [pinned, setPinned] = useState<boolean>(!defaultCollapsed);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [hoverExpanded, setHoverExpanded] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const items: NavItem[] = useMemo(
    () => [
      {
        href: "/dashboard",
        label: messages.dashboard.sidebar.items.dashboard,
        icon: LayoutDashboard,
        canView: true,
      },
      {
        href: "/dashboard/users",
        label: messages.dashboard.sidebar.items.users,
        icon: Users2,
        canView: usersPermissions.any.view,
      },
      {
        href: "/dashboard/media",
        label: messages.dashboard.sidebar.items.media,
        icon: Image,
        canView: true,
      },
      {
        href: "/dashboard/subscription",
        label: messages.dashboard.sidebar.items.subscription,
        icon: CreditCard,
        canView: subscriptionsPermissions.own.view,
      },
      {
        href: "/dashboard/email",
        label: messages.dashboard.sidebar.items.email,
        icon: Mail,
        canView: emailPermissions.one || emailPermissions.broadcast,
      },
      {
        href: "/dashboard/feedback",
        label: messages.dashboard.sidebar.items.feedback,
        icon: MessageSquare,
        canView: feedbackPermissions.view,
      },
      {
        label: messages.dashboard.sidebar.items.analytics,
        icon: BarChart3,
        canView:
          analitycsTrafficPermissions.view || analitycsBusinessPermissions.view,
        children: [
          {
            href: "/dashboard/analytics/traffic",
            label: messages.dashboard.sidebar.items.analyticsTraffic,
            icon: Activity,
            canView: analitycsTrafficPermissions.view,
          },
          {
            href: "/dashboard/analytics/business",
            label: messages.dashboard.sidebar.items.analyticsBusiness,
            icon: LineChartIcon,
            canView: analitycsBusinessPermissions.view,
          },
        ],
      },
    ],
    [
      usersPermissions.any.view,
      feedbackPermissions.view,
      subscriptionsPermissions.own.view,
      emailPermissions.broadcast,
      emailPermissions.one,
      analitycsTrafficPermissions.view,
      analitycsBusinessPermissions.view,
    ],
  );

  const isExpanded = pinned || hoverExpanded;

  const handleLogout = useCallback(() => {
    if (onLogoutClick) return onLogoutClick();
    logout();
  }, [onLogoutClick, logout]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const onEnter = useCallback(() => {
    setIsHovering(true);
    if (collapsed && !pinned) setHoverExpanded(true);
  }, [collapsed, pinned]);

  const onLeave = useCallback(() => {
    setIsHovering(false);
    if (!pinned) setHoverExpanded(false);
  }, [pinned]);

  const onClickSidebar = useCallback(() => {
    if (!pinned) {
      setPinned(true);
      setCollapsed(false);
      setHoverExpanded(false);
    }
  }, [pinned]);

  const onTogglePin = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setHoverExpanded(true);
      if (pinned) {
        setPinned(false);
        setCollapsed(true);
        setHoverExpanded(true);
      } else {
        setPinned(true);
        setCollapsed(false);
        setHoverExpanded(false);
      }
    },
    [pinned],
  );

  return (
    <>
      {!mobileOpen && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <Button
              size={ButtonSizeEnum.md}
              variant={ButtonVariantEnum.primary}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      )}

      <aside
        className={clsx(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 z-10",
          "bg-surface text-text border-r border-border",
          "transition-[width] duration-300 ease-in-out motion-reduce:transition-none",
          isExpanded ? "md:w-64" : "md:w-16",
        )}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onClickSidebar}
        aria-expanded={isExpanded}
      >
        <SidebarHeader
          isExpanded={isExpanded}
          pinned={pinned}
          isHovering={isHovering}
          onTogglePin={onTogglePin}
          onMouseDownPin={() => setHoverExpanded(true)}
          toggleTooltip={t(messages.tooltips.sidebarToggle)}
          toggleTooltipPinned={t(messages.tooltips.sidebarTogglePinned)}
        />

        <SidebarAccount isExpanded={isExpanded} variant="desktop" />

        <nav className="flex-1 overflow-y-auto py-2">
          <SidebarNavList
            items={items}
            isExpanded={isExpanded}
            translate={t}
            onItemClick={() => setMobileOpen(false)}
          />
        </nav>

        {bottomSlot && (
          <div
            className={clsx(
              "border-t border-border",
              isExpanded ? "px-3 py-2" : "px-2 py-2",
            )}
          >
            {bottomSlot}
          </div>
        )}

        <div
          className={clsx(
            "border-t border-border",
            isExpanded ? "p-3" : "p-2",
          )}
        >
          <Button
            size={ButtonSizeEnum.md}
            variant={ButtonVariantEnum.primary}
            onClick={(event) => {
              event.stopPropagation();
              handleLogout();
            }}
            aria-label={t(messages.auth.logout)}
            title={t(messages.auth.logout)}
            className="w-full justify-center transition-all"
          >
            <LogOut size={18} className="shrink-0" />
            <span
              className={clsx(
                "ml-2 overflow-hidden transition-[opacity,transform,max-width] duration-200 ease-in-out motion-reduce:transition-none",
                isExpanded
                  ? "max-w-[120px] opacity-100 translate-x-0"
                  : "max-w-0 opacity-0 -translate-x-2",
              )}
            >
              {t(messages.auth.logout)}
            </span>
          </Button>
        </div>
      </aside>

      <div
        className={clsx(
          "hidden md:block shrink-0 transition-[width] duration-300 ease-in-out motion-reduce:transition-none",
          isExpanded ? "w-64" : "w-16",
        )}
      />

      <SidebarMobileDrawer
        open={mobileOpen}
        items={items}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}
