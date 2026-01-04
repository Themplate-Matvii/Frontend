"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  EmailBranding,
  EmailCategory,
  MarketingTemplate,
  SystemTemplate,
  useEmailBranding,
  useEmailTemplates,
  useUpdateEmailBranding,
} from "@packages/api/modules/communication/email";
import { sortEnum } from "@packages/api/types/pagination";
import { messages, useI18n } from "@packages/locales";

import { useAppPermissions } from "@/hooks/auth/usePermissions";
import { usePermissionGuard } from "@/hooks/auth/usePermissionGuard";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { PageShell } from "@/shared/layout/PageShell";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";
import { Small, TextColorEnum } from "@/shared/ui/Typography";
import { EmailBrandingForm } from "@/shared/components/email/EmailBrandingForm";
import { HeaderFooterPreview } from "@/shared/components/email/HeaderFooterPreview";
import { EmailTemplateCard } from "@/shared/components/email/EmailTemplateCard";
import { EmailPreviewModal } from "@/shared/components/email/EmailPreviewModal";
import { SendEmailModal } from "@/shared/components/email/SendEmailModal";
import { MarketingTemplateModal } from "@/shared/components/email/MarketingTemplateModal";
import { useUsers } from "@packages/api/modules/user/index/queries";

const DEFAULT_BRANDING: EmailBranding = {
  brandName: "Example",
  primaryColor: "#2563eb",
  secondaryColor: "#111827",
  accentColor: "#22d3ee",
  backgroundColor: "#0b1224",
  textColor: "#e5e7eb",
  footerText: "You are receiving this email because you are a valued customer.",
  supportEmail: "support@example.com",
  supportUrl: "https://example.com/support",
};

const getTemplateKey = (tpl: SystemTemplate | MarketingTemplate) => {
  if ("id" in tpl) return tpl.id;
  return tpl.file ?? tpl.key;
};

export default function EmailClientPage() {
  const { t } = useI18n();
  const { email: emailPermissions } = useAppPermissions();
  const canAccess = emailPermissions.one || emailPermissions.broadcast;
  const { canAccess: allowed } = usePermissionGuard({ canAccess });

  const {
    data: templateList,
    isLoading: templatesLoading,
    isError: templatesError,
  } = useEmailTemplates({
    enabled: allowed,
  });

  const {
    data: brandingQuery,
    isLoading: brandingLoading,
  } = useEmailBranding({
    enabled: allowed,
  });
  const updateBranding = useUpdateEmailBranding();

  const brandingSource =
    brandingQuery || templateList?.branding || DEFAULT_BRANDING;

  const [branding, setBranding] = useState<EmailBranding>(brandingSource);
  const [brandingStatus, setBrandingStatus] = useState<string | null>(null);

  useEffect(() => {
    setBranding(brandingSource);
  }, [brandingSource]);

  const isBrandingDirty =
    JSON.stringify(branding ?? {}) !== JSON.stringify(brandingSource ?? {});

  const handleSaveBranding = () => {
    setBrandingStatus(null);
    updateBranding.mutate(branding, {
      onSuccess: () => {
        setBrandingStatus(t(messages.dashboard.email.branding.saved));
      },
      onError: () => {
        setBrandingStatus(t(messages.dashboard.email.branding.failed));
      },
    });
  };

  const systemTemplates = useMemo(
    () => templateList?.systemTemplates ?? [],
    [templateList?.systemTemplates],
  );

  const marketingTemplates = templateList?.marketingTemplates ?? [];

  const {
    data: users,
    isLoading: usersLoading,
  } = useUsers(
    {
      page: 1,
      limit: 50,
      sort: sortEnum.desc,
    },
    { enabled: allowed },
  );

  const userItems = users?.items ?? [];

  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    templateKey: string;
    templateName: string;
    marketingTemplateId?: string;
    defaultData?: Record<string, unknown>;
    subjectKey?: string;
    category?: EmailCategory;
    type: "system" | "marketing";
  }>({
    open: false,
    templateKey: "",
    templateName: "",
    type: "system",
  });

  const [sendModal, setSendModal] = useState<{
    open: boolean;
    templateKey?: string;
    templateName: string;
    marketingTemplateId?: string;
    defaultData?: Record<string, unknown>;
    subjectKey?: string;
    category?: EmailCategory;
    type: "system" | "marketing";
  }>({
    open: false,
    templateName: "",
    type: "system",
  });

  const [marketingModal, setMarketingModal] = useState<{
    open: boolean;
    template?: MarketingTemplate | null;
  }>({ open: false, template: null });

  const openPreview = (
    tpl: SystemTemplate | MarketingTemplate,
    type: "system" | "marketing",
  ) => {
    const key = getTemplateKey(tpl);

    if (!key) return;
    const templateName =
      tpl.name ||
      ("key" in tpl ? tpl.key : undefined) ||
      ("file" in tpl ? tpl.file : undefined) ||
      ("id" in tpl ? tpl.id : undefined) ||
      tpl.subjectKey ||
      String(key);
    setPreviewModal({
      open: true,
      templateKey: key,
      templateName,
      marketingTemplateId:
        type === "marketing" && "id" in tpl ? tpl.id : undefined,
      defaultData: tpl.previewData ?? {},
      subjectKey: tpl.subjectKey,
      category:
        tpl.category ?? (type === "marketing" ? "marketing" : "transactional"),
      type,
    });
  };

  const openSend = (
    tpl: SystemTemplate | MarketingTemplate,
    type: "system" | "marketing",
  ) => {
    const key = getTemplateKey(tpl);
    if (!key) return;
    const templateName =
      tpl.name ||
      ("key" in tpl ? tpl.key : undefined) ||
      ("file" in tpl ? tpl.file : undefined) ||
      ("id" in tpl ? tpl.id : undefined) ||
      tpl.subjectKey ||
      String(key);
    setSendModal({
      open: true,
      templateKey: String(key),
      templateName,
      marketingTemplateId:
        type === "marketing" && "id" in tpl ? tpl.id : undefined,
      defaultData: tpl.previewData ?? {},
      subjectKey: tpl.subjectKey,
      category: tpl.category ?? (type === "marketing" ? "marketing" : "transactional"),
      type,
    });
  };

  const closePreview = () =>
    setPreviewModal((prev) => ({ ...prev, open: false }));
  const closeSend = () => setSendModal((prev) => ({ ...prev, open: false }));

  if (!allowed && !templatesLoading) {
    return null;
  }

  return (
    <PageShell>
      <LoadingOverlay loading={templatesLoading || brandingLoading || usersLoading} />
      <Container>
        <PageHeader
          title={t(messages.dashboard.email.title)}
          subtitle={t(messages.dashboard.email.subtitle)}
          addLabel={
            emailPermissions.broadcast
              ? t(messages.dashboard.email.marketing.createButton)
              : undefined
          }
          onAdd={
            emailPermissions.broadcast
              ? () => setMarketingModal({ open: true, template: null })
              : undefined
          }
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title={t(messages.dashboard.email.branding.title)}
            description={t(messages.dashboard.email.branding.description)}
          >
            <EmailBrandingForm
              value={branding}
              onChange={setBranding}
              onSave={handleSaveBranding}
              saving={updateBranding.isPending}
              isDirty={isBrandingDirty}
            />
            {brandingStatus ? (
              <Small
                className="block pt-2"
                color={
                  brandingStatus === t(messages.dashboard.email.branding.failed)
                    ? TextColorEnum.Danger
                    : TextColorEnum.Success
                }
              >
                {brandingStatus}
              </Small>
            ) : null}
          </SectionCard>

          <SectionCard
            title={t(messages.dashboard.email.preview.layoutTitle)}
            description={t(messages.dashboard.email.preview.layoutDescription)}
          >
            <HeaderFooterPreview
              branding={branding}
              headerHtml={templateList?.header}
              footerHtml={templateList?.footer}
              showUnsubscribe
            />
            <Small className="block pt-2" color={TextColorEnum.Secondary}>
              {t(messages.dashboard.email.preview.unsubscribeCopy)}
            </Small>
          </SectionCard>
        </div>

        <SectionCard
          title={t(messages.dashboard.email.templates.title)}
          description={t(messages.dashboard.email.templates.description)}
          className="mt-4"
        >
          {templatesError ? (
            <Small color={TextColorEnum.Danger}>
              {t(messages.dashboard.email.templates.error)}
            </Small>
          ) : null}
          <div className="grid gap-3">
            {systemTemplates.map((tpl) => (
              <EmailTemplateCard
                key={getTemplateKey(tpl)}
                template={tpl}
                type="system"
                onPreview={() => openPreview(tpl, "system")}
                onSend={() => openSend(tpl, "system")}
              />
            ))}
            {systemTemplates.length === 0 && (
              <Small color={TextColorEnum.Secondary}>
                {t(messages.dashboard.email.templates.empty)}
              </Small>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title={t(messages.dashboard.email.marketing.title)}
          description={t(messages.dashboard.email.marketing.subtitle)}
          className="mt-4"
        >
          <div className="grid gap-3">
            {marketingTemplates.map((tpl) => (
              <EmailTemplateCard
                key={tpl.id}
                template={tpl}
                type="marketing"
                onPreview={() => openPreview(tpl, "marketing")}
                onSend={() => openSend(tpl, "marketing")}
                onEdit={
                  emailPermissions.broadcast
                    ? () => setMarketingModal({ open: true, template: tpl })
                    : undefined
                }
              />
            ))}
            {marketingTemplates.length === 0 && (
              <Small color={TextColorEnum.Secondary}>
                {t(messages.dashboard.email.marketing.empty)}
              </Small>
            )}
          </div>
        </SectionCard>
      </Container>

      <EmailPreviewModal
        open={previewModal.open}
        onClose={closePreview}
        type={previewModal.type}
        templateKey={previewModal.templateKey}
        templateName={previewModal.templateName}
        marketingTemplateId={previewModal.marketingTemplateId}
        branding={branding}
        subjectKey={previewModal.subjectKey}
        category={previewModal.category}
        defaultData={previewModal.defaultData}
      />

      <SendEmailModal
        open={sendModal.open}
        onClose={closeSend}
        templateKey={sendModal.templateKey}
        templateName={sendModal.templateName}
        marketingTemplateId={sendModal.marketingTemplateId}
        subjectKey={sendModal.subjectKey}
        category={sendModal.category}
        defaultData={sendModal.defaultData}
        users={userItems}
        canBroadcast={emailPermissions.broadcast}
        canSendOne={emailPermissions.one}
      />

      <MarketingTemplateModal
        open={marketingModal.open}
        onClose={() => setMarketingModal({ open: false, template: null })}
        template={marketingModal.template}
      />
    </PageShell>
  );
}
