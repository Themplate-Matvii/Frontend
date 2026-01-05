import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/shared/config";
import { appendSetCookies, getSetCookies } from "@/shared/lib/auth/bff";

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } },
) {
  const { provider } = params;
  const incomingCookie = request.headers.get("cookie") ?? "";
  const contentType = request.headers.get("content-type");
  const acceptLanguage = request.headers.get("accept-language");
  const body = await request.arrayBuffer();

  const backendResponse = await fetch(`${ENV.API_URL}/api/auth/oauth/${provider}`, {
    method: "POST",
    headers: {
      ...(contentType ? { "Content-Type": contentType } : {}),
      ...(acceptLanguage ? { "Accept-Language": acceptLanguage } : {}),
      ...(incomingCookie ? { cookie: incomingCookie } : {}),
    },
    body: body.byteLength ? body : undefined,
    cache: "no-store",
  });

  const responseBody = await backendResponse.text();
  const response = new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: {
      "Content-Type":
        backendResponse.headers.get("Content-Type") || "application/json",
    },
  });

  appendSetCookies(response.headers, getSetCookies(backendResponse));
  return response;
}
