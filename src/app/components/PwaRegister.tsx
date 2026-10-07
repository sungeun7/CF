"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocal) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // SW 등록 실패 시 앱 동작에는 영향 없도록 무시
    });
  }, []);

  return null;
}
