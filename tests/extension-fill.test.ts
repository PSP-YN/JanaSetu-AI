import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source=readFileSync("extension/fill.js","utf8");
type TestOption={disabled:boolean;text:string;value:string};
type TestElement={
 tagName:string;type:string;name:string;id:string;value:string;
 hidden:boolean;disabled:boolean;readOnly:boolean;checked:boolean;
 maxLength:number;min:string;max:string;labels:{innerText:string}[];
 options:TestOption[];selectedIndex:number;
 getAttribute:(key:string)=>string;closest:(selector?:string)=>null;
 getClientRects:()=>object[];dispatchEvent:(event:Event)=>void;
};
type ApprovedField={index:number;fingerprint:string};
type PreviewField={index:number;fingerprint:string;value:string;valid:boolean;reason:string};
type FillResult={preview:PreviewField[];filled:number};
type FillContext=vm.Context&{fillProfileInPage:(profile:Record<string,unknown>,approved?:ApprovedField[])=>FillResult};

function runFill(fields:TestElement[],profile:Record<string,unknown>,approved?:ApprovedField[]):FillResult{
 class FakeEvent{
  type:string;options:EventInit;
  constructor(type:string,options:EventInit={}){this.type=type;this.options=options;}
 }
 const context={
  document:{querySelectorAll:()=>fields},
  getComputedStyle:()=>({display:"block",visibility:"visible"}),
  Event:FakeEvent as unknown as typeof Event,
  HTMLInputElement:class{},HTMLSelectElement:class{},HTMLTextAreaElement:class{}
 } as unknown as FillContext;
 vm.runInNewContext(source,context);
 return context.fillProfileInPage(profile,approved);
}
function input({type="text",name,id,label,value=""}:{type?:string;name:string;id:string;label:string;value?:string}):TestElement{
 return {tagName:"INPUT",type,name,id,value,hidden:false,disabled:false,readOnly:false,checked:false,
  maxLength:-1,min:"",max:"",labels:[{innerText:label}],options:[],selectedIndex:0,
  getAttribute:(_key:string)=>"",closest:(_selector?:string)=>null,getClientRects:()=>[{}],dispatchEvent:(_event:Event)=>{}};
}
const profile:Record<string,unknown>={fullName:"Citizen Example",age:28,gender:"woman",state:"Karnataka",district:"Mysuru",residenceType:"rural",annualIncome:250000,occupation:"Farmer",hasCultivableLand:true,pmKisanExcluded:"no",ownsPuccaHouse:null,previousHousingBenefit:"unknown",householdHasLpg:null,poorHouseholdDeclaration:null,isStudent:false,top20Percentile:null,regularUndergraduate:null,otherScholarship:null,diplomaOrDistance:null,mobileNumber:"9876543210",emailAddress:"citizen@example.test",addressLine1:"12 Test Road",addressLine2:"Near Park",villageOrTown:"Mysuru",pincode:"570001",fatherOrGuardianName:"Synthetic Guardian",motherName:"Synthetic Mother",socialCategory:"OBC",landholdingAcres:1.5,institutionName:"Synthetic College",courseName:"Computer Science",courseYear:"2nd year",rationCardCategory:"PHH"};

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
 name.getAttribute=(key:string)=>key==="pattern"?"[A-Z]+":"";
 const preview=runFill([name],profile).preview;
 assert.equal(preview[0].valid,false);
 assert.match(preview[0].reason,/manual validation/i);
});

test("extension previews additional reviewed profile fields while keeping phone and email fields blocked",()=>{
 const pin=input({name:"postal_code",id:"postal-code",label:"PIN code"});
 const town=input({name:"city",id:"village-town",label:"Village / Town / City"});
 const phone=input({name:"mobile_number",id:"mobile-number",label:"Mobile number"});
 const email=input({name:"email",id:"email",label:"Email address"});
 const result=runFill([pin,town,phone,email],profile);
 assert.equal(result.preview.length,2);
 assert.deepEqual(result.preview.map(item=>item.value),["570001","Mysuru"]);
 assert.equal(phone.value,"");
 assert.equal(email.value,"");
});

test("extension treats postal PIN as a fillable address field but blocks security PINs",()=>{
 const postal=input({name:"postal_code",id:"postal-code",label:"PIN code"});
 const security=input({name:"security_pin",id:"security-pin",label:"Security PIN"});
 const result=runFill([postal,security],profile);
 assert.equal(result.preview.length,1);
 assert.equal(result.preview[0].key,"pincode");
 assert.equal(result.preview[0].value,"570001");
});
