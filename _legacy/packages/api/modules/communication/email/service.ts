import { apiClient } from "@packages/api/client";
import type { AxiosRequestConfig } from "axios";
import type {
  BroadcastEmailRequest,
  CreateMarketingTemplateRequest,
  EmailBranding,
  EmailResponse,
  MarketingPreviewRequest,
  MarketingTemplate,
  TemplateListResponse,
  TemplatePreviewRequest,
  TemplatePreviewResult,
  UnsubscribePreferences,
  UpdateMarketingTemplateRequest,
  UpdatePreferencesRequest,
  SendEmailRequest,
} from "./types";
import { ApiResponse } from "@packages/api/types/global";

export const emailService = {
  /** POST /api/email/send */
  send: (body: SendEmailRequest, config?: AxiosRequestConfig) =>
    apiClient.post<EmailResponse>("/api/email/send", body, config),

  /** POST /api/email/broadcast */
  broadcast: (body: BroadcastEmailRequest, config?: AxiosRequestConfig) =>
    apiClient.post<EmailResponse>("/api/email/broadcast", body, config),

  /** GET /api/email/branding */
  getBranding: () => apiClient.get<ApiResponse<EmailBranding>>("/api/email/branding"),

  /** PUT /api/email/branding */
  updateBranding: (body: EmailBranding) =>
    apiClient.put<ApiResponse<EmailBranding>>("/api/email/branding", body),

  /** GET /api/email/templates */
  getTemplates: () =>
    apiClient.get<ApiResponse<TemplateListResponse>>("/api/email/templates"),

  /** POST /api/email/templates/preview */
  previewTemplate: (body: TemplatePreviewRequest) =>
    apiClient.post<ApiResponse<TemplatePreviewResult>>(
      "/api/email/templates/preview",
      body,
    ),

  /** GET /api/email/marketing */
  getMarketingTemplates: () =>
    apiClient.get<ApiResponse<MarketingTemplate[]>>("/api/email/marketing"),

  /** POST /api/email/marketing */
  createMarketingTemplate: (body: CreateMarketingTemplateRequest) =>
    apiClient.post<ApiResponse<MarketingTemplate>>("/api/email/marketing", body),

  /** GET /api/email/marketing/{id} */
  getMarketingTemplate: (id: string) =>
    apiClient.get<ApiResponse<MarketingTemplate>>(`/api/email/marketing/${id}`),

  /** PUT /api/email/marketing/{id} */
  updateMarketingTemplate: (id: string, body: UpdateMarketingTemplateRequest) =>
    apiClient.put<ApiResponse<MarketingTemplate>>(`/api/email/marketing/${id}`, body),

  /** POST /api/email/marketing/{id}/preview */
  previewMarketingTemplate: (id: string, body: MarketingPreviewRequest) =>
    apiClient.post<ApiResponse<TemplatePreviewResult>>(
      `/api/email/marketing/${id}/preview`,
      body,
    ),

  /** GET /api/email/unsubscribe/{token} */
  getUnsubscribePreferences: (token: string) =>
    apiClient.get<ApiResponse<UnsubscribePreferences>>(
      `/api/email/unsubscribe/${token}`,
    ),

  /** POST /api/email/unsubscribe/{token} */
  updateUnsubscribePreferences: (
    token: string,
    body: UpdatePreferencesRequest,
  ) =>
    apiClient.post<ApiResponse<UnsubscribePreferences>>(
      `/api/email/unsubscribe/${token}`,
      body,
    ),
};
