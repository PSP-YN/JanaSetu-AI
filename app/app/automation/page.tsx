"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Scheme={id:string;slug:string;name:string;category:string;current_version_id:string|null};
type Case={id:string;scheme_version_id:string;status:string;created_at:string;external_reference:string|null};
type Run={id:string;case_id:string;action_type:string;status:string;requires_human_confirmation:boolean;created_at:string;expires_at:string;result_summary:Record<string,unknown>};
type Reminder={id:string;case_id:string|null;title:string;due_at:string;channel:string;status:string};
type PreparedField={key:string;label:string;value:string|number|boolean|null;status:"provided"|"missing";requiresCitizenConfirmation:boolean};
type Preparation={case_id:string;status:"awaiting_citizen_review"|"citizen_approved";fields:PreparedField[];documents:string[];citizen_approved_at:string|null};
type User={id:string;email:string|null};

export default function AutomationCenterPage(){
  const [user,setUser]=useState<User|null>(null);
  const [schemes,setSchemes]=useState<Scheme[]>([]);
  const [cases,setCases]=useState<Case[]>([]);
  const [runs,setRuns]=useState<Run[]>([]);
  const [reminders,setReminders]=useState<Reminder[]>([]);
  const [preparations,setPreparations]=useState<Preparation[]>([]);
  const [confirming,setConfirming]=useState("");
  const [busy,setBusy]=useState(true);
  const [error,setError]=useState("");
  const [refreshedAt,setRefreshedAt]=useState("");
  const refresh=useCallback(async()=>{
    setBusy(true);setError("");
    try{
      const [authRes,schemeRes]=await Promise.all([fetch("/api/auth",{cache:"no-store"}),fetch("/api/schemes/approved",{cache:"no-store"})]);
      const auth=authRes.ok?await authRes.json():{user:null};
      if(!schemeRes.ok)throw new Error("Published scheme catalogue could not be loaded.");
      const schemeData=await schemeRes.json();
      setUser(auth.user||null);setSchemes(schemeData.schemes||[]);
      if(auth.user){
        const [caseRes,runRes,reminderRes]=await Promise.all([fetch("/api/applications",{cache:"no-store"}),fetch("/api/automation/runs",{cache:"no-store"}),fetch("/api/reminders",{cache:"no-store"})]);
        if(!caseRes.ok||!runRes.ok||!reminderRes.ok)throw new Error("Your application and reminder history could not be loaded.");
        const [caseData,runData,reminderData]=await Promise.all([caseRes.json(),runRes.json(),reminderRes.json()]);
        const applicationCases=caseData.applications||[];
        setCases(applicationCases);setRuns(runData.runs||[]);setReminders(reminderData.reminders||[]);
        const preparationResponse=await fetch("/api/applications/prepare",{cache:"no-store"});
        const preparationData=await preparationResponse.json().catch(()=>({}));
        if(preparationResponse.ok){setPreparations(preparationData.preparations||[]);}
        else{setPreparations([]);setError(preparationData.error||"Saved application preparations could not be loaded.");}

      }else{setCases([]);setRuns([]);setReminders([]);setPreparations([]);}
      setRefreshedAt(new Date().toLocaleTimeString());
    }catch(e){setError(e instanceof Error?e.message:"Could not refresh automation status.");}
    finally{setBusy(false);}
  },[]);
  useEffect(()=>{void refresh();},[refresh]);
  const statusLabel=(s:string)=>s.replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());
  const confirmPreparation=async(caseId:string)=>{
    setConfirming(caseId);setError("");
    try{
      const response=await fetch("/api/applications/prepare/confirm",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({case_id:caseId})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"Could not confirm the prepared fields.");
      await refresh();
    }catch(e){setError(e instanceof Error?e.message:"Could not confirm the prepared fields.");}
    finally{setConfirming("");}
  };
  return <main className="automation-center">
    <header className="automation-heading"><div><p className="automation-eyebrow">JANASETU AI · APPLICATION AUTOMATION</p><h1>Applications & automation</h1><p>Prepare an application, authorize each action, and track what actually happened.</p></div><button className="button-primary" onClick={()=>void refresh()} disabled={busy}>{busy?"Refreshing…":"Refresh status"}</button></header>
    {error&&<p className="auth-error" role="alert">{error}</p>}
    {!user?<section className="automation-panel"><h2>Sign in to view your application activity</h2><p>Citizen applications, consent records and automation history are private to the signed-in account.</p><Link className="button-primary automation-link" href="/auth?next=/app/automation">Sign in / Create account</Link></section>:<section className="automation-user">Signed in as <strong>{user.email||"Citizen account"}</strong></section>}
    <section className="automation-stats">
      <article><span>Published schemes</span><strong>{schemes.length}</strong><small>Eligible for application creation</small></article>
      <article><span>Your applications</span><strong>{cases.length}</strong><small>Persisted application cases</small></article>
      <article><span>Automation runs</span><strong>{runs.length}</strong><small>Consent and confirmation tracked</small></article>
      <article><span>In-app reminders</span><strong>{reminders.length}</strong><small>Scheduled by confirmed workflows</small></article>
    </section>
    {schemes.length===0&&<section className="automation-panel automation-hold"><span className="automation-tag">Application creation locked</span><h2>No independently approved schemes are published yet</h2><p>The current database has no published scheme versions. This is an intentional safety gate: discovery records cannot become application cases until source accuracy and eligibility rules have been independently reviewed and approved.</p><p>Once a scheme is approved and published, it will appear here. JanaSetu will then prepare checklists and permitted application steps; it will never claim an application was submitted without a verified government acknowledgement.</p><Link href="/app" className="automation-text-link">Return to scheme discovery →</Link></section>}
    {user&&<section className="automation-panel"><h2>Review prepared application fields</h2>{preparations.length===0?<p className="automation-empty">No saved application preparations are awaiting review. A preparation is created only after a scheme is independently approved, your eligibility profile matches its reviewed rules, and you grant the required purpose-specific consent.</p>:<div className="automation-preparations">{preparations.map(preparation=><article key={preparation.case_id} className="automation-preparation"><div className="automation-preparation-heading"><strong>Case {preparation.case_id.slice(0,8)}</strong><span>{statusLabel(preparation.status)}</span></div><ul>{preparation.fields.map(field=><li key={field.key}><strong>{field.label}</strong><span>{field.value===null||field.value===""?"Missing":String(field.value)}</span><small>{field.status==="provided"?"From your saved citizen profile · confirm this value":"Required information is missing"}</small></li>)}</ul>{preparation.documents.length>0&&<p><strong>Document checklist:</strong> {preparation.documents.join(" · ")}</p>}{preparation.status==="awaiting_citizen_review"?<button className="button-primary" disabled={confirming===preparation.case_id} onClick={()=>void confirmPreparation(preparation.case_id)}>{confirming===preparation.case_id?"Saving confirmation…":"I reviewed these fields"}</button>:<p className="automation-empty">You approved this preparation. It has not been submitted to a government portal.</p>}</article>)}</div>}</section>}
    {user&&<div className="automation-columns"><section className="automation-panel"><h2>Your application cases</h2>{cases.length===0?<p className="automation-empty">No application cases have been created for this account.</p>:<ul>{cases.map(c=><li key={c.id}><strong>{statusLabel(c.status)}</strong><small>Case {c.id.slice(0,8)} · {new Date(c.created_at).toLocaleDateString()}</small>{c.external_reference&&<small>Official reference: {c.external_reference}</small>}</li>)}</ul>}</section><section className="automation-panel"><h2>Automation history</h2>{runs.length===0?<p className="automation-empty">No automation runs. Requests require purpose-specific consent and a separate confirmation.</p>:<ul>{runs.map(run=><li key={run.id}><strong>{statusLabel(run.action_type)} · {statusLabel(run.status)}</strong><small>{new Date(run.created_at).toLocaleString()}</small><small>{run.requires_human_confirmation?"Citizen confirmation required":"No confirmation flag"}</small></li>)}</ul>}</section><section className="automation-panel"><h2>In-app reminders</h2>{reminders.length===0?<p className="automation-empty">No reminders have been scheduled for this account.</p>:<ul>{reminders.map(reminder=><li key={reminder.id}><strong>{reminder.title}</strong><small>{new Date(reminder.due_at).toLocaleString()} · {statusLabel(reminder.status)}</small><small>Delivery: {reminder.channel.replaceAll("_"," ")}</small></li>)}</ul>}</section></div>}
    <section className="automation-panel"><h2>What JanaSetu can automate</h2><div className="automation-capabilities"><div><strong>Internal preparation</strong><p>Generate document checklists from independently approved scheme rules and schedule in-app reminders after consent and confirmation.</p></div><div><strong>Government portal actions</strong><p>Remain blocked until the department grants API/partner access, a scheme-specific adapter passes acceptance tests, and the citizen confirms the exact destination and action.</p></div><div><strong>Submission proof</strong><p>A case is marked submitted only after a verified official acknowledgement or receipt is recorded.</p></div></div></section>
    {refreshedAt&&<p className="automation-refresh-note">Last checked {refreshedAt}. {busy?"":"Data is refreshed on request."}</p>}
  </main>;
}
