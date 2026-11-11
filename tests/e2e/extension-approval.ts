import type { Page } from "@playwright/test";

/** Synthetic E2E helper: preview first, then simulate explicit citizen approval of every valid test field. */
export async function fillWithCitizenApproval(page:Page,profile:Record<string,unknown>){
 const preview=await page.evaluate((value)=>(window as any).fillProfileInPage(value),profile);
 const approved=(preview.preview||[])
  .filter((field:any)=>field.valid)
  .map((field:any)=>({index:field.index,fingerprint:field.fingerprint}));
 return page.evaluate(({value,selected})=>(window as any).fillProfileInPage(value,selected),{value:profile,selected:approved});
}
