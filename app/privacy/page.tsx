import Link from "next/link";

export const metadata = {
  title: "Privacy | JanaSetu",
  description: "How the JanaSetu prototype handles profile data, browser storage and external services."
};

export default function PrivacyPage() {
  return <main className="content-area" style={{maxWidth: 900, margin: "0 auto", padding: "40px 24px"}}>
    <p><Link href="/">← Back to JanaSetu</Link></p>
    <h1>Privacy notice</h1>
    <p><strong>Prototype notice · Last updated 2 November 2026.</strong> JanaSetu is an independent prototype, not a government service. Do not enter Aadhaar numbers, bank credentials, account numbers, identity-document numbers or other sensitive personal data.</p>
    <h2>What stays in your browser</h2>
    <p>The prototype stores the citizen profile, selected language, assessments, draft records, document metadata and reminders in this browser's local storage. These records are not synced to an account. Clearing browser site data can remove them. Use the backup feature only on a device and storage location you control; the exported JSON may contain personal information.</p>
    <h2>What is sent to the application server</h2>
    <p>When you run an assessment, prepare an application draft or use text intake, the relevant profile fields or text are sent to JanaSetu's application routes for processing. The current prototype has no configured citizen-profile database and does not intentionally save these request bodies as application records. Hosting and network providers may process request metadata under their own terms. Do not treat this prototype as a confidential-data environment.</p>
    <h2>Documents and speech</h2>
    <p>Document entries are metadata references only; the prototype does not upload the selected documents. Browser speech recognition may send audio to the browser or operating-system speech provider. You can avoid speech input and type manually.</p>
    <h2>External websites</h2>
    <p>Links to myScheme, department portals, UMANG, DigiLocker and other services leave JanaSetu. Their own privacy notices and terms apply. Information entered or submitted on those sites is controlled by the relevant service, not JanaSetu.</p>
    <h2>Purpose and retention</h2>
    <p>Browser data is retained until you delete it or clear the site's storage. Exported backups are under your control. Do not share a backup publicly. The prototype does not provide an account-based deletion request because it does not provide user accounts.</p>
    <h2>Your choices</h2>
    <ul><li>Use synthetic information while testing.</li><li>Do not use voice input if you do not want to involve a browser speech provider.</li><li>Do not export or share a backup unless you understand it contains personal profile data.</li><li>Delete local JanaSetu site data in your browser when finished.</li></ul>
    <h2>Review status</h2>
    <p>This notice documents current prototype behaviour; it is not a legal opinion or a completed DPDP Act compliance assessment. A qualified privacy/legal reviewer must assess the actual deployment, vendor terms, data flows, retention, consent and applicable obligations before any real citizen data is collected.</p>
  </main>;
}
