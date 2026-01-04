"use client";

import { Sun, Moon } from "lucide-react";
import { Theme, useTheme } from "@packages/ui";
import { Button, ButtonVariantEnum, ButtonSizeEnum } from "../ui/Button";
import { useTranslation } from "react-i18next";

import { Languages } from "@packages/locales/translations";
import { useAuth } from "@packages/api/context/AuthContext";
import { useUpdateUser } from "@packages/api/modules/user/index/queries";
import Tooltip from "../ui/Tooltip";
import { messages } from "@packages/locales";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const updateUser = useUpdateUser();

  const handleToggle = () => {
    // Compute next theme
    const nextTheme =
      theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;

    // Instant UI update
    setTheme(nextTheme);

    // Sync settings to backend
    if (user) {
      updateUser.mutate(
        {
          userId: user.id,
          body: {
            settings: {
              theme: nextTheme,
              locale: i18n.language as Languages,
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
  };

  return (
    <Tooltip content={theme === Theme.DARK ? t(messages.tooltips.themeToggleToLight) : t(messages.tooltips.themeToggleToDark)}>
      <Button
        onClick={handleToggle}
        variant={ButtonVariantEnum.icon}
        size={ButtonSizeEnum.md}
        aria-label={t("toggleTheme")}
        aria-pressed={theme === Theme.DARK}
      >
        <Sun size={20} className="block dark:hidden" />
        <Moon size={20} className="hidden dark:block" />
      </Button>
    </Tooltip>
  );
};
