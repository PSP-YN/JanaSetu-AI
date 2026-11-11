import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "JanaSetu AI | Government Schemes in India — Eligibility & Application Preparation",
  description: "Find public benefit schemes in India, understand preliminary eligibility criteria and prepare application details with transparent sources, clear limitations and citizen approval.",
  alternates: { canonical: "/", languages: { "en-IN": "/", "hi-IN": "/hi", "kn-IN": "/kn", "te-IN": "/te", "ta-IN": "/ta", "ml-IN": "/ml", "x-default": "/" } },
  keywords: ["government schemes India","government benefits","welfare schemes","scheme eligibility","application preparation","Karnataka government schemes"],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: { type: "website", siteName: "JanaSetu AI", title: "JanaSetu AI | Government Schemes in India", description: "Discover public benefits, understand preliminary eligibility and prepare your next step.", url: "https://jana-setu-ai.vercel.app/", locale: "en_IN", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "JanaSetu AI — public benefits navigation and application preparation" }] },
  twitter: { card: "summary_large_image", title: "JanaSetu AI | Government Schemes in India", description: "Discover public benefits. Understand eligibility. Prepare your next step.", images: ["/opengraph-image"] }
};
import { ArrowRight, ArrowUpRight, BadgeCheck, BookOpenCheck, FileCheck2, Globe2, HeartHandshake, Languages, LockKeyhole, SearchCheck, ShieldCheck, Sparkles, Workflow } from "lucide-react";

const steps = [
  { n: "01", title: "Tell us about your situation", body: "Build a profile with only the details needed for a preliminary scheme check." },
  { n: "02", title: "Review possible schemes", body: "See the criteria, source links, missing evidence and uncertainty behind each result." },
  { n: "03", title: "Prepare with confidence", body: "Organise documents and next steps. You stay in control of every external action." }
];
const features = [
  { icon: SearchCheck, title: "Discover relevant support", body: "Explore a growing catalogue of central and state-level benefit programmes." },
  { icon: BadgeCheck, title: "Understand eligibility", body: "Review rule-based screening with the criteria and evidence that shaped the result." },
  { icon: FileCheck2, title: "Get application-ready", body: "Build a document checklist and organise information before visiting an official portal." },
  { icon: Workflow, title: "Keep every next step clear", body: "A transparent workflow helps you distinguish preparation, portal activity and confirmed submission." }
];

export default function HomePage() {
  return <main className="site-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/"><img src="/janasetu-mark.svg" alt="" /><span>JanaSetu<span className="brand-ai"> AI</span><small>Your bridge to public benefits</small></span></Link>
        <nav className="desktop-nav" aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#principles">Our principles</a><a href="#coverage">Coverage</a><Link href="/schemes">Verified scheme guides</Link></nav>
        <nav className="language-nav" aria-label="Choose language"><Link href="/hi" hrefLang="hi-IN">हिन्दी</Link><Link href="/kn" hrefLang="kn-IN">ಕನ್ನಡ</Link><Link href="/te" hrefLang="te-IN">తెలుగు</Link><Link href="/ta" hrefLang="ta-IN">தமிழ்</Link><Link href="/ml" hrefLang="ml-IN">മലയാളം</Link></nav><div className="header-actions"><Link className="header-text-link" href="/app">Open workspace <ArrowUpRight size={15}/></Link><Link className="button-primary header-cta" href="/app">Get started <ArrowRight size={16}/></Link></div>
      </div>
    </header>
    <section className="hero-section" id="main">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"/> CITIZEN-FIRST BENEFITS NAVIGATION</div>
          <h1>Public support should be <span>easier to find.</span></h1>
          <p className="hero-lede">A clearer path from your circumstances to the government benefits you may be able to access.</p>
          <div className="hero-actions"><Link href="/app" className="button-primary button-large">Explore the workspace <ArrowRight size={18}/></Link><a href="#how-it-works" className="button-secondary">See how it works</a></div>
          <div className="hero-assurance"><ShieldCheck size={17}/><span>Transparent sources. Clear next steps. You stay in control.</span></div>
        </div>
        <div className="hero-art-wrap"><img className="hero-art" src="/hero-citizen.svg" alt="Illustration of a citizen reviewing a benefits checklist on a phone, with connected support cards."/><div className="floating-note"><span className="note-icon"><BookOpenCheck size={18}/></span><span><strong>Know what comes next</strong><small>Criteria · evidence · actions</small></span></div></div>
      </div>
      <div className="hero-bottom-line"><span>BUILT AROUND PEOPLE, NOT PAPERWORK</span><span className="line-rule"/><span>ENGLISH · हिंदी · ಕನ್ನಡ · తెలుగు · தமிழ் · മലയാളം</span></div>
    </section>
    <section className="trust-strip" aria-label="JanaSetu principles"><div><ShieldCheck/><span><strong>Evidence-led</strong><small>Sources beside scheme information</small></span></div><div><LockKeyhole/><span><strong>Citizen-controlled</strong><small>Consent before consequential actions</small></span></div><div><Languages/><span><strong>Multilingual direction</strong><small>Designed for India's diversity</small></span></div><div><HeartHandshake/><span><strong>Independent navigator</strong><small>Not a government department</small></span></div></section>
    <section className="section-wrap" id="coverage">
      <div className="section-heading"><div><div className="eyebrow">A MORE USEFUL STARTING POINT</div><h2>From finding a scheme to knowing your next step.</h2></div><p>JanaSetu brings discovery, preliminary screening and application preparation into one understandable journey.</p></div>
      <div className="feature-grid">{features.map(({icon:Icon,title,body},i)=><article className="feature-card" key={title}><div className="feature-icon"><Icon size={22}/></div><span className="feature-index">0{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>
    <section className="how-section" id="how-it-works"><div className="how-inner"><div className="how-intro"><div className="eyebrow eyebrow-light">A SIMPLE, REVIEWABLE FLOW</div><h2>Clarity at every step.<br/><span>Control stays with you.</span></h2><p>JanaSetu helps you prepare. The relevant government department remains the authority on eligibility and final decisions.</p><Link className="button-light" href="/app">Open JanaSetu <ArrowRight size={17}/></Link></div><div className="steps-list">{steps.map(s=><article className="step-row" key={s.n}><span>{s.n}</span><div><h3>{s.title}</h3><p>{s.body}</p></div></article>)}</div></div></section>
    <section className="faq-section" id="faq"><div className="faq-inner"><div><div className="eyebrow">CLEAR ANSWERS, NO OVERCLAIMS</div><h2>Questions people should not have to guess about.</h2><p>JanaSetu is designed for people across India's States and Union Territories. Scheme coverage is still partial; check the linked official department source for current rules and availability.</p></div><div className="faq-list"><details><summary>Does JanaSetu decide whether I am officially eligible?</summary><p>No. JanaSetu can help screen a limited set of published criteria using information you provide. The responsible government department makes the official eligibility decision.</p></details><details><summary>Will JanaSetu submit my application automatically?</summary><p>Not in the current workspace. It can help organise preparation details, but a saved draft is not a submitted application. Any future portal assistance must use a supported, authorised integration and require your approval at the relevant steps.</p></details><details><summary>Is JanaSetu an official government website?</summary><p>No. JanaSetu is an independent public-benefits navigation project. Official scheme information, application portals and decisions remain with the relevant government departments.</p></details><details><summary>How current and complete is the scheme catalogue?</summary><p>The catalogue combines distinct source classes, including source-linked built-in records and discovery-only external data. Coverage is not exhaustive and records may require manual verification. Always check current eligibility, deadlines and application routes with the official source.</p></details></div></div></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context":"https://schema.org","@graph":[
      {"@type":"Organization","@id":"https://jana-setu-ai.vercel.app/#organization","name":"JanaSetu AI","url":"https://jana-setu-ai.vercel.app/","logo":{"@type":"ImageObject","url":"https://jana-setu-ai.vercel.app/janasetu-mark.svg"},"areaServed":{"@type":"Country","name":"India"},"knowsAbout":["Public benefit schemes in India","Preliminary eligibility screening","Government application preparation"]},
      {"@type":"WebSite","@id":"https://jana-setu-ai.vercel.app/#website","name":"JanaSetu AI","url":"https://jana-setu-ai.vercel.app/","description":"Independent public-benefits navigation and application preparation support for people in India.","inLanguage":"en-IN","publisher":{"@id":"https://jana-setu-ai.vercel.app/#organization"}},
      {"@type":"WebPage","@id":"https://jana-setu-ai.vercel.app/#webpage","url":"https://jana-setu-ai.vercel.app/","name":"JanaSetu AI | Government Schemes in India","inLanguage":"en-IN","isPartOf":{"@id":"https://jana-setu-ai.vercel.app/#website"},"about":{"@id":"https://jana-setu-ai.vercel.app/#organization"}},
      {"@type":"SoftwareApplication","@id":"https://jana-setu-ai.vercel.app/#application","name":"JanaSetu AI","applicationCategory":"UtilitiesApplication","operatingSystem":"Web browser","description":"Public benefit scheme discovery, preliminary eligibility screening and application preparation with citizen review.","url":"https://jana-setu-ai.vercel.app/app","inLanguage":["en-IN","hi-IN","kn-IN","te-IN","ta-IN","ml-IN"],"areaServed":{"@type":"Country","name":"India"},"provider":{"@id":"https://jana-setu-ai.vercel.app/#organization"},"featureList":["Public benefit scheme discovery","Preliminary eligibility screening","Application preparation with citizen review"]},
      {"@type":"FAQPage","@id":"https://jana-setu-ai.vercel.app/#faq","inLanguage":"en-IN","mainEntity":[
        {"@type":"Question","name":"Does JanaSetu decide whether I am officially eligible?","acceptedAnswer":{"@type":"Answer","text":"No. JanaSetu can help screen a limited set of published criteria using information you provide. The responsible government department makes the official eligibility decision."}},
        {"@type":"Question","name":"Will JanaSetu submit my application automatically?","acceptedAnswer":{"@type":"Answer","text":"Not in the current workspace. It can help organise preparation details, but a saved draft is not a submitted application. Any future portal assistance must use a supported, authorised integration and require your approval at the relevant steps."}},
        {"@type":"Question","name":"Is JanaSetu an official government website?","acceptedAnswer":{"@type":"Answer","text":"No. JanaSetu is an independent public-benefits navigation project. Official scheme information, application portals and decisions remain with the relevant government departments."}},
        {"@type":"Question","name":"How current and complete is the scheme catalogue?","acceptedAnswer":{"@type":"Answer","text":"The catalogue combines distinct source classes, including source-linked built-in records and discovery-only external data. Coverage is not exhaustive and records may require manual verification. Always check current eligibility, deadlines and application routes with the official source."}}
      ]}
    ]})}} />
    <section className="principles-section" id="principles"><div className="principles-card"><div className="principles-mark"><Sparkles size={22}/></div><div><div className="eyebrow">THE JANASETU PROMISE</div><h2>Useful assistance. Honest boundaries.</h2><p>We show what is known, what needs verification and what remains in your hands. A draft is never presented as a submitted application, and a preliminary match is never a guarantee of approval.</p></div><ul><li><BadgeCheck size={17}/> Source links and evidence context</li><li><LockKeyhole size={17}/> Explicit approval for sensitive actions</li><li><Globe2 size={17}/> Official portals remain authoritative</li></ul></div></section>
    <section className="cta-section"><div><div className="eyebrow">START WITH WHAT MATTERS TO YOU</div><h2>Take the next step with more clarity.</h2><p>Explore the current JanaSetu workspace and review its available catalogue and preparation tools.</p></div><Link href="/app" className="button-primary button-large">Open the workspace <ArrowRight size={18}/></Link></section>
    <footer className="site-footer"><div className="footer-main"><Link className="brand footer-brand" href="/"><img src="/janasetu-mark.svg" alt=""/><span>JanaSetu<span className="brand-ai"> AI</span><small>Your bridge to public benefits</small></span></Link><p>Independent public-benefits navigation and preparation support.</p><div className="footer-links"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/schemes">Verified scheme guides</Link><Link href="/app">Workspace</Link></div><nav className="footer-languages" aria-label="Choose language"><Link href="/">English</Link><Link href="/hi">हिन्दी</Link><Link href="/kn">ಕನ್ನಡ</Link><Link href="/te">తెలుగు</Link><Link href="/ta">தமிழ்</Link><Link href="/ml">മലയാളം</Link></nav></div><div className="footer-bottom"><span>© {new Date().getFullYear()} JanaSetu AI</span><span>JanaSetu is not a government website or department. Scheme decisions are made by the relevant authorities.</span></div></footer>
  </main>;
}
