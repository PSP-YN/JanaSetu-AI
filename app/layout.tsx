import type { Metadata, Viewport } from "next";
import "./globals.css";
const siteUrl = new URL("https://jana-setu-ai.vercel.app");
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "JanaSetu AI — Your bridge to public benefits", template: "%s | JanaSetu AI" },
  description: "Find public benefit schemes in India, understand preliminary eligibility criteria and prepare application details with transparent sources, clear limitations and citizen approval.",
  applicationName: "JanaSetu AI",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  icons: { icon: "/janasetu-mark.svg", apple: "/janasetu-mark.svg" },
  openGraph: { title: "JanaSetu AI | Government Schemes in India", description: "Discover public benefits, understand preliminary eligibility and prepare your next step.", url: siteUrl, siteName: "JanaSetu AI", type: "website", locale: "en_IN", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "JanaSetu AI public benefits navigation" }] },
  twitter: { card: "summary_large_image", title: "JanaSetu AI | Government Schemes in India", description: "Discover public benefits. Understand eligibility. Prepare your next step.", images: ["/opengraph-image"] }
};
export const viewport: Viewport = { themeColor: "#102b52", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en-IN"><body>{children}</body></html>; }
