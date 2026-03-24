import { getRecommendationsForRequest, getRequest } from "@/lib/store";
import { jsonUtf8 } from "@/lib/json-response";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: Params) {
  const { id } = await context.params;
  const request = getRequest(id);
  if (!request) {
    return jsonUtf8({ error: "요청을 찾을 수 없습니다." }, { status: 404 });
  }
  const recommendations = getRecommendationsForRequest(id);
  return jsonUtf8({ request, recommendations });
}
