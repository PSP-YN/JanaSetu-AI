import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(path:string)=>readFileSync(path,"utf8");

test("public landing pages publish accurate answer-engine structured data",()=>{
 const home=read("app/page.tsx");
 const locale=read("app/[locale]/page.tsx");
 const localeData=read("lib/landing-locales.ts");
 assert.match(home,/Government Schemes in India/);
 assert.match(home,/FAQPage/);
 assert.match(home,/Organization/);
 assert.match(home,/SoftwareApplication/);
 assert.match(home,/areaServed/);
 assert.match(locale,/generateStaticParams/);
 assert.match(locale,/alternates:\{canonical/);
 assert.match(locale,/FAQPage/);
 for(const code of ["hi","kn","te","ta","ml"])assert.ok(localeData.includes(code+":"));
 assert.match(home,/Will JanaSetu submit my application automatically/);
 assert.match(home,/No\. JanaSetu is an independent public-benefits navigation project/);
});

test("localized pages and answer-engine references are discoverable without exposing citizen workspace",()=>{
 const robots=read("app/robots.ts");
 const sitemap=read("app/sitemap.ts");
 const short=read("public/llms.txt");
 const full=read("public/llms-full.txt");
 assert.match(robots,/OAI-SearchBot/);
 assert.match(robots,/PerplexityBot/);
 assert.match(robots,/Claude-SearchBot/);
 assert.match(robots,/\/app/);
 for(const code of ["hi","kn","te","ta","ml"])assert.ok(sitemap.includes('"/'+code+'"'));
 assert.match(short,/not a government website/i);
 assert.match(short,/A preliminary match is not an official eligibility decision/i);
 assert.match(full,/source-check date/);
 assert.match(full,/citizen approval/);
 assert.match(full,/official government source/i);
});
