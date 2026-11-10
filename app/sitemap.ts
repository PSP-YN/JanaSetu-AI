import type { MetadataRoute } from "next";
const base="https://jana-setu-ai.vercel.app";
const locales=["hi","kn","te","ta","ml"] as const;
const languageTags:Record<string,string>={"hi":"hi-IN","kn":"kn-IN","te":"te-IN","ta":"ta-IN","ml":"ml-IN"};
export default function sitemap():MetadataRoute.Sitemap{
 const now=new Date();
 const languages:Record<string,string>={"en-IN":base+"/","x-default":base+"/"};
 for(const locale of locales)languages[languageTags[locale]]=base+"/"+locale;
 return [
  {url:base+"/",lastModified:now,changeFrequency:"weekly",priority:1,alternates:{languages}},
  ...locales.map(locale=>({url:base+"/"+locale,lastModified:now,changeFrequency:"weekly" as const,priority:0.9,alternates:{languages}})),
  {url:base+"/privacy",lastModified:now,changeFrequency:"yearly",priority:0.3},
  {url:base+"/terms",lastModified:now,changeFrequency:"yearly",priority:0.3}
 ];
}
