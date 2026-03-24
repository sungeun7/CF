import { adoptRecommendation, getRecommendationsForRequest, getRequest } from "@/lib/store";
import { jsonUtf8 } from "@/lib/json-response";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";
import { getSessionUser } from "@/lib/store";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: Params) {
  const { id } = await context.params;
  const styleRequest = getRequest(id);
  if (!styleRequest) {
    return jsonUtf8({ error: "요청을 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    const currentUser = token ? getSessionUser(token) : null;
    if (!currentUser) {
      return jsonUtf8({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    if (currentUser !== styleRequest.authorName) {
      return jsonUtf8({ error: "작성자만 채택할 수 있습니다." }, { status: 403 });
    }

    const body = await req.json();
    const recommendationId = String(body.recommendationId ?? "").trim();
    if (!recommendationId) {
      return jsonUtf8({ error: "추천 ID가 필요합니다." }, { status: 400 });
    }

    const target = getRecommendationsForRequest(id).find((r) => r.id === recommendationId);
    if (!target) {
      return jsonUtf8({ error: "추천을 찾을 수 없습니다." }, { status: 404 });
    }
    if (target.authorName === currentUser) {
      return jsonUtf8({ error: "작성자는 본인 추천을 채택할 수 없습니다." }, { status: 403 });
    }

    const result = adoptRecommendation(id, recommendationId);
    if (!result.ok) {
      if (result.reason === "already_adopted") {
        return jsonUtf8({ error: "이미 채택된 추천이 있습니다." }, { status: 409 });
      }
      if (result.reason === "recommendation_not_found") {
        return jsonUtf8({ error: "추천을 찾을 수 없습니다." }, { status: 404 });
      }
      return jsonUtf8({ error: "요청을 찾을 수 없습니다." }, { status: 404 });
    }

    return jsonUtf8({
      ok: true,
      adoptedRecommendationId: result.adoptedRecommendationId,
      awardedTo: result.awardedTo,
      pointsAwarded: 100,
    });
  } catch {
    return jsonUtf8({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
