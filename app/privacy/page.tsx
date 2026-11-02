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
    <p>The main web interface stores the citizen profile, selected language, assessments, draft records, document metadata and reminders in this browser's local storage. These records are not synced to an account. Clearing browser site data can remove them. Use the backup feature only on a device and storage location you control; the exported JSON may contain personal information.</p>
    <h2>How the main app processes your information</h2>
    <p>In the current main-interface workflow, benefit screening, text-intake extraction and draft preparation run in the browser using deterministic code. Those three actions do not send the profile or free-text description to JanaSetu's screening, intake or draft API routes. The repository does expose corresponding API endpoints for programmatic clients; a client that calls those endpoints sends the submitted profile or text to the application server for processing. Do not assume that an API request is local-only.</p>
    <p>When you search or browse the external open-data catalogue, the search term (up to 120 characters) is sent through JanaSetu's server to the Hugging Face Dataset Viewer. Do not put names, addresses, income details or other personal information in the scheme search box. The source-health endpoint contacts Hugging Face for dataset metadata and does not require a citizen profile.</p>
    <p>Normal use of a hosted website also exposes network and request metadata to the hosting, CDN and infrastructure providers. Their logs, retention and processing terms must be checked for the actual deployment. This notice does not certify provider-side deletion or log configuration.</p>
    <h2>Documents and speech</h2>
    <p>Document entries are metadata references only; the prototype does not upload the selected documents. Browser speech recognition may send audio to the browser or operating-system speech provider. You can avoid speech input and type manually.</p>
    <h2>External websites and browser extension</h2>
    <p>Links to myScheme, department portals, UMANG, DigiLocker and other services leave JanaSetu. Their own privacy notices and terms apply. Information entered or submitted on those sites is controlled by the relevant service, not JanaSetu. The optional extension stores an explicitly imported profile in extension-local storage and sends selected mapped values to the active tab only after you click Fill. Review every field; the extension does not submit the form.</p>
    <h2>Purpose and retention</h2>
    <p>Browser data is retained until you delete it or clear the site's storage. Exported backups are under your control. The prototype does not provide an account-based deletion request because it does not provide user accounts. Provider-side request and infrastructure log retention is outside the browser's local-storage controls and must be verified separately.</p>
    <h2>Your choices</h2>
    <ul><li>Use synthetic information while testing.</li><li>Do not use voice input if you do not want to involve a browser speech provider.</li><li>Do not put personal information into the scheme search box.</li><li>Do not export or share a backup unless you understand it contains personal profile data.</li><li>Delete local JanaSetu site data in your browser when finished.</li></ul>
    <h2>Review status</h2>
    <p>This notice documents the intended current prototype flows; it is not a legal opinion or a completed DPDP Act compliance assessment. A qualified privacy/legal reviewer must validate the actual deployment, API consumers, vendor terms, data flows, logs, retention, consent and applicable obligations before any real citizen data is collected.</p>
  </main>;
}
