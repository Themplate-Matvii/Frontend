import { cache } from "react";
import { ENV } from "@/shared/config";
import { User } from "@/entities/identity/users/model/user/types";
import { cookies } from "next/headers";
import { getSetCookies, mergeCookieHeader } from "@/shared/lib/auth/bff";

/**
 * getUser:
 * - Single call per request via React cache()
 * - Resolves current user from backend via cookie-based session
 */
export const getUser = cache(async (): Promise<User | null> => {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  if (!cookieHeader) return null;

  const fetchMe = async (cookie: string) =>
    fetch(`${ENV.API_URL}/api/users/me`, {
      method: "GET",
      headers: cookie ? { cookie } : {},
      cache: "no-store",
    });

  const extractUser = (payload: any) => payload?.data ?? payload;

  const meResponse = await fetchMe(cookieHeader);
  if (meResponse.ok) {
    return extractUser(await meResponse.json());
  }

  if (meResponse.status !== 401 && meResponse.status !== 403) {
    return null;
  }

  const refreshResponse = await fetch(`${ENV.API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: "no-store",
  });

  if (!refreshResponse.ok) {
    return null;
  }

  const mergedCookie = mergeCookieHeader(cookieHeader, getSetCookies(refreshResponse));
  const retryResponse = await fetchMe(mergedCookie);
  if (!retryResponse.ok) return null;

  return extractUser(await retryResponse.json());
});
