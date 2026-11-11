export type PublicScheme = {
 id:string;slug:string;name:string;category:string;level:string;state_code:string|null;
 content:Record<string,unknown>;ruleSet:Record<string,unknown>|null;
 sourceUrl:string|null;sourcePublisher:string|null;sourceCheckedAt:string|null;
 effectiveFrom:string|null;effectiveTo:string|null;versionNumber:number;
};
const base=()=>process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,"");
const key=()=>process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const safeUrl=(value:unknown)=>typeof value==="string"&&/^https:\/\//i.test(value)?value:null;
async function rest<T>(path:string):Promise<T|null>{
 const url=base(),anon=key();if(!url||!anon)return null;
 try{const response=await fetch(url+"/rest/v1/"+path,{headers:{apikey:anon,Accept:"application/json"},next:{revalidate:3600}});
  if(!response.ok)return null;return await response.json() as T;
 }catch{return null;}
}
type SchemeRow={id:string;slug:string;name:string;category:string;level:string;state_code:string|null;current_version_id:string|null};
type VersionRow={id:string;version_number:number;source_id:string|null;source_url:string|null;content:unknown;rule_set:unknown;verification_status:string;effective_from:string|null;effective_to:string|null;reviewed_at:string|null};
type SourceRow={id:string;publisher:string;source_url:string;last_checked_at:string|null};
const isRecord=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==="object"&&!Array.isArray(v);
export async function listPublicSchemes():Promise<PublicScheme[]>{
 const rows=await rest<SchemeRow[]>("schemes?select=id,slug,name,category,level,state_code,current_version_id&publication_status=eq.published&order=name.asc&limit=500");
 if(!rows?.length)return [];
 const current=rows.filter(row=>row.current_version_id);
 const ids=current.map(row=>row.current_version_id as string);
 const versions:VersionRow[]=[];
 for(let offset=0;offset<ids.length;offset+=100){
  const batch=await rest<VersionRow[]>("scheme_versions?select=id,version_number,source_id,source_url,content,rule_set,verification_status,effective_from,effective_to,reviewed_at&id=in.("+ids.slice(offset,offset+100).join(",")+")");
  if(batch)versions.push(...batch);
 }
 const byVersion=new Map(versions.map(version=>[version.id,version]));
 const sourceIds=[...new Set(versions.filter(version=>version.source_id).map(version=>version.source_id as string))];
 const sources:SourceRow[]=[];
 for(let offset=0;offset<sourceIds.length;offset+=100){
  const batch=await rest<SourceRow[]>("scheme_sources?select=id,publisher,source_url,last_checked_at&id=in.("+sourceIds.slice(offset,offset+100).join(",")+")");
  if(batch)sources.push(...batch);
 }
 const bySource=new Map(sources.map(source=>[source.id,source]));
 return current.flatMap(row=>{
  const version=byVersion.get(row.current_version_id as string);
  if(!version||version.verification_status!=="independently_approved"||!isRecord(version.content))return [];
  const source=version.source_id?bySource.get(version.source_id):undefined;
  return [{id:row.id,slug:row.slug,name:row.name,category:row.category,level:row.level,state_code:row.state_code,
   content:version.content,ruleSet:isRecord(version.rule_set)?version.rule_set:null,sourceUrl:safeUrl(source?.source_url)||safeUrl(version.source_url),
   sourcePublisher:source?.publisher||null,sourceCheckedAt:source?.last_checked_at||version.reviewed_at,
   effectiveFrom:version.effective_from,effectiveTo:version.effective_to,versionNumber:version.version_number}];
 });
}
export async function getPublicScheme(slug:string):Promise<PublicScheme|null>{
 if(!/^[a-z0-9-]{2,120}$/.test(slug))return null;
 const schemes=await rest<SchemeRow[]>("schemes?select=id,slug,name,category,level,state_code,current_version_id&slug=eq."+encodeURIComponent(slug)+"&publication_status=eq.published&limit=1");
 const row=schemes?.[0];if(!row?.current_version_id)return null;
 const versions=await rest<VersionRow[]>("scheme_versions?select=id,version_number,source_id,source_url,content,rule_set,verification_status,effective_from,effective_to,reviewed_at&id=eq."+encodeURIComponent(row.current_version_id)+"&limit=1");
 const version=versions?.[0];if(!version||version.verification_status!=="independently_approved"||!isRecord(version.content))return null;
 let source:SourceRow|undefined;
 if(version.source_id){const sources=await rest<SourceRow[]>("scheme_sources?select=publisher,source_url,last_checked_at&id=eq."+encodeURIComponent(version.source_id)+"&limit=1");source=sources?.[0];}
 return {id:row.id,slug:row.slug,name:row.name,category:row.category,level:row.level,state_code:row.state_code,
  content:version.content,ruleSet:isRecord(version.rule_set)?version.rule_set:null,sourceUrl:safeUrl(source?.source_url)||safeUrl(version.source_url),
  sourcePublisher:source?.publisher||null,sourceCheckedAt:source?.last_checked_at||version.reviewed_at,
  effectiveFrom:version.effective_from,effectiveTo:version.effective_to,versionNumber:version.version_number};
}
export function schemeString(scheme:PublicScheme,key:string,fallback=""):string{
 const value=scheme.content[key];return typeof value==="string"&&value.trim()?value.trim():fallback;
}
export function schemeStringList(scheme:PublicScheme,key:string):string[]{
 const value=scheme.content[key];return Array.isArray(value)?value.filter((item):item is string=>typeof item==="string"&&item.trim().length>0).slice(0,30):[];
}
export function approvedRuleSummaries(scheme:PublicScheme):{label:string;excerpt:string;sourceUrl:string|null}[]{
 const rules=scheme.ruleSet?.schemaVersion===1&&scheme.ruleSet?.state==="approved"&&Array.isArray(scheme.ruleSet.rules)?scheme.ruleSet.rules:[];
 return rules.slice(0,50).flatMap(item=>{
  if(!isRecord(item)||item.reviewStatus!=="approved"||typeof item.label!=="string"||!isRecord(item.evidence)||typeof item.evidence.excerpt!=="string")return [];
  return [{label:item.label,excerpt:item.evidence.excerpt,sourceUrl:safeUrl(item.evidence.sourceUrl)}];
 });
}
