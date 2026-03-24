"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  requestId: string;
  recommendationId: string;
};

export default function AdoptButton({ requestId, recommendationId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onAdopt() {
    if (loading) return;
    const ok = window.confirm("이 추천을 채택하시겠어요? 추천 작성자에게 100포인트가 지급됩니다.");
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/adopt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "채택 실패");
      window.alert(`채택 완료! ${data.awardedTo}님에게 +${data.pointsAwarded}포인트 지급`);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onAdopt}
      disabled={loading}
      className="rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-300 hover:bg-orange-500/20 disabled:opacity-50"
    >
      {loading ? "채택 중..." : "채택 (+100P)"}
    </button>
  );
}
