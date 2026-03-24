"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { requestId: string };

export default function RecommendForm({ requestId }: Props) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let imagePath: string | null = null;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const uj = await up.json();
        if (!up.ok) throw new Error(uj.error ?? "업로드 실패");
        imagePath = uj.path;
      }
      const res = await fetch(`/api/requests/${requestId}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          imagePath,
          linkUrl: linkUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "등록 실패");
      setContent("");
      setLinkUrl("");
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="recContent" className="mb-1.5 block text-sm font-medium text-stone-300">
          코디 추천
        </label>
        <textarea
          id="recContent"
          required
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="브랜드·아이템·색 조합·착장 팁 등 자유롭게 적어 주세요."
          maxLength={2000}
          className="w-full resize-y rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-stone-100 placeholder:text-stone-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        <p className="mt-1 text-xs text-stone-500">{content.length} / 2000</p>
      </div>
      <div>
        <label htmlFor="recLink" className="mb-1.5 block text-sm font-medium text-stone-300">
          관련 링크 (선택)
        </label>
        <input
          id="recLink"
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-stone-100 placeholder:text-stone-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>
      <div>
        <label htmlFor="recImage" className="mb-1.5 block text-sm font-medium text-stone-300">
          추천 이미지 (선택)
        </label>
        <input
          id="recImage"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-stone-400 file:mr-4 file:rounded-lg file:border-0 file:bg-stone-800 file:px-4 file:py-2 file:text-stone-200 hover:file:bg-stone-700"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-orange-500 px-5 py-2.5 font-medium text-stone-950 hover:bg-orange-400 disabled:opacity-50"
      >
        {loading ? "등록 중…" : "추천 남기기"}
      </button>
    </form>
  );
}
