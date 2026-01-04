"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@packages/api/context/AuthContext";
import { useI18n, messages } from "@packages/locales";
import { useOnClickOutside } from "@/hooks/ui/useOnClickOutside";
import { useOnEscape } from "@/hooks/ui/useOnEscape";
import Spinner from "@/shared/ui/loading/Spinner";
import { UserAvatar } from "@/shared/preview/user/UserAvatar";
import { Button, ButtonSizeEnum } from "@/shared/ui/Button";

export default function UserMenu() {
  const { user, logout, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useOnClickOutside(rootRef, () => setOpen(false), { enabled: open });
  useOnEscape(() => setOpen(false), open);

  return (
    <div ref={rootRef} className="inline-flex items-center gap-2">
      {(loading || user) && (
        <div className="relative h-10 w-10">
          {/* loader layer */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity ${
              loading ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!loading}
          >
            <Spinner size={18} />
          </div>

          {/* avatar button */}
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((p) => !p)}
            className={`absolute inset-0 rounded-full focus:outline-none transition-opacity ${
              user ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-label="User menu"
            aria-expanded={open}
            aria-haspopup="menu"
            // keep hover behavior consistent with previous version
            style={{ filter: open ? "brightness(0.95)" : undefined }}
          >
            <UserAvatar
              user={user}
              className="h-full w-full"
            />
          </button>

          {/* dropdown */}
          {open && user && !loading && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 rounded-lg bg-background border border-border shadow-lg overflow-hidden z-[1000] w-max"
            >
              <div className="px-3 py-2 border-b border-border">
                <div className="text-sm font-medium">
                  {user.name || user.email}
                </div>
                {user.name && user.email && (
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                )}
              </div>

              <Link
                href="/dashboard"
                role="menuitem"
                className="block w-full text-left px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-primaryHover hover:text-white active:bg-primary active:text-white"
                onClick={() => setOpen(false)}
              >
                {t(messages.dashboard.sidebar.items.dashboard)}
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  void logout();
                  requestAnimationFrame(() => buttonRef.current?.focus());
                }}
                className="block w-full text-left px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-primaryHover hover:text-white active:bg-primary active:text-white"
              >
                {t(messages.auth.logout)}
              </button>
            </div>
          )}
        </div>
      )}

      {/* sign-in button when unauthenticated */}
      {!loading && !user && (
        <Button onClick={() => router.push("/auth/sign-in")} size={ButtonSizeEnum.md}>
          {t(messages.auth.login)}
        </Button>
      )}
    </div>
  );
}
