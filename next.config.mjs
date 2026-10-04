/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Restrict all network calls strictly to local origin and local backends (localhost:8000, localhost:11434)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' data: blob:",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 http://localhost:11434 http://127.0.0.1:11434 https://*.onrender.com https:",
              "media-src 'self' data: blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
        ],
      },
    ];
  },
  async rewrites() {
    const rawTarget = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const target = rawTarget.startsWith('http') ? rawTarget : `https://${rawTarget}`;
    return [
      {
        source: '/api/:path*',
        destination: `${target}/api/:path*`,
      },
      {
        source: '/documents/:path*',
        destination: `${target}/documents/:path*`,
      },
      {
        source: '/synthetic/:path*',
        destination: `${target}/synthetic/:path*`,
      },
    ];
  },
};

export default nextConfig;
