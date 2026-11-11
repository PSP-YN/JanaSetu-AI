import type { MetadataRoute } from "next";
import { listPublicSchemes } from "@/lib/public-scheme-content";
const base="https://jana-setu-ai.vercel.app";
const locales=["hi","kn","te","ta","ml"] as const;
const languageTags:Record<string,string>={"hi":"hi-IN","kn":"kn-IN","te":"te-IN","ta":"ta-IN","ml":"ml-IN"};
export const revalidate=3600;
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const now=new Date();
 const languages:Record<string,string>={"en-IN":base+"/","x-default":base+"/"};
 for(const locale of locales)languages[languageTags[locale]]=base+"/"+locale;
 const staticPages:MetadataRoute.Sitemap=[
  {url:base+"/",lastModified:now,changeFrequency:"weekly",priority:1,alternates:{languages}},
  ...locales.map(locale=>({url:base+"/"+locale,lastModified:now,changeFrequency:"weekly" as const,priority:0.9,alternates:{languages}})),
  {url:base+"/schemes",lastModified:now,changeFrequency:"daily",priority:0.85},
  {url:base+"/privacy",lastModified:now,changeFrequency:"yearly",priority:0.3},
  {url:base+"/terms",lastModified:now,changeFrequency:"yearly",priority:0.3}
 ];
 const schemes=await listPublicSchemes();
 const guidePages:MetadataRoute.Sitemap=schemes.filter(scheme=>scheme.sourceCheckedAt&&Number.isFinite(Date.parse(scheme.sourceCheckedAt))&&Date.now()-Date.parse(scheme.sourceCheckedAt)<=90*86400000).map(scheme=>({
  url:base+"/schemes/"+scheme.slug,
  lastModified:scheme.sourceCheckedAt&&Number.isFinite(Date.parse(scheme.sourceCheckedAt))?new Date(scheme.sourceCheckedAt):now,
  changeFrequency:"weekly",priority:0.8
 }));
 return [...staticPages,...guidePages];
}
