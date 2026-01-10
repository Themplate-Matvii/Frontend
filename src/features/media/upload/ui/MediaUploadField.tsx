"use client";

import type { ClipboardEvent, KeyboardEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { DropZone } from "react-aria-components";
import { isFileDropItem } from "react-aria";

import { useI18n } from "@/shared/lib/i18n";
import { messages } from "@/i18n/messages";
import type { MediaItem } from "@/entities/content/media/model/types";

import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import Spinner from "@/shared/ui/loading/Spinner";
import { Small, TextColorEnum } from "@/shared/ui/Typography";
import { Link as LinkIcon, Pencil, Upload, X } from "lucide-react";

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
  isUploading?: boolean;
};

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const imageExtensionRegex =
  /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?.*)?$/i;

function extractFirstUriListEntry(value: string): string | null {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const entry = lines.find((line) => !line.startsWith("#"));
  return entry || null;
}

function extractImageFromHtml(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

async function isRemoteImage(url: string): Promise<boolean> {
  if (imageExtensionRegex.test(url)) return true;
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("content-type");
    return Boolean(contentType?.startsWith("image/"));
  } catch {
    return true;
  }
}

export function MediaUploadField({
  label,
  savedMedia,
  onSavedChange,
  onSelectionChange,
  error,
  disabled,
  isUploading = false,
}: MediaUploadFieldProps) {
  const { t } = useI18n();

  const filePreviewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputId = useId();

  const [selection, setSelection] = useState<MediaUploadSelection | null>(null);
  const [urlInput, setUrlInput] = useState<string>("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);

  useEffect(() => {
    return () => {
      if (filePreviewRef.current) {
        URL.revokeObjectURL(filePreviewRef.current);
      }
    };
  }, []);

  useEffect(() => {
    onSelectionChange?.(selection);
  }, [selection, onSelectionChange]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const handleChange = () => setIsCoarsePointer(mediaQuery.matches);
    handleChange();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const displayPreview = selection ?? savedMedia ?? null;

  const previewName =
    displayPreview && "previewUrl" in displayPreview
      ? displayPreview.name || t(messages.media.upload.previewNameFallback)
      : displayPreview
        ? displayPreview.name ?? displayPreview.filename
        : null;

  const handleFileSelection = (file: File | null) => {
    if (!file || disabled) return;
    if (!file.type.startsWith("image/")) {
      setPreviewError(t(messages.media.upload.previewError));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (filePreviewRef.current) {
      URL.revokeObjectURL(filePreviewRef.current);
    }
    filePreviewRef.current = previewUrl;

    setPreviewError(null);
    setUrlError(null);
    setUrlInput("");
    setShowUrlInput(false);
    const nextSelection: MediaUploadSelection = {
      type: "file",
      file,
      previewUrl,
      name: file.name,
    };
    setSelection(nextSelection);
  };

  const handleFileChange = (files: FileList | null) => {
    handleFileSelection(files?.[0] ?? null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlInputChange = (value: string) => {
    setUrlInput(value);
    setPreviewError(null);
    setUrlError(null);
  };

  const applyUrlSelection = async (rawValue: string) => {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      setUrlError(null);
      return;
    }
    if (!isValidHttpUrl(trimmed)) {
      setUrlError(t(messages.media.upload.previewError));
      return;
    }

    setIsCheckingUrl(true);
    const isImage = await isRemoteImage(trimmed);
    setIsCheckingUrl(false);

    if (!isImage) {
      setUrlError(t(messages.media.upload.previewError));
      return;
    }

    const nextSelection: MediaUploadSelection = {
      type: "url",
      url: trimmed,
      previewUrl: trimmed,
      name: undefined,
    };
    setSelection(nextSelection);
    setPreviewError(null);
    setUrlError(null);
    setUrlInput(trimmed);
    setShowUrlInput(true);
  };

  const handleUrlSave = async () => {
    await applyUrlSelection(urlInput);
  };

  const handleUrlKeyDown = async (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleUrlSave();
    }
  };

  const handleClearSelection = () => {
    setPreviewError(null);
    setUrlError(null);

    setSelection(null);
    setUrlInput("");
    setShowUrlInput(false);
    if (filePreviewRef.current) {
      URL.revokeObjectURL(filePreviewRef.current);
      filePreviewRef.current = null;
    }
  };

  const handleClearSaved = () => {
    setPreviewError(null);
    setUrlError(null);
    setSelection(null);
    setUrlInput("");
    setShowUrlInput(false);
    if (filePreviewRef.current) {
      URL.revokeObjectURL(filePreviewRef.current);
      filePreviewRef.current = null;
    }
    onSavedChange?.(null);
  };

  const handlePreviewError = () => {
    setPreviewError(t(messages.media.upload.previewError));
    if (selection?.type === "file") {
      if (filePreviewRef.current) {
        URL.revokeObjectURL(filePreviewRef.current);
        filePreviewRef.current = null;
      }
    }
    setSelection(null);
  };

  const footerMessage = [error, urlError, previewError].filter(Boolean).join(" • ");

  const handlePaste = async (event: ClipboardEvent<HTMLElement>) => {
    if (disabled) return;
    const clipboard = event.clipboardData;
    if (!clipboard) return;

    const items = Array.from(clipboard.items ?? []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        event.preventDefault();
        handleFileSelection(file);
        return;
      }
    }

    const uriList = clipboard.getData("text/uri-list");
    const plainText = clipboard.getData("text/plain");
    const htmlText = clipboard.getData("text/html");

    const htmlImage = htmlText ? extractImageFromHtml(htmlText) : null;
    const rawValue =
      (uriList ? extractFirstUriListEntry(uriList) : null) ||
      htmlImage ||
      (plainText ? plainText.trim() : null);

    if (!rawValue || !isValidHttpUrl(rawValue)) return;

    event.preventDefault();
    setUrlInput(rawValue);
    setShowUrlInput(true);
    await applyUrlSelection(rawValue);
  };

  const handleOpenPicker = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

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
      <div className="space-y-3 focus:outline-none" onPaste={handlePaste} tabIndex={0}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {displayPreview && (
            <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-surface/60">
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
                className="h-full w-full object-cover"
                onError={handlePreviewError}
              />
              <Button
                type="button"
                size={ButtonSizeEnum.sm}
                variant={ButtonVariantEnum.secondary}
                onClick={
                  "previewUrl" in displayPreview
                    ? handleClearSelection
                    : handleClearSaved
                }
                disabled={disabled}
                className="absolute right-2 top-2 h-7 w-7 !px-0 !py-0"
                aria-label={t(messages.media.upload.remove)}
              >
                <X size={14} />
              </Button>
              <Button
                type="button"
                size={ButtonSizeEnum.sm}
                variant={ButtonVariantEnum.icon}
                onClick={handleOpenPicker}
                disabled={disabled}
                className="absolute bottom-2 right-2 h-7 w-7 !px-0 !py-0"
                aria-label={t(messages.media.upload.replace)}
              >
                <Pencil size={14} />
              </Button>
            </div>
          )}

          <div className="flex-1 space-y-2">
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
              onClick={handleOpenPicker}
              onKeyDown={(event) => {
                if (disabled) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpenPicker();
                }
              }}
              className={({ isDropTarget, isFocusVisible }) =>
                clsx(
                  "flex w-full flex-col items-start gap-2 rounded-xl border border-dashed px-5 py-6 text-sm transition",
                  "bg-surface/50 text-secondary",
                  isDropTarget && "border-primary bg-primary/5 text-text",
                  isFocusVisible && "ring-2 ring-primary/30",
                  disabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:border-primary/60 hover:bg-primary/5",
                )
              }
              aria-busy={isUploading || isCheckingUrl}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-primary">
                  <Upload size={18} />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-text">
                    {t(
                      isCoarsePointer
                        ? messages.media.upload.dropzoneTitleMobile
                        : messages.media.upload.dropzoneTitleDesktop,
                    )}
                  </p>
                  <p className="text-xs text-secondary">
                    {t(
                      isCoarsePointer
                        ? messages.media.upload.dropzoneSubtitleMobile
                        : messages.media.upload.dropzoneSubtitleDesktop,
                    )}
                  </p>
                </div>
              </div>
              {(isUploading || isCheckingUrl) && (
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <Spinner size={14} />
                  <span>{t(messages.common.loading)}</span>
                </div>
              )}
            </DropZone>

            {showUrlInput ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Input
                    id="media-url"
                    value={urlInput}
                    onChange={(event) => handleUrlInputChange(event.target.value)}
                    onKeyDown={handleUrlKeyDown}
                    placeholder={t(messages.media.upload.urlPlaceholder)}
                    disabled={disabled}
                    className="w-full"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                    <LinkIcon size={16} />
                  </span>
                </div>
                <Button
                  type="button"
                  size={ButtonSizeEnum.sm}
                  variant={ButtonVariantEnum.secondary}
                  onClick={handleUrlSave}
                  disabled={
                    disabled || isCheckingUrl || !isValidHttpUrl(urlInput.trim())
                  }
                  className="sm:min-w-[90px]"
                >
                  {isCheckingUrl ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size={14} />
                      {t(messages.common.loading)}
                    </span>
                  ) : (
                    t(messages.media.upload.modalLinkSave)
                  )}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size={ButtonSizeEnum.sm}
                variant={ButtonVariantEnum.ghost}
                onClick={() => setShowUrlInput(true)}
                disabled={disabled}
                className="inline-flex items-center gap-2 self-start text-xs"
              >
                <LinkIcon size={14} />
                {t(messages.media.upload.uploadFromUrl)}
              </Button>
            )}
          </div>
        </div>

        {previewName && (
          <Small color={TextColorEnum.Secondary} className="block">
            {previewName}
          </Small>
        )}
      </div>
    </Field>
  );
}
