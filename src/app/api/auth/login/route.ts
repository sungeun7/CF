import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";
import { authenticateUser, createSession } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userName = String(body.userName ?? "").trim();
    const password = String(body.password ?? "").trim();
    const user = authenticateUser(userName, password);
    if (!user) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }
    const token = createSession(user.userName);
    const res = NextResponse.json({ ok: true, userName: user.userName });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
