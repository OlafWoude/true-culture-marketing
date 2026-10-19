import type { NextConfig } from "next";

const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cache-Control", value: "no-store, max-age=0" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      { source: "/admin", headers: privateHeaders },
      { source: "/admin/:path*", headers: privateHeaders },
      { source: "/preview/:path*", headers: privateHeaders },
      { source: "/api/admin/:path*", headers: privateHeaders },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
