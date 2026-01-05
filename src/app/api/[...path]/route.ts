import { NextResponse } from "next/server";
import { ENV } from "@/shared/config";
import { appendSetCookies, getSetCookies } from "@/shared/lib/auth/bff";

const buildTargetUrl = (path: string[], search: string) =>
  `${ENV.API_URL}/api/${path.join("/")}${search}`;

const proxyRequest = async (request: Request, path: string[]) => {
  const targetUrl = buildTargetUrl(path, new URL(request.url).search);
  const headers = new Headers(request.headers);

  const isBodyAllowed = !["GET", "HEAD"].includes(request.method);
  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    body: isBodyAllowed ? request.body : undefined,
    cache: "no-store",
    redirect: "manual",
  };

  if (isBodyAllowed) {
    init.duplex = "half";
  }

  const response = await fetch(targetUrl, init);

  const nextResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  const setCookies = getSetCookies(response);
  if (setCookies.length) {
    nextResponse.headers.delete("set-cookie");
    appendSetCookies(nextResponse.headers, setCookies);
  }

  return nextResponse;
};

export const dynamic = "force-dynamic";

const resolvePath = async (context: { params: Promise<{ path?: string[] }> }) => {
  const params = await context.params;
  return params?.path ?? [];
};

export async function GET(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const path = await resolvePath(context);
  return proxyRequest(request, path);
}

export async function POST(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const path = await resolvePath(context);
  return proxyRequest(request, path);
}

export async function PUT(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const path = await resolvePath(context);
  return proxyRequest(request, path);
}

export async function PATCH(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const path = await resolvePath(context);
  return proxyRequest(request, path);
}

export async function DELETE(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const path = await resolvePath(context);
  return proxyRequest(request, path);
}
