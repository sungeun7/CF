"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionResponse = { userName?: string | null };

export default function AuthUserNavItem() {
  const [userName, setUserName] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: SessionResponse) => {
        if (!cancelled) setUserName(typeof data.userName === "string" ? data.userName : null);
      })
      .catch(() => {
        if (!cancelled) setUserName(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (userName === undefined) {
    return (
      <span className="rounded-lg px-3 py-1.5 text-stone-600" aria-hidden>
        ...
      </span>
    );
  }

  if (userName) {
    return (
      <Link
        href="/mypage"
        className="rounded-lg px-3 py-1.5 text-stone-300 transition hover:bg-stone-800 hover:text-white"
      >
        {userName}
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-lg px-3 py-1.5 text-stone-300 transition hover:bg-stone-800 hover:text-white"
    >
      로그인
    </Link>
  );
}
