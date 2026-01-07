export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001",
  FRONTEND_URL:
    process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || "development",
  // OAuth providers
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
  APPLE_CLIENT_ID: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "",
} as const;

export const AUTH = {
  TOKEN_COOKIE_KEY: "accessToken",
  REFRESH_COOKIE_KEY: "rt",
  USER_COOKIE_KEY: "user",
} as const;

export const I18N = {
  LOCALE_COOKIE_KEY: "NEXT_LOCALE",
  DEFAULT_LOCALE: "ru",
} as const;

export const THEME_STORAGE_KEY = "theme";

export const COMPANY = {
  name: "Example Technologies Sp. z o.o.",
  email: "support@example.com",
  address: "Warsaw, Poland",
  lastUpdated: "October 2025",
} as const;

export const DEFAULT_PAGINATION_LIMIT = 2;
