import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JanaSetu — Benefits, made easier to access",
  description: "A transparent benefits navigation workspace that connects citizen profiles, scheme rules, supporting evidence and next actions.",
  applicationName: "JanaSetu",
  robots: { index: true, follow: true },
  openGraph: {
    title: "JanaSetu — Benefits, made easier to access",
    description: "Understand what you may qualify for. Prepare what comes next.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
