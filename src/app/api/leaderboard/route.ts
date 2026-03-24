import { jsonUtf8 } from "@/lib/json-response";
import { getPointsLeaderboard, readStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requestId = String(searchParams.get("requestId") ?? "").trim();

  // 특정 피드 상세(/r/[id])에서는 해당 피드를 추천한 유저만 랭킹에 포함
  if (requestId) {
    const store = readStore();
    const authorSet = new Set(
      store.recommendations
        .filter((r) => r?.requestId === requestId)
        .map((r) => String(r?.authorName ?? "").trim())
        .filter(Boolean)
    );

    const rows = [...authorSet].map((userName) => {
      const row = store.userPoints.find((p) => p?.userName === userName);
      return {
        userName,
        points: typeof row?.points === "number" && Number.isFinite(row.points) ? row.points : 0,
      };
    });

    rows.sort((a, b) => b.points - a.points || a.userName.localeCompare(b.userName, "ko"));
    return jsonUtf8(rows.slice(0, 20));
  }

  return jsonUtf8(getPointsLeaderboard(20));
}
