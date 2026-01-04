import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** When true, renders error focus and border colors */
  invalid?: boolean;
};

export default function Input({ invalid, className, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={[
        "w-full rounded-md border px-3 py-2 text-sm outline-none",
        "bg-background text-text placeholder:text-muted",
        invalid
          ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          : "border-border focus:ring-2 focus:ring-primary focus:border-primary",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
