"use client";

import type { ClipboardEvent } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  Dialog,
  DropZone,
  Modal,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "react-aria-components";
import { isFileDropItem } from "react-aria";

import { useI18n } from "@/shared/lib/i18n";
import { messages } from "@/i18n/messages";
import type { MediaItem } from "@/entities/content/media/model/types";

import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { Small, TextColorEnum } from "@/shared/ui/Typography";
import { formatFileSize } from "@/shared/lib/files";
import { Link as LinkIcon, Upload, X } from "lucide-react";

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

type UploadTab = "upload" | "link";

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

  const [selection, setSelection] = useState<MediaUploadSelection | null>(null);
  const [urlInput, setUrlInput] = useState<string>("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<UploadTab>("upload");
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

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

  const formattedSize = useMemo(() => {
    if (!displayPreview) return null;
    if ("previewUrl" in displayPreview) {
      return displayPreview.type === "file"
        ? formatFileSize(displayPreview.file.size)
        : null;
    }
    return formatFileSize(displayPreview.size);
  }, [displayPreview]);

  const previewName =
    displayPreview && "previewUrl" in displayPreview
      ? displayPreview.name || t(messages.media.upload.previewNameFallback)
      : displayPreview
        ? displayPreview.name ?? displayPreview.filename
        : null;

  const previewMeta =
    displayPreview && "previewUrl" in displayPreview
      ? displayPreview.type === "url"
        ? displayPreview.url
        : formattedSize
      : formattedSize;

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
    const nextSelection: MediaUploadSelection = {
      type: "file",
      file,
      previewUrl,
      name: file.name,
    };
    setSelection(nextSelection);
    setIsModalOpen(false);
  };

  const handleFileChange = (files: FileList | null) => {
    handleFileSelection(files?.[0] ?? null);
  };

  const handleUrlInputChange = (value: string) => {
    setUrlInput(value);
    setPreviewError(null);
    setUrlError(null);
  };

  const handleUrlSave = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError(null);
      return;
    }
    if (!isValidHttpUrl(trimmed)) {
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
    setUrlError(null);
    setIsModalOpen(false);
  };

  const handleClearSelection = () => {
    setPreviewError(null);
    setUrlError(null);

    setSelection(null);
    setUrlInput("");
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

  const handlePaste = (event: ClipboardEvent<HTMLElement>) => {
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

    const text = clipboard.getData("text");
    if (!text) return;
    const trimmed = text.trim();
    if (!isValidHttpUrl(trimmed)) return;
    event.preventDefault();
    setUrlInput(trimmed);
    setUrlError(null);
    setActiveTab("link");
    setIsModalOpen(true);
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
      <div className="space-y-3">
        {displayPreview && (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/60 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
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
                className="h-20 w-20 rounded-lg object-cover"
                onError={handlePreviewError}
              />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-text">{previewName}</p>
                <Small color={TextColorEnum.Secondary} className="block">
                  {previewMeta}
                </Small>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size={ButtonSizeEnum.sm}
                variant={ButtonVariantEnum.secondary}
                onClick={() => {
                  setActiveTab("upload");
                  setIsModalOpen(true);
                }}
                disabled={disabled}
                className="min-w-[110px]"
              >
                {t(messages.media.upload.replace)}
              </Button>
              <Button
                type="button"
                size={ButtonSizeEnum.sm}
                variant={ButtonVariantEnum.secondary}
                onClick={
                  "previewUrl" in displayPreview ? handleClearSelection : handleClearSaved
                }
                disabled={disabled}
                className="min-w-[90px]"
              >
                {t(messages.media.upload.remove)}
              </Button>
            </div>
          </div>
        )}

        <input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => handleFileChange(event.target.files)}
          disabled={disabled}
        />
        {!displayPreview && (
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
            onPaste={handlePaste}
            onClick={() => {
              if (disabled) return;
              setActiveTab("upload");
              setIsModalOpen(true);
            }}
            onKeyDown={(event) => {
              if (disabled) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveTab("upload");
                setIsModalOpen(true);
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
          </DropZone>
        )}
      </div>

      <ModalOverlay
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        isDismissable
        className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/70 backdrop-blur-sm sm:items-center"
      >
        <Modal className="w-full sm:max-w-lg">
          <Dialog
            className="relative mx-auto w-full rounded-2xl border border-border bg-background p-5 shadow-xl sm:p-6"
            onPaste={handlePaste}
            aria-label={t(messages.media.upload.modalTitle)}
          >
            <Button
              type="button"
              variant={ButtonVariantEnum.secondary}
              size={ButtonSizeEnum.sm}
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 h-8 w-8 max-h-8 max-w-8 !px-0 !py-0"
            >
              <X size={18} />
            </Button>
            <div className="space-y-1 pr-10">
              <p className="text-base font-semibold text-text">
                {t(messages.media.upload.modalTitle)}
              </p>
              <Small color={TextColorEnum.Secondary}>
                {t(messages.media.upload.modalDescription)}
              </Small>
            </div>

            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as UploadTab)}
              className="mt-4"
            >
              <TabList className="flex rounded-full border border-border bg-surface p-1 text-sm">
                <Tab
                  id="upload"
                  className="flex-1 rounded-full px-3 py-2 text-center text-xs font-medium transition data-[selected]:bg-background data-[selected]:text-text data-[selected]:shadow-sm"
                >
                  {t(messages.media.upload.modalTabUpload)}
                </Tab>
                <Tab
                  id="link"
                  className="flex-1 rounded-full px-3 py-2 text-center text-xs font-medium transition data-[selected]:bg-background data-[selected]:text-text data-[selected]:shadow-sm"
                >
                  {t(messages.media.upload.modalTabLink)}
                </Tab>
              </TabList>

              <TabPanel id="upload" className="mt-5 space-y-4">
                <div className="rounded-xl border border-dashed border-border bg-surface/60 p-4">
                  <Button
                    type="button"
                    size={ButtonSizeEnum.md}
                    variant={ButtonVariantEnum.primary}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="w-full"
                  >
                    {t(messages.media.upload.modalUploadAction)}
                  </Button>
                  <p className="mt-3 text-xs text-secondary">
                    {t(
                      isCoarsePointer
                        ? messages.media.upload.modalUploadHintMobile
                        : messages.media.upload.modalUploadHintDesktop,
                    )}
                  </p>
                </div>
              </TabPanel>

              <TabPanel id="link" className="mt-5 space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Input
                      id="media-url"
                      value={urlInput}
                      onChange={(event) => handleUrlInputChange(event.target.value)}
                      placeholder={t(messages.media.upload.modalLinkPlaceholder)}
                      disabled={disabled}
                      className="w-full"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                      <LinkIcon size={16} />
                    </span>
                  </div>
                  <Button
                    type="button"
                    size={ButtonSizeEnum.md}
                    variant={ButtonVariantEnum.primary}
                    onClick={handleUrlSave}
                    disabled={disabled || !isValidHttpUrl(urlInput.trim())}
                    className="sm:min-w-[110px]"
                  >
                    {t(messages.media.upload.modalLinkSave)}
                  </Button>
                </div>
                {urlError && (
                  <Small color={TextColorEnum.Danger} className="block">
                    {urlError}
                  </Small>
                )}
              </TabPanel>
            </Tabs>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </Field>
  );
}
