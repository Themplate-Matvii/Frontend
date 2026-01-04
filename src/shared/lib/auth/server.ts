import { cache } from "react";
import { AUTH } from "@/shared/config";
import { User } from "@/entities/identity/users/model/user/types";
import { parseUserCookie } from "@/entities/identity/users/api/users/userCookie";
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
