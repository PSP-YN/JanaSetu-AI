function fillProfileInPage(profile,approvedFields){
  const norm=(value)=>String(value??"").toLowerCase().replace(/[^a-z0-9\p{L}\p{N}]+/gu," ").trim();
  const hasAlias=(text,alias)=>(" "+norm(text)+" ").includes(" "+norm(alias)+" ");
  const fieldParts=(element)=>[
    element.labels?[...element.labels].map(label=>label.innerText).join(" "):"",
    element.name||"",element.id||"",element.getAttribute("placeholder")||"",element.getAttribute("aria-label")||""
  ].map(norm).filter(Boolean);
  const relatedPersonName=/(?:^| )(?:father|mother|spouse|husband|wife|guardian|parent|son|daughter|brother|sister|father in law|mother in law)(?: |$)/;
  const applicantNameAliases=new Set(["applicant name","applicant full name","name of applicant","beneficiary name","beneficiary full name","name of beneficiary"]);
  const matchesAlias=(parts,alias)=>{
    const key=norm(alias);
    if(key==="name")return parts.some(part=>part==="name");
    if(applicantNameAliases.has(key))return parts.some(part=>!relatedPersonName.test(part)&&hasAlias(part,alias));
    return parts.some(part=>hasAlias(part,alias));
  };
  const aliases={
    fullName:["name","full name","applicant name","applicant full name","name of applicant","beneficiary name","beneficiary full name","name of beneficiary","पूरा नाम","ಹೆಸರು","பெயர்","పేరు","പേര്"],
    age:["age","उम्र","ವಯಸ್ಸು","வயது","వయస్సు","പ്രായം"],
    state:["state","union territory","राज्य","ರಾಜ್ಯ","மாநிலம்","రాష్ట్రం","സംസ്ഥാനം"],
    district:["district","जिला","ಜಿಲ್ಲೆ","மாவட்டம்","జిల్లా","ജില്ല"],
    annualIncome:["annual income","family income","household income","वार्षिक आय","ವಾರ್ಷಿಕ ಆದಾಯ","ஆண்டு வருமானம்","వార్షిక ఆదాయం","വാർഷിക വരുമാനം"],
    gender:["gender","sex","लिंग","ಲಿಂಗ","பாலினம்","లింగం","ലിംഗം"],
    occupation:["occupation","profession","व्यवसाय","ಉದ್ಯೋಗ","தொழில்","వృత్తి","തൊഴിൽ"],
    residenceType:["rural or urban","rural urban","area of residence","rural","urban","ग्रामीण","शहरी","ಗ್ರಾಮೀಣ","ನಗರ","கிராமப்புற","நகர்ப்புற","గ్రామీణ","పట్టణ","ഗ്രാമീണം"],
    hasCultivableLand:["cultivable land","agricultural land","land records","खेती की भूमि","ಕೃಷಿ ಭೂಮಿ","சாகுபடி நிலம்","సాగు భూమి","കൃഷിഭൂമി"],
    pmKisanExcluded:["pm kisan exclusion","exclusion category","excluded from pm kisan","अपवर्जन श्रेणी","ಹೊರಗಿಡುವ ವರ್ಗ","விலக்கு வகை","మినహాయింపు","ഒഴിവാക്കൽ വിഭാഗം"],
    ownsPuccaHouse:["own a pucca house","pucca house","house ownership","पक्का मकान","ಪಕ್ಕಾ ಮನೆ","பக்கா வீடு","పక్కా ఇల్లు","പക്കാ വീട്"],
    previousHousingBenefit:["government house allotted","government housing benefit","house allotted in last 20 years","सरकारी आवास","ಸರ್ಕಾರಿ ಮನೆ","அரசு வீடு","ప్రభుత్వ ఇల్లు","സർക്കാർ വീട്"],
    householdHasLpg:["lpg connection","gas connection","household lpg","एलपीजी कनेक्शन","ಎಲ್‌ಪಿಜಿ ಸಂಪರ್ಕ","எல்பிஜி இணைப்பு","ఎల్పీజీ కనెక్షన్","എൽപിജി കണക്ഷൻ"],
    poorHouseholdDeclaration:["poor household declaration","deprivation declaration","गरीब परिवार घोषणा","ಬಡ ಕುಟುಂಬ ಘೋಷಣೆ","ஏழை குடும்ப அறிவிப்பு","పేద కుటుంబ ప్రకటన","ദരിദ്ര കുടുംബ പ്രഖ്യാപനം"],
    isStudent:["currently a student","are you a student","student status","विद्यार्थी","ವಿದ್ಯಾರ್ಥಿ","மாணவர்","విద్యార్థి","വിദ്യാർത്ഥി"],
    top20Percentile:["80th percentile","top 20 percentile","board percentile","80वाँ प्रतिशतक","80ನೇ ಪರ್ಸೆಂಟೈಲ್","80வது சதவீதம்","80వ శాతం","80-ാം പെർസെന്റൈൽ"],
    regularUndergraduate:["regular undergraduate","regular ug course","undergraduate course","नियमित स्नातक","ನಿಯಮಿತ ಪದವಿ","வழக்கமான இளங்கலை","రెగ్యులర్ అండర్ గ్రాడ్యుయేట్","സാധാരണ ബിരുദ"],
    otherScholarship:["other scholarship","fee reimbursement","अन्य छात्रवृत्ति","ಇತರ ವಿದ್ಯಾರ್ಥಿವೇತನ","மற்ற உதவித்தொகை","ఇతర స్కాలర్‌షిప్","മറ്റൊരു സ്കോളർഷിപ്പ്"],
    diplomaOrDistance:["diploma or distance","distance correspondence course","डिप्लोमा या दूरस्थ","ಡಿಪ್ಲೊಮಾ ಅಥವಾ ದೂರಶಿಕ್ಷಣ","தொலைநிலை படிப்பு","దూరవిద్య","ദൂരവിദ്യാഭ്യാസ"]
  };
  const isSensitive=(text)=>/(?:^| )(?:aadhaar|aadhar|uidai|pan|bank|account|ifsc|otp|captcha|password|passcode|pin|mobile|phone|email|identity|document|upload|file)(?: |$)/.test(norm(text));
  const profileValue=(key)=>{
    let value=profile[key];
    if(key==="gender")value=profile.gender==="woman"?"Female":profile.gender==="man"?"Male":profile.gender==="other"?"Other":"";
    if(key==="annualIncome"&&value!==""&&value!=null)value=String(value);
    if(["hasCultivableLand","ownsPuccaHouse","householdHasLpg","poorHouseholdDeclaration","isStudent","top20Percentile","regularUndergraduate","otherScholarship","diplomaOrDistance"].includes(key))value=value===null?"":value?"Yes":"No";
    if(key==="pmKisanExcluded")value=profile.pmKisanExcluded==="yes"?"Yes":profile.pmKisanExcluded==="no"?"No":"Not sure";
    if(key==="previousHousingBenefit")value=profile.previousHousingBenefit==="yes"?"Yes":profile.previousHousingBenefit==="no"?"No":"Not sure";
    if(key==="residenceType")value=profile.residenceType==="rural"?"Rural":profile.residenceType==="urban"?"Urban":"";
    return value===null||value===undefined?"":String(value);
  };
  const visible=(element)=>!element.hidden&&!element.disabled&&!element.readOnly&&!element.closest('[aria-hidden="true"],[inert]')&&getComputedStyle(element).display!=="none"&&getComputedStyle(element).visibility!=="hidden"&&element.getClientRects().length>0;
  const controls=[...document.querySelectorAll('input:not([type]),input[type="text"],input[type="number"],input[type="radio"],select,textarea')].filter(visible);
  const candidates=[];const handledRadio=new Set();
  for(const element of controls){
    const radio=element.type==="radio";
    if(radio){
      if(!element.name||handledRadio.has(element.name))continue;
      handledRadio.add(element.name);
      const group=controls.filter(item=>item.type==="radio"&&item.name===element.name);
      if(group.some(item=>item.checked))continue;
      const legend=element.closest("fieldset")?.querySelector("legend")?.innerText||"";
      const parts=[...fieldParts(element),norm(legend)];
      const allText=parts.join(" ");
      if(isSensitive(allText))continue;
      const key=Object.keys(aliases).find(name=>aliases[name].some(alias=>matchesAlias(parts,alias)));
      if(!key)continue;
      const value=profileValue(key);if(!value)continue;
      const targets=group.filter(item=>norm(item.value)===norm(value)||(item.labels&&hasAlias([...item.labels].map(label=>label.innerText).join(" "),value)));
      if(targets.length!==1)continue;
      const target=targets[0];
      const label=legend||[...target.labels||[]].map(item=>item.innerText).join(" ")||element.name;
      const fingerprint=JSON.stringify({kind:"radio",name:element.name,legend:norm(legend),id:target.id,targetValue:target.value});
      candidates.push({index:candidates.length,key,label,value,fingerprint,kind:"radio",element:target});
      continue;
    }
    if(element.type==="checkbox"||element.type==="file"||element.type==="password")continue;
    const parts=fieldParts(element);const joined=parts.join(" ");
    if(isSensitive(joined))continue;
    const key=Object.keys(aliases).find(name=>aliases[name].some(alias=>matchesAlias(parts,alias)));
    if(!key)continue;
    const duplicates=controls.filter(candidate=>{
      if(candidate.type==="radio"||candidate.type==="checkbox"||candidate.type==="file")return false;
      const candidateParts=fieldParts(candidate);
      return !isSensitive(candidateParts.join(" "))&&aliases[key].some(alias=>matchesAlias(candidateParts,alias));
    });
    if(duplicates.length>1)continue;
    const value=profileValue(key);if(!value)continue;
    if(element.tagName==="SELECT"){
      const current=element.options[element.selectedIndex];
      const empty=element.value===""||!current||current.disabled||/^(select|choose|--)/i.test(current.text.trim());
      if(!empty)continue;
      const options=[...element.options].filter(option=>!option.disabled&&(norm(option.text)===norm(value)||norm(option.value)===norm(value)));
      if(options.length!==1)continue;
    }else if(String(element.value||"").trim()!=="")continue;
    const label=element.labels?[...element.labels].map(item=>item.innerText).join(" "):element.getAttribute("aria-label")||element.name||element.id||key;
    const fingerprint=JSON.stringify({kind:element.tagName.toLowerCase(),type:element.type||"",name:element.name||"",id:element.id||"",label:norm(label),placeholder:norm(element.getAttribute("placeholder"))});
    candidates.push({index:candidates.length,key,label,value,fingerprint,kind:element.tagName==="SELECT"?"select":"text",element});
  }
  if(!Array.isArray(approvedFields)){
    return {preview:candidates.map(({index,key,label,value,fingerprint})=>({index,key,label,value,fingerprint}))};
  }
  const approved=new Map(approvedFields.filter(item=>item&&Number.isInteger(item.index)&&typeof item.fingerprint==="string").map(item=>[item.index,item.fingerprint]));
  let filled=0,stale=0;
  for(const candidate of candidates){
    if(!approved.has(candidate.index))continue;
    if(approved.get(candidate.index)!==candidate.fingerprint){stale++;continue;}
    const element=candidate.element;
    if(candidate.kind==="radio"){
      if(controls.some(item=>item.type==="radio"&&item.name===element.name&&item.checked)){stale++;continue;}
      const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"checked")?.set;
      if(setter)setter.call(element,true);else element.checked=true;
    }else{
      if(candidate.kind==="select"){
        const current=element.options[element.selectedIndex];
        if(element.value!==""&&current&&!current.disabled&&!/^(select|choose|--)/i.test(current.text.trim())){stale++;continue;}
        const value=element.options.length?[...element.options].find(option=>!option.disabled&&(norm(option.text)===norm(candidate.value)||norm(option.value)===norm(candidate.value)))?.value:undefined;
        if(value===undefined){stale++;continue;}
        const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value")?.set;
        if(setter)setter.call(element,value);else element.value=value;
      }else{
        if(String(element.value||"").trim()!==""){stale++;continue;}
        const proto=element.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
        const setter=Object.getOwnPropertyDescriptor(proto,"value")?.set;
        if(setter)setter.call(element,candidate.value);else element.value=candidate.value;
      }
    }
    element.dispatchEvent(new Event("input",{bubbles:true}));
    element.dispatchEvent(new Event("change",{bubbles:true}));
    filled++;
  }
  return {filled,stale};
}
