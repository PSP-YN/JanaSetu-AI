const statusEl = document.getElementById("status");
const COPY = {
  en: {
    title: "JanaSetu Form Assistant",
    intro: "Import a citizen-reviewed JanaSetu JSON backup, preview matching fields and approve each value before filling.",
    backupLabel: "Select JanaSetu backup (.json)", importBtn: "Import reviewed profile", fillBtn: "Preview matching fields", applyBtn: "Fill selected fields", previewReady: "Review each suggested field. Select only the values you approve.", noSelection: "Select at least one field to fill.", stalePreview: "The active tab or page changed. Preview the fields again before filling.",
    warning: "Preview the matching fields and select each value you approve. The extension never submits forms or uploads documents. Portal scripts may react to field changes; check every filled field before continuing.",
    chooseBackup: "Choose a JanaSetu JSON backup first.", invalidBackup: "Invalid JanaSetu backup.",
    imported: "Profile imported into extension storage on this device.", importFailed: "Import failed.", profileFirst: "Import a profile first.",
    openPortal: "Open the official portal from JanaSetu first.", blockedDomain: "Open an HTTPS government portal ending in .gov.in or .nic.in, verify its exact URL against JanaSetu, and check the confirmation box.",
    verifyPortalLabel: 'I checked this exact website address against the official link in JanaSetu. I understand this is user-directed field assistance, not a government-authorized integration.',
    fillOk: "Filled {count} matching field(s). Review every value. JanaSetu stops here and never clicks Next, Apply, Save or Submit; any further steps are yours.", noFields: "No matching fields found. Portal forms vary; fill them manually.", fillFail: "Could not fill this tab. Check extension permissions and try again."
  },
  hi: {
    title: "JanaSetu फ़ॉर्म सहायक",
    intro: "नागरिक द्वारा जाँचा गया JanaSetu JSON बैकअप आयात करें। फ़ील्ड देखें और भरने से पहले हर मान को मंज़ूरी दें।",
    backupLabel: "JanaSetu बैकअप चुनें (.json)", importBtn: "जाँची गई प्रोफ़ाइल आयात करें", fillBtn: "मिलते-जुलते फ़ील्ड देखें", applyBtn: "चुने हुए फ़ील्ड भरें", previewReady: "हर सुझाए गए फ़ील्ड की समीक्षा करें और केवल स्वीकृत मान चुनें।", noSelection: "भरने के लिए कम से कम एक फ़ील्ड चुनें।", stalePreview: "सक्रिय टैब या पेज बदल गया है। फिर से फ़ील्ड देखें।",
    warning: "मिलते-जुलते फ़ील्ड देखें और हर स्वीकृत मान चुनें। यह एक्सटेंशन फ़ॉर्म जमा या दस्तावेज़ अपलोड नहीं करता। पोर्टल की स्क्रिप्ट फ़ील्ड बदलने पर प्रतिक्रिया दे सकती हैं; आगे बढ़ने से पहले भरे गए सभी फ़ील्ड जाँचें।",
    chooseBackup: "पहले JanaSetu JSON बैकअप चुनें।", invalidBackup: "JanaSetu बैकअप मान्य नहीं है।",
    imported: "प्रोफ़ाइल इस डिवाइस के एक्सटेंशन स्टोरेज में आयात की गई।", importFailed: "आयात विफल हुआ।", profileFirst: "पहले प्रोफ़ाइल आयात करें।",
    openPortal: "पहले JanaSetu से आधिकारिक पोर्टल खोलें।", blockedDomain: "HTTPS सरकारी पोर्टल खोलें जिसका पता .gov.in या .nic.in पर समाप्त हो, उसका पूरा URL JanaSetu से मिलाएँ और पुष्टि चेकबॉक्स चुनें।",
    verifyPortalLabel: 'मैंने इस वेबसाइट पते को JanaSetu के आधिकारिक लिंक से मिलाया है। यह उपयोगकर्ता-निर्देशित फ़ील्ड सहायता है, सरकारी-अधिकृत एकीकरण नहीं।',
    fillOk: "{count} मिलते-जुलते फ़ील्ड भरे गए। हर मान जाँचें। JanaSetu यहीं रुकता है और Next, Apply, Save या Submit नहीं दबाता; आगे के सभी कदम आपके नियंत्रण में हैं।", noFields: "कोई मिलान फ़ील्ड नहीं मिला। पोर्टल फ़ॉर्म अलग होते हैं; जानकारी स्वयं भरें।", fillFail: "इस टैब को भर नहीं सके। एक्सटेंशन अनुमतियाँ जाँचकर पुनः प्रयास करें।"
  },
  kn: {
    title: "JanaSetu ಫಾರ್ಮ್ ಸಹಾಯಕ",
    intro: "ನಾಗರಿಕ ಪರಿಶೀಲಿಸಿದ JanaSetu JSON ಬ್ಯಾಕಪ್ ಆಮದು ಮಾಡಿ. ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ನೋಡಿ, ತುಂಬುವ ಮೊದಲು ಪ್ರತಿಯೊಂದು ಮೌಲ್ಯಕ್ಕೂ ಅನುಮೋದನೆ ನೀಡಿ.",
    backupLabel: "JanaSetu ಬ್ಯಾಕಪ್ ಆಯ್ಕೆಮಾಡಿ (.json)", importBtn: "ಪರಿಶೀಲಿಸಿದ ಪ್ರೊಫೈಲ್ ಆಮದು ಮಾಡಿ", fillBtn: "ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಪೂರ್ವವೀಕ್ಷಿಸಿ", applyBtn: "ಆಯ್ದ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಿ", previewReady: "ಪ್ರತಿ ಸೂಚಿಸಿದ ಕ್ಷೇತ್ರವನ್ನು ಪರಿಶೀಲಿಸಿ. ನೀವು ಅನುಮೋದಿಸಿದ ಮೌಲ್ಯಗಳನ್ನು ಮಾತ್ರ ಆಯ್ಕೆಮಾಡಿ.", noSelection: "ತುಂಬಲು ಕನಿಷ್ಠ ಒಂದು ಕ್ಷೇತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.", stalePreview: "ಸಕ್ರಿಯ ಟ್ಯಾಬ್ ಅಥವಾ ಪುಟ ಬದಲಾಗಿದೆ. ಮತ್ತೆ ಪೂರ್ವವೀಕ್ಷಿಸಿ.",
    warning: "ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಪೂರ್ವವೀಕ್ಷಿಸಿ ಮತ್ತು ನೀವು ಅನುಮೋದಿಸುವ ಪ್ರತಿಯೊಂದು ಮೌಲ್ಯವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ. ವಿಸ್ತರಣೆ ಫಾರ್ಮ್ ಸಲ್ಲಿಸುವುದಿಲ್ಲ ಅಥವಾ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡುವುದಿಲ್ಲ. ಪೋರ್ಟಲ್ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳು ಕ್ಷೇತ್ರ ಬದಲಾವಣೆಗಳಿಗೆ ಪ್ರತಿಕ್ರಿಯಿಸಬಹುದು; ಮುಂದುವರಿಯುವ ಮೊದಲು ತುಂಬಿದ ಎಲ್ಲ ಕ್ಷೇತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    chooseBackup: "ಮೊದಲು JanaSetu JSON ಬ್ಯಾಕಪ್ ಆಯ್ಕೆಮಾಡಿ.", invalidBackup: "JanaSetu ಬ್ಯಾಕಪ್ ಮಾನ್ಯವಾಗಿಲ್ಲ.",
    imported: "ಪ್ರೊಫೈಲ್ ಈ ಸಾಧನದ ವಿಸ್ತರಣೆ ಸಂಗ್ರಹಣೆಗೆ ಆಮದು ಮಾಡಲಾಗಿದೆ.", importFailed: "ಆಮದು ವಿಫಲವಾಗಿದೆ.", profileFirst: "ಮೊದಲು ಪ್ರೊಫೈಲ್ ಆಮದು ಮಾಡಿ.",
    openPortal: "ಮೊದಲು JanaSetu ನಿಂದ ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ.", blockedDomain: ".gov.in ಅಥವಾ .nic.in ನಲ್ಲಿ ಕೊನೆಗೊಳ್ಳುವ HTTPS ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ, ಸಂಪೂರ್ಣ URL ಅನ್ನು JanaSetu ಅಧಿಕೃತ ಲಿಂಕ್‌ನೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ದೃಢೀಕರಣ ಚೆಕ್‌ಬಾಕ್ಸ್ ಆಯ್ಕೆಮಾಡಿ.",
    verifyPortalLabel: 'ಈ ವೆಬ್\u200cಸೈಟ್ ವಿಳಾಸವನ್ನು JanaSetu ಅಧಿಕೃತ ಲಿಂಕ್\u200cನೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿದ್ದೇನೆ. ಇದು ಬಳಕೆದಾರ-ನಿರ್ದೇಶಿತ ಕ್ಷೇತ್ರ ಸಹಾಯ ಮಾತ್ರ, ಸರ್ಕಾರಿ-ಅನುಮೋದಿತ ಏಕೀಕರಣವಲ್ಲ.',
    fillOk: "{count} ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಲಾಗಿದೆ. ಪ್ರತಿಯೊಂದು ಮೌಲ್ಯ ಪರಿಶೀಲಿಸಿ. JanaSetu ಇಲ್ಲಿಯೇ ನಿಲ್ಲುತ್ತದೆ; Next, Apply, Save ಅಥವಾ Submit ಒತ್ತುವುದಿಲ್ಲ. ಮುಂದಿನ ಹಂತಗಳು ನಿಮ್ಮ ನಿಯಂತ್ರಣದಲ್ಲಿರುತ್ತವೆ.", noFields: "ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಪೋರ್ಟಲ್ ಫಾರ್ಮ್‌ಗಳು ಬದಲಾಗುತ್ತವೆ; ಕೈಯಾರೆ ತುಂಬಿ.", fillFail: "ಈ ಟ್ಯಾಬ್ ತುಂಬಲಾಗಲಿಲ್ಲ. ವಿಸ್ತರಣೆ ಅನುಮತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
  },
  ta: {
    title: "JanaSetu படிவ உதவியாளர்",
    intro: "குடிமகன் சரிபார்த்த JanaSetu JSON காப்புப்பிரதியை இறக்குமதி செய்யவும். பொருந்தும் புலங்களைப் பார்த்து, நிரப்புவதற்கு முன் ஒவ்வொரு மதிப்பையும் ஒப்புதல் அளிக்கவும்.",
    backupLabel: "JanaSetu காப்புப்பிரதியைத் தேர்ந்தெடுக்கவும் (.json)", importBtn: "சரிபார்த்த சுயவிவரத்தை இறக்குமதி செய்", fillBtn: "பொருந்தும் புலங்களை முன்னோட்டம் காண்க", applyBtn: "தேர்ந்தெடுத்த புலங்களை நிரப்பு", previewReady: "ஒவ்வொரு பரிந்துரைக்கப்பட்ட புலத்தையும் சரிபார்த்து, நீங்கள் ஒப்புதல் அளிக்கும் மதிப்புகளை மட்டும் தேர்ந்தெடுக்கவும்.", noSelection: "நிரப்ப குறைந்தது ஒரு புலத்தைத் தேர்ந்தெடுக்கவும்.", stalePreview: "செயலில் உள்ள தாவல் அல்லது பக்கம் மாறிவிட்டது. மீண்டும் முன்னோட்டம் காண்க.",
    warning: "பொருந்தும் புலங்களை முன்னோட்டம் பார்த்து, நீங்கள் ஒப்புதல் அளிக்கும் மதிப்புகளைத் தேர்ந்தெடுக்கவும். இந்த நீட்டிப்பு படிவங்களைச் சமர்ப்பிக்கவோ ஆவணங்களைப் பதிவேற்றவோ செய்யாது. போர்டல் ஸ்கிரிப்டுகள் புல மாற்றங்களுக்கு பதிலளிக்கலாம்; தொடர்வதற்கு முன் நிரப்பிய அனைத்துப் புலங்களையும் சரிபார்க்கவும்.",
    chooseBackup: "முதலில் JanaSetu JSON காப்புப்பிரதியைத் தேர்ந்தெடுக்கவும்.", invalidBackup: "JanaSetu காப்புப்பிரதி செல்லுபடியாகாது.",
    imported: "சுயவிவரம் இந்தச் சாதனத்தின் நீட்டிப்பு சேமிப்பகத்தில் இறக்குமதி செய்யப்பட்டது.", importFailed: "இறக்குமதி தோல்வியடைந்தது.", profileFirst: "முதலில் சுயவிவரத்தை இறக்குமதி செய்யவும்.",
    openPortal: "முதலில் JanaSetu-இலிருந்து அதிகாரப்பூர்வ போர்டலைத் திறக்கவும்.", blockedDomain: ".gov.in அல்லது .nic.in என முடியும் HTTPS அரசு போர்டலைத் திறந்து, முழு URL-ஐ JanaSetu அதிகாரப்பூர்வ இணைப்புடன் சரிபார்த்து உறுதிப்படுத்தல் பெட்டியைத் தேர்ந்தெடுக்கவும்.",
    verifyPortalLabel: 'இந்த இணையதள முகவரியை JanaSetu அதிகாரப்பூர்வ இணைப்புடன் சரிபார்த்தேன். இது பயனர் வழிநடத்தும் புல உதவி மட்டுமே; அரசு அங்கீகரித்த ஒருங்கிணைப்பு அல்ல.',
    fillOk: "{count} பொருந்தும் புலங்கள் நிரப்பப்பட்டன. ஒவ்வொரு மதிப்பையும் சரிபார்க்கவும். JanaSetu இங்கேயே நிற்கும்; Next, Apply, Save அல்லது Submit பொத்தானை அழுத்தாது. அடுத்த படிகள் உங்கள் கட்டுப்பாட்டில் இருக்கும்.", noFields: "பொருந்தும் புலங்கள் இல்லை. தளப் படிவங்கள் மாறுபடும்; கைமுறையாக நிரப்பவும்.", fillFail: "இந்தத் தாவலை நிரப்ப முடியவில்லை. நீட்டிப்பு அனுமதிகளைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
  },
  te: {
    title: "JanaSetu ఫారమ్ సహాయకుడు",
    intro: "పౌరుడు సమీక్షించిన JanaSetu JSON బ్యాకప్‌ను దిగుమతి చేయండి. సరిపోలే ఫీల్డ్‌లను చూసి, నింపే ముందు ప్రతి విలువకు ఆమోదం ఇవ్వండి.",
    backupLabel: "JanaSetu బ్యాకప్ ఎంచుకోండి (.json)", importBtn: "సమీక్షించిన ప్రొఫైల్ దిగుమతి చేయండి", fillBtn: "సరిపోలే ఫీల్డ్‌లను ప్రివ్యూ చేయండి", applyBtn: "ఎంచుకున్న ఫీల్డ్‌లను నింపండి", previewReady: "ప్రతి సూచించిన ఫీల్డ్‌ను పరిశీలించండి. మీరు ఆమోదించిన విలువలను మాత్రమే ఎంచుకోండి.", noSelection: "నింపడానికి కనీసం ఒక ఫీల్డ్‌ను ఎంచుకోండి.", stalePreview: "ప్రస్తుత ట్యాబ్ లేదా పేజీ మారింది. మళ్లీ ప్రివ్యూ చేయండి.",
    warning: "సరిపోలే ఫీల్డ్‌లను ప్రివ్యూ చేసి, మీరు ఆమోదించిన విలువలను మాత్రమే ఎంచుకోండి. ఈ ఎక్స్‌టెన్షన్ ఫారమ్‌లను సమర్పించదు లేదా పత్రాలను అప్‌లోడ్ చేయదు. పోర్టల్ స్క్రిప్ట్‌లు ఫీల్డ్ మార్పులకు స్పందించవచ్చు; కొనసాగించే ముందు నింపిన ప్రతి ఫీల్డ్‌ను తనిఖీ చేయండి.",
    chooseBackup: "ముందుగా JanaSetu JSON బ్యాకప్ ఎంచుకోండి.", invalidBackup: "JanaSetu బ్యాకప్ చెల్లదు.",
    imported: "ప్రొఫైల్ ఈ పరికరంలోని ఎక్స్‌టెన్షన్ నిల్వలో దిగుమతి చేయబడింది.", importFailed: "దిగుమతి విఫలమైంది.", profileFirst: "ముందుగా ప్రొఫైల్‌ను దిగుమతి చేయండి.",
    openPortal: "ముందుగా JanaSetu నుంచి అధికారిక పోర్టల్‌ను తెరవండి.", blockedDomain: ".gov.in లేదా .nic.in తో ముగిసే HTTPS ప్రభుత్వ పోర్టల్‌ను తెరిచి, పూర్తి URL ను JanaSetu అధికారిక లింక్‌తో సరిపోల్చి నిర్ధారణ చెక్‌బాక్స్‌ను ఎంచుకోండి.",
    verifyPortalLabel: 'ఈ వెబ్\u200cసైట్ చిరునామాను JanaSetu అధికారిక లింక్\u200cతో తనిఖీ చేశాను. ఇది వినియోగదారు-నిర్దేశిత ఫీల్డ్ సహాయం మాత్రమే, ప్రభుత్వ-అధికారిక సమీకరణ కాదు.',
    fillOk: "{count} సరిపోలే ఫీల్డ్‌లు నింపబడ్డాయి. ప్రతి విలువను తనిఖీ చేయండి. JanaSetu ఇక్కడే ఆగుతుంది; Next, Apply, Save లేదా Submit నొక్కదు. తదుపరి చర్యలు మీ నియంత్రణలో ఉంటాయి.", noFields: "సరిపోలే ఫీల్డ్‌లు కనబడలేదు. పోర్టల్ ఫారమ్‌లు వేరుగా ఉంటాయి; చేతితో నింపండి.", fillFail: "ఈ ట్యాబ్‌ను నింపలేకపోయాం. ఎక్స్‌టెన్షన్ అనుమతులను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి."
  },
  ml: {
    title: "JanaSetu ഫോം സഹായി",
    intro: "പൗരൻ പരിശോധിച്ച JanaSetu JSON ബാക്കപ്പ് ഇറക്കുമതി ചെയ്യുക. പൊരുത്തമുള്ള ഫീൽഡുകൾ പരിശോധിച്ച് പൂരിപ്പിക്കുന്നതിന് മുമ്പ് ഓരോ മൂല്യത്തിനും അംഗീകാരം നൽകുക.",
    backupLabel: "JanaSetu ബാക്കപ്പ് തിരഞ്ഞെടുക്കുക (.json)", importBtn: "പരിശോധിച്ച പ്രൊഫൈൽ ഇറക്കുമതി ചെയ്യുക", fillBtn: "പൊരുത്തമുള്ള ഫീൽഡുകൾ പ്രിവ്യൂ ചെയ്യുക", applyBtn: "തിരഞ്ഞെടുത്ത ഫീൽഡുകൾ പൂരിപ്പിക്കുക", previewReady: "ഓരോ നിർദ്ദേശിച്ച ഫീൽഡും പരിശോധിക്കുക. നിങ്ങൾ അംഗീകരിക്കുന്ന മൂല്യങ്ങൾ മാത്രം തിരഞ്ഞെടുക്കുക.", noSelection: "പൂരിപ്പിക്കാൻ കുറഞ്ഞത് ഒരു ഫീൽഡ് തിരഞ്ഞെടുക്കുക.", stalePreview: "സജീവ ടാബോ പേജോ മാറി. വീണ്ടും പ്രിവ്യൂ ചെയ്യുക.",
    warning: "പൊരുത്തമുള്ള ഫീൽഡുകൾ പ്രിവ്യൂ ചെയ്ത് നിങ്ങൾ അംഗീകരിക്കുന്ന മൂല്യങ്ങൾ മാത്രം തിരഞ്ഞെടുക്കുക. ഈ എക്സ്റ്റൻഷൻ ഫോമുകൾ സമർപ്പിക്കുകയോ രേഖകൾ അപ്‌ലോഡ് ചെയ്യുകയോ ഇല്ല. പോർട്ടൽ സ്ക്രിപ്റ്റുകൾ ഫീൽഡ് മാറ്റങ്ങളോട് പ്രതികരിക്കാം; തുടരുന്നതിന് മുമ്പ് പൂരിപ്പിച്ച എല്ലാ ഫീൽഡുകളും പരിശോധിക്കുക.",
    chooseBackup: "ആദ്യം JanaSetu JSON ബാക്കപ്പ് തിരഞ്ഞെടുക്കുക.", invalidBackup: "JanaSetu ബാക്കപ്പ് സാധുവല്ല.",
    imported: "പ്രൊഫൈൽ ഈ ഉപകരണത്തിലെ എക്സ്റ്റൻഷൻ സംഭരണത്തിലേക്ക് ഇറക്കുമതി ചെയ്തു.", importFailed: "ഇറക്കുമതി പരാജയപ്പെട്ടു.", profileFirst: "ആദ്യം പ്രൊഫൈൽ ഇറക്കുമതി ചെയ്യുക.",
    openPortal: "ആദ്യം JanaSetu-യിൽ നിന്ന് ഔദ്യോഗിക പോർട്ടൽ തുറക്കുക.", blockedDomain: ".gov.in അല്ലെങ്കിൽ .nic.in-ൽ അവസാനിക്കുന്ന HTTPS സർക്കാർ പോർട്ടൽ തുറന്ന്, പൂർണ്ണ URL JanaSetu ഔദ്യോഗിക ലിങ്കുമായി പരിശോധിച്ച് സ്ഥിരീകരണ ചെക്ക്ബോക്സ് തിരഞ്ഞെടുക്കുക.",
    verifyPortalLabel: 'ഈ വെബ്സൈറ്റ് വിലാസം JanaSetu ഔദ്യോഗിക ലിങ്കുമായി പരിശോധിച്ചു. ഇത് ഉപയോക്താവ് നിർദ്ദേശിക്കുന്ന ഫീൽഡ് സഹായം മാത്രമാണ്, സർക്കാർ അംഗീകരിച്ച സംയോജനം അല്ല.',
    fillOk: "{count} പൊരുത്തമുള്ള ഫീൽഡുകൾ പൂരിപ്പിച്ചു. ഓരോ മൂല്യവും പരിശോധിക്കുക. JanaSetu ഇവിടെ നിർത്തും; Next, Apply, Save അല്ലെങ്കിൽ Submit അമർത്തില്ല. തുടർനടപടികൾ നിങ്ങളുടെ നിയന്ത്രണത്തിലായിരിക്കും.", noFields: "പൊരുത്തമുള്ള ഫീൽഡുകളൊന്നും കണ്ടെത്തിയില്ല. പോർട്ടൽ ഫോമുകൾ വ്യത്യസ്തമാണ്; കൈകൊണ്ട് പൂരിപ്പിക്കുക.", fillFail: "ഈ ടാബ് പൂരിപ്പിക്കാൻ കഴിഞ്ഞില്ല. എക്സ്റ്റൻഷൻ അനുമതികൾ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക."
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
  const allowed = ["fullName","age","gender","state","district","residenceType","annualIncome","occupation","hasCultivableLand","pmKisanExcluded","ownsPuccaHouse","previousHousingBenefit","householdHasLpg","poorHouseholdDeclaration","isStudent","top20Percentile","regularUndergraduate","otherScholarship","diplomaOrDistance","dateOfBirth","sslcRegistrationNumber","casteCertificateRdNumber","incomeCertificateRdNumber","universityRegistrationNumber","taluk","assemblyConstituency","mobileNumber","emailAddress","addressLine1","addressLine2","villageOrTown","pincode","fatherOrGuardianName","motherName","socialCategory","landholdingAcres","institutionName","courseName","courseYear","rationCardCategory"];
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
  const textFields = ["dateOfBirth","sslcRegistrationNumber","casteCertificateRdNumber","incomeCertificateRdNumber","universityRegistrationNumber","taluk","assemblyConstituency","mobileNumber","emailAddress","addressLine1","addressLine2","villageOrTown","pincode","fatherOrGuardianName","motherName","institutionName","courseName","courseYear"];
  for (const key of textFields) if (profile[key] !== undefined && (typeof profile[key] !== "string" || profile[key].length > 160)) return false;
  if (profile.mobileNumber && !/^\+?[0-9]{10,13}$/.test(profile.mobileNumber.replace(/[\s-]/g,""))) return false;
  if (profile.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.emailAddress)) return false;
  if (profile.pincode && !/^[0-9]{6}$/.test(profile.pincode)) return false;
  if (profile.socialCategory !== undefined && !["","General","OBC","SC","ST","EWS","Other"].includes(profile.socialCategory)) return false;
  if (profile.rationCardCategory !== undefined && !["","AAY","PHH","BPL","APL","Other"].includes(profile.rationCardCategory)) return false;
  if (profile.landholdingAcres !== undefined && !(profile.landholdingAcres === "" || (typeof profile.landholdingAcres === "number" && Number.isFinite(profile.landholdingAcres) && profile.landholdingAcres >= 0 && profile.landholdingAcres <= 100000))) return false;
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
    clearPreview();
    setLanguage(language);
    say("imported");
  } catch (error) { say("importFailed"); }
});

let pendingPreview=[];
let pendingTabId=null;
let pendingUrl="";
let pendingProfile=null;
let pendingSessionValues=null;
const sspAadhaarInput=document.getElementById("ssp-aadhaar");
const sspAadhaarGroup=document.getElementById("ssp-aadhaar-group");
sspAadhaarInput.addEventListener("input",()=>{sspAadhaarInput.value=sspAadhaarInput.value.replace(/\D/g,"").slice(0,12);});
const previewEl=document.getElementById("preview");
const applyButton=document.getElementById("apply");
function clearPreview(){
  const manual=document.getElementById("manual-steps");if(manual){manual.hidden=true;manual.textContent="";}
  pendingPreview=[];pendingTabId=null;pendingUrl="";pendingProfile=null;pendingSessionValues=null;
  previewEl.replaceChildren();applyButton.disabled=true;
}
function notifyHumanSteps(steps){
  if(!chrome.notifications?.create||!steps.length)return;
  try{chrome.notifications.create("janasetu-human-"+Date.now(),{type:"basic",iconUrl:chrome.runtime.getURL("notification.png"),title:"JanaSetu: action needed in browser",message:steps.join(" ").slice(0,240)},()=>{});}catch{}
}
function renderPreview(fields,manualSteps=[]){
  const manual=document.getElementById("manual-steps");
  if(manual&&manualSteps.length){manual.hidden=false;manual.textContent="Human steps required: "+manualSteps.join(" ");notifyHumanSteps(manualSteps);}
  previewEl.replaceChildren();applyButton.disabled=true;
  if(!Array.isArray(fields)||fields.length===0){say("noFields");return;}
  pendingPreview=fields;
  const note=document.createElement("p");note.className="preview-note";note.textContent=getCopy("previewReady");previewEl.append(note);
  for(const field of fields){
    const row=document.createElement("label");row.className="preview-row";
    const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.dataset.index=String(field.index);
    checkbox.addEventListener("change",()=>{applyButton.disabled=!previewEl.querySelector("input[type=checkbox]:checked");});
    const text=document.createElement("span");
    const title=document.createElement("strong");title.textContent=String(field.label||field.key);
    const value=document.createElement("small");value.textContent=String(field.value??"")+(field.valid===false?" — "+String(field.reason||"Manual validation required."):"");
    if(field.valid===false)checkbox.disabled=true;
    text.append(title,value);row.append(checkbox,text);previewEl.append(row);
  }
  say("previewReady");
}
function getApprovedFields(){
  return [...previewEl.querySelectorAll("input[type=checkbox]:checked")].map(input=>{
    const index=Number(input.dataset.index);
    const field=pendingPreview.find(item=>item.index===index);
    return field?{index:field.index,fingerprint:field.fingerprint}:null;
  }).filter(Boolean);
}
// Citizen-directed browser assistance. The citizen verifies the exact HTTPS
// address against JanaSetu's official source link for every preview/fill session.
// This is not a department-authorized integration and does not certify the page.
const verifyPortalCheckbox=document.getElementById("verify-portal");
const activeSiteEl=document.getElementById("active-site");
async function getCitizenConfirmedPortalTab(){
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab?.id||!tab.url){say("openPortal");return null;}
  let portalUrl;
  try{portalUrl=new URL(tab.url);}catch{say("blockedDomain");return null;}
  const host=portalUrl.hostname.toLowerCase();
  const governmentHost=host==="gov.in"||host.endsWith(".gov.in")||host==="nic.in"||host.endsWith(".nic.in");
  if(portalUrl.protocol!=="https:"||!governmentHost){say("blockedDomain");return null;}
  if(activeSiteEl.textContent&&activeSiteEl.textContent!=="Not checked yet"&&activeSiteEl.textContent!==portalUrl.href){verifyPortalCheckbox.checked=false;sspAadhaarInput.value="";}
  activeSiteEl.textContent=portalUrl.href;
  sspAadhaarGroup.hidden=host!=="ssp.postmatric.karnataka.gov.in";
  if(!verifyPortalCheckbox.checked){say("blockedDomain");return null;}
  return tab;
}
document.getElementById("fill").addEventListener("click",async()=>{
  try{
    await popupReady;clearPreview();
    const {profile,language}=await chrome.storage.local.get(["profile","language"]);
    setLanguage(language||currentLanguage);
    if(!profile){say("profileFirst");return;}
    if(!isValidProfile(profile)){say("invalidBackup");return;}
    const tab=await getCitizenConfirmedPortalTab();if(!tab)return;
    const isSspPage=new URL(tab.url).hostname.toLowerCase()==="ssp.postmatric.karnataka.gov.in";
    const enteredAadhaar=sspAadhaarInput.value.trim();
    if(enteredAadhaar&&!isSspPage){sspAadhaarInput.value="";statusEl.textContent="This one-time field is only available on the exact Karnataka SSP page.";return;}
    if(enteredAadhaar&&!/^[0-9]{12}$/.test(enteredAadhaar)){document.getElementById("status").textContent="Enter exactly 12 digits for the SSP-only session field, or leave it blank.";return;}
    const sessionValues={aadhaarNumber:isSspPage?enteredAadhaar:""};
    const normalizedProfile={...profile,occupation:normalizeOccupation(profile.occupation)};
    const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:fillProfileInPage,args:[normalizedProfile,null,sessionValues]});
    const fields=result?.[0]?.result?.preview||[];
    const manualSteps=result?.[0]?.result?.manualSteps||[];
    if(!fields.length){if(manualSteps.length)renderPreview([],manualSteps);else say("noFields");return;}
    pendingTabId=tab.id;pendingUrl=tab.url;pendingProfile=normalizedProfile;pendingSessionValues=sessionValues;
    renderPreview(fields,manualSteps);
  }catch(error){clearPreview();say("fillFail");}
});
applyButton.addEventListener("click",async()=>{
  try{
    await popupReady;
    const selected=getApprovedFields();
    if(!selected.length){say("noSelection");return;}
    const tab=await getCitizenConfirmedPortalTab();if(!tab)return;
    if(tab.id!==pendingTabId||tab.url!==pendingUrl||!verifyPortalCheckbox.checked){clearPreview();say("stalePreview");return;}
    const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:fillProfileInPage,args:[pendingProfile,selected,pendingSessionValues||{}]});
    const filled=result?.[0]?.result?.filled??0;
    const stale=result?.[0]?.result?.stale??0;
    const manualSteps=result?.[0]?.result?.manualSteps||[];
    if(manualSteps.length)notifyHumanSteps(manualSteps);
    if(filled)sspAadhaarInput.value="";
    clearPreview();
    if(filled)say("fillOk",{count:filled});else if(stale)say("stalePreview");else say("noFields");
  }catch(error){clearPreview();say("fillFail");}
});
