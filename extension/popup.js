const statusEl = document.getElementById("status");
const COPY = {
  en: {
    title: "JanaSetu Form Assistant",
    intro: "Import a citizen-reviewed JanaSetu JSON backup, then fill matching fields on the active government portal.",
    backupLabel: "Select JanaSetu backup (.json)", importBtn: "Import reviewed profile", fillBtn: "Fill fields on active tab",
    warning: "This extension only fills visible matching fields after you click. It does not intentionally submit forms or upload documents. Portal scripts may react to field changes; check the page after filling and review every field before proceeding.",
    chooseBackup: "Choose a JanaSetu JSON backup first.", invalidBackup: "Invalid JanaSetu backup.",
    imported: "Profile imported into extension storage on this device.", importFailed: "Import failed.", profileFirst: "Import a profile first.",
    openPortal: "Open an official government portal tab first.", blockedDomain: "For safety, autofill is limited to HTTPS .gov.in and .nic.in portals. Use manual entry on other sites.",
    fillOk: "Filled {count} matching field(s). Review all values before submitting.", noFields: "No matching fields found. Portal forms vary; fill them manually.", fillFail: "Could not fill this tab. Check extension permissions and try again."
  },
  hi: {
    title: "JanaSetu फ़ॉर्म सहायक",
    intro: "नागरिक द्वारा जाँचा गया JanaSetu JSON बैकअप आयात करें, फिर सक्रिय सरकारी पोर्टल पर मिलते-जुलते फ़ील्ड भरें।",
    backupLabel: "JanaSetu बैकअप चुनें (.json)", importBtn: "जाँची गई प्रोफ़ाइल आयात करें", fillBtn: "सक्रिय टैब के फ़ील्ड भरें",
    warning: "यह एक्सटेंशन आपके क्लिक के बाद केवल दिखाई देने वाले मेल खाते फ़ील्ड भरता है। यह जानबूझकर फ़ॉर्म जमा या दस्तावेज़ अपलोड नहीं करता। पोर्टल की स्क्रिप्ट फ़ील्ड बदलने पर प्रतिक्रिया दे सकती हैं; भरने के बाद पेज जाँचें और आगे बढ़ने से पहले हर फ़ील्ड की समीक्षा करें।",
    chooseBackup: "पहले JanaSetu JSON बैकअप चुनें।", invalidBackup: "JanaSetu बैकअप मान्य नहीं है।",
    imported: "प्रोफ़ाइल इस डिवाइस के एक्सटेंशन स्टोरेज में आयात की गई।", importFailed: "आयात विफल हुआ।", profileFirst: "पहले प्रोफ़ाइल आयात करें।",
    openPortal: "पहले सरकारी पोर्टल का टैब खोलें।", blockedDomain: "सुरक्षा के लिए ऑटोफ़िल केवल HTTPS .gov.in और .nic.in पोर्टलों पर उपलब्ध है। अन्य साइटों पर जानकारी स्वयं भरें।",
    fillOk: "{count} मिलते-जुलते फ़ील्ड भरे गए। जमा करने से पहले सभी मान जाँचें।", noFields: "कोई मिलान फ़ील्ड नहीं मिला। पोर्टल फ़ॉर्म अलग होते हैं; जानकारी स्वयं भरें।", fillFail: "इस टैब को भर नहीं सके। एक्सटेंशन अनुमतियाँ जाँचकर पुनः प्रयास करें।"
  },
  kn: {
    title: "JanaSetu ಫಾರ್ಮ್ ಸಹಾಯಕ",
    intro: "ನಾಗರಿಕ ಪರಿಶೀಲಿಸಿದ JanaSetu JSON ಬ್ಯಾಕಪ್ ಆಮದು ಮಾಡಿ, ನಂತರ ತೆರೆದ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ನ ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಿ.",
    backupLabel: "JanaSetu ಬ್ಯಾಕಪ್ ಆಯ್ಕೆಮಾಡಿ (.json)", importBtn: "ಪರಿಶೀಲಿಸಿದ ಪ್ರೊಫೈಲ್ ಆಮದು ಮಾಡಿ", fillBtn: "ಸಕ್ರಿಯ ಟ್ಯಾಬ್‌ನ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಿ",
    warning: "ನೀವು ಕ್ಲಿಕ್ ಮಾಡಿದ ನಂತರ ಮಾತ್ರ ಈ ವಿಸ್ತರಣೆ ಕಾಣುವ ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬುತ್ತದೆ. ಇದು ಉದ್ದೇಶಪೂರ್ವಕವಾಗಿ ಫಾರ್ಮ್ ಸಲ್ಲಿಸುವುದಿಲ್ಲ ಅಥವಾ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡುವುದಿಲ್ಲ. ಕ್ಷೇತ್ರ ಬದಲಾವಣೆಗಳಿಗೆ ಪೋರ್ಟಲ್ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳು ಪ್ರತಿಕ್ರಿಯಿಸಬಹುದು; ತುಂಬಿದ ನಂತರ ಪುಟವನ್ನು ಪರಿಶೀಲಿಸಿ. ಮುಂದುವರಿಯುವ ಮೊದಲು ಪ್ರತಿಯೊಂದು ಕ್ಷೇತ್ರವನ್ನೂ ಪರಿಶೀಲಿಸಿ.",
    chooseBackup: "ಮೊದಲು JanaSetu JSON ಬ್ಯಾಕಪ್ ಆಯ್ಕೆಮಾಡಿ.", invalidBackup: "JanaSetu ಬ್ಯಾಕಪ್ ಮಾನ್ಯವಾಗಿಲ್ಲ.",
    imported: "ಪ್ರೊಫೈಲ್ ಈ ಸಾಧನದ ವಿಸ್ತರಣೆ ಸಂಗ್ರಹಣೆಗೆ ಆಮದು ಮಾಡಲಾಗಿದೆ.", importFailed: "ಆಮದು ವಿಫಲವಾಗಿದೆ.", profileFirst: "ಮೊದಲು ಪ್ರೊಫೈಲ್ ಆಮದು ಮಾಡಿ.",
    openPortal: "ಮೊದಲು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್ ಟ್ಯಾಬ್ ತೆರೆಯಿರಿ.", blockedDomain: "ಸುರಕ್ಷತೆಗಾಗಿ HTTPS .gov.in ಮತ್ತು .nic.in ಪೋರ್ಟಲ್‌ಗಳಲ್ಲಿ ಮಾತ್ರ ಸ್ವಯಂ-ಭರ್ತಿ ಅನುಮತಿಸಲಾಗಿದೆ. ಇತರ ತಾಣಗಳಲ್ಲಿ ಕೈಯಾರೆ ನಮೂದಿಸಿ.",
    fillOk: "{count} ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಲಾಗಿದೆ. ಸಲ್ಲಿಸುವ ಮೊದಲು ಎಲ್ಲವನ್ನೂ ಪರಿಶೀಲಿಸಿ.", noFields: "ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಪೋರ್ಟಲ್ ಫಾರ್ಮ್‌ಗಳು ಬದಲಾಗುತ್ತವೆ; ಕೈಯಾರೆ ತುಂಬಿ.", fillFail: "ಈ ಟ್ಯಾಬ್ ತುಂಬಲಾಗಲಿಲ್ಲ. ವಿಸ್ತರಣೆ ಅನುಮತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
  },
  ta: {
    title: "JanaSetu படிவ உதவியாளர்",
    intro: "குடிமகன் சரிபார்த்த JanaSetu JSON காப்புப்பிரதியை இறக்குமதி செய்து, திறந்துள்ள அரசு தளத்தில் பொருந்தும் புலங்களை நிரப்பவும்.",
    backupLabel: "JanaSetu காப்புப்பிரதியைத் தேர்ந்தெடுக்கவும் (.json)", importBtn: "சரிபார்த்த சுயவிவரத்தை இறக்குமதி செய்", fillBtn: "செயலில் உள்ள தாவல் புலங்களை நிரப்பு",
    warning: "நீங்கள் கிளிக் செய்த பிறகே இந்த நீட்டிப்பு காணக்கூடிய பொருந்தும் புலங்களை நிரப்பும். இது திட்டமிட்டு படிவங்களைச் சமர்ப்பிக்கவோ ஆவணங்களைப் பதிவேற்றவோ செய்யாது. புல மாற்றங்களுக்கு போர்டல் ஸ்கிரிப்டுகள் பதிலளிக்கலாம்; நிரப்பிய பிறகு பக்கத்தைச் சரிபார்க்கவும். தொடர்வதற்கு முன் ஒவ்வொரு புலத்தையும் சரிபார்க்கவும்.",
    chooseBackup: "முதலில் JanaSetu JSON காப்புப்பிரதியைத் தேர்ந்தெடுக்கவும்.", invalidBackup: "JanaSetu காப்புப்பிரதி செல்லுபடியாகாது.",
    imported: "சுயவிவரம் இந்தச் சாதனத்தின் நீட்டிப்பு சேமிப்பகத்தில் இறக்குமதி செய்யப்பட்டது.", importFailed: "இறக்குமதி தோல்வியடைந்தது.", profileFirst: "முதலில் சுயவிவரத்தை இறக்குமதி செய்யவும்.",
    openPortal: "முதலில் அதிகாரப்பூர்வ அரசு தாவலைத் திறக்கவும்.", blockedDomain: "பாதுகாப்புக்காக HTTPS .gov.in மற்றும் .nic.in தளங்களில் மட்டுமே தானியங்கி நிரப்பு அனுமதிக்கப்படுகிறது. பிற தளங்களில் கைமுறையாக உள்ளிடவும்.",
    fillOk: "{count} பொருந்தும் புலங்கள் நிரப்பப்பட்டன. சமர்ப்பிப்பதற்கு முன் அனைத்தையும் சரிபார்க்கவும்.", noFields: "பொருந்தும் புலங்கள் இல்லை. தளப் படிவங்கள் மாறுபடும்; கைமுறையாக நிரப்பவும்.", fillFail: "இந்தத் தாவலை நிரப்ப முடியவில்லை. நீட்டிப்பு அனுமதிகளைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
  },
  te: {
    title: "JanaSetu ఫారమ్ సహాయకుడు",
    intro: "పౌరుడు సమీక్షించిన JanaSetu JSON బ్యాకప్‌ను దిగుమతి చేసి, తెరిచిన ప్రభుత్వ పోర్టల్‌లో సరిపోలే ఫీల్డ్‌లను నింపండి.",
    backupLabel: "JanaSetu బ్యాకప్ ఎంచుకోండి (.json)", importBtn: "సమీక్షించిన ప్రొఫైల్ దిగుమతి చేయండి", fillBtn: "ప్రస్తుత ట్యాబ్ ఫీల్డ్‌లను నింపండి",
    warning: "మీరు క్లిక్ చేసిన తర్వాత మాత్రమే ఈ ఎక్స్‌టెన్షన్ కనిపించే సరిపోలే ఫీల్డ్‌లను నింపుతుంది. ఇది ఉద్దేశపూర్వకంగా ఫారమ్‌లను సమర్పించదు లేదా పత్రాలను అప్‌లోడ్ చేయదు. ఫీల్డ్ మార్పులకు పోర్టల్ స్క్రిప్ట్‌లు స్పందించవచ్చు; నింపిన తర్వాత పేజీని తనిఖీ చేయండి. కొనసాగించే ముందు ప్రతి ఫీల్డ్‌ను సమీక్షించండి.",
    chooseBackup: "ముందుగా JanaSetu JSON బ్యాకప్ ఎంచుకోండి.", invalidBackup: "JanaSetu బ్యాకప్ చెల్లదు.",
    imported: "ప్రొఫైల్ ఈ పరికరంలోని ఎక్స్‌టెన్షన్ నిల్వలో దిగుమతి చేయబడింది.", importFailed: "దిగుమతి విఫలమైంది.", profileFirst: "ముందుగా ప్రొఫైల్‌ను దిగుమతి చేయండి.",
    openPortal: "ముందుగా అధికారిక ప్రభుత్వ పోర్టల్ ట్యాబ్‌ను తెరవండి.", blockedDomain: "భద్రత కోసం HTTPS .gov.in మరియు .nic.in పోర్టల్‌లలో మాత్రమే ఆటోఫిల్ అనుమతించబడుతుంది. ఇతర సైట్‌లలో చేతితో నమోదు చేయండి.",
    fillOk: "{count} సరిపోలే ఫీల్డ్‌లు నింపబడ్డాయి. సమర్పించే ముందు అన్నింటినీ పరిశీలించండి.", noFields: "సరిపోలే ఫీల్డ్‌లు కనబడలేదు. పోర్టల్ ఫారమ్‌లు వేరుగా ఉంటాయి; చేతితో నింపండి.", fillFail: "ఈ ట్యాబ్‌ను నింపలేకపోయాం. ఎక్స్‌టెన్షన్ అనుమతులను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి."
  },
  ml: {
    title: "JanaSetu ഫോം സഹായി",
    intro: "പൗരൻ പരിശോധിച്ച JanaSetu JSON ബാക്കപ്പ് ഇറക്കുമതി ചെയ്ത് തുറന്നിരിക്കുന്ന സർക്കാർ പോർട്ടലിലെ പൊരുത്തമുള്ള ഫീൽഡുകൾ പൂരിപ്പിക്കുക.",
    backupLabel: "JanaSetu ബാക്കപ്പ് തിരഞ്ഞെടുക്കുക (.json)", importBtn: "പരിശോധിച്ച പ്രൊഫൈൽ ഇറക്കുമതി ചെയ്യുക", fillBtn: "സജീവ ടാബിലെ ഫീൽഡുകൾ പൂരിപ്പിക്കുക",
    warning: "നിങ്ങൾ ക്ലിക്ക് ചെയ്തതിന് ശേഷമേ ഈ എക്സ്റ്റൻഷൻ കാണുന്ന പൊരുത്തമുള്ള ഫീൽഡുകൾ പൂരിപ്പിക്കൂ. ഇത് ഉദ്ദേശ്യപൂർവം ഫോമുകൾ സമർപ്പിക്കുകയോ രേഖകൾ അപ്‌ലോഡ് ചെയ്യുകയോ ഇല്ല. ഫീൽഡ് മാറ്റങ്ങളോട് പോർട്ടൽ സ്ക്രിപ്റ്റുകൾ പ്രതികരിച്ചേക്കാം; പൂരിപ്പിച്ച ശേഷം പേജ് പരിശോധിക്കുക. തുടരുന്നതിന് മുമ്പ് ഓരോ ഫീൽഡും പരിശോധിക്കുക.",
    chooseBackup: "ആദ്യം JanaSetu JSON ബാക്കപ്പ് തിരഞ്ഞെടുക്കുക.", invalidBackup: "JanaSetu ബാക്കപ്പ് സാധുവല്ല.",
    imported: "പ്രൊഫൈൽ ഈ ഉപകരണത്തിലെ എക്സ്റ്റൻഷൻ സംഭരണത്തിലേക്ക് ഇറക്കുമതി ചെയ്തു.", importFailed: "ഇറക്കുമതി പരാജയപ്പെട്ടു.", profileFirst: "ആദ്യം പ്രൊഫൈൽ ഇറക്കുമതി ചെയ്യുക.",
    openPortal: "ആദ്യം ഔദ്യോഗിക സർക്കാർ പോർട്ടൽ ടാബ് തുറക്കുക.", blockedDomain: "സുരക്ഷയ്ക്കായി HTTPS .gov.in, .nic.in പോർട്ടലുകളിൽ മാത്രമാണ് ഓട്ടോഫിൽ അനുവദിക്കുന്നത്. മറ്റ് സൈറ്റുകളിൽ കൈകൊണ്ട് നൽകുക.",
    fillOk: "{count} പൊരുത്തമുള്ള ഫീൽഡുകൾ പൂരിപ്പിച്ചു. സമർപ്പിക്കുന്നതിന് മുമ്പ് എല്ലാം പരിശോധിക്കുക.", noFields: "പൊരുത്തമുള്ള ഫീൽഡുകളൊന്നും കണ്ടെത്തിയില്ല. പോർട്ടൽ ഫോമുകൾ വ്യത്യസ്തമാണ്; കൈകൊണ്ട് പൂരിപ്പിക്കുക.", fillFail: "ഈ ടാബ് പൂരിപ്പിക്കാൻ കഴിഞ്ഞില്ല. എക്സ്റ്റൻഷൻ അനുമതികൾ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക."
  }
};


const OCCUPATION_ALIASES = {
  farmer: "Farmer", "किसान": "Farmer", "ರೈತ": "Farmer", "விவசாயி": "Farmer", "రైతు": "Farmer", "കർഷകൻ": "Farmer",
  "agricultural worker": "Agricultural worker", "कृषि श्रमिक": "Agricultural worker", "ಕೃಷಿ ಕಾರ್ಮಿಕ": "Agricultural worker", "வேளாண் தொழிலாளர்": "Agricultural worker", "వ్యవసాయ కార్మికుడు": "Agricultural worker", "കൃഷിത്തൊഴിലാളി": "Agricultural worker",
  student: "Student", "छात्र": "Student", "ವಿದ್ಯಾರ್ಥಿ": "Student", "மாணவர்": "Student", "విద్యార్థి": "Student", "വിദ്യാർത്ഥി": "Student",
  "self-employed": "Self-employed", "स्व-रोज़गार": "Self-employed", "ಸ್ವಯಂ ಉದ್ಯೋಗಿ": "Self-employed", "சுயதொழில்": "Self-employed", "స్వయం ఉపాధి": "Self-employed", "സ്വയം തൊഴിൽ": "Self-employed",
  vendor: "Vendor", "विक्रेता": "Vendor", "ವ್ಯಾಪಾರಿ": "Vendor", "விற்பனையாளர்": "Vendor", "విక్రేత": "Vendor", "വിൽപ്പനക്കാരൻ": "Vendor",
  salaried: "Salaried", "वेतनभोगी": "Salaried", "ಸಂಬಳದ ಉದ್ಯೋಗಿ": "Salaried", "சம்பளப் பணியாளர்": "Salaried", "వేతన ఉద్యోగి": "Salaried", "ശമ്പളക്കാരൻ": "Salaried",
  unemployed: "Unemployed", "बेरोज़गार": "Unemployed", "ನಿರುದ್ಯೋಗಿ": "Unemployed", "வேலைஇல்லாதவர்": "Unemployed", "నిరుద్యోగి": "Unemployed", "തൊഴിൽരഹിതൻ": "Unemployed",
  homemaker: "Homemaker", "गृहिणी": "Homemaker", "ಗೃಹಿಣಿ": "Homemaker", "இல்லத்தரசி": "Homemaker", "വീട്ടമ്മ": "Homemaker",
  other: "Other", "अन्य": "Other", "ಇತರೆ": "Other", "மற்றவை": "Other", "ఇతర": "Other", "മറ്റുള്ളവ": "Other"
};
const ALLOWED_OCCUPATIONS = new Set(["", "Farmer", "Agricultural worker", "Student", "Self-employed", "Vendor", "Salaried", "Unemployed", "Homemaker", "Other"]);
function normalizeOccupation(value) {
  if (typeof value !== "string" || value.length > 100) return null;
  const trimmed = value.trim();
  const canonical = OCCUPATION_ALIASES[trimmed.toLocaleLowerCase()] || OCCUPATION_ALIASES[trimmed] || trimmed;
  return ALLOWED_OCCUPATIONS.has(canonical) ? canonical : null;
}

const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
const STATES_AND_UTS = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"];
function isValidProfile(profile) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) return false;
  const allowed = ["fullName","age","gender","state","district","residenceType","annualIncome","occupation","hasCultivableLand","pmKisanExcluded","ownsPuccaHouse","previousHousingBenefit","householdHasLpg","poorHouseholdDeclaration","isStudent","top20Percentile","regularUndergraduate","otherScholarship","diplomaOrDistance"];
  if (Object.keys(profile).some((key) => !allowed.includes(key))) return false;
  if (typeof profile.fullName !== "string" || profile.fullName.length > 100) return false;
  if (!(profile.age === "" || (Number.isInteger(profile.age) && profile.age >= 0 && profile.age <= 120))) return false;
  if (!["", "woman", "man", "other"].includes(profile.gender)) return false;
  if (typeof profile.state !== "string" || profile.state.length > 80 || (profile.state !== "" && !STATES_AND_UTS.includes(profile.state))) return false;
  if (typeof profile.district !== "string" || profile.district.length > 100) return false;
  if (!["", "urban", "rural"].includes(profile.residenceType)) return false;
  if (!(profile.annualIncome === "" || (typeof profile.annualIncome === "number" && Number.isFinite(profile.annualIncome) && profile.annualIncome >= 0 && profile.annualIncome <= 100000000))) return false;
  if (normalizeOccupation(profile.occupation) === null) return false;
  for (const key of ["hasCultivableLand","ownsPuccaHouse","householdHasLpg","poorHouseholdDeclaration","top20Percentile","regularUndergraduate","otherScholarship","diplomaOrDistance"]) if (profile[key] !== null && typeof profile[key] !== "boolean") return false;
  if (!["yes","no","unknown"].includes(profile.pmKisanExcluded) || !["yes","no","unknown"].includes(profile.previousHousingBenefit)) return false;
  return typeof profile.isStudent === "boolean";
}

let currentLanguage = "en";
const getCopy = (key) => COPY[currentLanguage]?.[key] || COPY.en[key] || key;
const say = (key, values = {}) => {
  let message = getCopy(key);
  for (const [name, value] of Object.entries(values)) message = message.replace("{" + name + "}", String(value));
  statusEl.textContent = message;
};
function setLanguage(language) {
  currentLanguage = Object.prototype.hasOwnProperty.call(COPY, language) ? language : "en";
  document.documentElement.lang = ({ en: "en-IN", hi: "hi-IN", kn: "kn-IN", ta: "ta-IN", te: "te-IN", ml: "ml-IN" })[currentLanguage];
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (key) element.textContent = getCopy(key);
  });
}

const popupReady = (async () => {
  try {
    const saved = await chrome.storage.local.get(["language"]);
    setLanguage(saved.language || "en");
  } catch { setLanguage("en"); }
})();

document.getElementById("save").addEventListener("click", async () => {
  await popupReady;
  const file = document.getElementById("backup").files?.[0];
  if (!file) { say("chooseBackup"); return; }
  try {
    if (file.size > MAX_BACKUP_BYTES) throw new Error(getCopy("invalidBackup"));
    const data = JSON.parse(await file.text());
    if (data?.app !== "JanaSetu" || data?.schemaVersion !== 1 || !isValidProfile(data?.profile)) throw new Error(getCopy("invalidBackup"));
    const language = Object.prototype.hasOwnProperty.call(COPY, data.language) ? data.language : "en";
    const profile = { ...data.profile, occupation: normalizeOccupation(data.profile.occupation) };
    await chrome.storage.local.set({ profile, language, importedAt: new Date().toISOString() });
    setLanguage(language);
    say("imported");
  } catch (error) { say("importFailed"); }
});

document.getElementById("fill").addEventListener("click", async () => {
  try {
    await popupReady;
    const { profile, language } = await chrome.storage.local.get(["profile", "language"]);
    setLanguage(language || currentLanguage);
    if (!profile) { say("profileFirst"); return; }
    if (!isValidProfile(profile)) { say("invalidBackup"); return; }
    const normalizedProfile = { ...profile, occupation: normalizeOccupation(profile.occupation) };
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) { say("openPortal"); return; }
    const portalUrl = new URL(tab.url);
    const host = portalUrl.hostname.toLowerCase();
    const approvedHost = portalUrl.protocol === "https:" && (host === "gov.in" || host.endsWith(".gov.in") || host === "nic.in" || host.endsWith(".nic.in"));
    if (!approvedHost) { say("blockedDomain"); return; }
    const result = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: fillProfileInPage, args: [normalizedProfile] });
    const count = result?.[0]?.result?.filled ?? 0;
    if (count) say("fillOk", { count }); else say("noFields");
  } catch (error) { say("fillFail"); }
});
