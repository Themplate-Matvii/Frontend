import { Theme } from "@/shared/ui";

/**
 * User settings shape returned by the backend.
 * Mirrors OpenAPI schema "UserSettings".
 */
export interface UserSettings {
  theme: Theme; // "light" | "dark" | "system"
  timezone: string; // IANA timezone, e.g. "Europe/Warsaw"
}