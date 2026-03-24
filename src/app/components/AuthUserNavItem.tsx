"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

type SessionResponse = { userName?: string | null };

export default function AuthUserNavItem() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const fetchSession = () => {
      fetch("/api/auth/session")
        .then((res) => res.json())
        .then((data: SessionResponse) => {
          if (!cancelled) setUserName(typeof data.userName === "string" ? data.userName : null);
        })
        .catch(() => {
          if (!cancelled) setUserName(null);
        });
    };
    fetchSession();
    const onAuthChanged = () => fetchSession();
    window.addEventListener("cf-auth-changed", onAuthChanged);

    return () => {
      cancelled = true;
      window.removeEventListener("cf-auth-changed", onAuthChanged);
    };
  }, [pathname]);

  if (userName === undefined) {
    return (
      <span className="rounded-lg px-3 py-1.5 text-stone-600" aria-hidden>
        ...
      </span>
    );
  }

  if (userName) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-lg px-3 py-1.5 text-stone-300">{userName}</span>
        <LogoutButton onLoggedOut={() => setUserName(null)} />
      </div>
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
