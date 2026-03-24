import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPointsLeaderboard,
  getRecommendationsForRequest,
  getRequest,
  getUserPoints,
} from "@/lib/store";
import RequestRecommendationsSection from "./RequestRecommendationsSection";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

type Props = { params: Promise<{ id: string }> };

export default async function RequestDetailPage({ params }: Props) {
  const resolved = await Promise.resolve(params);
  const id = typeof resolved?.id === "string" ? resolved.id : "";
  if (!id) notFound();
  const request = getRequest(id);
  if (!request) notFound();

  const recommendations = getRecommendationsForRequest(id);
  const leaderboard = getPointsLeaderboard(20);

  const authorNames = [...new Set(recommendations.map((r) => r.authorName))];
  const pointsByAuthor: Record<string, number> = {};
  for (const name of authorNames) {
    pointsByAuthor[name] = getUserPoints(name);
  }

  return (
    <div className="space-y-8">
      <Link href="/" className="text-sm text-orange-400 hover:text-orange-300">
        ← 피드로
      </Link>

      <div className="lg:grid lg:grid-cols-[1fr_minmax(240px,300px)] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-10">
      <article className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/50">
        {request.imagePath ? (
          <div className="relative bg-stone-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={request.imagePath}
              alt=""
              className="max-h-[70vh] w-full object-contain"
            />
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {(request.productTags ?? []).map((tag, i) => (
                <a
                  key={tag.id}
                  href={tag.url}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto"
                >
                  <circle
                    cx={tag.x}
                    cy={tag.y}
                    r="2.9"
                    fill="#f97316"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="0.35"
                  />
                  <text
                    x={tag.x}
                    y={tag.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#0c0a09"
                    fontSize="2.2"
                    fontWeight="700"
                  >
                    {i + 1}
                  </text>
                </a>
              ))}
            </svg>
          </div>
        ) : null}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-stone-50">{request.title}</h1>
          <p className="mt-2 text-sm text-stone-500">
            {request.authorName} · {formatDate(request.createdAt)}
          </p>

          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-orange-400/90">
              체형 · 비율
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-stone-300">{request.bodyType}</p>
          </section>

          {request.stylePreference ? (
            <section className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-orange-400/90">
                선호 스타일
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-stone-300">{request.stylePreference}</p>
            </section>
          ) : null}

          {(request.photoTags ?? []).length > 0 ? (
            <section className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-orange-400/90">
                사진 태그
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {(request.photoTags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-stone-700 bg-stone-900/60 px-3 py-1 text-xs text-stone-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {(request.productTags ?? []).length > 0 ? (
            <section className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-orange-400/90">
                바로 구매 태그
              </h2>
              <ul className="mt-3 space-y-2">
                {(request.productTags ?? []).map((tag, i) => (
                  <li
                    key={tag.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-800 bg-stone-900/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-100">
                        #{i + 1} {tag.label}
                      </p>
                      {tag.price ? <p className="text-xs text-stone-500">{tag.price}</p> : null}
                    </div>
                    <a
                      href={tag.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-stone-950 hover:bg-orange-400"
                    >
                      구매하러 가기
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>

      <RequestRecommendationsSection
        requestId={id}
        requestAuthorName={request.authorName}
        acceptedRecommendationId={request.acceptedRecommendationId}
        recommendations={recommendations}
        pointsByAuthor={pointsByAuthor}
      />
        </div>

        <aside className="mt-10 lg:mt-0">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-4 lg:sticky lg:top-4">
            <h2 className="text-sm font-semibold text-stone-200">포인트 랭킹</h2>
            <p className="mt-1 text-xs text-stone-500">누적 포인트 상위</p>
            {leaderboard.length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">아직 기록된 포인트가 없습니다.</p>
            ) : (
              <ol className="mt-4 space-y-2.5">
                {leaderboard.map((row, i) => (
                  <li
                    key={row.userName}
                    className="flex items-center gap-2 text-sm"
                  >
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
                    <span className="shrink-0 tabular-nums font-medium text-amber-400">
                      {row.points}P
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
