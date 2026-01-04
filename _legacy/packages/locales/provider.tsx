"use client";

import React, { ReactNode, useEffect } from "react";
import i18n from "i18next";
import {
  initReactI18next,
  I18nextProvider,
  useTranslation,
} from "react-i18next";
import { translations } from "./translations";
import { I18N } from "@packages/config";
import { getCookie, setCookie } from "@packages/utils/cookies";

type I18nProviderProps = {
  children: ReactNode;
  initialLocale?: string;
};

function resolveInitialLocale(initialLocale: string): string {
  if (typeof document === "undefined") return initialLocale;
  return getCookie(I18N.LOCALE_COOKIE_KEY) ?? initialLocale;
}

function ensureI18nInitialized(locale: string) {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources: translations,
      lng: locale,
      fallbackLng: I18N.DEFAULT_LOCALE,
      interpolation: { escapeValue: false },
    });
  } else if (i18n.language !== locale) {
    i18n.changeLanguage(locale);
  }
}

export const I18nProvider = ({
  children,
  initialLocale = I18N.DEFAULT_LOCALE,
}: I18nProviderProps) => {
  const locale = resolveInitialLocale(initialLocale);

  ensureI18nInitialized(locale);

  useEffect(() => {
    const handleLangChange = (lng: string) =>
      setCookie(I18N.LOCALE_COOKIE_KEY, lng);
    i18n.on("languageChanged", handleLangChange);
    return () => i18n.off("languageChanged", handleLangChange);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export const useI18n = () => useTranslation();
