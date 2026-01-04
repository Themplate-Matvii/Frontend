"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  useDeleteMedia,
  useMediaList,
  type MediaItem,
} from "@packages/api/modules/assets/media";
import { messages, useI18n } from "@packages/locales";

import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { PageShell } from "@/shared/layout/PageShell";
import { ListSection } from "@/shared/ui/list/ListSection";
import { ItemCard } from "@/shared/ui/list/ItemCard";
import Field from "@/shared/ui/forms/Field";
import { Select } from "@/shared/ui/forms/Select";
import { usePageSize } from "@/hooks/layout/usePageSize";
import { useDeleteWithConfirm } from "@/hooks/entities/useDeleteWithConfirm";
import { DeleteModal } from "@/shared/ui/modal/DeleteModal";
import { MediaPreview } from "@/shared/preview/media/MediaPreview";
import { sortEnum } from "@packages/api/types/pagination";

export default function MediaClientPage() {
  const { t } = useI18n();
  const router = useRouter();

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

  const { data: mediaPage, isLoading, isError, refetch } = useMediaList(queryParams);
  const deleteMedia = useDeleteMedia();

  const { requestDelete, modalProps } = useDeleteWithConfirm<MediaItem>({
    canDelete: true,
    getLabel: (media) => media.name || media.filename,
    onDelete: async (media) => {
      await deleteMedia.mutateAsync(media.id);
    },
  });

  const mimeOptions = useMemo(
    () => [
      { value: "", label: t(messages.dashboard.media.list.filters.all) },
      { value: "image", label: t(messages.dashboard.media.list.filters.images) },
      { value: "video", label: t(messages.dashboard.media.list.filters.videos) },
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

  return (
    <PageShell>
      <Container>
        <PageHeader
          title={t(messages.dashboard.media.list.title)}
          subtitle={t(messages.dashboard.media.list.subtitle)}
          addLabel={t(messages.dashboard.media.list.createButton)}
          onAdd={() => router.push("/dashboard/media/create")}
        />

        <ListSection<MediaItem>
          canView
          authLoading={false}
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
              canEdit
              canDelete
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
}
