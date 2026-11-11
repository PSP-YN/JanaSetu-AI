import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SCANNER_EMAIL = process.env.SCANNER_EMAIL;
const SCANNER_PASSWORD = process.env.SCANNER_PASSWORD;
const POLL_MS = Math.min(30000, Math.max(2000, Number(process.env.POLL_INTERVAL_MS || 5000)));
const MAX_BYTES = 12 * 1024 * 1024;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SCANNER_EMAIL || !SCANNER_PASSWORD) throw new Error("Scanner environment is incomplete.");
let auth = null, stopping = false;
process.on("SIGTERM", () => { stopping = true; });
process.on("SIGINT", () => { stopping = true; });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const log = (event, details = {}) => process.stdout.write(JSON.stringify({ at: new Date().toISOString(), event, ...details }) + "\n");
async function authenticate() {
 const response = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {method:"POST",headers:{apikey:SUPABASE_ANON_KEY,"Content-Type":"application/json"},body:JSON.stringify({email:SCANNER_EMAIL,password:SCANNER_PASSWORD}),signal:AbortSignal.timeout(15000)});
 if(!response.ok) throw new Error("Scanner authentication failed: "+response.status);
 auth=await response.json(); if(!auth.access_token||!auth.refresh_token) throw new Error("Incomplete scanner token response.");
 log("scanner_authenticated");
}
async function refreshAuth() {
 if(auth?.refresh_token&&Date.now()<Number(auth.expires_at||0)*1000-60000)return;
 if(auth?.refresh_token){
  const response=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{apikey:SUPABASE_ANON_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:auth.refresh_token}),signal:AbortSignal.timeout(15000)});
  if(response.ok){auth=await response.json();return;}
 }
 await authenticate();
}
async function api(path,options={}) {
 await refreshAuth();
 const headers={apikey:SUPABASE_ANON_KEY,Authorization:"Bearer "+auth.access_token,...(options.headers||{})};
 return fetch(SUPABASE_URL+path,{...options,headers,cache:"no-store",signal:AbortSignal.timeout(30000)});
}
async function rpc(name,args={}) {
 const response=await api("/rest/v1/rpc/"+name,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(args)});
 if(!response.ok)throw new Error("RPC "+name+" failed: "+response.status);
 return response.json();
}
function validObjectPath(path){return typeof path==="string"&&/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(pdf|jpg|png)$/i.test(path);}
function validMagic(bytes,mime){
 if(mime==="application/pdf")return bytes.subarray(0,5).toString("ascii")==="%PDF-";
 if(mime==="image/png")return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 if(mime==="image/jpeg")return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
 return false;
}
async function attest(id,result,engine,signature){await rpc("attest_document_scan",{p_document_id:id,p_result:result,p_engine:engine,p_signature:signature});}
async function scan(doc){
 if(!doc||!/^[0-9a-f-]{36}$/i.test(doc.id)||!validObjectPath(doc.storage_object_name)||!Number.isInteger(doc.expected_size)||doc.expected_size<1||doc.expected_size>MAX_BYTES||!["application/pdf","image/jpeg","image/png"].includes(doc.mime_type))throw new Error("Claimed document metadata failed strict validation.");
 const path=doc.storage_object_name.split("/").map(encodeURIComponent).join("/");
 const response=await api("/storage/v1/object/citizen-documents/"+path);
 if(!response.ok)throw new Error("Quarantined object download failed: "+response.status);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length!==doc.expected_size||bytes.length>MAX_BYTES||!validMagic(bytes,doc.mime_type)){
  await attest(doc.id,"rejected","JanaSetu upload-integrity gate","size-or-magic-mismatch");
  log("document_rejected",{document_id:doc.id,reason:"integrity_check_failed"});bytes.fill(0);return;
 }
 const directory=await mkdtemp(join(tmpdir(),"janasetu-scan-"+randomUUID()+"-"));
 const extension=doc.mime_type==="application/pdf"?"pdf":doc.mime_type==="image/png"?"png":"jpg";
 const file=join(directory,"document."+extension);
 try{
  await writeFile(file,bytes,{mode:0o600,flag:"wx"});
  let engine="ClamAV";try{engine=(await execFileAsync("clamscan",["--version"],{timeout:10000})).stdout.trim().slice(0,120)||engine;}catch{}
  let result="scan_error";
  try{await execFileAsync("clamscan",["--no-summary","--infected","--max-filesize=12M","--max-scansize=12M","--max-recursion=5",file],{timeout:120000,maxBuffer:1024*1024});result="clean";}
  catch(error){if(error?.code===1)result="rejected";else throw error;}
  const signature="sha256="+createHash("sha256").update(bytes).digest("hex")+";engine="+engine;
  await attest(doc.id,result,engine,signature.slice(0,240));
  log("document_scanned",{document_id:doc.id,result,engine});
 }finally{bytes.fill(0);await rm(directory,{recursive:true,force:true});}
}
await authenticate();log("scanner_worker_started",{poll_interval_ms:POLL_MS});
while(!stopping){
 try{
  const doc=await rpc("claim_next_document_scan");
  if(!doc){await sleep(POLL_MS);continue;}
  try{await scan(doc);}
  catch(error){
   const reason=error instanceof Error?error.message:"unknown";
   try{await attest(doc.id,"scan_error","ClamAV worker","scan-error:"+createHash("sha256").update(reason).digest("hex").slice(0,32));}
   catch(attestError){log("scan_attestation_failed",{document_id:doc.id,reason:String(attestError).slice(0,180)});}
   log("document_scan_error",{document_id:doc.id,reason:reason.slice(0,180)});
  }
 }catch(error){log("scanner_poll_error",{reason:String(error).slice(0,180)});await sleep(POLL_MS);}
}
log("scanner_worker_stopped");
