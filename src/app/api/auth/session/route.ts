import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";
import { getSessionUser } from "@/lib/store";
import { jsonUtf8 } from "@/lib/json-response";

export const runtime = "nodejs";

/** 루트 레이아웃에서 cookies()를 쓰지 않고 세션만 조회할 때 사용합니다. */
export async function GET() {
  try {
    const c = await cookies();
    const token = c.get(AUTH_COOKIE)?.value;
    if (!token) return jsonUtf8({ userName: null as string | null });
    const userName = getSessionUser(token);
    return jsonUtf8({ userName: userName ?? null });
  } catch {
    return jsonUtf8({ userName: null as string | null });
  }
}
