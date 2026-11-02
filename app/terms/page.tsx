import Link from "next/link";

export const metadata = {
  title: "Terms and limitations | JanaSetu",
  description: "Terms and limitations for the independent JanaSetu public-service navigation prototype."
};

export default function TermsPage() {
  return <main className="content-area" style={{maxWidth: 900, margin: "0 auto", padding: "40px 24px"}}>
    <p><Link href="/">← Back to JanaSetu</Link></p>
    <h1>Terms and limitations</h1>
    <p><strong>Prototype notice · Last updated 2 November 2026.</strong></p>
    <h2>Independent service</h2>
    <p>JanaSetu is an independent public-service navigation and preparation prototype. It is not owned, operated, endorsed or certified by the Government of India, any State Government, ministry or department. It is not a government application portal.</p>
    <h2>Information is not an eligibility decision</h2>
    <p>Screening is preliminary and based on a limited set of prototype rules. A potential match is not approval, entitlement or a guarantee of benefit. Scheme terms, dates, amounts and documents can change. Confirm current requirements with the responsible department and the official notification before acting.</p>
    <h2>Catalogue limitations</h2>
    <p>Third-party imported records are discovery-only and may be incomplete, stale, duplicated or incorrectly parsed. Budget-derived leads are not necessarily schemes. Imported eligibility fields do not drive JanaSetu's rule engine. Only records explicitly marked as rule-screened have deterministic prototype checks, and those checks are not a substitute for official verification.</p>
    <h2>Forms and external services</h2>
    <p>The optional browser extension is experimental and uses label/placeholder heuristics on HTTPS .gov.in and .nic.in pages. It may miss or mis-map fields. You must review every value. It does not submit forms, upload documents, bypass OTP/CAPTCHA or provide access to a government account. You remain responsible for information entered and submitted on external portals.</p>
    <h2>No professional advice or guarantee</h2>
    <p>JanaSetu does not provide legal, financial or government-authority advice. Use is at your own discretion. The service is provided as a prototype without a promise of uninterrupted availability, complete coverage or error-free output.</p>
    <h2>Source rights and access</h2>
    <p>Third-party datasets retain their stated licences and attribution. Government portal terms continue to apply. JanaSetu does not authorize scraping, automated access or copying where the source prohibits it.</p>
    <p>These prototype terms require qualified legal review before public use with real citizen data or any government/department integration.</p>
  </main>;
}
