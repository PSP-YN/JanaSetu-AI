import { NextRequest,NextResponse } from "next/server";
import { getVerifiedSupabaseSession } from "@/lib/supabase/rest";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
const uuid=(value:unknown)=>typeof value==="string"&&/^[0-9a-f-]{36}$/i.test(value);
async function readLimitedForm(request:NextRequest,maxBytes:number):Promise<FormData>{
 const reader=request.body?.getReader();if(!reader)throw new Error("document_body_required");
 const chunks:Uint8Array[]=[];let total=0;
 try{
  for(;;){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;
   if(total>maxBytes){await reader.cancel();throw new Error("request_body_too_large");}
   chunks.push(value);
  }
 }finally{reader.releaseLock();}
 const body=new Uint8Array(total);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.byteLength;}
 const contentType=request.headers.get("content-type");if(!contentType||!contentType.toLowerCase().startsWith("multipart/form-data;"))throw new Error("multipart_form_required");
 return new Response(body,{headers:{"Content-Type":contentType}}).formData();
}
async function hasValidSignature(file:File):Promise<boolean>{
 const bytes=new Uint8Array(await file.slice(0,8).arrayBuffer());
 if(file.type==="application/pdf")return String.fromCharCode(...bytes.slice(0,5))==="%PDF-";
 if(file.type==="image/jpeg")return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
 if(file.type==="image/png")return [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((value,index)=>bytes[index]===value);
 return false;
}
async function rpc(session:NonNullable<Awaited<ReturnType<typeof getVerifiedSupabaseSession>>>,name:string,args:Record<string,unknown>){
 const r=await fetch(session.url+"/rest/v1/rpc/"+name,{method:"POST",headers:{apikey:session.key,Authorization:"Bearer "+session.accessToken,"Content-Type":"application/json"},body:JSON.stringify(args),cache:"no-store"});
 const data=await r.json().catch(()=>null);
 if(!r.ok)throw new Error(String(data?.message||"Document operation failed."));
 return data;
}
export async function GET(request:NextRequest){
 try{
  const session=await getVerifiedSupabaseSession();if(!session)return json({error:"Sign in required."},401);
  const documentId=request.nextUrl.searchParams.get("document_id");
  if(documentId){
   if(!uuid(documentId))return json({error:"A valid document is required."},400);
   const document=await rpc(session,"get_citizen_document_download",{p_document_id:documentId});
   const path=String(document?.object_name||"");
   const mime=String(document?.mime_type||"");
   const size=Number(document?.size||0);
   if(!path.startsWith(session.user.id+"/")||!["application/pdf","image/jpeg","image/png"].includes(mime)||!Number.isSafeInteger(size)||size<1||size>12*1024*1024)return json({error:"Document is not available."},404);
   const segments=path.split("/").map(encodeURIComponent).join("/");
   const object=await fetch(session.url+"/storage/v1/object/authenticated/citizen-documents/"+segments,{headers:{apikey:session.key,Authorization:"Bearer "+session.accessToken},cache:"no-store"});
   if(!object.ok)return json({error:"Document is not available."},object.status===404?404:503);
   const bytes=await object.arrayBuffer();
   if(bytes.byteLength!==size)return json({error:"Stored document failed its integrity check."},503);
   const filename=String(document?.filename||"document").replace(/[\\r\\n"\\\\]/g,"_").slice(0,120)||"document";
   return new NextResponse(bytes,{headers:{
    "Content-Type":mime,
    "Content-Length":String(size),
    "Content-Disposition":"attachment; filename*=UTF-8''"+encodeURIComponent(filename),
    "Cache-Control":"private, no-store, max-age=0",
    "X-Content-Type-Options":"nosniff",
    "Referrer-Policy":"no-referrer",
    "Content-Security-Policy":"default-src 'none'; sandbox"
   }});
  }
  const caseId=request.nextUrl.searchParams.get("case_id");
  if(!uuid(caseId))return json({error:"A valid application case is required."},400);
  const documents=await rpc(session,"list_citizen_documents",{p_case_id:caseId});
  return json({documents});
 }catch(error){
  const message=error instanceof Error?error.message:"";
  if(message.includes("document_not_available"))return json({error:"Document is not available. It may still be quarantined or may have been deleted."},404);
  if(message.includes("document_consent_required"))return json({error:"Document access is disabled because the required consent is not active."},403);
  if(message.includes("case_not_found"))return json({error:"Application case not found."},404);
  if(message.includes("authentication_required"))return json({error:"Sign in required."},401);
  return json({error:"Document service is unavailable."},503);
 }
}
export async function POST(request:NextRequest){
 let session:Awaited<ReturnType<typeof getVerifiedSupabaseSession>>=null;
 let uploadedPath="";
 try{
  if(request.headers.get("origin")!==request.nextUrl.origin)return json({error:"Cross-origin request blocked."},403);
  session=await getVerifiedSupabaseSession();if(!session)return json({error:"Sign in required."},401);
  const form=await readLimitedForm(request,13*1024*1024);
  if([...form.keys()].some(k=>!["case_id","consent_id","file"].includes(k)))return json({error:"Unsupported upload field."},400);
  const caseId=form.get("case_id"),consentId=form.get("consent_id"),file=form.get("file");
  if(!uuid(caseId)||!uuid(consentId)||!(file instanceof File))return json({error:"A case, document-storage consent and file are required."},400);
  if(file.size<1||file.size>12*1024*1024)return json({error:"Maximum document size is 12 MB."},413);
  if(!["application/pdf","image/jpeg","image/png"].includes(file.type)||!(await hasValidSignature(file)))return json({error:"The file content does not match an accepted PDF, JPEG or PNG format."},415);
  const init=await rpc(session,"init_document_upload",{p_case_id:caseId,p_consent_id:consentId,p_filename:file.name,p_mime_type:file.type,p_size:file.size});
  const path=String(init?.object_name||"");const id=String(init?.document_id||"");
  if(!uuid(id)||!path.startsWith(session.user.id+"/"+caseId+"/"+consentId+"/"))throw new Error("Invalid upload session.");
  uploadedPath=path;
  const segments=path.split("/").map(encodeURIComponent).join("/");
  const upload=await fetch(session.url+"/storage/v1/object/citizen-documents/"+segments,{method:"POST",headers:{apikey:session.key,Authorization:"Bearer "+session.accessToken,"Content-Type":file.type,"x-upsert":"false"},body:await file.arrayBuffer(),cache:"no-store"});
  if(!upload.ok){const failure=await upload.json().catch(()=>({}));throw new Error(String(failure.message||"Private document upload failed."));}
  const completed=await rpc(session,"complete_document_upload",{p_document_id:id});
  return json({document_id:id,status:completed?.status||"quarantined",downloadable:false,message:"Uploaded to private quarantine. It cannot be viewed or downloaded until an authorized malware scanner attests that it is clean."},201);
 }catch(error){
  if(session&&uploadedPath){
   const segments=uploadedPath.split("/").map(encodeURIComponent).join("/");
   await fetch(session.url+"/storage/v1/object/citizen-documents/"+segments,{method:"DELETE",headers:{apikey:session.key,Authorization:"Bearer "+session.accessToken},cache:"no-store"}).catch(()=>null);
  }
  const message=error instanceof Error?error.message:"Document upload failed.";
  if(message.includes("consent_policy_not_approved")||message.includes("document_storage_consent_required"))return json({error:"Document upload is disabled until the document-storage policy receives legal approval and you grant the matching consent."},409);
  if(message.includes("consent_scope_mismatch"))return json({error:"The document consent does not cover this application and upload action."},409);
  if(message.includes("case_not_found"))return json({error:"Application case not found."},404);
  if(message.includes("invalid_filename"))return json({error:"The file name is not valid."},400);
  if(message.includes("unsupported_document_type_or_size"))return json({error:"The file type or size is not supported."},415);
  if(message.includes("authentication_required"))return json({error:"Sign in required."},401);
  if(message.includes("request_body_too_large"))return json({error:"Maximum upload request size is 13 MB, including multipart overhead."},413);
  if(message.includes("document_body_required")||message.includes("multipart_form_required"))return json({error:"A multipart document upload is required."},400);
  return json({error:"Document upload failed. No document was made available."},503);
 }
}
