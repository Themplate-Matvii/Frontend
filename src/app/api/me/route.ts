import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/shared/config";
import {
  appendSetCookies,
  getSetCookies,
  mergeCookieHeader,
} from "@/shared/lib/auth/bff";

const ME_ENDPOINT = "/api/users/me";

const extractUser = (payload: any) => payload?.data ?? payload;

const fetchMe = async (cookieHeader: string) =>
  fetch(`${ENV.API_URL}${ME_ENDPOINT}`, {
    method: "GET",
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: "no-store",
  });

export async function GET(request: NextRequest) {
  const incomingCookie = request.headers.get("cookie") ?? "";

  const meResponse = await fetchMe(incomingCookie);
  if (meResponse.ok) {
    const data = extractUser(await meResponse.json());
    const response = NextResponse.json(data, { status: meResponse.status });
    appendSetCookies(response.headers, getSetCookies(meResponse));
    return response;
  }

  if (meResponse.status !== 401 && meResponse.status !== 403) {
    const response = NextResponse.json(
      await meResponse.json().catch(() => ({})),
      { status: meResponse.status },
    );
    appendSetCookies(response.headers, getSetCookies(meResponse));
    return response;
  }

  const refreshResponse = await fetch(`${ENV.API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: incomingCookie ? { cookie: incomingCookie } : {},
    cache: "no-store",
  });

  const refreshCookies = getSetCookies(refreshResponse);
  if (!refreshResponse.ok) {
    const response = NextResponse.json(
      await refreshResponse.json().catch(() => ({})),
      { status: 401 },
    );
    appendSetCookies(response.headers, refreshCookies);
    return response;
  }

  const mergedCookie = mergeCookieHeader(incomingCookie, refreshCookies);
  const retryResponse = await fetchMe(mergedCookie);
  const response = NextResponse.json(
    extractUser(await retryResponse.json().catch(() => ({}))),
    { status: retryResponse.status },
  );

  appendSetCookies(response.headers, refreshCookies);
  appendSetCookies(response.headers, getSetCookies(retryResponse));
  return response;
}
