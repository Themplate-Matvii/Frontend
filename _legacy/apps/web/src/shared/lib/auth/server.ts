import { cache } from "react";
import { AUTH } from "@packages/config";
import { User } from "@packages/api/modules/user/index/types";
import { parseUserCookie } from "@packages/api/modules/user/index/userCookie";
import { cookies } from "next/headers";

/**
 * getUser:
 * - Single call per request via React cache()
 * - Reads current user from the client-managed cookie
 */
export const getUser = cache(async (): Promise<User | null> => {
  const jar = await cookies();
  const rawUser = jar.get(AUTH.USER_COOKIE_KEY)?.value ?? null;

  return parseUserCookie(rawUser);
});
