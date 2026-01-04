"use client";

import React from "react";
import clsx from "clsx";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "animate-pulse rounded-md bg-muted/50 dark:bg-muted/30",
        className,
      )}
    />
  );
}
