"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

const AUTH_CHANGED = "cf-auth-changed";

export default function Header() {
  const [userName, setUserName] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    function fetchSession() {
      fetch("/api/auth/session")
        .then((r) => r.json())
        .then((d: { userName?: string | null }) => {
          if (!cancelled) setUserName(d.userName ?? null);
        })
        .catch(() => {
          if (!cancelled) setUserName(null);
        });
    }
    fetchSession();
    function onAuthChanged() {
      fetchSession();
    }
    window.addEventListener(AUTH_CHANGED, onAuthChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_CHANGED, onAuthChanged);
    };
  }, []);

  return (
    <header className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md sticky top-0 z-10">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-stone-50">
          choose the <span className="text-orange-400">fashion</span>
        </Link>
        <nav className="flex min-h-[2.25rem] items-center gap-3 text-sm">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-stone-300 transition hover:bg-stone-800 hover:text-white"
          >
            피드
          </Link>
          <Link
            href="/new"
            className="rounded-lg bg-orange-500 px-3 py-1.5 font-medium text-stone-950 transition hover:bg-orange-400"
          >
            코디 요청하기
          </Link>
          {userName === undefined ? (
            <span className="w-16 text-stone-600" aria-hidden>
              …
            </span>
          ) : userName ? (
            <>
              <Link
                href="/mypage"
                className="rounded-lg px-3 py-1.5 text-stone-300 transition hover:bg-stone-800 hover:text-white"
              >
                {userName}
              </Link>
              <LogoutButton onLoggedOut={() => setUserName(null)} />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-stone-300 transition hover:bg-stone-800 hover:text-white"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
