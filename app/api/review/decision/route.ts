import { NextRequest,NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";
export const runtime="nodejs";
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request:NextRequest){
  try{
    if(request.headers.get("origin")!==request.nextUrl.origin)return json({error:"Cross-origin request blocked."},403);
    const input=await request.json() as Record<string,unknown>;
    if(Object.keys(input).some(k=>!["scheme_version_id","approval_type","decision","notes"].includes(k)))return json({error:"Unsupported review field."},400);
    const version=typeof input.scheme_version_id==="string"?input.scheme_version_id:"";
    const type=typeof input.approval_type==="string"?input.approval_type:"";
    const decision=typeof input.decision==="string"?input.decision:"";
    const notes=typeof input.notes==="string"?input.notes.trim():"";
    if(!/^[0-9a-f-]{36}$/i.test(version)||!["source_accuracy","eligibility_rule_accuracy","legal_review","translation_quality"].includes(type)||!["approved","rejected","changes_requested"].includes(decision)||notes.length<20||notes.length>4000)return json({error:"Invalid review decision. Provide at least 20 characters of evidence-based notes."},400);
    const session=await getVerifiedSupabaseSession();
    if(!session)return json({error:"Sign in required."},401);
    const response=await fetch(session.url+"/rest/v1/rpc/submit_scheme_review",{method:"POST",headers:{apikey:session.key,Authorization:"Bearer "+session.accessToken,"Content-Type":"application/json"},body:JSON.stringify({p_scheme_version_id:version,p_approval_type:type,p_decision:decision,p_notes:notes}),cache:"no-store"});
    if(!response.ok){
      const failure=await response.json().catch(()=>({}));const message=String(failure.message||"");
      if(message.includes("reviewer_role_required"))return json({error:"Your account is not assigned the required reviewer role."},403);
      if(message.includes("reviewer_role_separation_violation"))return json({error:"Independent review required: one person cannot approve multiple review categories for the same version."},409);
      return json({error:"Review decision was rejected by the review workflow."},409);
    }
    return json({approval_id:await response.json(),saved:true},201);
  }catch{return json({error:"Review decision could not be saved."},503);}
}
