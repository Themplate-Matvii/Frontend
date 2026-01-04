"use client";

import React from "react";
import { Skeleton } from "@/shared/ui/loading/Skeleton";

type ListSkeletonProps = {
  rows?: number;
};

export function ListSkeleton({ rows = 5 }: ListSkeletonProps) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`list-skeleton-${index}`}
          className="rounded-lg border border-border bg-background/80 p-4"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
