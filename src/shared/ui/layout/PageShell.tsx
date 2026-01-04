"use client";

import React from "react";
import clsx from "clsx";

type Props = React.PropsWithChildren<{
  className?: string;
}>;

export function PageShell({ children, className }: Props) {
  return (
    <div
      className={clsx(
        "bg-background text-text transition-colors duration-300 flex-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
