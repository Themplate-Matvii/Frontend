import { ApiResponse } from "@/shared/types/api/global";
import { Languages } from "@/i18n/translations";

export type EmailCategory = "transactional" | "marketing" | "billing";

export interface EmailBranding {
  brandName?: string;
  logoUrl?: string;
  darkLogoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  footerText?: string;
  supportEmail?: string;
  supportUrl?: string;
  socialLinks?: Array<{ label?: string; url?: string }>;
}

export interface SystemTemplate {
  key: string;
  file: string;
  category?: EmailCategory;
  subjectKey?: string;
  previewTextKey?: string;
  previewData?: Record<string, unknown>;
  type?: "system";
  /**
   * Optional properties kept for backward compatibility with older payloads.
   */
  name?: string;
  description?: string;
  translations?: Record<string, Record<string, string>>;
  locales?: string[];
}

export interface MarketingTemplate {
  id: string;
  name: string;
  description?: string;
  subjectKey: string;
  translations: Record<string, Record<string, string>>;
  hbs: string;
  previewData?: Record<string, unknown>;
  category?: EmailCategory;
  locales?: string[];
  type?: "marketing";
}

export interface CreateMarketingTemplateRequest {
  name: string;
  subjectKey: string;
  translations: Record<string, Record<string, string>>;
  hbs: string;
  description?: string;
  previewData?: Record<string, unknown>;
  category?: EmailCategory;
}

export interface UpdateMarketingTemplateRequest {
  name?: string;
  subjectKey?: string;
  translations?: Record<string, Record<string, string>>;
  hbs?: string;
  description?: string;
  previewData?: Record<string, unknown>;
  category?: EmailCategory;
}

export interface TemplateListResponse {
  branding?: EmailBranding;
  header?: string;
  footer?: string;
  systemTemplates: SystemTemplate[];
  marketingTemplates: MarketingTemplate[];
}

export interface TemplatePreviewRequest {
  template: string;
  data?: Record<string, unknown>;
  locale?: Languages | string;
}

export interface MarketingPreviewRequest {
  data?: Record<string, unknown>;
  locale?: Languages | string;
}

export interface TemplatePreviewResult {
  html?: string;
  subject?: string;
  locale?: string;
  data?: Record<string, unknown>;
}

export interface SendEmailRequest {
  to?: string;
  userId?: string;
  template?: string;
  marketingTemplateId?: string;
  subjectKey?: string;
  category?: EmailCategory;
  locale?: Languages | string;
  data?: Record<string, unknown>;
}

export interface BroadcastEmailRequest {
  template?: string;
  marketingTemplateId?: string;
  subjectKey?: string;
  category?: EmailCategory;
  userIds?: string[];
  locale?: Languages | string;
  data?: Record<string, unknown>;
}

export interface EmailActionPayload {
  message?: string | null;
  data?: Record<string, unknown>;
}

export type EmailResponse = ApiResponse<EmailActionPayload>;

export interface UnsubscribePreferences {
  email?: string;
  name?: string;
  preferences?: {
    marketing?: boolean;
    billing?: boolean;
  };
  categories?: string[];
}

export interface UpdatePreferencesRequest {
  marketing?: boolean;
  billing?: boolean;
}
