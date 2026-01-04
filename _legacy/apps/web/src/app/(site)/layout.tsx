"use client";

import { Footer } from "@/shared/layout/base/Footer";
import { Header } from "@/shared/layout/base/Header";
import React, { PropsWithChildren } from "react";

export default function SiteLayout({
  children,
}:PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
