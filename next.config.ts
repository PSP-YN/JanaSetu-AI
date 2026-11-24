import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), payment=(), usb=(), microphone=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Origin-Agent-Cluster", value: "?1" },
];

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/api/schemes/open-data": ["./data/smartduke-snapshot.json.gz"],
    "/api/sources/health": ["./data/smartduke-snapshot.json.gz"]
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" }
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default config;
