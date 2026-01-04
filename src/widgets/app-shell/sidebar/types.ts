import { ReactNode } from "react";

export type NavItem = {
  href?: string;
  label: string;
  icon?: any;
  badgeCount?: number;
  canView: boolean;
  children?: NavItem[];
};

export type SidebarProps = {
  items?: NavItem[];
  onLogoutClick?: () => void;
  bottomSlot?: ReactNode;
  defaultCollapsed?: boolean;
};
