"use client";

import React from "react";
import Link from "next/link";
import { FaviconDark, FaviconLight, LogoDark, LogoLight } from "@/shared/ui/assets";
import { useI18n } from "@/shared/lib/i18n";
import { messages } from "@/i18n/messages";

export const Logo = ({
  href = "/",
  width = 120,
  height = 40,
  alt,
  compact = false,
}: {
  href?: string;
  width?: number;
  height?: number;
  alt?: string;
  compact?: boolean;
}) => {
  const { t } = useI18n();
  const altText = alt ?? t(messages.common.logoAlt);
  // choose asset set depending on mode
  const light = compact ? FaviconDark : LogoDark;
  const dark = compact ? FaviconLight : LogoLight;

  return (
    <Link
      href={href}
      className="inline-flex items-center text-xl font-bold text-primary"
    >
      <img
        src={light}
        alt={altText}
        width={width}
        height={height}
        className="block dark:hidden"
      />
      <img
        src={dark}
        alt={altText}
        width={width}
        height={height}
        className="hidden dark:block"
      />
    </Link>
  );
};
