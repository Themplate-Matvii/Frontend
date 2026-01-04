"use client";

import React from "react";
import clsx from "clsx";
import { H2, Small, TextColorEnum } from "@/shared/ui/Typography";
import { X } from "lucide-react";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "../Button";

export enum ModalSize {
  sm = "sm",
  md = "md",
  lg = "lg",
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  size?: ModalSize;
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  size = ModalSize.md,
}) => {
  if (!open) return null;

  const sizeClass = {
    [ModalSize.sm]: "max-w-sm",
    [ModalSize.md]: "max-w-md",
    [ModalSize.lg]: "max-w-5xl",
  }[size];

  const handleBackdropClick = () => onClose();
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={clsx(
          "relative mx-auto w-full overflow-hidden rounded-xl border border-border bg-background shadow-lg",
          "p-5 sm:p-6",
          "max-h-[85vh] overflow-y-auto",
          sizeClass,
        )}
        onClick={stop}
      >
        {/* Close button – styled exactly as requested */}
        <Button
          type="button"
          variant={ButtonVariantEnum.secondary}
          size={ButtonSizeEnum.sm}
          onClick={onClose}
          className="absolute right-3 top-3 h-8 w-8 max-h-8 max-w-8 !px-0 !py-0"
        >
          <X size={18} />
        </Button>

        {(title || description) && (
          <div className="mb-4 space-y-1 pr-10">
            {title && (
              <H2 className="text-lg sm:text-xl" color={TextColorEnum.Default}>
                {title}
              </H2>
            )}
            {description && (
              <Small color={TextColorEnum.Secondary}>
                {description}
              </Small>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
