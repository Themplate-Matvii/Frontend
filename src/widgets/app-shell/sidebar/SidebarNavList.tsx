"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { NavItem } from "./types";

type SidebarNavListProps = {
  items: NavItem[];
  isExpanded: boolean;
  onItemClick?: () => void;
  translate: (key: string) => string;
};

export const SidebarNavList = ({
  items,
  isExpanded,
  onItemClick,
  translate,
}: SidebarNavListProps) => {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const isItemActive = (item: NavItem): boolean => {
    const matchesSelf =
      !!item.href &&
      (pathname === item.href ||
        (item.href !== "/dashboard" && pathname?.startsWith(item.href)));

    const childActive = item.children?.some(isItemActive);
    return matchesSelf || !!childActive;
  };

  // Only items with canView !== false are visible
  const visibleItems = useMemo(
    () =>
      items
        .map((item) => {
          const visibleChildren = item.children?.filter(
            (child) => child.canView === undefined || child.canView === true,
          );
          if (visibleChildren?.length) {
            return { ...item, children: visibleChildren };
          }
          return item;
        })
        .filter((item) => {
          const canShow = item.canView === undefined || item.canView === true;
          if (item.children?.length) return canShow && item.children.length > 0;
          return canShow;
        }),
    [items],
  );

  useEffect(() => {
    const next: Record<string, boolean> = {};
    visibleItems.forEach((item) => {
      if (item.children?.length && item.children.some(isItemActive)) {
        next[item.label] = true;
      }
    });
    setOpenGroups((prev) => ({ ...prev, ...next }));
  }, [pathname, visibleItems]);

  const renderLink = (
    item: NavItem,
    depth: number,
    forceExpanded = false,
  ) => {
    const Icon = item.icon;
    const active = isItemActive(item);
    const expanded = forceExpanded || isExpanded;

    return (
      <Link
        href={item.href || "#"}
        className={clsx(
          "group flex items-center rounded-md text-sm font-medium transition-all duration-200 border h-9 gap-3 px-2.5",
          expanded ? "h-9 gap-3 px-2.5" : "h-9 justify-center px-0",
          depth > 0 && expanded && "ml-2",
          active
            ? "text-primary border-primary bg-primary/10"
            : "text-secondary border-transparent hover:text-text hover:bg-surface",
        )}
        aria-current={active ? "page" : undefined}
        title={!expanded ? translate(item.label) : undefined}
        onClick={onItemClick}
      >
        {Icon ? (
          <Icon
            width={18}
            height={18}
            className={clsx(
              "shrink-0 transition-colors duration-150",
              active ? "text-primary" : "text-muted group-hover:text-text",
            )}
          />
        ) : null}

        {expanded && <span className="truncate">{translate(item.label)}</span>}

        {expanded &&
          typeof item.badgeCount === "number" &&
          item.badgeCount > 0 && (
            <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full text-[11px] px-1 border border-primary bg-primary/10 text-primary">
              {item.badgeCount}
            </span>
          )}
      </Link>
    );
  };

  const renderItem = (item: NavItem, depth = 0) => {
    const hasChildren = !!item.children?.length;
    const isOpen = openGroups[item.label] ?? false;
    const active = isItemActive(item);

    if (!hasChildren) {
      return (
        <li key={`${item.href}-${item.label}`}>{renderLink(item, depth)}</li>
      );
    }

    return (
      <li key={item.label} className="relative group">
        <button
          type="button"
          className={clsx(
            "w-full group flex items-center rounded-md text-sm font-medium transition-all duration-200 border h-9",
            isExpanded ? "px-2.5 gap-3" : "justify-center px-0",
            active
              ? "text-primary border-primary bg-primary/10"
              : "text-secondary border-transparent hover:text-text hover:bg-surface",
          )}
          onClick={() => setOpenGroups((prev) => ({ ...prev, [item.label]: !isOpen }))}
          title={!isExpanded ? translate(item.label) : undefined}
        >
          {item.icon ? (
            <item.icon
              width={18}
              height={18}
              className={clsx(
                "shrink-0 transition-colors duration-150",
                active ? "text-primary" : "text-muted group-hover:text-text",
              )}
            />
          ) : null}
          {isExpanded && <span className="truncate">{translate(item.label)}</span>}
          {isExpanded && (
            <ChevronDown
              className={clsx(
                "ml-auto h-4 w-4 transition-transform", 
                isOpen ? "rotate-180" : "",
              )}
            />
          )}
        </button>

        {isExpanded && isOpen && (
          <ul className="mt-1 space-y-1 pl-2 border-l border-border/60">
            {item.children?.map((child) => renderItem(child, depth + 1))}
          </ul>
        )}

        {!isExpanded && item.children?.length ? (
          <div className="absolute left-full top-0 ml-2 hidden group-hover:block">
            <div className="rounded-lg border border-border bg-background shadow-lg p-2 space-y-1 min-w-[180px]">
              {item.children.map((child) => (
                <div key={child.href || child.label}>{renderLink(child, depth + 1, true)}</div>
              ))}
            </div>
          </div>
        ) : null}
      </li>
    );
  };

  return (
    <ul
      className={clsx(
        "px-2",
        isExpanded ? "space-y-1" : "space-y-1.5",
      )}
    >
      {visibleItems.map((item) => renderItem(item))}
    </ul>
  );
};
