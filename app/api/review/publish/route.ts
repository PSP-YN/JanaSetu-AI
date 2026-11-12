import { NextRequest,NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";
export const runtime="nodejs";
export async function POST(request:NextRequest){
  try{
    if(request.headers.get("origin")!==request.nextUrl.origin)return NextResponse.json({error:"Cross-origin request blocked."},{status:403});
    const input=await request.json() as Record<string,unknown>;
    if(Object.keys(input).some(k=>k!=="scheme_version_id")||typeof input.scheme_version_id!=="string"||!/^[0-9a-f-]{36}$/i.test(input.scheme_version_id))return NextResponse.json({error:"Invalid scheme version."},{status:400});
    const session=await getVerifiedSupabaseSession();
    if(!session)return NextResponse.json({error:"Sign in required."},{status:401});
    const response=await fetch(session.url+"/rest/v1/rpc/publish_scheme_version",{method:"POST",headers:{apikey:session.key,Authorization:"Bearer "+session.accessToken,"Content-Type":"application/json"},body:JSON.stringify({p_scheme_version_id:input.scheme_version_id}),cache:"no-store"});
    if(!response.ok){
      const failure=await response.json().catch(()=>({}));const message=String(failure.message||"");
      if(message.includes("publisher_role_required"))return NextResponse.json({error:"Your account is not assigned the scheme-publisher role."},{status:403});
      if(message.includes("publisher_must_be_independent"))return NextResponse.json({error:"The publisher must be independent from all reviewers for this version."},{status:409});
      return NextResponse.json({error:"Scheme cannot be published until all independent source, eligibility and legal approvals are complete."},{status:409});
    }
    return NextResponse.json({scheme_id:await response.json(),published:true});
  }catch{return NextResponse.json({error:"Scheme publication could not be completed."},{status:503});}
}
