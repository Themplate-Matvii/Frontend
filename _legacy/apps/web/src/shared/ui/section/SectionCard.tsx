"use client";

import type { PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";

import { P, Small } from "@/shared/ui/Typography";

type SectionCardProps = PropsWithChildren<{
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  id?: string;
}>;

export function SectionCard({
  title,
  description,
  children,
  className,
  headerClassName,
  bodyClassName,
  id,
}: SectionCardProps) {
  const hasHeader = title || description;

  return (
    <section
      id={id}
      className={clsx(
        "rounded-xl border border-border bg-surface p-4 lg:p-5 space-y-4",
        className,
      )}
    >
      {hasHeader && (
        <div className={clsx("space-y-1", headerClassName)}>
          {title && (
            <P className="text-sm font-semibold">
              {title}
            </P>
          )}
          {description && (
            <Small>
              {description}
            </Small>
          )}
        </div>
      )}

      {children && (
        <div className={bodyClassName}>
          {children}
        </div>
      )}
    </section>
  );
}
