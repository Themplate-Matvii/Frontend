"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export enum ButtonVariantEnum {
  primary = "primary",
  secondary = "secondary",
  danger = "danger",
  icon = "icon",
  ghost = "ghost",
}

export enum ButtonSizeEnum {
  sm = "sm",
  md = "md",
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariantEnum;
  size?: ButtonSizeEnum;
}

export function Button({
  children,
  variant = ButtonVariantEnum.primary,
  size = ButtonSizeEnum.md,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isIcon = variant === ButtonVariantEnum.icon;

  return (
    <button
      disabled={disabled}
      className={clsx(
        "rounded-lg font-medium focus:outline-none min-w-min transition-all flex items-center justify-center",
        "overflow-hidden text-ellipsis whitespace-nowrap",
        !disabled && "active:scale-95",

        // disabled
        disabled && "opacity-50 cursor-not-allowed bg-muted text-surface",

        //
        // primary
        //
        !disabled &&
          variant === ButtonVariantEnum.primary &&
          "bg-primary text-onPrimary hover:bg-primaryHover",

        //
        // secondary
        // normal = surface, hover = secondary
        //
        !disabled &&
          variant === ButtonVariantEnum.secondary &&
          clsx(
            "inline-flex items-center justify-center",
            "rounded-md border border-border",
            "bg-surface text-text",
            "hover:bg-secondary hover:text-onPrimary transition-all duration-300"
          ),

        //
        // danger
        //
        !disabled &&
          variant === ButtonVariantEnum.danger &&
          "bg-danger text-onPrimary hover:opacity-90",

        //
        // icon
        //
        !disabled &&
          isIcon &&
          "bg-primary text-onPrimary hover:bg-primaryHover",

        //
        // ghost
        //
        !disabled &&
          variant === ButtonVariantEnum.ghost &&
          "bg-transparent text-text hover:bg-surface",

        // size rules
        size === ButtonSizeEnum.sm && !isIcon && "px-3 py-1 text-sm",
        size === ButtonSizeEnum.md && !isIcon && "px-4 py-2 text-base min-h-[40px]",

        size === ButtonSizeEnum.sm && isIcon && "w-9 h-9",
        size === ButtonSizeEnum.md && isIcon && "w-10 h-10",

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
