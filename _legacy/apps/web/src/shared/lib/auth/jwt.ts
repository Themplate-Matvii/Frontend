export function isJwtExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload?.exp;
    if (!exp) return true;
    return Date.now() / 1000 >= exp;
  } catch {
    return true;
  }
}
