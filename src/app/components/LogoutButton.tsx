"use client";

import { useRouter } from "next/navigation";

type Props = { onLoggedOut?: () => void };

export default function LogoutButton({ onLoggedOut }: Props) {
  const router = useRouter();
  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    onLoggedOut?.();
    router.push("/");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={onLogout}
      className="rounded-lg px-3 py-1.5 text-stone-300 transition hover:bg-stone-800 hover:text-white"
    >
      로그아웃
    </button>
  );
}
