import React from "react";
import { Footer } from "@/shared/layout/base/Footer";
import { Header } from "@/shared/layout/base/Header";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
