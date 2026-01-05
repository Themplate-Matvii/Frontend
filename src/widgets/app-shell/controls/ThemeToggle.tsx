"use client";

import { Sun, Moon } from "lucide-react";
import { Theme } from "@/shared/ui";
import { useTheme } from "@/shared/lib/theme";
import { Button, ButtonVariantEnum, ButtonSizeEnum } from "@/shared/ui/Button";
import Tooltip from "@/shared/ui/Tooltip";
import { useI18n } from "@/shared/lib/i18n";
import { Languages } from "@/i18n/translations";
import { messages } from "@/i18n/messages";
import { useAuth, UserApi } from "@/entities/identity";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useI18n();
  const { user, refreshUser } = useAuth();
  const updateUser = UserApi.User.useUpdateUser();

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
        type="button"
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
