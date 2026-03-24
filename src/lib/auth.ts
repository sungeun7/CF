import { cookies } from "next/headers";
import { getSessionUser } from "./store";

export const AUTH_COOKIE = "stylemate_session";

export async function getCurrentUserName() {
  try {
    const c = await cookies();
    const token = c.get(AUTH_COOKIE)?.value;
    if (!token) return null;
    return getSessionUser(token);
  } catch {
    return null;
  }
}

export async function getCurrentSessionToken() {
  try {
    const c = await cookies();
    return c.get(AUTH_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}
