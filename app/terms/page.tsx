import { LocalizedLegalContent } from "@/components/LocalizedLegalContent";

export const metadata = {
  title: "Terms and limitations | JanaSetu",
  description: "Terms and limitations for the independent JanaSetu public-service navigation prototype."
};

export default function TermsPage() {
  return <LocalizedLegalContent page="terms" />;
}
