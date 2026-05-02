import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  // Turbopack (Next.js 16 default bundler)
  // @imgly/background-removal usa onnxruntime-web (browser) — no necesita alias adicional
  turbopack: {},
};

export default nextConfig;
