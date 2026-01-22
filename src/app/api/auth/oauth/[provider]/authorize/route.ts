import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/shared/config";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;

  const incomingCookie = request.headers.get("cookie") ?? "";
  const acceptLanguage = request.headers.get("accept-language");

  const backendResponse = await fetch(
    `${ENV.API_URL}/api/auth/oauth/${provider}/authorize${request.nextUrl.search}`,
    {
      method: "GET",
      headers: {
        ...(acceptLanguage ? { "Accept-Language": acceptLanguage } : {}),
        ...(incomingCookie ? { cookie: incomingCookie } : {}),
      },
      cache: "no-store",
    },
  );

  const responseBody = await backendResponse.text();
  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: {
      "Content-Type":
        backendResponse.headers.get("Content-Type") || "application/json",
    },
  });
}

