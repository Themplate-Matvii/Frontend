"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  useDeleteMedia,
  useMediaById,
  useUpdateMedia,
  type MediaItem,
} from "@packages/api/modules/assets/media";
import { messages, useI18n } from "@packages/locales";

import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { PageShell } from "@/shared/layout/PageShell";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { ItemCard } from "@/shared/ui/list/ItemCard";
import { MediaPreview } from "@/shared/preview/media/MediaPreview";
import { formatFileSize } from "@/shared/lib/files";
import { DeleteModal } from "@/shared/ui/modal/DeleteModal";
import { useDeleteWithConfirm } from "@/hooks/entities/useDeleteWithConfirm";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";
import Spinner from "@/shared/ui/loading/Spinner";
import { DangerZoneSection } from "@/shared/ui/section/DangerZoneSection";

export default function MediaDetailClient() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const mediaId = params?.id;

  const {
    data: media,
    isLoading,
    isError,
    refetch,
  } = useMediaById(mediaId);
  const updateMedia = useUpdateMedia(mediaId);
  const deleteMedia = useDeleteMedia();

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

  const { requestDelete, modalProps } = useDeleteWithConfirm<MediaItem>({
    canDelete: true,
    getLabel: (item) => item.name || item.filename,
    onDelete: async (item) => {
      await deleteMedia.mutateAsync(item.id);
      router.push("/dashboard/media");
    },
  });

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    if (!mediaId || !media) return;
    if (!hasChanges) return;

    setSaving(true);
    updateMedia.mutate(
      { name, description },
      {
        onSuccess: ({ media: updated }) => {
          setName(updated.name ?? updated.filename ?? "");
          setDescription(updated.description ?? "");
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
        <P className="text-sm font-medium">{display}</P>
      </div>
    );
  };

  return (
    <PageShell>
      <Container>
        <PageHeader
          title={t(messages.dashboard.media.detail.title)}
          subtitle={t(messages.dashboard.media.detail.subtitle)}
          onBack={() => router.push("/dashboard/media")}
          addLabel={t(messages.dashboard.media.list.createButton)}
        />

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size={32} />
          </div>
        )}

        {!isLoading && isError && (
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

        {media && (
          <section className="flex flex-col gap-8 lg:flex-row">
            <SectionCard
              className="space-y-6 lg:basis-3/5 lg:flex-1"
              title={t(messages.dashboard.media.detail.infoTitle)}
            >
              <div className="relative space-y-4">
                <LoadingOverlay loading={saving} />
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
                      disabled={saving}
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
                      disabled={saving}
                    />
                  </Field>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size={ButtonSizeEnum.md}
                      variant={ButtonVariantEnum.primary}
                      disabled={saving || !hasChanges}
                    >
                      {saving ? (
                        <span className="inline-flex items-center gap-2">
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
                      ? (media.uploadedBy.name ??
                          media.uploadedBy.email ??
                          null)
                      : null,
                  )}
                  {renderMeta(
                    t(messages.dashboard.media.detail.fields.url),
                    media.url,
                  )}
                </div>
              </SectionCard>
              <DangerZoneSection
                titleKey={messages.dashboard.media.detail.deleteTitle}
                descriptionKey={
                  messages.dashboard.media.detail.deleteDescription
                }
                buttonLabelKey={messages.common.actions.delete}
                onClick={() => requestDelete(media)}
              />
            </div>
          </section>
        )}
      </Container>

      <DeleteModal
        open={modalProps.open}
        onClose={modalProps.onClose}
        requiredValue={modalProps.requiredValue}
        onConfirm={modalProps.onConfirm}
      />
    </PageShell>
  );
}
