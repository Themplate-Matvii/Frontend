import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { ApiResponse } from "@packages/api/types/global";
import { emailService } from "./service";
import type {
  BroadcastEmailRequest,
  CreateMarketingTemplateRequest,
  EmailBranding,
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

export function useSendEmail() {
  return useMutation({
    mutationFn: async (vars: SendEmailRequest) => {
      const { data } = await emailService.send(vars);
      return data;
    },
  });
}

export function useBroadcastEmail() {
  return useMutation({
    mutationFn: async (vars: BroadcastEmailRequest) => {
      const { data } = await emailService.broadcast(vars);
      return data;
    },
  });
}

export const useEmailBranding = (options?: Partial<UseQueryOptions<EmailBranding>>) =>
  useQuery<EmailBranding>({
    queryKey: ["email-branding"],
    queryFn: async () => {
      const { data } = await emailService.getBranding();
      return data.data;
    },
    ...options,
  });

export const useUpdateEmailBranding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EmailBranding) => {
      const { data } = await emailService.updateBranding(payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-branding"] });
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
};

export const useEmailTemplates = (
  options?: Partial<UseQueryOptions<TemplateListResponse>>,
) =>
  useQuery<TemplateListResponse>({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data } = await emailService.getTemplates();
      return data.data;
    },
    ...options,
  });

export const usePreviewTemplate = () =>
  useMutation({
    mutationFn: async (
      payload: TemplatePreviewRequest,
    ): Promise<ApiResponse<TemplatePreviewResult>> => {
      const { data } = await emailService.previewTemplate(payload);
      return data;
    },
  });

export const useMarketingTemplates = (
  options?: Partial<UseQueryOptions<MarketingTemplate[]>>,
) =>
  useQuery<MarketingTemplate[]>({
    queryKey: ["email-marketing-templates"],
    queryFn: async () => {
      const { data } = await emailService.getMarketingTemplates();
      return data.data;
    },
    ...options,
  });

export const useMarketingTemplate = (
  id?: string,
  options?: Partial<UseQueryOptions<MarketingTemplate>>,
) =>
  useQuery<MarketingTemplate>({
    queryKey: ["email-marketing-template", id],
    queryFn: async () => {
      const { data } = await emailService.getMarketingTemplate(id!);
      return data.data;
    },
    enabled: !!id,
    ...options,
  });

export const useCreateMarketingTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateMarketingTemplateRequest) => {
      const { data } = await emailService.createMarketingTemplate(payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["email-marketing-templates"],
      });
      queryClient.invalidateQueries({
        queryKey: ["email-templates"],
      });
    },
  });
};

export const useUpdateMarketingTemplate = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateMarketingTemplateRequest) => {
      if (!id) throw new Error("Marketing template id is missing");
      const { data } = await emailService.updateMarketingTemplate(id, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["email-marketing-template", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["email-marketing-templates"],
      });
      queryClient.invalidateQueries({
        queryKey: ["email-templates"],
      });
    },
  });
};

export const usePreviewMarketingTemplate = (id?: string) =>
  useMutation({
    mutationFn: async (
      payload: MarketingPreviewRequest,
    ): Promise<ApiResponse<TemplatePreviewResult>> => {
      if (!id) throw new Error("Marketing template id is missing");
      const { data } = await emailService.previewMarketingTemplate(id, payload);
      return data;
    },
  });

export const useUnsubscribePreferences = (
  token?: string,
  options?: Partial<UseQueryOptions<UnsubscribePreferences>>,
) =>
  useQuery<UnsubscribePreferences>({
    queryKey: ["email-unsubscribe", token],
    queryFn: async () => {
      const { data } = await emailService.getUnsubscribePreferences(token!);
      return data.data;
    },
    enabled: !!token,
    ...options,
  });

export const useUpdateUnsubscribePreferences = (token?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePreferencesRequest) => {
      if (!token) throw new Error("Unsubscribe token is missing");
      const { data } = await emailService.updateUnsubscribePreferences(
        token,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["email-unsubscribe", token],
      });
    },
  });
};
