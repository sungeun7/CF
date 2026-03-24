"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Row = { userName: string; points: number };

export default function PointsSidebar() {
  const pathname = usePathname();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const m = pathname.match(/^\/r\/([^/]+)$/);
    const requestId = m?.[1];
    const endpoint = requestId
      ? `/api/leaderboard?requestId=${encodeURIComponent(requestId)}`
      : "/api/leaderboard";

    fetch(endpoint)
      .then((res) => res.json())
      .then((data: Row[]) => {
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-4 lg:sticky lg:top-24">
      <h2 className="text-sm font-semibold text-stone-200">포인트 랭킹</h2>
      <p className="mt-1 text-xs text-stone-500">
        {/^\/r\/[^/]+$/.test(pathname ?? "")
          ? "이 피드를 추천한 유저 중 포인트 순위"
          : "누적 포인트 상위"}
      </p>
      {rows === null ? (
        <p className="mt-4 text-sm text-stone-500">불러오는 중…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">아직 기록된 포인트가 없습니다.</p>
      ) : (
        <ol className="mt-4 space-y-2.5">
          {rows.map((row, i) => (
            <li key={row.userName} className="flex items-center gap-2 text-sm">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                  i === 0
                    ? "bg-amber-500/25 text-amber-300"
                    : i === 1
                      ? "bg-stone-600/40 text-stone-300"
                      : i === 2
                        ? "bg-orange-900/40 text-orange-200/90"
                        : "bg-stone-800 text-stone-500"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-stone-200">{row.userName}</span>
              <span className="shrink-0 tabular-nums font-medium text-amber-400">{row.points}P</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
