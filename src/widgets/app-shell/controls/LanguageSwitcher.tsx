"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { translations } from "@/i18n/translations";
import { useI18n } from "@/shared/lib/i18n";
import { I18N } from "@/shared/config";
import { useOnClickOutside } from "@/shared/lib/hooks/useOnClickOutside";
import { useOnEscape } from "@/shared/lib/hooks/useOnEscape";
import { Languages } from "@/i18n/translations";
import { useTheme } from "@/shared/lib/theme";
import { useAuth, UserApi } from "@/entities/user";

const LANGS = Object.keys(translations).map((code) => ({
  code,
  label: code.toUpperCase(),
}));

export const LanguageSwitcher = () => {
  const { i18n } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { user, refreshUser } = useAuth();
  const updateUser = UserApi.User.useUpdateUser();
  const { theme } = useTheme();

  useOnClickOutside(menuRef, () => setOpen(false), { enabled: open });
  useOnEscape(() => setOpen(false), open);

  useEffect(() => {
    const backendLocale = user?.settings?.locale as Languages | undefined;
    if (!backendLocale) return;

    if (i18n.language !== backendLocale) {
      void i18n.changeLanguage(backendLocale);

      document.cookie = `${I18N.LOCALE_COOKIE_KEY}=${encodeURIComponent(
        backendLocale,
      )}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [user?.settings?.locale, i18n]);

  const changeLang = async (lng: string) => {
    // Instant i18n change
    await i18n.changeLanguage(lng);

    // Local cookie (for SSR and first load)
    document.cookie = `${I18N.LOCALE_COOKIE_KEY}=${encodeURIComponent(
      lng,
    )}; path=/; max-age=31536000; SameSite=Lax`;

    // Sync to backend
    if (user) {
      updateUser.mutate(
        {
          userId: user.id,
          body: {
            settings: {
              theme,
              locale: lng as Languages,
            },
          },
        },
        {
          onSuccess: async () => {
            await refreshUser();
          },
        }
      );
    }

    setOpen(false);
    router.refresh();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-1 px-3 py-2 w-20 rounded-lg bg-primary text-white hover:bg-primary/90 active:bg-primary/80 transition-colors shadow-sm"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {i18n.language.toUpperCase()}
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-1 w-20 rounded-lg bg-background border border-border shadow-lg overflow-hidden z-50"
        >
          {LANGS.map((lng) => {
            const active = i18n.language === lng.code;
            return (
              <button
                key={lng.code}
                onClick={() => changeLang(lng.code)}
                className={`block w-full text-left px-3 py-2 text-sm transition-colors dark:text-white hover:bg-primaryHover hover:text-white active:bg-primary active:text-white ${
                  active ? "bg-primary text-white" : ""
                }`}
                role="option"
                aria-selected={active}
              >
                {lng.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
