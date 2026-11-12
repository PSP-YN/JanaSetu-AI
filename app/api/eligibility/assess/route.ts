import { NextRequest,NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";
import { parseCitizenProfile } from "@/lib/profile-validation";
import { assessApprovedScheme } from "@/lib/eligibility-engine";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store, max-age=0"}});
type SchemeRow={id:string;slug:string;name:string;current_version_id:string|null};
type VersionRow={id:string;version_number:number;verification_status:string;effective_from:string|null;effective_to:string|null;rule_set:unknown};

export async function POST(request:NextRequest){
 try{
  if(request.headers.get("origin")!==request.nextUrl.origin)return json({error:"Cross-origin request blocked."},403);
  const raw=await request.text();
  if(new TextEncoder().encode(raw).byteLength>48*1024)return json({error:"Assessment request is too large."},413);
  const input=JSON.parse(raw) as Record<string,unknown>;
  if(Object.keys(input).some(k=>![ "scheme_slug","profile" ].includes(k)))return json({error:"Unsupported assessment field."},400);
  const slug=typeof input.scheme_slug==="string"?input.scheme_slug:"";
  const profile=parseCitizenProfile(input.profile);
  if(!/^[a-z0-9-]{2,120}$/.test(slug)||!profile)return json({error:"A valid scheme and citizen profile are required."},400);
  const session=await getVerifiedSupabaseSession();
  if(!session)return json({error:"Sign in required."},401);
  const headers={apikey:session.key,Authorization:"Bearer "+session.accessToken};
  const schemeParams=new URLSearchParams({select:"id,slug,name,current_version_id",slug:"eq."+slug,publication_status:"eq.published",limit:"1"});
  const schemeResponse=await fetch(session.url+"/rest/v1/schemes?"+schemeParams,{headers,cache:"no-store"});
  if(!schemeResponse.ok)return json({error:"Published scheme catalogue is unavailable."},503);
  const schemes=await schemeResponse.json() as SchemeRow[];
  const scheme=schemes[0];
  if(!scheme?.current_version_id)return json({error:"This scheme has no published version available for assessment."},404);
  const versionParams=new URLSearchParams({select:"id,version_number,verification_status,effective_from,effective_to,rule_set",id:"eq."+scheme.current_version_id,limit:"1"});
  const versionResponse=await fetch(session.url+"/rest/v1/scheme_versions?"+versionParams,{headers,cache:"no-store"});
  if(!versionResponse.ok)return json({error:"Approved scheme rules are unavailable."},503);
  const versions=await versionResponse.json() as VersionRow[];
  const version=versions[0];
  if(!version)return json({error:"Published scheme version was not found."},404);
  const assessment=assessApprovedScheme(profile,{
   schemeId:scheme.slug,publicationStatus:"published",
   verificationStatus:version.verification_status as "independently_approved",
   effectiveFrom:version.effective_from,effectiveTo:version.effective_to,ruleSet:version.rule_set
  });
  return json({scheme:{slug:scheme.slug,name:scheme.name,version:version.version_number},assessment});
 }catch{return json({error:"Eligibility assessment could not be completed."},503);}
}
