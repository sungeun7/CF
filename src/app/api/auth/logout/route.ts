import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";
import { deleteSession } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = req.headers
    .get("cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${AUTH_COOKIE}=`))
    ?.split("=")[1];

  if (token) deleteSession(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
