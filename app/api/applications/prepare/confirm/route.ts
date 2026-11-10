import { NextRequest,NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 try{
  if(request.headers.get("origin")!==request.nextUrl.origin)return NextResponse.json({error:"Cross-origin request blocked."},{status:403});
  const input=await request.json() as Record<string,unknown>;
  if(Object.keys(input).some(k=>k!=="case_id")||typeof input.case_id!=="string"||!/^[0-9a-f-]{36}$/i.test(input.case_id))return NextResponse.json({error:"A valid application case is required."},{status:400});
  const session=await getVerifiedSupabaseSession();if(!session)return NextResponse.json({error:"Sign in required."},{status:401});
  const response=await fetch(session.url+"/rest/v1/rpc/confirm_application_preparation",{method:"POST",headers:{apikey:session.key,Authorization:"Bearer "+session.accessToken,"Content-Type":"application/json"},body:JSON.stringify({p_case_id:input.case_id}),cache:"no-store"});
  const data=await response.json().catch(()=>null);
  if(!response.ok){
   const message=String(data?.message||"");
   if(message.includes("profile_storage_consent_required"))return NextResponse.json({error:"Active profile-storage consent is required."},{status:403});
   if(message.includes("scheme_not_published_or_approved"))return NextResponse.json({error:"The scheme is no longer published and approved."},{status:409});
   return NextResponse.json({error:"The preparation is not ready for citizen approval."},{status:409});
  }
  return NextResponse.json({preparation:data,submissionStatus:"not_submitted",message:"Your prepared fields are approved by you. This is not a government submission."},{headers:{"Cache-Control":"private, no-store, max-age=0"}});
 }catch{return NextResponse.json({error:"Preparation approval could not be recorded."},{status:503});}
}
