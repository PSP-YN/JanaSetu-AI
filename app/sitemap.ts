import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://jana-setu-ai.vercel.app";
  return [ "", "/privacy", "/terms" ].map((path) => ({ url: base + path, lastModified: new Date(), changeFrequency: path === "" ? "weekly" : "yearly", priority: path === "" ? 1 : 0.3 }));
}
