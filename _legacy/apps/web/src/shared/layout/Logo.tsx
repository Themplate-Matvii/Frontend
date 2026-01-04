"use client";

import React from "react";
import Link from "next/link";
import {
  LogoDark,
  LogoLight,
  FaviconDark,
  FaviconLight,
} from "@packages/assets";

export const Logo = ({
  href = "/",
  width = 120,
  height = 40,
  alt = "Logo",
  compact = false,
}: {
  href?: string;
  width?: number;
  height?: number;
  alt?: string;
  compact?: boolean;
}) => {
  // choose asset set depending on mode
  const light = compact ? FaviconLight : LogoLight;
  const dark = compact ? FaviconDark : LogoDark;

  return (
    <Link
      href={href}
      className="inline-flex items-center text-xl font-bold text-primary"
    >
      <img
        src={light}
        alt={alt}
        width={width}
        height={height}
        className="block dark:hidden"
      />
      <img
        src={dark}
        alt={alt}
        width={width}
        height={height}
        className="hidden dark:block"
      />
    </Link>
  );
};
