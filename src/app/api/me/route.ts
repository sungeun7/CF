import { NextResponse } from "next/server";
import { AUTH_COOKIE, getCurrentSessionToken, getCurrentUserName } from "@/lib/auth";
import {
  deleteSession,
  deleteUserAccount,
  getUserByName,
  getUserPoints,
  updateUserProfile,
} from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const userName = await getCurrentUserName();
  if (!userName) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const user = getUserByName(userName);
  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({
    userName: user.userName,
    createdAt: user.createdAt,
    points: getUserPoints(user.userName),
  });
}

export async function PATCH(req: Request) {
  const userName = await getCurrentUserName();
  if (!userName) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const currentPassword = String(body.currentPassword ?? "").trim();
    const newUserName = String(body.newUserName ?? "").trim();
    const newPassword = String(body.newPassword ?? "").trim();
    if (!currentPassword) {
      return NextResponse.json({ error: "현재 비밀번호를 입력해 주세요." }, { status: 400 });
    }
    const result = updateUserProfile({
      currentUserName: userName,
      currentPassword,
      newUserName: newUserName || undefined,
      newPassword: newPassword || undefined,
    });
    if (!result.ok) {
      if (result.reason === "wrong_password") {
        return NextResponse.json({ error: "현재 비밀번호가 틀렸습니다." }, { status: 401 });
      }
      if (result.reason === "duplicate_username") {
        return NextResponse.json({ error: "이미 존재하는 아이디입니다." }, { status: 409 });
      }
      return NextResponse.json({ error: "입력값을 확인해 주세요." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, userName: result.userName });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const userName = await getCurrentUserName();
  if (!userName) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const password = String(body.password ?? "").trim();
    if (!password) {
      return NextResponse.json({ error: "비밀번호를 입력해 주세요." }, { status: 400 });
    }
    const result = deleteUserAccount(userName, password);
    if (!result.ok) {
      if (result.reason === "wrong_password") {
        return NextResponse.json({ error: "비밀번호가 틀렸습니다." }, { status: 401 });
      }
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const token = await getCurrentSessionToken();
    if (token) deleteSession(token);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
