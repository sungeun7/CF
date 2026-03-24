"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ProductTag } from "@/lib/types";

type DraftTag = ProductTag & { draft: boolean };

export default function NewRequestForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [photoTagsText, setPhotoTagsText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [productTags, setProductTags] = useState<DraftTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewSrc = previewUrl ?? imagePath;

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    // FileReader(data URL)는 blob URL + revoke와 달리 React Strict Mode에서도 안정적으로 미리보기됨
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = () => {
      if (!cancelled && typeof reader.result === "string") {
        setPreviewUrl(reader.result);
      }
    };
    reader.onerror = () => {
      if (!cancelled) setPreviewUrl(null);
    };
    reader.readAsDataURL(file);
    return () => {
      cancelled = true;
    };
  }, [file]);

  async function uploadIfNeeded() {
    if (!file) return imagePath;
    const fd = new FormData();
    fd.append("file", file);
    const up = await fetch("/api/upload", { method: "POST", body: fd });
    const uj = await up.json();
    if (!up.ok) throw new Error(uj.error ?? "업로드 실패");
    setImagePath(uj.path);
    setFile(null);
    return uj.path as string;
  }

  function onImageClick(e: React.MouseEvent<HTMLImageElement>) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (!previewSrc) return;
    const id = crypto.randomUUID();
    setProductTags((prev) => [
      ...prev,
      {
        id,
        label: "",
        url: "",
        price: "",
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
        draft: true,
      },
    ]);
  }

  function updateTag(id: string, patch: Partial<DraftTag>) {
    setProductTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function removeTag(id: string) {
    setProductTags((prev) => prev.filter((t) => t.id !== id));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const uploadedImagePath = await uploadIfNeeded();
      const sanitizedTags = productTags
        .filter((t) => t.label.trim() && t.url.trim())
        .map((t) => ({
          id: t.id,
          label: t.label.trim(),
          url: t.url.trim(),
          price: t.price?.trim() ? t.price.trim() : undefined,
          x: t.x,
          y: t.y,
        }));
      const photoTags = photoTagsText
        .split(/[,\s]+/)
        .map((v) => v.trim())
        .filter(Boolean)
        .map((v) => (v.startsWith("#") ? v : `#${v}`))
        .slice(0, 20);

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          bodyType,
          stylePreference,
          imagePath: uploadedImagePath ?? null,
          photoTags,
          productTags: sanitizedTags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "저장 실패");
      router.push(`/r/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-stone-300">
          제목
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 봄 데이트 코디 추천 받아요"
          maxLength={120}
          className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-stone-100 placeholder:text-stone-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      <div>
        <label htmlFor="bodyType" className="mb-1.5 block text-sm font-medium text-stone-300">
          체형 · 키 · 비율 등
        </label>
        <textarea
          id="bodyType"
          required
          rows={4}
          value={bodyType}
          onChange={(e) => setBodyType(e.target.value)}
          placeholder="예: 키 168cm, 상체 짧은 편, 다리는 길어 보이고 싶어요."
          maxLength={500}
          className="w-full resize-y rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-stone-100 placeholder:text-stone-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        <p className="mt-1 text-xs text-stone-500">{bodyType.length} / 500</p>
      </div>

      <div>
        <label htmlFor="stylePreference" className="mb-1.5 block text-sm font-medium text-stone-300">
          선호 스타일 · 상황
        </label>
        <textarea
          id="stylePreference"
          rows={3}
          value={stylePreference}
          onChange={(e) => setStylePreference(e.target.value)}
          placeholder="예: 캐주얼, 미니멀, 오피스룩 / 첫 데이트"
          maxLength={500}
          className="w-full resize-y rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-stone-100 placeholder:text-stone-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        <p className="mt-1 text-xs text-stone-500">{stylePreference.length} / 500</p>
      </div>

      <div>
        <label htmlFor="photo" className="mb-1.5 block text-sm font-medium text-stone-300">
          제품/코디 사진 (선택, 최대 5MB)
        </label>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setImagePath(null);
            setProductTags([]);
          }}
          className="block w-full text-sm text-stone-400 file:mr-4 file:rounded-lg file:border-0 file:bg-stone-800 file:px-4 file:py-2 file:text-stone-200 hover:file:bg-stone-700"
        />
        <p className="mt-1 text-xs text-stone-500">
          파일을 선택하면 아래에 미리보기가 나타나며, 이미지를 클릭해 바로 태그를 찍을 수 있습니다.
        </p>
      </div>

      <div>
        <label htmlFor="photoTags" className="mb-1.5 block text-sm font-medium text-stone-300">
          사진 태그
        </label>
        <input
          id="photoTags"
          type="text"
          value={photoTagsText}
          onChange={(e) => setPhotoTagsText(e.target.value)}
          placeholder="#봄코디 #캐주얼 #데일리 (공백/쉼표로 구분)"
          className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-stone-100 placeholder:text-stone-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {previewSrc && (
        <div className="space-y-3 rounded-xl border border-stone-800 bg-stone-900/40 p-3">
          <p className="text-sm font-medium text-stone-300">
            미리보기 {file ? `· ${file.name}` : ""} (클릭해서 태그 추가)
          </p>
          <div className="relative overflow-hidden rounded-lg border border-stone-800 bg-stone-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="태그 편집용 미리보기"
              className="max-h-[70vh] w-full cursor-crosshair object-contain"
              onClick={onImageClick}
            />
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {productTags.map((tag, i) => (
                <g key={tag.id}>
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
                </g>
              ))}
            </svg>
          </div>
          {productTags.length > 0 && (
            <div className="space-y-2">
              {productTags.map((tag, i) => (
                <div key={tag.id} className="rounded-lg border border-stone-800 p-3">
                  <p className="mb-2 text-xs text-stone-500">태그 #{i + 1}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      value={tag.label}
                      onChange={(e) => updateTag(tag.id, { label: e.target.value, draft: false })}
                      placeholder="상품명"
                      maxLength={60}
                      className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600"
                    />
                    <input
                      type="url"
                      value={tag.url}
                      onChange={(e) => updateTag(tag.id, { url: e.target.value, draft: false })}
                      placeholder="구매 링크(URL)"
                      className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 sm:col-span-2"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={tag.price ?? ""}
                      onChange={(e) => updateTag(tag.id, { price: e.target.value })}
                      placeholder="가격(선택) 예: 39,000원"
                      maxLength={30}
                      className="flex-1 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id)}
                      className="rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-300 hover:bg-stone-800"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-stone-950 transition hover:bg-orange-400 disabled:opacity-50"
      >
        {loading ? "등록 중…" : "요청 올리기"}
      </button>
    </form>
  );
}
