"use client";

import { PropsWithChildren } from "react";
import clsx from "clsx";

export enum FormMessageVariant {
  success = "success",
  error = "error",
}

type Props = PropsWithChildren<{
  variant?: FormMessageVariant;
  className?: string;
  id?: string;
}>;

/**
 * Accessible form message for success and error states.
 * Use role="alert" for errors and role="status" for success.
 */
export default function FormMessage({
  variant = FormMessageVariant.error,
  className,
  children,
  id,
}: Props) {
  const isError = variant === FormMessageVariant.error;

  return (
    <p
      id={id}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={clsx(
        "rounded-md px-3 py-2 text-sm",

        // Error
        isError && "border border-danger bg-dangerSoft text-danger",

        // Success
        !isError && "border border-success bg-successSoft text-success",

        className,
      )}
    >
      {children}
    </p>
  );
}
