"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { LinkItem } from "./nav.config";

/**
 * Renders navigation links.
 * Accepts an array of links and optional onClick handler (for mobile menus).
 */
export function NavLinks({
  links,
  onClick,
  className = "flex gap-6 items-center",
}: {
  links: LinkItem[];
  onClick?: () => void;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <nav className={className}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClick}
          className="hover:text-primary transition-colors"
        >
          {t(link.i18nKey)}
        </Link>
      ))}
    </nav>
  );
}
