"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { MediaApi, type MediaItem } from "@/entities/content/media";
import {
  useAuth,
  useAppPermissions,
  usePermissionGuard,
} from "@/entities/identity";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";

import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { PageShell } from "@/shared/layout/PageShell";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { ItemCard } from "@/shared/ui/list/ItemCard";
import { MediaPreview } from "@/entities/content/media";
import { formatFileSize } from "@/shared/lib/files";
import { DeleteModal } from "@/shared/ui/modal/DeleteModal";
import { useDeleteWithConfirm } from "@/shared/lib/hooks/useDeleteWithConfirm";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";
import Spinner from "@/shared/ui/loading/Spinner";
import { DangerZoneSection } from "@/shared/ui/section/DangerZoneSection";
import { toast } from "@/shared/ui/toast/toast";

export const DashboardMediaDetailPage = () => {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const mediaId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const { loading: authLoading } = useAuth();
  const { media: mediaPermissions } = useAppPermissions();

  const canViewMedia = mediaPermissions.any.view || mediaPermissions.own.view;
  const canEditMedia =
    mediaPermissions.any.update || mediaPermissions.own.update;
  const canDeleteMedia =
    mediaPermissions.any.delete || mediaPermissions.own.delete;

  const { canAccess } = usePermissionGuard({
    canAccess: canViewMedia,
  });

  const {
    data: media,
    isLoading,
    isError,
    refetch,
  } = MediaApi.useMediaById(mediaId);
  const updateMedia = MediaApi.useUpdateMedia(mediaId);
  const deleteMedia = MediaApi.useDeleteMedia();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!media) return;

    setName(media.name ?? media.filename ?? "");
    setDescription(media.description ?? "");
  }, [media]);

  const hasChanges = Boolean(
    media &&
      (name !== (media.name ?? media.filename ?? "") ||
        description !== (media.description ?? "")),
  );

  const { requestDelete, modalProps, isPending } =
    useDeleteWithConfirm<MediaItem>({
      canDelete: canDeleteMedia,
      getLabel: (item) => item.name || item.filename,
      onDelete: async (item) => {
        try {
          await deleteMedia.mutateAsync(item.id);
          toast.success(t(messages.notifications.media.deleteSuccess));
          router.push("/dashboard/media");
        } catch (error: any) {
          const message =
            error?.response?.data?.message || t(messages.errors.generic);
          toast.error(message);
        }
      },
    });

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    if (!mediaId || !media || !canEditMedia) return;
    if (!hasChanges) return;

    setSaving(true);
    updateMedia.mutate(
      { name, description },
      {
        onSuccess: ({ media: updated }) => {
          setName(updated.name ?? updated.filename ?? "");
          setDescription(updated.description ?? "");
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message || t(messages.errors.generic);
          toast.error(message);
        },
        onSettled: () => setSaving(false),
      },
    );
  };

  type MetaValue = string | number | null | undefined;

  const renderMeta = (label: string, value?: MetaValue) => {
    let display: string;

    if (typeof value === "string" || typeof value === "number") {
      display = String(value);
    } else {
      display = "-";
    }

    return (
      <div>
        <Small color={TextColorEnum.Secondary}>{label}</Small>
        <P className="text-sm font-medium break-all">{display}</P>
      </div>
    );
  };

  const loading = authLoading || isLoading;

  if (!canAccess && !authLoading) {
    return null;
  }

  return (
    <PageShell>
      <Container>
        <PageHeader
          title={t(messages.dashboard.media.detail.title)}
          subtitle={t(messages.dashboard.media.detail.subtitle)}
          onBack={() => router.push("/dashboard/media")}
        />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size={32} />
          </div>
        )}

        {!loading && !canViewMedia && (
          <section className="space-y-2">
            <P className="font-semibold" color={TextColorEnum.Danger}>
              {t(messages.common.noPermission.title)}
            </P>
            <Small color={TextColorEnum.Secondary}>
              {t(messages.common.noPermission.description)}
            </Small>
          </section>
        )}

        {!loading && isError && (
          <section className="space-y-3">
            <P className="font-semibold" color={TextColorEnum.Danger}>
              {t(messages.dashboard.media.detail.notFoundTitle)}
            </P>
            <Small color={TextColorEnum.Secondary}>
              {t(messages.dashboard.media.detail.notFoundDescription)}
            </Small>
            <div className="flex gap-2">
              <Button
                type="button"
                size={ButtonSizeEnum.md}
                variant={ButtonVariantEnum.secondary}
                onClick={() => refetch()}
              >
                {t(messages.common.actions.tryAgain)}
              </Button>
              <Button
                type="button"
                size={ButtonSizeEnum.md}
                variant={ButtonVariantEnum.primary}
                onClick={() => router.push("/dashboard/media")}
              >
                {t(messages.common.actions.back)}
              </Button>
            </div>
          </section>
        )}

        {media && canViewMedia && !loading && !isError && (
          <section className="flex flex-col gap-8 lg:flex-row">
            <LoadingOverlay loading={saving} className="rounded-xl">
              <SectionCard
                className="space-y-6 lg:basis-3/5 lg:flex-1"
                title={t(messages.dashboard.media.detail.infoTitle)}
              >
                <div className="space-y-4">
                  <ItemCard canDelete={false} canEdit={false}>
                    <MediaPreview media={media} />
                  </ItemCard>

                  <form onSubmit={handleSave} className="space-y-4">
                    <Field
                      id="media-name"
                      label={t(messages.dashboard.media.detail.fields.name)}
                    >
                      <Input
                        id="media-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={saving || !canEditMedia}
                      />
                    </Field>

                    <Field
                      id="media-description"
                      label={t(
                        messages.dashboard.media.detail.fields.description,
                      )}
                    >
                      <Input
                        id="media-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        disabled={saving || !canEditMedia}
                      />
                    </Field>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size={ButtonSizeEnum.md}
                        variant={ButtonVariantEnum.primary}
                        disabled={saving || !hasChanges || !canEditMedia}
                      >
                        {saving ? (
                          <span className="inline-flex items-center gap-2">
                            <Spinner size={16} />
                            {t(messages.common.actions.saveChanges)}
                          </span>
                        ) : (
                          t(messages.common.actions.saveChanges)
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </SectionCard>
            </LoadingOverlay>
            <div className="space-y-6 lg:basis-2/5 lg:flex-1">
              <SectionCard title={t(messages.dashboard.media.detail.metaTitle)}>
                <div className="space-y-3">
                  {renderMeta(
                    t(messages.dashboard.media.detail.fields.id),
                    media.id,
                  )}
                  {renderMeta(
                    t(messages.dashboard.media.detail.fields.mime),
                    media.mimeType,
                  )}
                  {renderMeta(
                    t(messages.dashboard.media.detail.fields.size),
                    formatFileSize(media.size) ?? undefined,
                  )}
                  {renderMeta(
                    t(messages.dashboard.media.detail.fields.createdAt),
                    new Date(media.createdAt).toLocaleString(),
                  )}
                  {renderMeta(
                    t(messages.dashboard.media.detail.fields.uploadedBy),
                    media.uploadedBy
                      ? media.uploadedBy.name ?? media.uploadedBy.email ?? null
                      : null,
                  )}
                  {renderMeta(
                    t(messages.dashboard.media.detail.fields.url),
                    media.url,
                  )}
                </div>
              </SectionCard>
              {canDeleteMedia && (
                <DangerZoneSection
                  titleKey={messages.dashboard.media.detail.deleteTitle}
                  descriptionKey={
                    messages.dashboard.media.detail.deleteDescription
                  }
                  buttonLabelKey={messages.common.actions.delete}
                  onClick={() => requestDelete(media)}
                  disabled={isPending}
                />
              )}
            </div>
          </section>
        )}
      </Container>

      <DeleteModal
        open={modalProps.open}
        onClose={() => {
          if (isPending) return;
          modalProps.onClose();
        }}
        requiredValue={modalProps.requiredValue}
        onConfirm={modalProps.onConfirm}
      />
    </PageShell>
  );
};
