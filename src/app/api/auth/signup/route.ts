import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";
import { createSession, createUser } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userName = String(body.userName ?? "").trim();
    const password = String(body.password ?? "").trim();
    if (userName.length < 2 || userName.length > 30) {
      return NextResponse.json({ error: "아이디는 2~30자여야 합니다." }, { status: 400 });
    }
    if (password.length < 4 || password.length > 100) {
      return NextResponse.json({ error: "비밀번호는 4자 이상이어야 합니다." }, { status: 400 });
    }
    const created = createUser(userName, password);
    if (!created.ok) {
      if (created.reason === "duplicate_user") {
        return NextResponse.json({ error: "이미 존재하는 아이디입니다." }, { status: 409 });
      }
      return NextResponse.json({ error: "입력값을 확인해 주세요." }, { status: 400 });
    }
    const token = createSession(userName);
    const res = NextResponse.json({ ok: true, userName });
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
