import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "JanaSetu AI — Public Benefits Workspace",
    short_name: "JanaSetu",
    description: "A multilingual, citizen-controlled public-benefits preparation workspace.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#fffaf4",
    theme_color: "#a94f1b",
    orientation: "any",
    categories: ["government", "productivity"],
    icons: [{ src: "/janasetu-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }]
  };
}
