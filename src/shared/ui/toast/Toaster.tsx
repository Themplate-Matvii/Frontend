"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      visibleToasts={1}
      expand
      toastOptions={{
        duration: 4000,
        className:
          "bg-transparent shadow-none border-0 p-0 m-0 pointer-events-auto",
      }}
    />
  );
}
