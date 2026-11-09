import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Citizen workspace",
  description: "Explore the current JanaSetu citizen benefits preparation workspace.",
  alternates: { canonical: "/app" },
  robots: { index: false, follow: false }
};
export default function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
