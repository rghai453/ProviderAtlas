import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap-index',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy-Report-Only', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagservices.com https://adservice.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src https://googleads.g.doubleclick.net https://www.google.com; connect-src 'self' https:; font-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
