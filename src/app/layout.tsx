import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import PointsSidebar from "./components/PointsSidebar";
import AuthUserNavItem from "./components/AuthUserNavItem";

export const metadata: Metadata = {
  applicationName: "choose the fashion",
  title: "choose the fashion — 코디 추천",
  description: "체형·스타일·사진을 올리면 다른 유저가 어울리는 패션을 추천합니다.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "choose the fashion",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", type: "image/svg+xml" },
      { url: "/icon-512.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans min-h-screen">
        <header className="sticky top-0 z-10 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight text-stone-50">
              choose the <span className="text-orange-400">fashion</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-3 text-sm">
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
              <AuthUserNavItem />
            </nav>
          </div>
        </header>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <main className="min-w-0">{children}</main>
          <aside className="hidden lg:block">
            <PointsSidebar />
          </aside>
        </div>
        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-2 text-center text-xs text-stone-500">
          로컬 서버에서 동작합니다. 다른 사람과 공유하려면 같은 서버에 접속하거나 배포하세요.
        </footer>
      </body>
    </html>
  );
}
