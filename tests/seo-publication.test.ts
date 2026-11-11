import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(path:string)=>readFileSync(path,"utf8");

test("public scheme guides expose only published, independently approved versions with fresh evidence",()=>{
 const source=read("lib/public-scheme-content.ts");
 assert.match(source,/publication_status=eq\.published/);
 assert.match(source,/verification_status!==\"independently_approved\"/);
 assert.match(source,/isFreshApprovedRuleSet\(version\.rule_set\)/);
 assert.match(source,/sourceHash/);
 assert.match(source,/90\*86400000/);
 assert.match(source,/^https:/m);
});

test("scheme SEO pages contain source links, honest government disclaimer and no submission claim",()=>{
 const page=read("app/schemes/[slug]/page.tsx");
 assert.match(page,/official scheme portal/);
 assert.match(page,/not a government website/);
 assert.match(page,/not a government submission/);
 assert.match(page,/BreadcrumbList/);
 assert.match(page,/FAQPage/);
 assert.match(page,/robots:\{index:fresh/);
});

test("empty and stale scheme guides are excluded from indexing and sitemap",()=>{
 const directory=read("app/schemes/page.tsx");
 const sitemap=read("app/sitemap.ts");
 assert.match(directory,/robots:\{index:schemes\.length>0/);
 assert.match(sitemap,/schemes\.filter/);
 assert.match(sitemap,/90\*86400000/);
 assert.match(sitemap,/scheme\.sourceCheckedAt/);
});

test("answer-engine files distinguish current capabilities from future automation",()=>{
 const llms=read("public/llms.txt");
 const full=read("public/llms-full.txt");
 assert.match(llms,/not a government website/i);
 assert.match(llms,/scheme guides/);
 assert.match(full,/A saved or citizen-reviewed draft is not a submitted application/);
 assert.match(full,/Do not infer eligibility, deadlines, benefit amounts or government integration status/);
});
