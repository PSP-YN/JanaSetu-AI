import { NextRequest,NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"}});
const TYPES=new Set(["application/pdf","image/jpeg","image/png"]);
export async function GET(_request:NextRequest,{params}:{params:Promise<{documentId:string}>}){
 try{
  const {documentId}=await params;
  if(!/^[0-9a-f-]{36}$/i.test(documentId))return json({error:"A valid document ID is required."},400);
  const session=await getVerifiedSupabaseSession();
  if(!session)return json({error:"Sign in required."},401);
  const metadataResponse=await fetch(session.url+"/rest/v1/rpc/get_clean_citizen_document",{
   method:"POST",headers:{apikey:session.key,Authorization:"Bearer "+session.accessToken,"Content-Type":"application/json"},
   body:JSON.stringify({p_document_id:documentId}),cache:"no-store"
  });
  if(!metadataResponse.ok){
   const failure=await metadataResponse.json().catch(()=>({}));
   const message=String(failure.message||"");
   if(message.includes("document_storage_consent_inactive"))return json({error:"Document retrieval is disabled because document-storage consent is not active."},403);
   return json({error:"This document is unavailable. It may still be quarantined, rejected, or owned by another account."},404);
  }
  const metadata=await metadataResponse.json() as {object_name?:string;filename?:string;mime_type?:string;size?:number};
  if(typeof metadata.object_name!=="string"||!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(pdf|jpg|png)$/i.test(metadata.object_name)||
     typeof metadata.filename!=="string"||metadata.filename.length>255||!TYPES.has(String(metadata.mime_type))||
     !Number.isInteger(metadata.size)||Number(metadata.size)<1||Number(metadata.size)>12*1024*1024)return json({error:"Document metadata failed validation."},503);
  const objectPath=metadata.object_name.split("/").map(encodeURIComponent).join("/");
  const storageResponse=await fetch(session.url+"/storage/v1/object/authenticated/citizen-documents/"+objectPath,{
   headers:{apikey:session.key,Authorization:"Bearer "+session.accessToken},cache:"no-store"
  });
  if(!storageResponse.ok)return json({error:"The verified document could not be retrieved."},503);
  const bytes=await storageResponse.arrayBuffer();
  if(bytes.byteLength!==metadata.size)return json({error:"Stored document size does not match its verified metadata."},503);
  const safeName=metadata.filename.replace(/[\r\n"]/g,"_");
  return new Response(bytes,{status:200,headers:{
   "Content-Type":String(metadata.mime_type),
   "Content-Length":String(metadata.size),
   "Content-Disposition":"attachment; filename*=UTF-8''"+encodeURIComponent(safeName),
   "Cache-Control":"private, no-store, max-age=0",
   "X-Content-Type-Options":"nosniff",
   "Referrer-Policy":"no-referrer",
   "Content-Security-Policy":"default-src 'none'; sandbox"
  }});
 }catch{return json({error:"Secure document retrieval is unavailable."},503);}
}
