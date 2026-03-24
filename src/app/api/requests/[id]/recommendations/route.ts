import { addRecommendation, getRequest, getSessionUser } from "@/lib/store";
import { jsonUtf8 } from "@/lib/json-response";
import { AUTH_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: Params) {
  const { id } = await context.params;
  const request = getRequest(id);
  if (!request) {
    return jsonUtf8({ error: "요청을 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    const sessionUser = token ? getSessionUser(token) : null;
    if (!sessionUser) {
      return jsonUtf8({ error: "로그인 후 추천을 남길 수 있습니다." }, { status: 401 });
    }

    const body = await req.json();
    const content = String(body.content ?? "").trim();
    const imagePath =
      body.imagePath === null || body.imagePath === undefined
        ? null
        : String(body.imagePath).trim() || null;
    const linkUrl =
      body.linkUrl === null || body.linkUrl === undefined
        ? null
        : String(body.linkUrl).trim() || null;
    const photoTagsRaw = Array.isArray(body.photoTags) ? body.photoTags : [];
    const photoTags = photoTagsRaw
      .map((v: unknown) => String(v ?? "").trim())
      .filter(Boolean)
      .map((tag: string) => (tag.startsWith("#") ? tag : `#${tag}`))
      .slice(0, 20);

    if (!content || content.length > 2000) {
      return jsonUtf8(
        { error: "추천 내용을 1~2000자로 입력해 주세요." },
        { status: 400 }
      );
    }
    if (linkUrl && linkUrl.length > 500) {
      return jsonUtf8({ error: "링크는 최대 500자까지 가능합니다." }, { status: 400 });
    }

    try {
      const created = addRecommendation({
        requestId: id,
        authorName: sessionUser,
        content,
        imagePath,
        photoTags,
        linkUrl,
      });
      return jsonUtf8(created, { status: 201 });
    } catch (err) {
      console.error("addRecommendation failed", err);
      return jsonUtf8(
        { error: "저장에 실패했습니다. 프로젝트 폴더의 data 쓰기 권한을 확인하세요." },
        { status: 500 }
      );
    }
  } catch {
    return jsonUtf8({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
