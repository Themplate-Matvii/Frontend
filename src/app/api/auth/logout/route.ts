import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/shared/config";
import { appendSetCookies, getSetCookies } from "@/shared/lib/auth/bff";

export async function POST(request: NextRequest) {
  const incomingCookie = request.headers.get("cookie") ?? "";

  const backendResponse = await fetch(`${ENV.API_URL}/api/auth/logout`, {
    method: "POST",
    headers: incomingCookie ? { cookie: incomingCookie } : {},
    cache: "no-store",
  });

  const response = new NextResponse(null, {
    status: backendResponse.status,
  });

  appendSetCookies(response.headers, getSetCookies(backendResponse));
  return response;
}
