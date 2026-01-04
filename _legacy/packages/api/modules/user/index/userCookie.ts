import { AUTH } from "@packages/config";
import { deleteCookie, getCookie, setCookie } from "@packages/utils/cookies";
import { User } from "./types";

export const USER_COOKIE_KEY = AUTH.USER_COOKIE_KEY;

export const parseUserCookie = (value?: string | null): User | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
};

export const getUserFromCookie = (): User | null => {
  const rawUser = getCookie(USER_COOKIE_KEY);

  return parseUserCookie(rawUser);
};

export const setUserCookie = (user: User) => {
  setCookie(USER_COOKIE_KEY, JSON.stringify(user));
};

export const clearUserCookie = () => {
  deleteCookie(USER_COOKIE_KEY);
};
