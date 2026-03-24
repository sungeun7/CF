"use client";

import { useMemo, useState } from "react";
import type { Recommendation } from "@/lib/types";
import AdoptButton from "./AdoptButton";

type SortMode = "time" | "points";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function sortRecommendations(
  recs: Recommendation[],
  acceptedId: string | null,
  sort: SortMode,
  pointsByAuthor: Record<string, number>
): Recommendation[] {
  const adopted = acceptedId ? recs.find((r) => r.id === acceptedId) : undefined;
  const rest = recs.filter((r) => r.id !== acceptedId);

  const sortedRest = [...rest].sort((a, b) => {
    if (sort === "time") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    const pa = pointsByAuthor[a.authorName] ?? 0;
    const pb = pointsByAuthor[b.authorName] ?? 0;
    if (pb !== pa) return pb - pa;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return adopted ? [adopted, ...sortedRest] : sortedRest;
}

type Props = {
  requestId: string;
  requestAuthorName: string;
  acceptedRecommendationId: string | null;
  /** undefined: 세션 조회 전 */
  currentUser: string | null | undefined;
  recommendations: Recommendation[];
  pointsByAuthor: Record<string, number>;
};

export default function RecommendationsList({
  requestId,
  requestAuthorName,
  acceptedRecommendationId,
  currentUser,
  recommendations,
  pointsByAuthor,
}: Props) {
  const [sort, setSort] = useState<SortMode>("time");

  const sorted = useMemo(
    () =>
      sortRecommendations(
        recommendations,
        acceptedRecommendationId,
        sort,
        pointsByAuthor
      ),
    [recommendations, acceptedRecommendationId, sort, pointsByAuthor]
  );

  if (recommendations.length === 0) {
    return <p className="text-stone-500">아직 추천이 없습니다. 첫 번째로 남겨 보세요.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-stone-500">정렬</span>
        <div className="inline-flex rounded-lg border border-stone-700 bg-stone-900/60 p-0.5">
          <button
            type="button"
            onClick={() => setSort("time")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              sort === "time"
                ? "bg-stone-700 text-stone-100"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            최신순
          </button>
          <button
            type="button"
            onClick={() => setSort("points")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              sort === "points"
                ? "bg-stone-700 text-stone-100"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            포인트순
          </button>
        </div>
        {acceptedRecommendationId ? (
          <span className="text-xs text-stone-500">· 채택된 추천은 항상 맨 위에 표시됩니다</span>
        ) : null}
      </div>

      <ul className="space-y-3">
        {sorted.map((rec) => {
          const pts = pointsByAuthor[rec.authorName] ?? 0;
          const isAdopted = acceptedRecommendationId === rec.id;
          return (
            <li
              key={rec.id}
              className={`rounded-xl border bg-stone-900/40 p-4 ${
                isAdopted ? "border-emerald-500/40 ring-1 ring-emerald-500/20" : "border-stone-800"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-stone-200">
                  {rec.authorName}
                  <span className="ml-2 text-xs text-amber-400">{pts}P</span>
                </span>
                <span className="text-xs text-stone-500">{formatDate(rec.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-stone-300">{rec.content}</p>
              {rec.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={rec.imagePath}
                  alt=""
                  className="mt-3 max-h-64 w-full rounded-lg border border-stone-800 bg-stone-950 object-contain"
                />
              ) : null}
              {rec.linkUrl ? (
                <a
                  href={rec.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-orange-300 underline underline-offset-4 hover:text-orange-200"
                >
                  관련 링크 열기
                </a>
              ) : null}
              <div className="mt-3 flex items-center justify-between gap-2">
                {acceptedRecommendationId === rec.id ? (
                  <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                    채택됨 (+100P 지급 완료)
                  </span>
                ) : acceptedRecommendationId ? (
                  <span className="text-xs text-stone-600">다른 추천이 이미 채택되었습니다.</span>
                ) : currentUser === undefined ? (
                  <span className="text-xs text-stone-600">…</span>
                ) : currentUser !== requestAuthorName ? (
                  <span className="text-xs text-stone-600">작성자만 채택할 수 있습니다.</span>
                ) : (
                  <AdoptButton requestId={requestId} recommendationId={rec.id} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
