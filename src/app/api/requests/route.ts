import { addRequest, readStore } from "@/lib/store";
import { jsonUtf8 } from "@/lib/json-response";
import type { ProductTag } from "@/lib/types";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";
import { getSessionUser } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const store = readStore();
  const list = [...store.requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const withCounts = list.map((r) => ({
    ...r,
    recommendationCount: store.recommendations.filter((x) => x.requestId === r.id).length,
  }));
  return jsonUtf8(withCounts);
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    const sessionUser = token ? getSessionUser(token) : null;

    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const bodyType = String(body.bodyType ?? "").trim();
    const stylePreference = String(body.stylePreference ?? "").trim();
    const authorName = sessionUser ?? "익명";
    const imagePath =
      body.imagePath === null || body.imagePath === undefined
        ? null
        : String(body.imagePath).trim() || null;
    const photoTagsRaw = Array.isArray(body.photoTags) ? body.photoTags : [];
    const photoTags = photoTagsRaw
      .map((v: unknown) => String(v ?? "").trim())
      .filter(Boolean)
      .map((tag: string) => (tag.startsWith("#") ? tag : `#${tag}`))
      .slice(0, 20);
    const productTagsRaw = Array.isArray(body.productTags) ? body.productTags : [];
    const productTags: ProductTag[] = [];

    for (const t of productTagsRaw) {
      if (!t || typeof t !== "object") continue;
      const label = String((t as { label?: unknown }).label ?? "").trim();
      const url = String((t as { url?: unknown }).url ?? "").trim();
      const price = String((t as { price?: unknown }).price ?? "").trim();
      const x = Number((t as { x?: unknown }).x);
      const y = Number((t as { y?: unknown }).y);
      const id = String((t as { id?: unknown }).id ?? "").trim() || crypto.randomUUID();

      if (!label || !url || Number.isNaN(x) || Number.isNaN(y)) continue;
      productTags.push({
        id,
        label: label.slice(0, 60),
        url: url.slice(0, 500),
        price: price ? price.slice(0, 30) : undefined,
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y)),
      });
    }

    if (!title || title.length > 120) {
      return jsonUtf8(
        { error: "제목은 1~120자로 입력해 주세요." },
        { status: 400 }
      );
    }
    if (!bodyType || bodyType.length > 500) {
      return jsonUtf8(
        { error: "체형 설명을 입력해 주세요. (최대 500자)" },
        { status: 400 }
      );
    }
    if (stylePreference.length > 500) {
      return jsonUtf8(
        { error: "스타일 선호는 최대 500자입니다." },
        { status: 400 }
      );
    }
    if (productTags.length > 20) {
      return jsonUtf8({ error: "상품 태그는 최대 20개까지 가능합니다." }, { status: 400 });
    }

    try {
      const created = addRequest({
        title,
        bodyType,
        stylePreference,
        imagePath,
        photoTags,
        productTags,
        acceptedRecommendationId: null,
        authorName,
      });
      return jsonUtf8(created, { status: 201 });
    } catch (err) {
      console.error("addRequest failed", err);
      return jsonUtf8(
        { error: "저장에 실패했습니다. 프로젝트 폴더의 data 쓰기 권한을 확인하세요." },
        { status: 500 }
      );
    }
  } catch {
    return jsonUtf8({ error: "잘못된 요청입니다." }, { status: 400 });
  }
}
