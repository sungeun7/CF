import { NextResponse } from "next/server";

/** JSON 응답에 UTF-8 charset을 명시합니다. Headers 객체 병합은 런타임에서 문제를 일으킬 수 있어 단순 객체로 둡니다. */
export function jsonUtf8(data: unknown, init?: ResponseInit) {
  const { headers: _drop, ...rest } = init ?? {};
  void _drop;
  return NextResponse.json(data, {
    ...rest,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
