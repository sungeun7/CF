"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-8 text-center">
      <h1 className="text-lg font-semibold text-stone-100">문제가 발생했습니다</h1>
      <p className="mt-2 text-sm text-stone-400">
        페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.
      </p>
      {process.env.NODE_ENV === "development" && error.message ? (
        <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-stone-950 p-3 text-left text-xs text-stone-500">
          {error.message}
        </pre>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-stone-950 hover:bg-orange-400"
      >
        다시 시도
      </button>
    </div>
  );
}
