import * as React from "react";

export default function FormError({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        rounded
        border
        border-danger
        bg-dangerSoft
        text-danger
        px-3 py-2
        text-sm
      "
    >
      {children}
    </div>
  );
}
