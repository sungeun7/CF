"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "요청 실패");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cf-auth-changed"));
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
      <div className="rounded-xl border border-stone-800 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`w-1/2 rounded-lg py-2 text-sm ${mode === "login" ? "bg-stone-700 text-white" : "text-stone-400"}`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`w-1/2 rounded-lg py-2 text-sm ${mode === "signup" ? "bg-stone-700 text-white" : "text-stone-400"}`}
        >
          회원가입
        </button>
      </div>
      <input
        type="text"
        placeholder="아이디"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-stone-100"
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-stone-100"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-stone-950 hover:bg-orange-400 disabled:opacity-50"
      >
        {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
      </button>
    </form>
  );
}
