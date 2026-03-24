"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Recommendation } from "@/lib/types";
import RecommendForm from "./RecommendForm";
import RecommendationsList from "./RecommendationsList";

type Props = {
  requestId: string;
  requestAuthorName: string;
  acceptedRecommendationId: string | null;
  recommendations: Recommendation[];
  pointsByAuthor: Record<string, number>;
};

export default function RequestRecommendationsSection({
  requestId,
  requestAuthorName,
  acceptedRecommendationId,
  recommendations,
  pointsByAuthor,
}: Props) {
  const [sessionUser, setSessionUser] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d: { userName?: string | null }) => {
        if (!cancelled) setSessionUser(d.userName ?? null);
      })
      .catch(() => {
        if (!cancelled) setSessionUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-100">
        추천 코디 <span className="text-stone-500">({recommendations.length})</span>
      </h2>

      <RecommendationsList
        requestId={requestId}
        requestAuthorName={requestAuthorName}
        acceptedRecommendationId={acceptedRecommendationId}
        currentUser={sessionUser}
        recommendations={recommendations}
        pointsByAuthor={pointsByAuthor}
      />

      <div className="rounded-2xl border border-stone-800 bg-stone-900/30 p-6">
        <h3 className="mb-4 font-medium text-stone-200">코디 추천 남기기</h3>
        {sessionUser === undefined ? (
          <p className="text-sm text-stone-500">로그인 여부 확인 중…</p>
        ) : sessionUser ? (
          <RecommendForm requestId={requestId} />
        ) : (
          <p className="text-sm text-stone-400">
            추천을 남기려면{" "}
            <Link href="/login" className="text-orange-300 underline underline-offset-4">
              로그인
            </Link>
            이 필요합니다.
          </p>
        )}
      </div>
    </section>
  );
}
