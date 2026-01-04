"use server";
import { AUTH } from "@/shared/config";
import { cookies } from "next/headers";

export async function readTokens() {
  const jar = await cookies(); // new async API in Next 14.3+
  return {
    access: jar.get(AUTH.TOKEN_COOKIE_KEY)?.value ?? null,
    refresh: jar.get(AUTH.REFRESH_COOKIE_KEY)?.value ?? null,
  };
}

export async function setTokens(next: {
  access?: string;
  refresh?: string;
  accessMaxAge?: number;
  refreshMaxAge?: number;
}) {
  const jar = await cookies();
  if (next.access) {
    jar.set(AUTH.TOKEN_COOKIE_KEY, next.access, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: next.accessMaxAge ?? 60 * 15,
    });
  }
  if (next.refresh) {
    jar.set(AUTH.REFRESH_COOKIE_KEY, next.refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: next.refreshMaxAge ?? 60 * 60 * 24 * 30,
    });
  }
}

export async function clearTokens() {
  const jar = await cookies();
  jar.delete(AUTH.TOKEN_COOKIE_KEY);
  jar.delete(AUTH.REFRESH_COOKIE_KEY);
}
