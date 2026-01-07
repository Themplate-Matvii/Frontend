"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
import { ListSection } from "@/shared/ui/list/ListSection";
import { ItemCard } from "@/shared/ui/list/ItemCard";
import Field from "@/shared/ui/forms/Field";
import { Select } from "@/shared/ui/forms/Select";
import { usePageSize } from "@/shared/lib/hooks/usePageSize";
import { useDeleteWithConfirm } from "@/shared/lib/hooks/useDeleteWithConfirm";
import { DeleteModal } from "@/shared/ui/modal/DeleteModal";
import { MediaPreview } from "@/entities/content/media";
import { sortEnum } from "@/shared/types/api/pagination";
import { toast } from "@/shared/ui/toast/toast";

export const DashboardMediaPage = () => {
  const { t } = useI18n();
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const { media: mediaPermissions } = useAppPermissions();

  const canViewMedia = mediaPermissions.any.view || mediaPermissions.own.view;
  const canCreateMedia =
    mediaPermissions.any.create || mediaPermissions.own.create;
  const canEditMedia =
    mediaPermissions.any.update || mediaPermissions.own.update;
  const canDeleteMedia =
    mediaPermissions.any.delete || mediaPermissions.own.delete;

  const { canAccess } = usePermissionGuard({
    canAccess: canViewMedia,
  });

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [mime, setMime] = useState<string>("");
  const [sort, setSort] = useState<sortEnum>(sortEnum.desc);
  const { pageSize, setPageSize } = usePageSize({ defaultSize: 8 });

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      s: search || undefined,
      mime: mime || undefined,
      sort: sort || undefined,
    }),
    [page, pageSize, search, mime, sort],
  );

  const {
    data: mediaPage,
    isLoading,
    isError,
    refetch,
  } = MediaApi.useMediaList(queryParams, { enabled: canViewMedia });
  const deleteMedia = MediaApi.useDeleteMedia();

  const { requestDelete, modalProps } = useDeleteWithConfirm<MediaItem>({
    canDelete: canDeleteMedia,
    getLabel: (media) => media.name || media.filename,
    onDelete: async (media) => {
      try {
        await deleteMedia.mutateAsync(media.id);
        toast.success(t(messages.notifications.media.deleteSuccess));
      } catch (error: any) {
        const message =
          error?.response?.data?.message || t(messages.errors.generic);
        toast.error(message);
      }
    },
  });

  const mimeOptions = useMemo(
    () => [
      { value: "", label: t(messages.dashboard.media.list.filters.all) },
      {
        value: "image",
        label: t(messages.dashboard.media.list.filters.images),
      },
      {
        value: "video",
        label: t(messages.dashboard.media.list.filters.videos),
      },
      { value: "audio", label: t(messages.dashboard.media.list.filters.audio) },
    ],
    [t],
  );

  const handleResetFilters = () => {
    setSearch("");
    setMime("");
    setSort(sortEnum.desc);
    setPage(1);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  if (!canAccess && !authLoading) {
    return null;
  }

  return (
    <PageShell>
      <Container>
        <PageHeader
          title={t(messages.dashboard.media.list.title)}
          subtitle={t(messages.dashboard.media.list.subtitle)}
          addLabel={
            canCreateMedia
              ? t(messages.dashboard.media.list.createButton)
              : undefined
          }
          onAdd={
            canCreateMedia
              ? () => router.push("/dashboard/media/create")
              : undefined
          }
        />

        <ListSection<MediaItem>
          canView={canViewMedia}
          authLoading={authLoading}
          isError={isError}
          isLoading={isLoading}
          onRetry={refetch}
          data={mediaPage}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          filters={{
            searchValue: search,
            onSearchChange: (value) => {
              setSearch(value);
              setPage(1);
            },
            sortValue: sort,
            onSortChange: setSort,
            onClearAll: handleResetFilters,
            extraFilters: (
              <Field
                id="media-mime"
                label={t(messages.dashboard.media.list.filters.mimeLabel)}
              >
                <Select
                  id="media-mime"
                  value={mime}
                  options={mimeOptions}
                  onChange={(value) => {
                    setMime((value as string) || "");
                    setPage(1);
                  }}
                />
              </Field>
            ),
          }}
          emptyTitleKey={messages.dashboard.media.list.emptyTitle}
          emptyDescriptionKey={messages.dashboard.media.list.emptyDescription}
          renderItem={(media) => (
            <ItemCard
              canEdit={canEditMedia}
              canDelete={canDeleteMedia}
              onEdit={() => router.push(`/dashboard/media/${media.id}`)}
              onDelete={() => requestDelete(media)}
              actionsSide="right"
            >
              <MediaPreview media={media} />
            </ItemCard>
          )}
          getItemKey={(media) => media.id}
        />
      </Container>

      <DeleteModal
        open={modalProps.open}
        onClose={modalProps.onClose}
        requiredValue={modalProps.requiredValue}
        onConfirm={modalProps.onConfirm}
      />
    </PageShell>
  );
};
