"use client";

import React, { HTMLAttributes } from "react";
import clsx from "clsx";

export enum TextColorEnum {
  Default = "text-text",
  Secondary = "text-secondary",
  Muted = "text-muted",
  Primary = "text-primary",
  Hover = "text-primaryHover",
  Danger = "text-danger",
  Success = "text-success",
  Warning = "text-warning",
}

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  color?: TextColorEnum;
};
type ParaProps = HTMLAttributes<HTMLParagraphElement> & {
  color?: TextColorEnum;
};
type UlProps = HTMLAttributes<HTMLUListElement> & { color?: TextColorEnum };

export const H1 = ({
  className,
  color = TextColorEnum.Default,
  ...p
}: HeadingProps) => (
  <h1
    className={clsx(
      "font-bold tracking-tight",
      "text-3xl sm:text-4xl md:text-5xl",
      color,
      className,
    )}
    {...p}
  />
);

export const H2 = ({
  className,
  color = TextColorEnum.Primary,
  ...p
}: HeadingProps) => (
  <h2
    className={clsx(
      "font-semibold tracking-tight",
      "text-2xl sm:text-3xl",
      color,
      className,
    )}
    {...p}
  />
);

export const Lead = ({
  className,
  color = TextColorEnum.Secondary,
  ...p
}: ParaProps) => (
  <p
    className={clsx(
      "leading-relaxed",
      "text-base sm:text-lg",
      color,
      className,
    )}
    {...p}
  />
);

export const P = ({
  className,
  color = TextColorEnum.Default,
  ...p
}: ParaProps) => (
  <p
    className={clsx(
      "leading-relaxed",
      "text-sm sm:text-base",
      color,
      className,
    )}
    {...p}
  />
);

export const Small = ({
  className,
  color = TextColorEnum.Muted,
  ...p
}: ParaProps) => <p className={clsx("text-xs", color, className)} {...p} />;

export const UL = ({
  className,
  color = TextColorEnum.Muted,
  ...p
}: UlProps) => (
  <ul
    className={clsx("list-disc list-inside space-y-1", color, className)}
    {...p}
  />
);
