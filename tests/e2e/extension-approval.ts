import type { Page } from "@playwright/test";

/** Synthetic E2E helper: preview first, then simulate explicit citizen approval of every valid test field. */
export async function fillWithCitizenApproval(page:Page,profile:Record<string,unknown>,sessionValues:Record<string,string>={}){
 const preview=await page.evaluate(({value,session})=>(window as any).fillProfileInPage(value,null,session),{value:profile,session:sessionValues});
 const approved=(preview.preview||[])
  .filter((field:any)=>field.valid)
  .map((field:any)=>({index:field.index,fingerprint:field.fingerprint}));
 return page.evaluate(({value,selected,session})=>(window as any).fillProfileInPage(value,selected,session),{value:profile,selected:approved,session:sessionValues});
}
