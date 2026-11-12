import { NextRequest,NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";
import { parseCitizenProfile } from "@/lib/profile-validation";
import { assessApprovedScheme,prepareApplicationDraft,type ApprovedSchemeVersion } from "@/lib/eligibility-engine";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store, max-age=0"}});
const uuid=(value:unknown)=>typeof value==="string"&&/^[0-9a-f-]{36}$/i.test(value);
type SchemeRow={slug:string;name:string;current_version_id:string|null};
type VersionRow={id:string;version_number:number;verification_status:string;effective_from:string|null;effective_to:string|null;rule_set:unknown};
type Session=NonNullable<Awaited<ReturnType<typeof getVerifiedSupabaseSession>>>;
async function rpc(session:Session,name:string,args:Record<string,unknown>){
 const response=await fetch(session.url+"/rest/v1/rpc/"+name,{method:"POST",headers:{apikey:session.key,Authorization:"Bearer "+session.accessToken,"Content-Type":"application/json"},body:JSON.stringify(args),cache:"no-store"});
 const data=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(String(data?.message||"Application preparation failed."));
 return data;
}
async function loadScheme(session:Session,slug:string){
 const headers={apikey:session.key,Authorization:"Bearer "+session.accessToken};
 const schemeParams=new URLSearchParams({select:"slug,name,current_version_id",slug:"eq."+slug,publication_status:"eq.published",limit:"1"});
 const sr=await fetch(session.url+"/rest/v1/schemes?"+schemeParams,{headers,cache:"no-store"});
 if(!sr.ok)throw new Error("scheme_catalogue_unavailable");
 const schemes=await sr.json() as SchemeRow[];
 const scheme=schemes[0];
 if(!scheme?.current_version_id)throw new Error("scheme_not_published");
 const versionParams=new URLSearchParams({select:"id,version_number,verification_status,effective_from,effective_to,rule_set",id:"eq."+scheme.current_version_id,limit:"1"});
 const vr=await fetch(session.url+"/rest/v1/scheme_versions?"+versionParams,{headers,cache:"no-store"});
 if(!vr.ok)throw new Error("scheme_rules_unavailable");
 const versions=await vr.json() as VersionRow[];
 if(!versions[0])throw new Error("scheme_version_not_found");
 const version=versions[0];
 const model:ApprovedSchemeVersion={schemeId:scheme.slug,publicationStatus:"published",verificationStatus:version.verification_status,effectiveFrom:version.effective_from,effectiveTo:version.effective_to,ruleSet:version.rule_set};
 return {scheme,version,model};
}
export async function GET(request:NextRequest){
 try{
  const session=await getVerifiedSupabaseSession();if(!session)return json({error:"Sign in required."},401);
  const caseId=request.nextUrl.searchParams.get("case_id");
  if(caseId){
   if(!uuid(caseId))return json({error:"A valid application case is required."},400);
   const preparation=await rpc(session,"get_application_preparation",{p_case_id:caseId});
   return json({preparation});
  }
  const preparations=await rpc(session,"list_application_preparations",{});
  return json({preparations});
 }catch(error){
  const message=error instanceof Error?error.message:"";
  if(message.includes("preparation_not_found"))return json({error:"Application preparation was not found."},404);
  if(message.includes("profile_storage_consent_required"))return json({error:"Access is blocked because profile-storage consent is no longer active."},403);
  return json({error:"Application preparation is unavailable."},503);
 }
}
export async function POST(request:NextRequest){
 try{
  if(request.headers.get("origin")!==request.nextUrl.origin)return json({error:"Cross-origin request blocked."},403);
  const raw=await request.text();
  if(new TextEncoder().encode(raw).byteLength>48*1024)return json({error:"Preparation request is too large."},413);
  const input=JSON.parse(raw) as Record<string,unknown>;
  if(Object.keys(input).some(k=>![ "scheme_slug","profile","consent_id","idempotency_key" ].includes(k)))return json({error:"Unsupported preparation field."},400);
  const slug=typeof input.scheme_slug==="string"?input.scheme_slug:"";
  const consentId=typeof input.consent_id==="string"?input.consent_id:"";
  const idempotencyKey=typeof input.idempotency_key==="string"?input.idempotency_key:"";
  const profile=parseCitizenProfile(input.profile);
  if(!/^[a-z0-9-]{2,120}$/.test(slug)||!uuid(consentId)||idempotencyKey.length<8||idempotencyKey.length>120||!profile)return json({error:"A valid scheme, profile, consent and idempotency key are required."},400);
  const session=await getVerifiedSupabaseSession();if(!session)return json({error:"Sign in required."},401);
  let loaded;
  try{loaded=await loadScheme(session,slug);}catch(error){
   const message=error instanceof Error?error.message:"";
   if(message==="scheme_not_published"||message==="scheme_version_not_found")return json({error:"This scheme is not independently published for application preparation."},409);
   return json({error:"Approved scheme rules are unavailable."},503);
  }
  const assessment=assessApprovedScheme(profile,loaded.model);
  if(assessment.state!=="potential_match")return json({error:"The profile does not yet satisfy the verified preparation gate.",assessment},409);
  const preparation=prepareApplicationDraft(profile,loaded.model,assessment);
  if(preparation.status!=="ready_for_citizen_review")return json({error:"The scheme has no complete validated field mapping or required profile data is missing.",assessment,preparation},422);
  let caseId="";
  try{
   caseId=String(await rpc(session,"create_application_case",{p_scheme_slug:slug,p_profile_snapshot:profile,p_idempotency_key:idempotencyKey,p_consent_id:consentId}));
   if(!uuid(caseId))throw new Error("invalid_case_id");
   await rpc(session,"save_application_preparation",{p_case_id:caseId,p_fields:preparation.fields,p_documents:preparation.documents});
  }catch(error){
   const message=error instanceof Error?error.message:"";
   if(message.includes("profile_storage_consent_required")||message.includes("consent_policy_not_approved"))return json({error:"An active, legally approved profile-storage consent for this exact scheme version is required."},409);
   if(message.includes("scheme_not_published_or_approved"))return json({error:"The scheme has not passed all independent publication checks."},409);
   if(message.includes("idempotency_key_reused"))return json({error:"This idempotency key was already used with a different profile or scheme. Start a new preparation with a new key."},409);
   if(message.includes("preparation_already_approved"))return json({error:"This preparation was already approved and cannot be changed.",case_id:caseId},409);
   if(message.includes("invalid_document_checklist"))return json({error:"The approved document checklist is invalid and must be corrected by a scheme reviewer."},422);
   if(caseId)return json({error:"The application case exists, but its prepared fields were not saved. Check the case before retrying.",case_id:caseId},503);
   return json({error:"Application preparation could not be saved."},409);
  }
  return json({case_id:caseId,status:"awaiting_citizen_review",assessment,preparation:{...preparation,submissionStatus:"not_submitted"}},201);
 }catch{return json({error:"Application preparation could not be completed."},503);}
}
