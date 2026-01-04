"use client";

import { User } from "@packages/api/modules/user/index/types";
import * as React from "react";


export type UserAvatarProps = {
  user?: User | null;
  /** Fallback initials when user is missing. */
  fallback?: string;
  /** Extra classes for container. */
  className?: string;
  /** aria-label override for accessibility. */
  "aria-label"?: string;
};

/** Build initials from name or email. */
export function getUserInitials(user?: User | null, fallback = "U"): string {
  if (!user) return fallback.toUpperCase();
  const src = user.name?.trim() || user.email || "";
  if (!src) return fallback.toUpperCase();

  // Prefer first + last token from name/email-like string
  const tokens = src.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (tokens.length >= 2) return (tokens[0][0] + tokens[tokens.length - 1][0]).toUpperCase();
  return tokens[0]?.slice(0, 2).toUpperCase() || fallback.toUpperCase();
}

/** Reusable avatar with initials. Fixed look to match UserMenu. */
export function UserAvatar({
  user,
  fallback = "U",
  className,
  ...rest
}: UserAvatarProps) {
  const label =
    rest["aria-label"] ||
    (user?.name || user?.email ? `User: ${user?.name || user?.email}` : "User");
  
  if (user?.avatar) {
    return <img src={user?.avatar.url} alt={user?.avatar.name} className="min-h-10 min-w-10 h-10 w-10 object-cover rounded-full inline-flex select-none items-center justify-centervtext-sm font-semibold uppercasevbg-primary text-white" />
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={[
        "min-h-10 min-w-10 rounded-full",
        "inline-flex select-none items-center justify-center",
        "text-sm font-semibold uppercase",
        "bg-primary text-white",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {getUserInitials(user, fallback)}
    </div>
  );
}

export default UserAvatar;
