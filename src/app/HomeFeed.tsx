"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StyleRequest } from "@/lib/types";

type FeedRequest = StyleRequest & { recommendationCount: number };

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

export default function HomeFeed() {
  const [items, setItems] = useState<FeedRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/requests")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: FeedRequest[]) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setError("목록을 불러오지 못했습니다.");
          setItems([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-950/30 p-6 text-sm text-red-200">{error}</div>
    );
  }

  if (items === null) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-50">코디 요청 피드</h1>
          <p className="mt-2 text-stone-400">불러오는 중…</p>
        </div>
      </div>
    );
  }

  const requests = items;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-50">코디 요청 피드</h1>
        <p className="mt-2 text-stone-400">
          체형·선호 스타일·참고 사진을 올리면, 다른 유저가 어울리는 룩을 추천해 줍니다.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-700 bg-stone-900/40 p-10 text-center">
          <p className="text-stone-400">아직 요청이 없습니다.</p>
          <Link
            href="/new"
            className="mt-4 inline-block rounded-xl bg-orange-500 px-5 py-2.5 font-medium text-stone-950 hover:bg-orange-400"
          >
            첫 코디 요청 올리기
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {requests.map((r) => {
            const recCount = r.recommendationCount ?? 0;
            return (
              <li key={r.id}>
                <Link
                  href={`/r/${r.id}`}
                  className="block rounded-2xl border border-stone-800 bg-stone-900/60 p-5 transition hover:border-orange-500/40 hover:bg-stone-900"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                    {r.imagePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imagePath}
                        alt=""
                        className="h-28 w-full shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
                      />
                    ) : (
                      <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-stone-800 text-xs text-stone-500 sm:h-24 sm:w-24">
                        사진 없음
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-stone-100">{String(r.title ?? "")}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-stone-400">{String(r.bodyType ?? "")}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                        <span>{String(r.authorName ?? "")}</span>
                        <span>·</span>
                        <span>{formatDate(r.createdAt)}</span>
                        <span>·</span>
                        <span className="text-orange-400/90">추천 {recCount}개</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
