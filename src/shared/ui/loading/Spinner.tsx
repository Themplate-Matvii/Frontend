"use client";

import { Theme } from "@/shared/ui";
import { useTheme } from "@/shared/lib/theme";
import * as React from "react";

/** Simple inline spinner that adapts color to current theme */
export default function Spinner({ size = 20 }: { size?: number }) {
  const { theme } = useTheme();

  const s = size;
  const stroke = Math.max(2, Math.round(size / 10));
  const colorClass =
    theme === Theme.DARK ? "text-background" : "text-gray-900"; // adjust to match palette

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 50 50"
      className={`animate-spin text-text`}
      aria-hidden="true"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth={stroke}
      />
      <path
        d="M45 25a20 20 0 0 0-20-20"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}
