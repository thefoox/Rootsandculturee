import type { NextConfig } from 'next'

const config: NextConfig = {
  // Proxy Firebase Auth handler to same origin — fixes signInWithRedirect/Popup
  // on browsers that block third-party storage access (Firebase docs: redirect-best-practices)
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://roots-and-culture.firebaseapp.com/__/auth/:path*',
      },
    ]
  },
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
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          {
            key: 'Content-Security-Policy',
            value:
              `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://apis.google.com https://*.firebaseapp.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com https://*.googleusercontent.com; connect-src 'self' https://api.stripe.com https://firebasestorage.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com https://*.firebaseapp.com https://apis.google.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.firebaseapp.com https://accounts.google.com https://*.google.com; font-src 'self' data:;`,
          },
        ],
      },
    ]
  },
}

export default config
