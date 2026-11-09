import type { Metadata, Viewport } from "next";
import "./globals.css";
const siteUrl = new URL("https://jana-setu-ai.vercel.app");
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "JanaSetu AI — Your bridge to public benefits", template: "%s | JanaSetu AI" },
  description: "Understand public benefit schemes, review eligibility criteria and prepare your next steps with transparent, source-linked guidance.",
  applicationName: "JanaSetu AI",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  icons: { icon: "/janasetu-mark.svg", apple: "/janasetu-mark.svg" },
  openGraph: { title: "JanaSetu AI — Your bridge to public benefits", description: "A clearer path from your circumstances to the government benefits you may be able to access.", url: siteUrl, siteName: "JanaSetu AI", type: "website" },
  twitter: { card: "summary_large_image", title: "JanaSetu AI", description: "Discover public benefits. Understand eligibility. Prepare your next step." }
};
export const viewport: Viewport = { themeColor: "#102b52", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
