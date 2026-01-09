"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { DropZone } from "react-aria-components";
import { isFileDropItem } from "react-aria";

import { useI18n } from "@/shared/lib/i18n";
import { messages } from "@/i18n/messages";
import type { MediaItem } from "@/entities/content/media/model/types";

import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { Small, TextColorEnum } from "@/shared/ui/Typography";
import { formatFileSize } from "@/shared/lib/files";
import { Info, X } from "lucide-react";
import Tooltip from "@/shared/ui/Tooltip";

export type MediaUploadSelection =
  | {
      type: "file";
      file: File;
      previewUrl: string;
      name?: string;
    }
  | {
      type: "url";
      url: string;
      previewUrl: string;
      name?: string;
    };

type MediaUploadFieldProps = {
  label: string;
  savedMedia?: MediaItem | null;
  onSavedChange?: (media: MediaItem | null) => void;
  onSelectionChange?: (selection: MediaUploadSelection | null) => void;
  error?: string | null;
  disabled?: boolean;
};

type UploadMode = "file" | "url";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function MediaUploadField({
  label,
  savedMedia,
  onSavedChange,
  onSelectionChange,
  error,
  disabled,
}: MediaUploadFieldProps) {
  const { t } = useI18n();

  const filePreviewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputId = useId();

  const [mode, setMode] = useState<UploadMode>("file");
  const [fileSelection, setFileSelection] = useState<MediaUploadSelection | null>(null);
  const [urlSelection, setUrlSelection] = useState<MediaUploadSelection | null>(null);
  const [urlInput, setUrlInput] = useState<string>("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (filePreviewRef.current) {
        URL.revokeObjectURL(filePreviewRef.current);
      }
    };
  }, []);

  const activeSelection = mode === "file" ? fileSelection : urlSelection;

  useEffect(() => {
    onSelectionChange?.(activeSelection);
  }, [activeSelection, onSelectionChange]);

  const displayPreview = activeSelection ?? savedMedia ?? null;

  const formattedSize = useMemo(() => {
    if (!displayPreview || "previewUrl" in displayPreview) return null;
    return formatFileSize(displayPreview.size);
  }, [displayPreview]);

  const handleModeChange = (nextMode: UploadMode) => {
    setMode(nextMode);
    setPreviewError(null);
    setUrlError(null);

    if (nextMode === "file") {
      onSelectionChange?.(fileSelection);
    } else {
      onSelectionChange?.(urlSelection);
    }
  };

  const handleFileSelection = (file: File | null) => {
    if (!file || disabled) return;

    const previewUrl = URL.createObjectURL(file);
    if (filePreviewRef.current) {
      URL.revokeObjectURL(filePreviewRef.current);
    }
    filePreviewRef.current = previewUrl;

    setPreviewError(null);
    setUrlError(null);
    const selection: MediaUploadSelection = {
      type: "file",
      file,
      previewUrl,
      name: file.name,
    };
    setFileSelection(selection);
    setMode("file");
    onSelectionChange?.(selection);
  };

  const handleFileChange = (files: FileList | null) => {
    handleFileSelection(files?.[0] ?? null);
  };

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    setPreviewError(null);

    const trimmed = value.trim();

    if (!trimmed) {
      setUrlError(null);
      setUrlSelection(null);
      onSelectionChange?.(null);
      return;
    }

    if (!isValidHttpUrl(trimmed)) {
      setUrlError(t(messages.media.upload.previewError))
      setUrlSelection(null);
      onSelectionChange?.(null);
      return;
    }

    setUrlError(null);
    const selection: MediaUploadSelection = {
      type: "url",
      url: trimmed,
      previewUrl: trimmed,
      name: undefined,
    };
    setUrlSelection(selection);
    setMode("url");
    onSelectionChange?.(selection);
  };

  const handleClearSelection = () => {
    setPreviewError(null);
    setUrlError(null);

    if (mode === "file") {
      setFileSelection(null);
      if (filePreviewRef.current) {
        URL.revokeObjectURL(filePreviewRef.current);
        filePreviewRef.current = null;
      }
    } else {
      setUrlSelection(null);
      setUrlInput("");
    }
    onSelectionChange?.(null);
  };

  const handleClearSaved = () => {
    setPreviewError(null);
    setUrlError(null);
    onSavedChange?.(null);
    onSelectionChange?.(null);
  };

  const handlePreviewError = () => {
    setPreviewError(t(messages.media.upload.previewError));
    if (mode === "file") {
      setFileSelection(null);
      if (filePreviewRef.current) {
        URL.revokeObjectURL(filePreviewRef.current);
        filePreviewRef.current = null;
      }
    } else {
      setUrlSelection(null);
    }
    onSelectionChange?.(null);
  };

  const footerMessage = [error, urlError, previewError].filter(Boolean).join(" • ");

  return (
    <Field
      id="media-upload"
      label={label}
      footer={
        footerMessage && (
          <Small color={TextColorEnum.Danger} className="block">
            {footerMessage}
          </Small>
        )
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {(["file", "url"] as UploadMode[]).map((item) => (
            <Button
              key={item}
              type="button"
              size={ButtonSizeEnum.sm}
              variant={mode === item ? ButtonVariantEnum.primary : ButtonVariantEnum.secondary}
              onClick={() => handleModeChange(item)}
              disabled={disabled}
              className="!max-h-[28px]"
            >
              {t(
                item === "file"
                  ? messages.media.upload.sourceDevice
                  : messages.media.upload.sourceUrl,
              )}
            </Button>
          ))}
        </div>

        {displayPreview && (
          <div className="relative">
            <div className="relative inline-block">
              <img
                src={
                  "previewUrl" in displayPreview
                    ? displayPreview.previewUrl
                    : displayPreview.url
                }
                alt={
                  "previewUrl" in displayPreview
                    ? displayPreview.name || t(messages.media.upload.previewAlt)
                    : displayPreview.name ?? displayPreview.filename
                }
                className="max-h-40 rounded-md object-contain"
                onError={handlePreviewError}
              />
              <button
                type="button"
                onClick={
                  "previewUrl" in displayPreview ? handleClearSelection : handleClearSaved
                }
                className="absolute right-1 top-1 rounded-full bg-background text-text border border-border flex justify-center items-center min-h-4 min-w-4 leading-none shadow-sm"
                disabled={disabled}
              >
                <X size={14} strokeWidth={2} className="w-3" />
              </button>
            </div>
            <Small color={TextColorEnum.Secondary} className="flex-1 mt-1">
              {fileSelection?.name}
            </Small>
          </div>
        )}

        {mode === "file" ? (
          <div className="flex flex-col gap-2">
            <input
              id={fileInputId}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => handleFileChange(event.target.files)}
              disabled={disabled}
            />
            <DropZone
              isDisabled={disabled}
              onDrop={async (event) => {
                if (disabled) return;
                for (const item of event.items) {
                  if (isFileDropItem(item)) {
                    const file = await item.getFile();
                    handleFileSelection(file);
                    break;
                  }
                }
              }}
              onClick={() => {
                if (disabled) return;
                fileInputRef.current?.click();
              }}
              onKeyDown={(event) => {
                if (disabled) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={({ isDropTarget, isFocusVisible }) =>
                clsx(
                  "flex w-full items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-4 text-sm transition",
                  "bg-surface/50 text-secondary",
                  isDropTarget && "border-primary bg-primary/5 text-text",
                  isFocusVisible && "ring-2 ring-primary/30",
                  disabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:border-primary/60 hover:bg-primary/5",
                )
              }
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm text-text">
                  {t(messages.media.upload.dropzoneText)}
                </span>
                <span className="text-xs text-secondary">
                  {t(messages.media.upload.deviceHint)}
                </span>
              </div>

              <Tooltip content={t(messages.media.upload.helper)}>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted">
                  <Info size={16} />
                </span>
              </Tooltip>
            </DropZone>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="media-url"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={t(messages.media.upload.urlPlaceholder)}
              disabled={disabled}
              className="flex-1"
            />
          </div>
        )}
      </div>
    </Field>
  );
}
