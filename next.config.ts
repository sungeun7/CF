import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Windows에서 .next/trace 파일 잠금(EPERM) 회피
  distDir: ".next-dev",
};

export default nextConfig;
