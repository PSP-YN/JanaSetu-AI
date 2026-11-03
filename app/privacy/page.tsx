import { LocalizedLegalContent } from "@/components/LocalizedLegalContent";

export const metadata = {
  title: "Privacy | JanaSetu",
  description: "How the JanaSetu prototype handles profile data, browser storage and external services."
};

export default function PrivacyPage() {
  return <LocalizedLegalContent page="privacy" />;
}
