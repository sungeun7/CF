"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Me = {
  userName: string;
  createdAt: string;
  points: number;
};

export default function MyPageClient() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [newUserName, setNewUserName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/login");
          return null;
        }
        if (!res.ok) return Promise.reject(new Error("불러오기 실패"));
        return res.json();
      })
      .then((data: Me | null) => {
        if (cancelled || data === null) return;
        setMe(data);
        setNewUserName(data.userName);
      })
      .catch(() => {
        if (!cancelled) setLoadError("정보를 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newUserName,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "수정 실패");
      alert("정보가 변경되었습니다.");
      const nextName = typeof data.userName === "string" ? data.userName : newUserName;
      setMe((prev) => (prev ? { ...prev, userName: nextName } : prev));
      setNewUserName(nextName);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    const ok = confirm("정말 탈퇴하시겠어요? 계정은 복구할 수 없습니다.");
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch("/api/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "탈퇴 실패");
      alert("탈퇴가 완료되었습니다.");
      router.push("/");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (loadError) {
    return <p className="text-stone-400">{loadError}</p>;
  }

  if (!me) {
    return <p className="text-stone-500">불러오는 중…</p>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5">
        <h2 className="text-lg font-semibold text-stone-100">내 포인트</h2>
        <p className="mt-2 text-2xl font-bold text-amber-400">{me.points}P</p>
        <p className="mt-1 text-xs text-stone-500">가입일: {new Date(me.createdAt).toLocaleDateString("ko-KR")}</p>
      </section>

      <section className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5">
        <h2 className="text-lg font-semibold text-stone-100">정보 변경</h2>
        <form onSubmit={onUpdate} className="mt-4 space-y-3">
          <input
            type="text"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="새 아이디"
            className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-stone-100"
          />
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호(필수)"
            className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-stone-100"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호(선택)"
            className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-stone-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-stone-950 hover:bg-orange-400 disabled:opacity-50"
          >
            변경 저장
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-red-900/50 bg-red-950/20 p-5">
        <h2 className="text-lg font-semibold text-red-300">회원 탈퇴</h2>
        <p className="mt-1 text-sm text-red-200/80">탈퇴 시 계정과 세션이 삭제되며 복구할 수 없습니다.</p>
        <div className="mt-3 flex gap-2">
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="비밀번호 확인"
            className="flex-1 rounded-xl border border-red-900/60 bg-stone-950 px-4 py-2.5 text-stone-100"
          />
          <button
            type="button"
            disabled={loading}
            onClick={onDelete}
            className="rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            탈퇴
          </button>
        </div>
      </section>
    </div>
  );
}
