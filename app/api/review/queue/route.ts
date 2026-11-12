import { NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
  try{
    const session=await getVerifiedSupabaseSession();
    if(!session)return NextResponse.json({error:"Sign in required."},{status:401});
    const response=await fetch(session.url+"/rest/v1/rpc/get_scheme_review_queue",{method:"POST",headers:{apikey:session.key,Authorization:"Bearer "+session.accessToken,"Content-Type":"application/json"},body:"{}",cache:"no-store"});
    if(!response.ok){
      const failure=await response.json().catch(()=>({}));
      if(String(failure.message||"").includes("reviewer_access_required"))return NextResponse.json({error:"This account has no active scheme-review role. Ask the JanaSetu administrator to assign an approved reviewer role."},{status:403});
      return NextResponse.json({error:"Review queue is unavailable."},{status:503});
    }
    const result=await response.json();
    return NextResponse.json({items:result.items||[],roles:result.roles||[]},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Review queue is unavailable."},{status:503});}
}
