const statusEl = document.getElementById("status");
const COPY = {
  en: {
    title: "JanaSetu Form Assistant",
    intro: "Import a citizen-reviewed JanaSetu JSON backup, preview matching fields and approve each value before filling.",
    backupLabel: "Select JanaSetu backup (.json)", importBtn: "Import reviewed profile", fillBtn: "Preview matching fields", applyBtn: "Fill selected fields", previewReady: "Review each suggested field. Select only the values you approve.", noSelection: "Select at least one field to fill.", stalePreview: "The active tab or page changed. Preview the fields again before filling.",
    warning: "Preview the matching fields and select each value you approve. The extension never submits forms or uploads documents. Portal scripts may react to field changes; check every filled field before continuing.",
    chooseBackup: "Choose a JanaSetu JSON backup first.", invalidBackup: "Invalid JanaSetu backup.",
    imported: "Profile imported into extension storage on this device.", importFailed: "Import failed.", profileFirst: "Import a profile first.",
    openPortal: "Open an official government portal tab first.", blockedDomain: "For safety, autofill is limited to HTTPS .gov.in and .nic.in portals. Use manual entry on other sites.",
    fillOk: "Filled {count} matching field(s). Review every value, then submit yourself on the official portal. JanaSetu does not submit it.", noFields: "No matching fields found. Portal forms vary; fill them manually.", fillFail: "Could not fill this tab. Check extension permissions and try again."
  },
  hi: {
    title: "JanaSetu फ़ॉर्म सहायक",
    intro: "नागरिक द्वारा जाँचा गया JanaSetu JSON बैकअप आयात करें। फ़ील्ड देखें और भरने से पहले हर मान को मंज़ूरी दें।",
    backupLabel: "JanaSetu बैकअप चुनें (.json)", importBtn: "जाँची गई प्रोफ़ाइल आयात करें", fillBtn: "मिलते-जुलते फ़ील्ड देखें", applyBtn: "चुने हुए फ़ील्ड भरें", previewReady: "हर सुझाए गए फ़ील्ड की समीक्षा करें और केवल स्वीकृत मान चुनें।", noSelection: "भरने के लिए कम से कम एक फ़ील्ड चुनें।", stalePreview: "सक्रिय टैब या पेज बदल गया है। फिर से फ़ील्ड देखें।",
    warning: "मिलते-जुलते फ़ील्ड देखें और हर स्वीकृत मान चुनें। यह एक्सटेंशन फ़ॉर्म जमा या दस्तावेज़ अपलोड नहीं करता। पोर्टल की स्क्रिप्ट फ़ील्ड बदलने पर प्रतिक्रिया दे सकती हैं; आगे बढ़ने से पहले भरे गए सभी फ़ील्ड जाँचें।",
    chooseBackup: "पहले JanaSetu JSON बैकअप चुनें।", invalidBackup: "JanaSetu बैकअप मान्य नहीं है।",
    imported: "प्रोफ़ाइल इस डिवाइस के एक्सटेंशन स्टोरेज में आयात की गई।", importFailed: "आयात विफल हुआ।", profileFirst: "पहले प्रोफ़ाइल आयात करें।",
    openPortal: "पहले सरकारी पोर्टल का टैब खोलें।", blockedDomain: "सुरक्षा के लिए ऑटोफ़िल केवल HTTPS .gov.in और .nic.in पोर्टलों पर उपलब्ध है। अन्य साइटों पर जानकारी स्वयं भरें।",
    fillOk: "{count} मिलते-जुलते फ़ील्ड भरे गए। हर मान जाँचें और आधिकारिक पोर्टल पर स्वयं जमा करें। JanaSetu आवेदन जमा नहीं करता।", noFields: "कोई मिलान फ़ील्ड नहीं मिला। पोर्टल फ़ॉर्म अलग होते हैं; जानकारी स्वयं भरें।", fillFail: "इस टैब को भर नहीं सके। एक्सटेंशन अनुमतियाँ जाँचकर पुनः प्रयास करें।"
  },
  kn: {
    title: "JanaSetu ಫಾರ್ಮ್ ಸಹಾಯಕ",
    intro: "ನಾಗರಿಕ ಪರಿಶೀಲಿಸಿದ JanaSetu JSON ಬ್ಯಾಕಪ್ ಆಮದು ಮಾಡಿ. ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ನೋಡಿ, ತುಂಬುವ ಮೊದಲು ಪ್ರತಿಯೊಂದು ಮೌಲ್ಯಕ್ಕೂ ಅನುಮೋದನೆ ನೀಡಿ.",
    backupLabel: "JanaSetu ಬ್ಯಾಕಪ್ ಆಯ್ಕೆಮಾಡಿ (.json)", importBtn: "ಪರಿಶೀಲಿಸಿದ ಪ್ರೊಫೈಲ್ ಆಮದು ಮಾಡಿ", fillBtn: "ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಪೂರ್ವವೀಕ್ಷಿಸಿ", applyBtn: "ಆಯ್ದ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಿ", previewReady: "ಪ್ರತಿ ಸೂಚಿಸಿದ ಕ್ಷೇತ್ರವನ್ನು ಪರಿಶೀಲಿಸಿ. ನೀವು ಅನುಮೋದಿಸಿದ ಮೌಲ್ಯಗಳನ್ನು ಮಾತ್ರ ಆಯ್ಕೆಮಾಡಿ.", noSelection: "ತುಂಬಲು ಕನಿಷ್ಠ ಒಂದು ಕ್ಷೇತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.", stalePreview: "ಸಕ್ರಿಯ ಟ್ಯಾಬ್ ಅಥವಾ ಪುಟ ಬದಲಾಗಿದೆ. ಮತ್ತೆ ಪೂರ್ವವೀಕ್ಷಿಸಿ.",
    warning: "ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಪೂರ್ವವೀಕ್ಷಿಸಿ ಮತ್ತು ನೀವು ಅನುಮೋದಿಸುವ ಪ್ರತಿಯೊಂದು ಮೌಲ್ಯವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ. ವಿಸ್ತರಣೆ ಫಾರ್ಮ್ ಸಲ್ಲಿಸುವುದಿಲ್ಲ ಅಥವಾ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡುವುದಿಲ್ಲ. ಪೋರ್ಟಲ್ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳು ಕ್ಷೇತ್ರ ಬದಲಾವಣೆಗಳಿಗೆ ಪ್ರತಿಕ್ರಿಯಿಸಬಹುದು; ಮುಂದುವರಿಯುವ ಮೊದಲು ತುಂಬಿದ ಎಲ್ಲ ಕ್ಷೇತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    chooseBackup: "ಮೊದಲು JanaSetu JSON ಬ್ಯಾಕಪ್ ಆಯ್ಕೆಮಾಡಿ.", invalidBackup: "JanaSetu ಬ್ಯಾಕಪ್ ಮಾನ್ಯವಾಗಿಲ್ಲ.",
    imported: "ಪ್ರೊಫೈಲ್ ಈ ಸಾಧನದ ವಿಸ್ತರಣೆ ಸಂಗ್ರಹಣೆಗೆ ಆಮದು ಮಾಡಲಾಗಿದೆ.", importFailed: "ಆಮದು ವಿಫಲವಾಗಿದೆ.", profileFirst: "ಮೊದಲು ಪ್ರೊಫೈಲ್ ಆಮದು ಮಾಡಿ.",
    openPortal: "ಮೊದಲು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್ ಟ್ಯಾಬ್ ತೆರೆಯಿರಿ.", blockedDomain: "ಸುರಕ್ಷತೆಗಾಗಿ HTTPS .gov.in ಮತ್ತು .nic.in ಪೋರ್ಟಲ್‌ಗಳಲ್ಲಿ ಮಾತ್ರ ಸ್ವಯಂ-ಭರ್ತಿ ಅನುಮತಿಸಲಾಗಿದೆ. ಇತರ ತಾಣಗಳಲ್ಲಿ ಕೈಯಾರೆ ನಮೂದಿಸಿ.",
    fillOk: "{count} ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಲಾಗಿದೆ. ಪ್ರತಿಯೊಂದು ಮೌಲ್ಯ ಪರಿಶೀಲಿಸಿ, ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನೀವೇ ಸಲ್ಲಿಸಿ. JanaSetu ಸಲ್ಲಿಸುವುದಿಲ್ಲ.", noFields: "ಹೊಂದಾಣಿಕೆಯ ಕ್ಷೇತ್ರಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಪೋರ್ಟಲ್ ಫಾರ್ಮ್‌ಗಳು ಬದಲಾಗುತ್ತವೆ; ಕೈಯಾರೆ ತುಂಬಿ.", fillFail: "ಈ ಟ್ಯಾಬ್ ತುಂಬಲಾಗಲಿಲ್ಲ. ವಿಸ್ತರಣೆ ಅನುಮತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
  },
  ta: {
    title: "JanaSetu படிவ உதவியாளர்",
    intro: "குடிமகன் சரிபார்த்த JanaSetu JSON காப்புப்பிரதியை இறக்குமதி செய்யவும். பொருந்தும் புலங்களைப் பார்த்து, நிரப்புவதற்கு முன் ஒவ்வொரு மதிப்பையும் ஒப்புதல் அளிக்கவும்.",
    backupLabel: "JanaSetu காப்புப்பிரதியைத் தேர்ந்தெடுக்கவும் (.json)", importBtn: "சரிபார்த்த சுயவிவரத்தை இறக்குமதி செய்", fillBtn: "பொருந்தும் புலங்களை முன்னோட்டம் காண்க", applyBtn: "தேர்ந்தெடுத்த புலங்களை நிரப்பு", previewReady: "ஒவ்வொரு பரிந்துரைக்கப்பட்ட புலத்தையும் சரிபார்த்து, நீங்கள் ஒப்புதல் அளிக்கும் மதிப்புகளை மட்டும் தேர்ந்தெடுக்கவும்.", noSelection: "நிரப்ப குறைந்தது ஒரு புலத்தைத் தேர்ந்தெடுக்கவும்.", stalePreview: "செயலில் உள்ள தாவல் அல்லது பக்கம் மாறிவிட்டது. மீண்டும் முன்னோட்டம் காண்க.",
    warning: "பொருந்தும் புலங்களை முன்னோட்டம் பார்த்து, நீங்கள் ஒப்புதல் அளிக்கும் மதிப்புகளைத் தேர்ந்தெடுக்கவும். இந்த நீட்டிப்பு படிவங்களைச் சமர்ப்பிக்கவோ ஆவணங்களைப் பதிவேற்றவோ செய்யாது. போர்டல் ஸ்கிரிப்டுகள் புல மாற்றங்களுக்கு பதிலளிக்கலாம்; தொடர்வதற்கு முன் நிரப்பிய அனைத்துப் புலங்களையும் சரிபார்க்கவும்.",
    chooseBackup: "முதலில் JanaSetu JSON காப்புப்பிரதியைத் தேர்ந்தெடுக்கவும்.", invalidBackup: "JanaSetu காப்புப்பிரதி செல்லுபடியாகாது.",
    imported: "சுயவிவரம் இந்தச் சாதனத்தின் நீட்டிப்பு சேமிப்பகத்தில் இறக்குமதி செய்யப்பட்டது.", importFailed: "இறக்குமதி தோல்வியடைந்தது.", profileFirst: "முதலில் சுயவிவரத்தை இறக்குமதி செய்யவும்.",
    openPortal: "முதலில் அதிகாரப்பூர்வ அரசு தாவலைத் திறக்கவும்.", blockedDomain: "பாதுகாப்புக்காக HTTPS .gov.in மற்றும் .nic.in தளங்களில் மட்டுமே தானியங்கி நிரப்பு அனுமதிக்கப்படுகிறது. பிற தளங்களில் கைமுறையாக உள்ளிடவும்.",
    fillOk: "{count} பொருந்தும் புலங்கள் நிரப்பப்பட்டன. ஒவ்வொரு மதிப்பையும் சரிபார்த்து அதிகாரப்பூர்வ தளத்தில் நீங்களே சமர்ப்பிக்கவும். JanaSetu சமர்ப்பிக்காது.", noFields: "பொருந்தும் புலங்கள் இல்லை. தளப் படிவங்கள் மாறுபடும்; கைமுறையாக நிரப்பவும்.", fillFail: "இந்தத் தாவலை நிரப்ப முடியவில்லை. நீட்டிப்பு அனுமதிகளைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
  },
  te: {
    title: "JanaSetu ఫారమ్ సహాయకుడు",
    intro: "పౌరుడు సమీక్షించిన JanaSetu JSON బ్యాకప్‌ను దిగుమతి చేయండి. సరిపోలే ఫీల్డ్‌లను చూసి, నింపే ముందు ప్రతి విలువకు ఆమోదం ఇవ్వండి.",
    backupLabel: "JanaSetu బ్యాకప్ ఎంచుకోండి (.json)", importBtn: "సమీక్షించిన ప్రొఫైల్ దిగుమతి చేయండి", fillBtn: "సరిపోలే ఫీల్డ్‌లను ప్రివ్యూ చేయండి", applyBtn: "ఎంచుకున్న ఫీల్డ్‌లను నింపండి", previewReady: "ప్రతి సూచించిన ఫీల్డ్‌ను పరిశీలించండి. మీరు ఆమోదించిన విలువలను మాత్రమే ఎంచుకోండి.", noSelection: "నింపడానికి కనీసం ఒక ఫీల్డ్‌ను ఎంచుకోండి.", stalePreview: "ప్రస్తుత ట్యాబ్ లేదా పేజీ మారింది. మళ్లీ ప్రివ్యూ చేయండి.",
    warning: "సరిపోలే ఫీల్డ్‌లను ప్రివ్యూ చేసి, మీరు ఆమోదించిన విలువలను మాత్రమే ఎంచుకోండి. ఈ ఎక్స్‌టెన్షన్ ఫారమ్‌లను సమర్పించదు లేదా పత్రాలను అప్‌లోడ్ చేయదు. పోర్టల్ స్క్రిప్ట్‌లు ఫీల్డ్ మార్పులకు స్పందించవచ్చు; కొనసాగించే ముందు నింపిన ప్రతి ఫీల్డ్‌ను తనిఖీ చేయండి.",
    chooseBackup: "ముందుగా JanaSetu JSON బ్యాకప్ ఎంచుకోండి.", invalidBackup: "JanaSetu బ్యాకప్ చెల్లదు.",
    imported: "ప్రొఫైల్ ఈ పరికరంలోని ఎక్స్‌టెన్షన్ నిల్వలో దిగుమతి చేయబడింది.", importFailed: "దిగుమతి విఫలమైంది.", profileFirst: "ముందుగా ప్రొఫైల్‌ను దిగుమతి చేయండి.",
    openPortal: "ముందుగా అధికారిక ప్రభుత్వ పోర్టల్ ట్యాబ్‌ను తెరవండి.", blockedDomain: "భద్రత కోసం HTTPS .gov.in మరియు .nic.in పోర్టల్‌లలో మాత్రమే ఆటోఫిల్ అనుమతించబడుతుంది. ఇతర సైట్‌లలో చేతితో నమోదు చేయండి.",
    fillOk: "{count} సరిపోలే ఫీల్డ్‌లు నింపబడ్డాయి. ప్రతి విలువను తనిఖీ చేసి అధికారిక పోర్టల్‌లో మీరే సమర్పించండి. JanaSetu సమర్పించదు.", noFields: "సరిపోలే ఫీల్డ్‌లు కనబడలేదు. పోర్టల్ ఫారమ్‌లు వేరుగా ఉంటాయి; చేతితో నింపండి.", fillFail: "ఈ ట్యాబ్‌ను నింపలేకపోయాం. ఎక్స్‌టెన్షన్ అనుమతులను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి."
  },
  ml: {
    title: "JanaSetu ഫോം സഹായി",
    intro: "പൗരൻ പരിശോധിച്ച JanaSetu JSON ബാക്കപ്പ് ഇറക്കുമതി ചെയ്യുക. പൊരുത്തമുള്ള ഫീൽഡുകൾ പരിശോധിച്ച് പൂരിപ്പിക്കുന്നതിന് മുമ്പ് ഓരോ മൂല്യത്തിനും അംഗീകാരം നൽകുക.",
    backupLabel: "JanaSetu ബാക്കപ്പ് തിരഞ്ഞെടുക്കുക (.json)", importBtn: "പരിശോധിച്ച പ്രൊഫൈൽ ഇറക്കുമതി ചെയ്യുക", fillBtn: "പൊരുത്തമുള്ള ഫീൽഡുകൾ പ്രിവ്യൂ ചെയ്യുക", applyBtn: "തിരഞ്ഞെടുത്ത ഫീൽഡുകൾ പൂരിപ്പിക്കുക", previewReady: "ഓരോ നിർദ്ദേശിച്ച ഫീൽഡും പരിശോധിക്കുക. നിങ്ങൾ അംഗീകരിക്കുന്ന മൂല്യങ്ങൾ മാത്രം തിരഞ്ഞെടുക്കുക.", noSelection: "പൂരിപ്പിക്കാൻ കുറഞ്ഞത് ഒരു ഫീൽഡ് തിരഞ്ഞെടുക്കുക.", stalePreview: "സജീവ ടാബോ പേജോ മാറി. വീണ്ടും പ്രിവ്യൂ ചെയ്യുക.",
    warning: "പൊരുത്തമുള്ള ഫീൽഡുകൾ പ്രിവ്യൂ ചെയ്ത് നിങ്ങൾ അംഗീകരിക്കുന്ന മൂല്യങ്ങൾ മാത്രം തിരഞ്ഞെടുക്കുക. ഈ എക്സ്റ്റൻഷൻ ഫോമുകൾ സമർപ്പിക്കുകയോ രേഖകൾ അപ്‌ലോഡ് ചെയ്യുകയോ ഇല്ല. പോർട്ടൽ സ്ക്രിപ്റ്റുകൾ ഫീൽഡ് മാറ്റങ്ങളോട് പ്രതികരിക്കാം; തുടരുന്നതിന് മുമ്പ് പൂരിപ്പിച്ച എല്ലാ ഫീൽഡുകളും പരിശോധിക്കുക.",
    chooseBackup: "ആദ്യം JanaSetu JSON ബാക്കപ്പ് തിരഞ്ഞെടുക്കുക.", invalidBackup: "JanaSetu ബാക്കപ്പ് സാധുവല്ല.",
    imported: "പ്രൊഫൈൽ ഈ ഉപകരണത്തിലെ എക്സ്റ്റൻഷൻ സംഭരണത്തിലേക്ക് ഇറക്കുമതി ചെയ്തു.", importFailed: "ഇറക്കുമതി പരാജയപ്പെട്ടു.", profileFirst: "ആദ്യം പ്രൊഫൈൽ ഇറക്കുമതി ചെയ്യുക.",
    openPortal: "ആദ്യം ഔദ്യോഗിക സർക്കാർ പോർട്ടൽ ടാബ് തുറക്കുക.", blockedDomain: "സുരക്ഷയ്ക്കായി HTTPS .gov.in, .nic.in പോർട്ടലുകളിൽ മാത്രമാണ് ഓട്ടോഫിൽ അനുവദിക്കുന്നത്. മറ്റ് സൈറ്റുകളിൽ കൈകൊണ്ട് നൽകുക.",
    fillOk: "{count} പൊരുത്തമുള്ള ഫീൽഡുകൾ പൂരിപ്പിച്ചു. ഓരോ മൂല്യവും പരിശോധിച്ച് ഔദ്യോഗിക പോർട്ടലിൽ നിങ്ങൾ തന്നെ സമർപ്പിക്കുക. JanaSetu സമർപ്പിക്കില്ല.", noFields: "പൊരുത്തമുള്ള ഫീൽഡുകളൊന്നും കണ്ടെത്തിയില്ല. പോർട്ടൽ ഫോമുകൾ വ്യത്യസ്തമാണ്; കൈകൊണ്ട് പൂരിപ്പിക്കുക.", fillFail: "ഈ ടാബ് പൂരിപ്പിക്കാൻ കഴിഞ്ഞില്ല. എക്സ്റ്റൻഷൻ അനുമതികൾ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക."
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
  const allowed = ["fullName","age","gender","state","district","residenceType","annualIncome","occupation","hasCultivableLand","pmKisanExcluded","ownsPuccaHouse","previousHousingBenefit","householdHasLpg","poorHouseholdDeclaration","isStudent","top20Percentile","regularUndergraduate","otherScholarship","diplomaOrDistance","mobileNumber","emailAddress","addressLine1","addressLine2","villageOrTown","pincode","fatherOrGuardianName","motherName","socialCategory","landholdingAcres","institutionName","courseName","courseYear","rationCardCategory"];
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
  const textFields = ["mobileNumber","emailAddress","addressLine1","addressLine2","villageOrTown","pincode","fatherOrGuardianName","motherName","institutionName","courseName","courseYear"];
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
const previewEl=document.getElementById("preview");
const applyButton=document.getElementById("apply");
function clearPreview(){
  pendingPreview=[];pendingTabId=null;pendingUrl="";pendingProfile=null;
  previewEl.replaceChildren();applyButton.disabled=true;
}
function renderPreview(fields){
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
async function getApprovedPortalTab(){
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab?.id||!tab.url){say("openPortal");return null;}
  const portalUrl=new URL(tab.url);const host=portalUrl.hostname.toLowerCase();
  const approvedHost=portalUrl.protocol === "https:"&&(host==="gov.in"||host.endsWith(".gov.in")||host==="nic.in"||host.endsWith(".nic.in"));
  if(!approvedHost){say("blockedDomain");return null;}
  return tab;
}
document.getElementById("fill").addEventListener("click",async()=>{
  try{
    await popupReady;clearPreview();
    const {profile,language}=await chrome.storage.local.get(["profile","language"]);
    setLanguage(language||currentLanguage);
    if(!profile){say("profileFirst");return;}
    if(!isValidProfile(profile)){say("invalidBackup");return;}
    const tab=await getApprovedPortalTab();if(!tab)return;
    const normalizedProfile={...profile,occupation:normalizeOccupation(profile.occupation)};
    const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:fillProfileInPage,args:[normalizedProfile]});
    const fields=result?.[0]?.result?.preview||[];
    if(!fields.length){say("noFields");return;}
    pendingTabId=tab.id;pendingUrl=tab.url;pendingProfile=normalizedProfile;
    renderPreview(fields);
  }catch(error){clearPreview();say("fillFail");}
});
applyButton.addEventListener("click",async()=>{
  try{
    await popupReady;
    const selected=getApprovedFields();
    if(!selected.length){say("noSelection");return;}
    const tab=await getApprovedPortalTab();if(!tab)return;
    if(tab.id!==pendingTabId||tab.url!==pendingUrl){clearPreview();say("stalePreview");return;}
    const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:fillProfileInPage,args:[pendingProfile,selected]});
    const filled=result?.[0]?.result?.filled??0;
    const stale=result?.[0]?.result?.stale??0;
    clearPreview();
    if(filled)say("fillOk",{count:filled});else if(stale)say("stalePreview");else say("noFields");
  }catch(error){clearPreview();say("fillFail");}
});
