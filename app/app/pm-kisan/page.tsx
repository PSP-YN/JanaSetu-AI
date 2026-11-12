"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const documents = [
  { id: "land", title: "Land ownership record", status: "State verification evidence", description: "RTC / Pahani / Record of Rights or the equivalent land record for your State. Keep the latest available copy ready; the exact record depends on State verification.", accept: ".pdf,.jpg,.jpeg,.png", upload: "Keep ready — upload only if the official portal or State authority requests it." },
  { id: "bank", title: "Bank passbook", status: "Bank detail reference", description: "First page showing account holder name, account number and IFSC/MICR. Do not send these details to JanaSetu.", accept: ".pdf,.jpg,.jpeg,.png", upload: "Keep ready — the first-step PM-KISAN form does not show a general file-upload control." },
  { id: "identity", title: "Identity document", status: "Aadhaar authentication", description: "Aadhaar is authenticated on the official portal. If Aadhaar has not been issued, check the official FAQ for the prescribed alternative identification route.", accept: ".pdf,.jpg,.jpeg,.png", upload: "Do not upload Aadhaar here. Enter/authenticate only on the official government service." },
  { id: "mobile", title: "Aadhaar-linked mobile access", status: "OTP / e-KYC", description: "Keep access to the linked mobile for OTP e-KYC, or ask an authorised CSC / State Seva Kendra about biometric or face-authentication options.", accept: "", upload: "No file upload. Keep the device / SIM available." },
  { id: "photo", title: "Photograph / demographic details", status: "Only if specifically requested", description: "Keep a recent photograph available if the State authority requests it. The current first-step form does not expose a photograph upload field.", accept: ".jpg,.jpeg,.png", upload: "Conditional — do not assume this is a mandatory upload." },
] as const;

const fields = [
  ["Farmer / spouse full name", "Use the spelling shown on official records", "Do not guess or expand initials."],
  ["Date of birth / age", "DD / MM / YYYY", "Check against official records."],
  ["State / Union Territory", "Select your State / UT on the official portal", "District, block and village details may be requested in later steps."],
  ["Mobile number", "Enter directly on PM-KISAN", "Never store OTPs in JanaSetu."],
  ["Aadhaar number / identity proof", "Enter directly on the official portal", "Sensitive identity data — not collected by this guide."],
  ["Bank account number", "Enter directly on the official portal", "Verify the account holder and account details from the passbook."],
  ["IFSC / MICR", "Enter directly on the official portal", "Verify with your bank."],
  ["Land / survey / khata reference", "Keep your State land record available", "State / UT land ownership verification applies."],
] as const;

export default function PMKisanPreparationPage() {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [ready, setReady] = useState<string[]>([]);
  const count = useMemo(() => ready.length, [ready]);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem("janasetu.pm-kisan.ready.v1") || "[]"); if (Array.isArray(saved)) setReady(saved.filter((id): id is string => documents.some(doc => doc.id === id))); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("janasetu.pm-kisan.ready.v1", JSON.stringify(ready)); } catch {} }, [ready]);
  function choose(id: string, file?: File) {
    if (!file) return;
    setFiles(previous => ({ ...previous, [id]: file.name }));
  }
  function toggle(id: string) {
    setReady(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
  }
  return <main className="pmkisan-page">
    <header className="pmkisan-top"><Link href="/app/automation">← Applications & automation</Link><span>PM-KISAN · GUIDED PREPARATION</span></header>
    <section className="pmkisan-hero">
      <div><span className="pmkisan-kicker">PRADHAN MANTRI KISAN SAMMAN NIDHI</span><h1>Prepare your farmer registration with confidence.</h1><p>A step-by-step guide to the information, records and verification you may need — with a clear distinction between official form fields and supporting documents.</p><div className="pmkisan-trust"><span>Official sources linked</span><span>Private by design</span><span>Citizen-controlled</span></div></div>
      <aside className="pmkisan-progress"><span>Your preparation</span><strong>{count} / {documents.length}</strong><div className="pmkisan-progress-track"><i style={{width: count / documents.length * 100 + "%"}}/></div><small>Supporting records marked ready</small></aside>
    </section>
    <section className="pmkisan-alert"><strong>Important: do not expect five mandatory uploads.</strong><p>The current official New Farmer Registration first step displays Aadhaar, mobile, State, CAPTCHA and consent. It does not display a general document-upload section. The records below are preparation placeholders only. Attach a file only when the official portal or your State authority specifically asks for it.</p></section>
    <section className="pmkisan-section"><div className="pmkisan-section-head"><div><span>01 · DOCUMENTS & SUPPORTING RECORDS</span><h2>Keep these records ready</h2><p>Optional local file selection helps you organise your own checklist. Files selected here stay in this browser and are not sent to JanaSetu or any server.</p></div><span className="pmkisan-count">{count} of {documents.length} ready</span></div>
      <div className="pmkisan-doc-grid">{documents.map((doc,index)=><article className={"pmkisan-doc "+(ready.includes(doc.id)?"is-ready":"")} key={doc.id}><div className="pmkisan-doc-top"><span className="pmkisan-doc-number">0{index+1}</span><span className="pmkisan-doc-state">{ready.includes(doc.id)?"MARKED READY":"NOT CHECKED"}</span></div><h3>{doc.title}</h3><p>{doc.description}</p><small>{doc.status}</small>{doc.accept&&<label className="pmkisan-file"> <span>{files[doc.id] ? "Selected: "+files[doc.id] : "Choose a local file (optional)"}</span><input type="file" accept={doc.accept} onChange={event=>choose(doc.id,event.target.files?.[0])}/></label>}<p className="pmkisan-upload-note">{doc.upload}</p><button type="button" onClick={()=>toggle(doc.id)}>{ready.includes(doc.id)?"Undo ready status":"Mark as ready"}</button></article>)}</div>
    </section>
    <section className="pmkisan-section"><div className="pmkisan-section-head"><div><span>02 · FORM FIELD GUIDE</span><h2>Know what the official form asks</h2><p>These placeholders explain the information to prepare. Sensitive values are deliberately not collected by JanaSetu.</p></div></div><div className="pmkisan-fields">{fields.map(([label,placeholder,note],index)=><label className="pmkisan-field" key={label}><span><b>{String(index+1).padStart(2,"0")}</b>{label}</span><input disabled placeholder={placeholder}/><small>{note}</small></label>)}</div></section>
    <section className="pmkisan-section pmkisan-flow"><div className="pmkisan-section-head"><div><span>03 · OFFICIAL PROCESS</span><h2>Complete registration on PM-KISAN</h2><p>The Department / State Government performs authentication, eligibility verification and registration decisions.</p></div></div><ol><li><b>Open New Farmer Registration</b><span>Use the official Government of India portal.</span></li><li><b>Enter Aadhaar and mobile</b><span>Enter sensitive details only on the official website. Complete Aadhaar authentication yourself.</span></li><li><b>Select State and review consent</b><span>Complete CAPTCHA and read the full Aadhaar consent notice before agreeing.</span></li><li><b>Follow the next State verification steps</b><span>Provide any further information or supporting records only when the official portal / State authority requests them.</span></li></ol><a className="pmkisan-primary" href="https://pmkisan.gov.in/RegistrationFormupdated.aspx" target="_blank" rel="noreferrer">Open official PM-KISAN registration ↗</a><p className="pmkisan-disclaimer">JanaSetu does not authenticate Aadhaar, solve CAPTCHA, upload your documents, or claim that your application has been submitted or approved. Review every declaration and submit through the official service.</p></section>
    <footer className="pmkisan-sources"><strong>Official sources reviewed · 12 November 2026</strong><a href="https://pmkisan.gov.in/RegistrationFormupdated.aspx" target="_blank" rel="noreferrer">New Farmer Registration form</a><a href="https://pmkisan.gov.in/Documents/FAQPMKISAN.PDF" target="_blank" rel="noreferrer">PM-KISAN FAQ</a><a href="https://www.nic.gov.in/project/pm-kisan/" target="_blank" rel="noreferrer">NIC process and portal features</a><a href="https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=156092&id=156092&lang=2&reg=3" target="_blank" rel="noreferrer">PIB eligibility and required information</a></footer>
  </main>;
}
