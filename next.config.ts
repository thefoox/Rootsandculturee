import type { NextConfig } from 'next'

// Used to allow 'unsafe-eval' in script-src only during local development
// (needed for Next.js HMR). Excluded from production builds.
const isDev = process.env.NODE_ENV === 'development'

// Content-Security-Policy — single-line string (whitespace collapsed)
// Allows Stripe JS, Firebase APIs, and Google Fonts while blocking
// everything else. 'unsafe-inline' in style-src is required for Tailwind.
// 'frame-ancestors none' reinforces X-Frame-Options: DENY.
const cspHeader = `
  default-src 'self';
  script-src 'self' https://js.stripe.com${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://firebasestorage.googleapis.com https://storage.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://api.stripe.com wss://*.firebaseio.com;
  frame-src https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // --- Existing headers ---
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // --- New headers added in phase 24-01 ---
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
        ],
      },
    ]
  },
}

export default config
