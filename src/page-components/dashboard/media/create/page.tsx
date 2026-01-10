"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { MediaApi } from "@/entities/content/media";
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
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import {
  MediaUploadField,
  type MediaUploadSelection,
} from "@/features/media/upload";
import { resolveMediaName } from "@/shared/lib/media";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import Spinner from "@/shared/ui/loading/Spinner";
import { toast } from "@/shared/ui/toast/toast";

export const DashboardMediaCreatePage = () => {
  const { t } = useI18n();
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const { media: mediaPermissions } = useAppPermissions();

  const canCreateMedia =
    mediaPermissions.any.create || mediaPermissions.own.create;

  const { canAccess } = usePermissionGuard({
    canAccess: canCreateMedia,
  });

  const uploadMedia = MediaApi.useUploadMedia();

  const [selection, setSelection] = useState<MediaUploadSelection | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selection) {
      setError(t(messages.dashboard.media.create.selectionRequired));
      return;
    }

    setError(null);
    const inferredName = resolveMediaName(selection, name);

    uploadMedia.mutate(
      {
        file: selection.type === "file" ? selection.file : undefined,
        url: selection.type === "url" ? selection.url : undefined,
        name: inferredName || undefined,
        description: description.trim() || undefined,
      },
      {
        onSuccess: ({ media }) => {
          setSelection(null);
          router.push(`/dashboard/media/${media.id}`);
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message as string;
          const fallback = message || t(messages.errors.generic);
          setError(fallback);
          toast.error(fallback);
        },
      },
    );
  };

  const handleSelectionChange = (next: MediaUploadSelection | null) => {
    setSelection(next);
    setError(null);
    if (!name.trim() && next) {
      const inferred = resolveMediaName(next);
      if (inferred) setName(inferred);
    }
  };

  if (!canAccess && !authLoading) {
    return null;
  }

  return (
    <PageShell>
      <Container>
        <PageHeader
          title={t(messages.dashboard.media.create.title)}
          subtitle={t(messages.dashboard.media.create.subtitle)}
          onBack={() => router.push("/dashboard/media")}
        />

        <SectionCard
          title={t(messages.dashboard.media.create.formTitle)}
          description={t(messages.dashboard.media.create.formDescription)}
          bodyClassName="space-y-4"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <MediaUploadField
              label={t(messages.dashboard.media.create.uploadLabel)}
              onSelectionChange={handleSelectionChange}
              error={error}
              disabled={uploadMedia.isPending || !canCreateMedia}
              isUploading={uploadMedia.isPending}
            />

            <Field
              id="media-name"
              label={t(messages.dashboard.media.detail.fields.name)}
            >
              <Input
                id="media-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t(messages.dashboard.media.create.namePlaceholder)}
                disabled={uploadMedia.isPending || !canCreateMedia}
              />
            </Field>

            <Field
              id="media-description"
              label={t(messages.dashboard.media.detail.fields.description)}
            >
              <Input
                id="media-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t(
                  messages.dashboard.media.create.descriptionPlaceholder,
                )}
                disabled={uploadMedia.isPending || !canCreateMedia}
              />
            </Field>

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                size={ButtonSizeEnum.md}
                variant={ButtonVariantEnum.primary}
                disabled={uploadMedia.isPending || !canCreateMedia}
              >
                {uploadMedia.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size={16} />
                    {t(messages.dashboard.media.create.submit)}
                  </span>
                ) : (
                  t(messages.dashboard.media.create.submit)
                )}
              </Button>
            </div>
          </form>
        </SectionCard>
      </Container>
    </PageShell>
  );
};
