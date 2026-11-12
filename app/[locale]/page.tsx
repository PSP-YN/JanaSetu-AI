import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight,ShieldCheck,LockKeyhole,Languages,FileCheck2,SearchCheck,BookOpenCheck } from "lucide-react";
import { LANDING_LOCALES,type LandingLocale } from "@/lib/landing-locales";
const BASE="https://jana-setu-ai.vercel.app";
const LOCALES=Object.values(LANDING_LOCALES);
type Props={params:Promise<{locale:string}>};
export const dynamicParams = false;
export function generateStaticParams(){return LOCALES.map(item=>({locale:item.code}));}
const getLocale=(code:string)=>LANDING_LOCALES[code as keyof typeof LANDING_LOCALES] as LandingLocale|undefined;
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {locale}=await params;const copy=getLocale(locale);if(!copy)return {title:"Page not found",robots:{index:false,follow:false}};
 const languages:Record<string,string>={"en-IN":"/","x-default":"/"};for(const item of LOCALES)languages[item.languageTag]="/"+item.code;
 return {metadataBase:new URL(BASE),title:copy.title,description:copy.description,alternates:{canonical:"/"+locale,languages},
  keywords:["government schemes India","welfare schemes","scheme eligibility","application preparation","public benefits India","Karnataka government schemes"],
  robots:{index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1}},
  openGraph:{type:"website",siteName:"JanaSetu AI",title:copy.title,description:copy.description,url:BASE+"/"+locale,locale:copy.languageTag.replace("-","_"),images:[{url:"/opengraph-image",width:1200,height:630,alt:"JanaSetu AI public benefits navigation"}]},
  twitter:{card:"summary_large_image",title:copy.title,description:copy.description,images:["/opengraph-image"]}};
}
export default async function LocalizedLandingPage({params}:Props){
 const {locale}=await params;const copy=getLocale(locale);
 if(!copy)return <main lang="en-IN"><h1>Page not found</h1><Link href="/">English</Link></main>;
 const languages=[{href:"/",label:"English"},...LOCALES.map(item=>({href:"/"+item.code,label:item.language}))];
 const graph={"@context":"https://schema.org","@graph":[
  {"@type":"Organization","@id":BASE+"/#organization","name":"JanaSetu AI","url":BASE+"/","logo":{"@type":"ImageObject","url":BASE+"/janasetu-mark.svg"},"areaServed":{"@type":"Country","name":"India"},"knowsAbout":["Public benefit schemes in India","Preliminary eligibility screening","Government application preparation"]},
  {"@type":"WebSite","@id":BASE+"/#website","url":BASE+"/","name":"JanaSetu AI","inLanguage":copy.languageTag,"publisher":{"@id":BASE+"/#organization"}},
  {"@type":"WebPage","@id":BASE+"/"+locale+"#webpage","url":BASE+"/"+locale,"name":copy.title,"description":copy.description,"inLanguage":copy.languageTag,"isPartOf":{"@id":BASE+"/#website"},"about":{"@id":BASE+"/#organization"}},
  {"@type":"SoftwareApplication","@id":BASE+"/#application","name":"JanaSetu AI","applicationCategory":"UtilitiesApplication","operatingSystem":"Web browser","description":copy.description,"url":BASE+"/app","inLanguage":copy.languageTag,"areaServed":{"@type":"Country","name":"India"},"provider":{"@id":BASE+"/#organization"},"featureList":["Public benefit scheme discovery","Preliminary eligibility screening","Application preparation with citizen review"]},
  {"@type":"FAQPage","@id":BASE+"/"+locale+"#faq","inLanguage":copy.languageTag,"mainEntity":copy.faqs.map(faq=>({"@type":"Question","name":faq.question,"acceptedAnswer":{"@type":"Answer","text":faq.answer}}))}
 ]};
 return <main lang={copy.languageTag} className="localized-landing">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph)}}/>
  <header className="localized-header"><Link className="brand" href="/"><img src="/janasetu-mark.svg" alt=""/><span>JanaSetu<span className="brand-ai"> AI</span><small>{copy.footer}</small></span></Link><nav aria-label="Choose language">{languages.map(item=><Link key={item.href} href={item.href} hrefLang={item.href==="/"? "en-IN":LOCALES.find(x=>"/"+x.code===item.href)?.languageTag}>{item.label}</Link>)}</nav><Link href="/app" className="button-primary">{copy.primaryCta}<ArrowRight size={16}/></Link></header>
  <section className="localized-hero"><div className="eyebrow"><span className="eyebrow-dot"/> {copy.eyebrow}</div><h1>{copy.headline}</h1><p>{copy.intro}</p><div className="localized-actions"><Link href="/app" className="button-primary button-large">{copy.primaryCta}<ArrowRight size={18}/></Link><a href="#how-it-works" className="button-secondary">{copy.secondaryCta}</a></div><div className="localized-assurance"><ShieldCheck size={18}/>{copy.trust}</div></section>
  <section className="localized-trust"><div><SearchCheck/><strong>{copy.steps[1].title}</strong></div><div><LockKeyhole/><strong>{copy.steps[2].title}</strong></div><div><Languages/><strong>{copy.language}</strong></div><div><FileCheck2/><strong>{copy.principlesTitle}</strong></div></section>
  <section className="localized-how" id="how-it-works"><div><div className="eyebrow">JANASETU AI</div><h2>{copy.howTitle}</h2><p>{copy.principlesBody}</p></div><div className="localized-steps">{copy.steps.map((step,index)=><article key={step.title}><span>0{index+1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></article>)}</div></section>
  <section className="localized-faq" id="faq"><div><div className="eyebrow">FAQ</div><h2>{copy.principlesTitle}</h2><p>{copy.principlesBody}</p></div><div>{copy.faqs.map(faq=><details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section>
  <section className="localized-disclaimer"><BookOpenCheck/><p>{copy.disclaimer}</p><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></section>
  <footer className="localized-footer"><span>{copy.footer}</span><Link href="/app">{copy.primaryCta}</Link></footer>
 </main>;
}
