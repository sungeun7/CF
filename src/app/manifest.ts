import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "choose the fashion",
    short_name: "choose fashion",
    description: "체형과 스타일 정보를 바탕으로 서로 코디를 추천하는 커뮤니티 앱",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0a09",
    theme_color: "#0c0a09",
    lang: "ko",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
      {
        src: "/apple-touch-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],
  };
}
