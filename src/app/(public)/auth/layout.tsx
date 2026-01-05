import React from "react";
import AuthGate from "@/widgets/auth/AuthGate";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGate mode="auth">{children}</AuthGate>;
}
