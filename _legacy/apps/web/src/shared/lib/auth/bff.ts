export const getSetCookies = (response: Response): string[] => {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const raw = response.headers.get("set-cookie");
  return raw ? [raw] : [];
};

export const appendSetCookies = (headers: Headers, cookies: string[]) => {
  cookies.forEach((cookie) => headers.append("set-cookie", cookie));
};

export const mergeCookieHeader = (baseCookie: string, setCookies: string[]) => {
  const cookieMap = new Map<string, string>();

  baseCookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const idx = part.indexOf("=");
      if (idx === -1) return;
      const name = part.slice(0, idx);
      const value = part.slice(idx + 1);
      cookieMap.set(name, value);
    });

  setCookies.forEach((cookie) => {
    const [pair] = cookie.split(";");
    if (!pair) return;
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (!name) return;
    cookieMap.set(name, value);
  });

  return Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
};
