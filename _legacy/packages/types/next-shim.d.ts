// comments only in English
declare module "next/headers" {
  type CookieValue = string;
  type CookieOptions = {
    httpOnly?: boolean;
    sameSite?: "lax" | "strict" | "none";
    secure?: boolean;
    path?: string;
    domain?: string;
    expires?: Date;
    maxAge?: number;
  };

  export function cookies(): {
    get(name: string): { value?: CookieValue } | undefined;
    set(name: string, value: CookieValue, options?: CookieOptions): void;
    delete(name: string): void; // <- not optional
    getAll?(): Array<{ name: string; value: string }>;
  };
}
