function fillProfileInPage(profile,approvedFields,sessionValues={}){
  const norm=(value)=>String(value??"").toLowerCase().replace(/[^a-z0-9\p{L}\p{N}]+/gu," ").trim();
  const hasAlias=(text,alias)=>(" "+norm(text)+" ").includes(" "+norm(alias)+" ");
  const fieldParts=(element)=>[
    element.labels?[...element.labels].map(label=>label.innerText).join(" "):"",
    element.name||"",element.id||"",element.getAttribute("placeholder")||"",element.getAttribute("aria-label")||"",
    element.getAttribute("title")||"",
    element.getAttribute("aria-labelledby")?document.getElementById(element.getAttribute("aria-labelledby"))?.innerText||"":"",
    element.closest("tr")?.innerText||"",
    element.closest(".form-group,.form-row,fieldset")?.innerText||""
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
    aadhaarNumber:["aadhaar number","aadhar number","uid number","uidai number","आधार संख्या","ಆಧಾರ್ ಸಂಖ್ಯೆ","ஆதார் எண்","ఆధార్ నంబర్","ആധാർ നമ്പർ"],
    dateOfBirth:["date of birth","dob","birth date","जन्म तिथि","ಜನ್ಮ ದಿನಾಂಕ","பிறந்த தேதி","పుట్టిన తేదీ","ജനനത്തീയതി"],
    sslcRegistrationNumber:["sslc registration number","sslc reg no","sslc number","10th registration number","ಶಾಲಾ ನೋಂದಣಿ ಸಂಖ್ಯೆ"],
    casteCertificateRdNumber:["caste certificate rd number","caste rd number","caste certificate number","ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ ಆರ್ ಡಿ ಸಂಖ್ಯೆ"],
    incomeCertificateRdNumber:["income certificate rd number","income rd number","income certificate number","ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಆರ್ ಡಿ ಸಂಖ್ಯೆ"],
    universityRegistrationNumber:["university registration number","university reg no","college registration number","university seat number","ಅಂಕಪಟ್ಟಿ ನೋಂದಣಿ ಸಂಖ್ಯೆ"],
    taluk:["taluk","taluka","ತಾಲ್ಲೂಕು","ತಾಲೂಕು"],
    assemblyConstituency:["assembly constituency","constituency","ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ"],
    fullName:["name","full name","name as in aadhaar","name as per aadhaar","name on aadhaar","applicant name","applicant full name","name of applicant","beneficiary name","beneficiary full name","name of beneficiary","पूरा नाम","ಹೆಸರು","பெயர்","పేరు","പേര്"],
    mobileNumber:["mobile number","mobile no","phone number","contact number","registered mobile","मोबाइल नंबर","ಮೊಬೈಲ್ ಸಂಖ್ಯೆ","கைபேசி எண்","మొబైల్ నంబర్","മൊബൈൽ നമ്പർ"],
    emailAddress:["email address","email id","e mail","ईमेल पता","ಇಮೇಲ್ ವಿಳಾಸ","மின்னஞ்சல் முகவரி","ఇమెయిల్ చిరునామా","ഇമെയിൽ വിലാസം"],
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
    diplomaOrDistance:["diploma or distance","distance correspondence course","डिप्लोमा या दूरस्थ","ಡಿಪ್ಲೊಮಾ ಅಥವಾ ದೂರಶಿಕ್ಷಣ","தொலைநிலை படிப்பு","దూరవిద్య","ദൂരവിദ്യാഭ്യാസ"],
    addressLine1:["address line 1","house number and street","street address","residential address","present address","permanent address","पता","ವಿಳಾಸ","முகவரி","చిరునామా","വിലാസം"],
    addressLine2:["address line 2","landmark","locality","area or locality","मोहल्ला","ಸ್ಥಳ","வட்டாரம்","ప్రాంతం","പ്രദേശം"],
    villageOrTown:["village","town","city","village town city","गाँव","गांव","शहर","ಗ್ರಾಮ","ಪಟ್ಟಣ","நகரம்","கிராமம்","పట్టణం","గ్రామం","നഗരം","ഗ്രാമം"],
    pincode:["pin code","pincode","postal code","zip code","डाक कोड","ಪಿನ್ ಕೋಡ್","அஞ்சல் குறியீடு","పిన్ కోడ్","പിൻകോഡ്"],
    fatherOrGuardianName:["father name","father or guardian name","guardian name","पिता का नाम","ತಂದೆಯ ಹೆಸರು","தந்தை பெயர்","తండ్రి పేరు","പിതാവിന്റെ പേര്"],
    motherName:["mother name","माता का नाम","ತಾಯಿಯ ಹೆಸರು","தாயின் பெயர்","తల్లి పేరు","മാതാവിന്റെ പേര്"],
    socialCategory:["social category","caste category","community category","reservation category","सामाजिक श्रेणी","ಸಾಮಾಜಿಕ ವರ್ಗ","சமூகப் பிரிவு","సామాజిక వర్గం","സാമൂഹിക വിഭാഗം"],
    landholdingAcres:["land holding acres","landholding acres","extent of cultivable land","land area acres","भूमि का क्षेत्रफल","ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ","நிலத்தின் பரப்பளவு","భూమి విస్తీర్ణం","ഭൂമിയുടെ വിസ്തീർണം"],
    institutionName:["institution name","college name","school name","educational institution","संस्थान का नाम","ಸಂಸ್ಥೆಯ ಹೆಸರು","நிறுவனத்தின் பெயர்","సంస్థ పేరు","സ്ഥാപനത്തിന്റെ പേര്"],
    courseName:["course name","programme name","program name","degree name","पाठ्यक्रम का नाम","ಕೋರ್ಸ್ ಹೆಸರು","பாடநெறி பெயர்","కోర్సు పేరు","കോഴ്‌സിന്റെ പേര്"],
    courseYear:["year of study","current academic year","study year","course year","अध्ययन वर्ष","ಅಧ್ಯಯನ ವರ್ಷ","படிப்பு ஆண்டு","చదువు సంవత్సరం","പഠന വർഷം"],
    rationCardCategory:["ration card category","ration card type","ration card classification","राशन कार्ड श्रेणी","ಪಡಿತರ ಚೀಟಿ ವರ್ಗ","குடும்ப அட்டை வகை","రేషన్ కార్డు వర్గం","റേഷൻ കാർഡ് വിഭാഗം"]
  };
  const isSensitive=(parts)=>{
    const normalizedParts=(Array.isArray(parts)?parts:[parts]).map(norm);
    const protectedTerm=/(?:^| )(?:pan|bank|account|ifsc|otp|captcha|password|passcode|identity|document|upload|file|security pin|securitypin|mpin|atm pin|atm_pin|transaction pin|transaction_pin|debit pin|credit pin|login pin)(?: |$)/;
    if(normalizedParts.some(part=>protectedTerm.test(part)))return true;
    const postalTerm=/(?:postal pin|pin code|pincode|postal code|zip code)/;
    const ambiguousPin=/(?:^| )pin(?: |$)/;
    return normalizedParts.some(part=>ambiguousPin.test(part)&&!postalTerm.test(part));
  };
  const isAadhaarSensitive=(parts)=>parts.some(part=>/(?:^| )(?:aadhaar|aadhar|uidai)(?: |$)/.test(norm(part)));
  const profileValue=(key)=>{
    let value=key==="aadhaarNumber"?sessionValues.aadhaarNumber:profile[key];
    if(key==="aadhaarNumber"&&!/^[0-9]{12}$/.test(String(value??"")))return "";
    if(key==="gender")value=profile.gender==="woman"?"Female":profile.gender==="man"?"Male":profile.gender==="other"?"Other":"";
    if(key==="annualIncome"&&value!==""&&value!=null)value=String(value);
    if(["hasCultivableLand","ownsPuccaHouse","householdHasLpg","poorHouseholdDeclaration","isStudent","top20Percentile","regularUndergraduate","otherScholarship","diplomaOrDistance"].includes(key))value=value===null?"":value?"Yes":"No";
    if(key==="pmKisanExcluded")value=profile.pmKisanExcluded==="yes"?"Yes":profile.pmKisanExcluded==="no"?"No":"Not sure";
    if(key==="previousHousingBenefit")value=profile.previousHousingBenefit==="yes"?"Yes":profile.previousHousingBenefit==="no"?"No":"Not sure";
    if(key==="residenceType")value=profile.residenceType==="rural"?"Rural":profile.residenceType==="urban"?"Urban":"";
    return value===null||value===undefined?"":String(value);
  };
  const visible=(element)=>!element.hidden&&!element.disabled&&!element.readOnly&&!element.closest('[aria-hidden="true"],[inert]')&&getComputedStyle(element).display!=="none"&&getComputedStyle(element).visibility!=="hidden"&&element.getClientRects().length>0;
  const validateControl=(element,value)=>{
    if(element.maxLength>0&&value.length>element.maxLength)return {valid:false,reason:"Value exceeds the portal field length limit."};
    if(element.type==="number"){
      const number=Number(value);
      if(!Number.isFinite(number))return {valid:false,reason:"Value is not a valid number."};
      if(element.min!==""&&element.min!==undefined&&number<Number(element.min))return {valid:false,reason:"Value is below the portal minimum."};
      if(element.max!==""&&element.max!==undefined&&number>Number(element.max))return {valid:false,reason:"Value exceeds the portal maximum."};
      const step=element.getAttribute("step");
      if(step&&step!=="any"&&Number(step)>0){
        const base=element.min!==""&&element.min!==undefined?Number(element.min):0;
        if(Math.abs((number-base)/Number(step)-Math.round((number-base)/Number(step)))>1e-8)return {valid:false,reason:"Value does not match the portal step constraint."};
      }
    }
    if(element.getAttribute("pattern"))return {valid:false,reason:"The portal has a custom format rule that needs manual validation."};
    return {valid:true,reason:""};
  };
  const controls=[...document.querySelectorAll('input:not([type]),input[type="text"],input[type="number"],input[type="tel"],input[type="email"],input[type="date"],input[type="search"],input[type="radio"],select,textarea')].filter(visible);
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
      if(isSensitive(parts))continue;
      const key=Object.keys(aliases).find(name=>aliases[name].some(alias=>matchesAlias(parts,alias)));
      if(!key)continue;
      const value=profileValue(key);if(!value)continue;
      const targets=group.filter(item=>norm(item.value)===norm(value)||(item.labels&&hasAlias([...item.labels].map(label=>label.innerText).join(" "),value)));
      if(targets.length!==1)continue;
      const target=targets[0];
      const label=legend||(target.labels?[...target.labels].map(item=>item.innerText).join(" "):element.name);
      const fingerprint=JSON.stringify({kind:"radio",name:element.name,legend:norm(legend),id:target.id,targetValue:target.value});
      candidates.push({index:candidates.length,key,label,value,fingerprint,kind:"radio",element:target,valid:true,reason:""});
      continue;
    }
    if(element.type==="checkbox"||element.type==="file"||element.type==="password")continue;
    const parts=fieldParts(element);
    const aadhaarField=aliases.aadhaarNumber.some(alias=>matchesAlias(parts,alias));
    const aadhaarNameField=["name as in aadhaar","name as per aadhaar","name on aadhaar"].some(alias=>matchesAlias(parts,alias));
    if(isSensitive(parts)||(isAadhaarSensitive(parts)&&!(aadhaarField&&profileValue("aadhaarNumber"))&&!aadhaarNameField))continue;
    const key=Object.keys(aliases).find(name=>aliases[name].some(alias=>matchesAlias(parts,alias)));
    if(!key)continue;
    const duplicates=controls.filter(candidate=>{
      if(candidate.type==="radio"||candidate.type==="checkbox"||candidate.type==="file")return false;
      const candidateParts=fieldParts(candidate);
      return !isSensitive(candidateParts)&&aliases[key].some(alias=>matchesAlias(candidateParts,alias));
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
    const label=element.labels?[...element.labels].map(item=>item.innerText).join(" "):element.closest(".form-group,.form-row,fieldset")?.innerText||element.getAttribute("aria-label")||element.name||element.id||key;
    const fingerprint=JSON.stringify({kind:element.tagName.toLowerCase(),type:element.type||"",name:element.name||"",id:element.id||"",label:norm(label),placeholder:norm(element.getAttribute("placeholder"))});
    const validation=element.tagName==="SELECT"?{valid:true,reason:""}:validateControl(element,value);
    candidates.push({index:candidates.length,key,label,value,fingerprint,kind:element.tagName==="SELECT"?"select":"text",element,valid:validation.valid,reason:validation.reason});
  }
  const manualSteps=[];
  const allControls=[...document.querySelectorAll("input,button,a,select,textarea")];
  const labels=allControls.map(element=>[element.getAttribute("aria-label")||"",element.name||"",element.id||"",element.value||"",element.innerText||"",element.closest("tr")?.innerText||""].join(" "));
  if(labels.some(value=>/(?:otp|one time password|verification code)/i.test(value)))manualSteps.push("Request and enter the OTP yourself in the portal.");
  if(labels.some(value=>/(?:captcha|security code|verification image)/i.test(value)))manualSteps.push("Read and enter the CAPTCHA yourself in the portal.");
  if(allControls.some(element=>element.tagName==="INPUT"&&element.type==="checkbox"&&/(?:consent|declaration|agree|authorize)/i.test([element.name,element.id,element.closest("tr")?.innerText||""].join(" "))))manualSteps.push("Review and tick any Aadhaar consent or declaration checkbox yourself.");
  if(allControls.some(element=>element.tagName==="INPUT"&&element.type==="submit"||element.tagName==="BUTTON"&&/(?:submit|apply|proceed|verify|continue|get otp)/i.test(element.innerText||element.value||"")))manualSteps.push("Review the page and click portal buttons yourself. JanaSetu will not click Proceed, Verify, Apply or Submit.");
  if(!Array.isArray(approvedFields)){
    return {preview:candidates.map(({index,key,label,value,fingerprint,valid,reason})=>({index,key,label,value,fingerprint,valid,reason})),manualSteps};
  }
  const approved=new Map(approvedFields.filter(item=>item&&Number.isInteger(item.index)&&typeof item.fingerprint==="string").map(item=>[item.index,item.fingerprint]));
  let filled=0,stale=0;
  for(const candidate of candidates){
    if(!approved.has(candidate.index))continue;
    if(approved.get(candidate.index)!==candidate.fingerprint||!candidate.valid){stale++;continue;}
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
  return {filled,stale,manualSteps};
}
