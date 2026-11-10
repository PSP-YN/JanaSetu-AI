import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source=readFileSync("extension/fill.js","utf8");
function runFill(fields,profile,approved){
 const context={
  document:{querySelectorAll:()=>fields},
  getComputedStyle:()=>({display:"block",visibility:"visible"}),
  Event:class{constructor(type,options){this.type=type;this.options=options;}},
  HTMLInputElement:class{},
  HTMLSelectElement:class{},
  HTMLTextAreaElement:class{}
 };
 vm.runInNewContext(source,context);
 return context.fillProfileInPage(profile,approved);
}
function input({type="text",name,id,label,value=""}){
 return {tagName:"INPUT",type,name,id,value,hidden:false,disabled:false,readOnly:false,checked:false,
  labels:[{innerText:label}],getAttribute:()=>"",closest:()=>null,getClientRects:()=>[{}],dispatchEvent:()=>{}};
}
const profile={fullName:"Citizen Example",age:28,gender:"woman",state:"Karnataka",district:"Mysuru",residenceType:"rural",annualIncome:250000,occupation:"Farmer",hasCultivableLand:true,pmKisanExcluded:"no",ownsPuccaHouse:null,previousHousingBenefit:"unknown",householdHasLpg:null,poorHouseholdDeclaration:null,isStudent:false,top20Percentile:null,regularUndergraduate:null,otherScholarship:null,diplomaOrDistance:null};

test("extension previews matching fields without changing portal values",()=>{
 const name=input({name:"applicant_name",id:"applicant-name",label:"Applicant name"});
 const age=input({type:"number",name:"age",id:"age",label:"Age"});
 const result=runFill([name,age],profile);
 assert.equal(result.preview.length,2);
 assert.equal(result.preview[0].value,"Citizen Example");
 assert.equal(name.value,"");
 assert.equal(age.value,"");
});

test("extension fills only explicitly selected preview fields",()=>{
 const name=input({name:"applicant_name",id:"applicant-name",label:"Applicant name"});
 const age=input({type:"number",name:"age",id:"age",label:"Age"});
 const preview=runFill([name,age],profile).preview;
 const selected=[{index:preview[0].index,fingerprint:preview[0].fingerprint}];
 const result=runFill([name,age],profile,selected);
 assert.equal(result.filled,1);
 assert.equal(name.value,"Citizen Example");
 assert.equal(age.value,"");
});

test("extension does not overwrite a value entered after preview",()=>{
 const name=input({name:"applicant_name",id:"applicant-name",label:"Applicant name"});
 const preview=runFill([name],profile).preview;
 name.value="Citizen-entered value";
 const result=runFill([name],profile,[{index:preview[0].index,fingerprint:preview[0].fingerprint}]);
 assert.equal(result.filled,0);
 assert.equal(name.value,"Citizen-entered value");
});

test("extension refuses sensitive portal fields",()=>{
 const bank=input({name:"bank_account_number",id:"bank-account",label:"Bank account number"});
 const result=runFill([bank],profile);
 assert.equal(result.preview.length,0);
 assert.equal(bank.value,"");
});

test("extension avoids ambiguous duplicate applicant fields",()=>{
 const first=input({name:"applicant_name",id:"applicant-name",label:"Applicant name"});
 const second=input({name:"beneficiary_name",id:"beneficiary-name",label:"Beneficiary name"});
 const result=runFill([first,second],profile);
 assert.equal(result.preview.length,0);
});


test("portal field length and numeric bounds are validated before fill",()=>{
 const name=input({name:"applicant_name",id:"applicant-name",label:"Applicant name"});
 name.maxLength=5;
 const preview=runFill([name],profile).preview;
 assert.equal(preview[0].valid,false);
 assert.match(preview[0].reason,/length limit/i);
 const age=input({type:"number",name:"age",id:"age",label:"Age"});
 age.min="30";
 const invalidAge=runFill([age],profile).preview;
 assert.equal(invalidAge[0].valid,false);
 assert.match(invalidAge[0].reason,/minimum/i);
});

test("custom portal patterns require manual entry",()=>{
 const name=input({name:"applicant_name",id:"applicant-name",label:"Applicant name"});
 name.getAttribute=(key)=>key==="pattern"?"[A-Z]+":"";
 const preview=runFill([name],profile).preview;
 assert.equal(preview[0].valid,false);
 assert.match(preview[0].reason,/manual validation/i);
});
