"use client";

import type { MediaItem } from "@packages/api/modules/assets/media";
import { messages, useI18n } from "@packages/locales";

import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import { formatFileSize } from "@/shared/lib/files";

type MediaPreviewProps = {
  media: MediaItem;
};

export function MediaPreview({ media }: MediaPreviewProps) {
  const { t } = useI18n();
  const sizeLabel = formatFileSize(media.size);

  return (
    <div className="flex items-start gap-3">
      <div className="h-20 w-20 overflow-hidden rounded-md border border-border bg-surface">
        <img
          src={media.url}
          alt={media.name ?? media.filename}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex-1 space-y-1">
        <P className="font-semibold text-sm">{media.name ?? media.filename}</P>
        {media.description && (
          <Small color={TextColorEnum.Secondary}>{media.description}</Small>
        )}
        <Small color={TextColorEnum.Secondary}>
          {media.mimeType}
          {sizeLabel ? ` • ${sizeLabel}` : ""}
        </Small>
        <Small color={TextColorEnum.Secondary}>
          {t(messages.media.item.uploadedAt, {
            date: new Date(media.createdAt).toLocaleString(),
          })}
        </Small>
      </div>
    </div>
  );
}

export default MediaPreview;
