"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import { useI18n } from "@/shared/lib/i18n";
import { messages } from "@/i18n/messages";
import type { MediaItem } from "@/entities/content/media/model/types";

import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import { formatFileSize } from "@/shared/lib/files";
import { X } from "lucide-react";

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const filePreviewRef = useRef<string | null>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled}
              />
              <Button
                type="button"
                size={ButtonSizeEnum.md}
                variant={ButtonVariantEnum.secondary}
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="sm:w-auto w-full"
              >
                {t(messages.media.upload.selectFile)}
              </Button>

              <Small color={TextColorEnum.Secondary} className="flex-1">
                {t(messages.media.upload.deviceHint)}
              </Small>
            </div>
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
