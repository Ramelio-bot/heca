import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.unsplash.com https://*.supabase.co https://*.googleusercontent.com",
  "media-src 'self' data: blob: https://*.supabase.co https://*.unsplash.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com",
  "frame-src 'self' https://www.paypal.com https://*.paypal.com",
  "frame-ancestors 'none'",
  "connect-src 'self' https://*.supabase.co https://*.paypal.com https://api-m.sandbox.paypal.com https://api-m.paypal.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "xrzdcqnezhcezitolkuu.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
