import type { EmailBranding } from "@/entities/communication/email";

export const defaultEmailBrandingColors: Pick<
  EmailBranding,
  "primaryColor" | "secondaryColor" | "accentColor" | "backgroundColor" | "textColor"
> = {
  primaryColor: "#2563eb",
  secondaryColor: "#111827",
  accentColor: "#22d3ee",
  backgroundColor: "#0b1224",
  textColor: "#e5e7eb",
};
