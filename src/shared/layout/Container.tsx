"use client";

import React from "react";

export enum ContainerSizeEnum {
  Default = "default",
  Narrow = "narrow",
}

type Props = {
  children: React.ReactNode;
  className?: string;
  size?: ContainerSizeEnum;
};

/**
 * Centers the content and limits its maximum width.
 * Supports two sizes: Default (7xl) and Narrow (2xl).
 */
export function Container({
  children,
  className = "",
  size = ContainerSizeEnum.Default,
}: Props) {
  const maxWidth =
    size === ContainerSizeEnum.Narrow ? "max-w-6xl" : "max-w-7xl";

  return (
    <div className={`w-full ${maxWidth} mx-auto px-4 py-10 space-y-6 ${className}`}>
      {children}
    </div>
  );
}
