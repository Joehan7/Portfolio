import type { NextConfig } from 'next';
const pages = process.env.GITHUB_PAGES === 'true';
const config: NextConfig = {
  poweredByHeader: false,
  ...(pages ? { output: 'export', basePath: '/Portfolio', trailingSlash: true } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: pages ? '/Portfolio' : '' },
  images: { formats: ['image/avif', 'image/webp'], unoptimized: pages },
  ...(!pages
    ? {
        async headers() {
          return [
            {
              source: '/(.*)',
              headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                { key: 'X-Frame-Options', value: 'DENY' },
              ],
            },
          ];
        },
      }
    : {}),
};
export default config;
