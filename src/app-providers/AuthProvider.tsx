"use client";

import type { ReactNode } from "react";
import type { User } from "@/entities/identity/users";
import { AuthProvider as BaseAuthProvider } from "@/entities/identity/auth";

type AuthProviderProps = {
  children: ReactNode;
  initialUser?: User | null;
};

export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  return <BaseAuthProvider initialUser={initialUser}>{children}</BaseAuthProvider>;
};
