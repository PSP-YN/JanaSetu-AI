"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Bell, BookOpen, Download, ExternalLink,
  Building2, CalendarClock, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleAlert, ClipboardCheck, Clock3, FileCheck2, FileText, Globe2, HandHeart,
  House, IndianRupee, Landmark, LayoutDashboard, ListChecks, LockKeyhole,
  MessageCircle, Search, ShieldCheck, Sparkles, Sprout, Upload, UserRound, Mic,
  Users, Wallet, X, Menu, GraduationCap, Leaf
} from "lucide-react";
import {
  LANGUAGE_OPTIONS, SCHEMES, STATES_AND_UTS,
  type Assessment, type CitizenProfile, type LanguageCode
} from "@/lib/catalog";

type Tab = "overview" | "discover" | "profile" | "documents" | "applications" | "about";
type DraftField = { key: string; label: string; value: string; source: string; status: "provided" | "missing" };
type LocalApplication = {
  id: string; schemeId: string; schemeName: string; citizenName: string;
  state: string; district: string; status: string; createdAt: string;
  reviewRequired: boolean; missingChecks: string[]; sourceUrl: string; disclaimer: string;
  fields?: DraftField[]; reviewedAt?: string | null;
};
type LocalDocument = { id: string; name: string; type: string; size: number; addedAt: string; status: string };
type LocalTask = { id: string; title: string; dueAt: string; status: string; note: string };

const STORAGE = {
  profile: "janSetu.profile.v1",
  language: "janSetu.language.v1",
  applications: "janSetu.applications.v1",
  documents: "janSetu.documents.v1",
  tasks: "janSetu.tasks.v1",
  assessments: "janSetu.assessments.v1"
};

const EMPTY_PROFILE: CitizenProfile = {
  fullName: "", age: "", gender: "", state: "", district: "", residenceType: "",
  annualIncome: "", occupation: "", hasCultivableLand: null, pmKisanExcluded: "unknown",
  ownsPuccaHouse: null, previousHousingBenefit: "unknown", householdHasLpg: null,
  poorHouseholdDeclaration: null, isStudent: false, top20Percentile: null,
  regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
};

const SAMPLE_PROFILE: CitizenProfile = {
  fullName: "Ananya Rao", age: 34, gender: "woman", state: "Karnataka", district: "Mysuru",
  residenceType: "urban", annualIncome: 150000, occupation: "Farmer",
  hasCultivableLand: true, pmKisanExcluded: "no", ownsPuccaHouse: false,
  previousHousingBenefit: "no", householdHasLpg: false, poorHouseholdDeclaration: true,
  isStudent: false, top20Percentile: null, regularUndergraduate: null,
  otherScholarship: null, diplomaOrDistance: null
};

const COPY: Record<LanguageCode, Record<string, string>> = {
  en: {
    overview: "Overview", discover: "Find benefits", profile: "My profile", documents: "Documents",
    applications: "My applications", about: "How it works", hello: "Government benefits, made easier to access.",
    intro: "A clearer path from your circumstances to the support you may be able to access.",
    start: "Start eligibility check", sample: "Try sample household", search: "Search schemes or support",
    verified: "Source-linked catalogue", next: "Your next steps", featured: "Potential benefit pathways",
    reviewed: "Reviewed scheme records", coverage: "Profile coverage", languages: "Interface languages",
    screening: "Screening workspace", run: "Run benefit assessment", save: "Save profile",
    saved: "Profile saved in this browser", view: "View details", prepare: "Prepare draft",
    noResult: "No screening results yet", noResultText: "Complete your profile and run an assessment to see relevant pathways.",
    match: "Potential match", review: "Needs verification", noMatch: "Not matched",
    source: "Official source", privacy: "Profiles and drafts are saved in this browser. Assessment and draft requests send relevant fields to the app server for processing; do not enter sensitive identifiers.",
    profileTitle: "Build your citizen profile", profileText: "Share only the details needed to screen the pathways in this catalogue.",
    documentsTitle: "Document checklist", documentsText: "Add file references to organize what you have. Prototype files are not uploaded to a server.",
    applicationsTitle: "Application workspace", applicationsText: "Drafts are preparation records. Nothing here has been submitted to a government portal.",
    language: "Language", allIndia: "Designed for every State and Union Territory", catalogue: "Curated central-government scheme pilot catalogue",
    official: "Official decision remains with the department", noUpload: "Files are not uploaded"
  },
  hi: {
    overview: "अवलोकन", discover: "लाभ खोजें", profile: "मेरी प्रोफ़ाइल", documents: "दस्तावेज़",
    applications: "मेरे आवेदन", about: "यह कैसे काम करता है", hello: "सरकारी योजनाओं और लाभों तक आसान पहुँच।",
    intro: "आपकी परिस्थितियों से संभावित सहायता तक एक स्पष्ट रास्ता।", start: "पात्रता जाँच शुरू करें",
    sample: "डेमो परिवार आज़माएँ", search: "योजनाएँ या सहायता खोजें", verified: "स्रोत-संदर्भित सूची",
    next: "आपके अगले कदम", featured: "संभावित लाभ के रास्ते", reviewed: "समीक्षित योजना रिकॉर्ड",
    coverage: "प्रोफ़ाइल कवरेज", languages: "इंटरफ़ेस भाषाएँ", screening: "जाँच कार्यक्षेत्र",
    run: "लाभ आकलन चलाएँ", save: "प्रोफ़ाइल सहेजें", saved: "प्रोफ़ाइल इस ब्राउज़र में सहेजी गई",
    view: "विवरण देखें", prepare: "ड्राफ़्ट तैयार करें", noResult: "अभी कोई जाँच परिणाम नहीं",
    noResultText: "प्रासंगिक विकल्प देखने के लिए प्रोफ़ाइल पूरी करें और आकलन चलाएँ।",
    match: "संभावित मिलान", review: "सत्यापन आवश्यक", noMatch: "मिलान नहीं",
    source: "आधिकारिक स्रोत", privacy: "प्रोफ़ाइल और ड्राफ़्ट इसी ब्राउज़र में सहेजे जाते हैं। जाँच और ड्राफ़्ट अनुरोधों में संबंधित जानकारी ऐप सर्वर पर प्रसंस्करण के लिए भेजी जाती है; संवेदनशील पहचान संख्या न डालें।",
    profileTitle: "अपनी नागरिक प्रोफ़ाइल बनाएँ", profileText: "केवल आवश्यक जानकारी साझा करें।",
    documentsTitle: "दस्तावेज़ सूची", documentsText: "अपने दस्तावेज़ व्यवस्थित करने के लिए फ़ाइल संदर्भ जोड़ें। फ़ाइलें सर्वर पर अपलोड नहीं होतीं।",
    applicationsTitle: "आवेदन कार्यक्षेत्र", applicationsText: "ये तैयारी के ड्राफ़्ट हैं; कोई आवेदन सरकारी पोर्टल पर जमा नहीं हुआ है।",
    language: "भाषा", allIndia: "हर राज्य और केंद्र शासित प्रदेश के लिए", catalogue: "चयनित केंद्रीय योजनाओं का पायलट",
    official: "अंतिम निर्णय संबंधित विभाग का होगा", noUpload: "फ़ाइलें अपलोड नहीं होतीं"
  },
  kn: {
    overview: "ಅವಲೋಕನ", discover: "ಸೌಲಭ್ಯಗಳನ್ನು ಹುಡುಕಿ", profile: "ನನ್ನ ಪ್ರೊಫೈಲ್", documents: "ದಾಖಲೆಗಳು",
    applications: "ನನ್ನ ಅರ್ಜಿಗಳು", about: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ", hello: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸೌಲಭ್ಯಗಳನ್ನು ಸುಲಭವಾಗಿ ಪಡೆಯಿರಿ.",
    intro: "ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯಿಂದ ಸಾಧ್ಯವಿರುವ ನೆರವಿನವರೆಗೆ ಸ್ಪಷ್ಟ ದಾರಿ.", start: "ಅರ್ಹತೆ ಪರಿಶೀಲನೆ ಪ್ರಾರಂಭಿಸಿ",
    sample: "ಮಾದರಿ ಕುಟುಂಬ ಪ್ರಯತ್ನಿಸಿ", search: "ಯೋಜನೆಗಳು ಅಥವಾ ನೆರವು ಹುಡುಕಿ", verified: "ಮೂಲ-ಸೂಚನೆಯ ಪಟ್ಟಿ",
    next: "ನಿಮ್ಮ ಮುಂದಿನ ಹಂತಗಳು", featured: "ಸಂಭಾವ್ಯ ಸೌಲಭ್ಯ ಮಾರ್ಗಗಳು", reviewed: "ಪರಿಶೀಲಿಸಿದ ಯೋಜನೆ ದಾಖಲೆಗಳು",
    coverage: "ಪ್ರೊಫೈಲ್ ವ್ಯಾಪ್ತಿ", languages: "ಇಂಟರ್ಫೇಸ್ ಭಾಷೆಗಳು", screening: "ಪರಿಶೀಲನಾ ಕಾರ್ಯಕ್ಷೇತ್ರ",
    run: "ಸೌಲಭ್ಯ ಮೌಲ್ಯಮಾಪನ ನಡೆಸಿ", save: "ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ", saved: "ಪ್ರೊಫೈಲ್ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ",
    view: "ವಿವರಗಳನ್ನು ನೋಡಿ", prepare: "ಕರಡು ಸಿದ್ಧಪಡಿಸಿ", noResult: "ಇನ್ನೂ ಪರಿಶೀಲನಾ ಫಲಿತಾಂಶಗಳಿಲ್ಲ",
    noResultText: "ಸಂಬಂಧಿತ ಮಾರ್ಗಗಳನ್ನು ನೋಡಲು ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ ಮತ್ತು ಮೌಲ್ಯಮಾಪನ ನಡೆಸಿ.",
    match: "ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ", review: "ಪರಿಶೀಲನೆ ಅಗತ್ಯ", noMatch: "ಹೊಂದಾಣಿಕೆ ಇಲ್ಲ",
    source: "ಅಧಿಕೃತ ಮೂಲ", privacy: "ಪ್ರೊಫೈಲ್ ಮತ್ತು ಕರಡುಗಳು ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಉಳಿಯುತ್ತವೆ. ಪರಿಶೀಲನೆ ಮತ್ತು ಕರಡು ವಿನಂತಿಗಳಲ್ಲಿ ಸಂಬಂಧಿತ ವಿವರಗಳು ಸಂಸ್ಕರಣೆಗೆ ಅಪ್ಲಿಕೇಶನ್ ಸರ್ವರ್‌ಗೆ ಕಳುಹಿಸಲಾಗುತ್ತವೆ; ಸೂಕ್ಷ್ಮ ಗುರುತು ಸಂಖ್ಯೆಗಳು ನಮೂದಿಸಬೇಡಿ.",
    profileTitle: "ನಿಮ್ಮ ನಾಗರಿಕ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ", profileText: "ಅಗತ್ಯವಿರುವ ವಿವರಗಳನ್ನು ಮಾತ್ರ ಹಂಚಿಕೊಳ್ಳಿ.",
    documentsTitle: "ದಾಖಲೆಗಳ ಪಟ್ಟಿ", documentsText: "ದಾಖಲೆಗಳನ್ನು ವ್ಯವಸ್ಥಿತಗೊಳಿಸಲು ಫೈಲ್ ವಿವರ ಸೇರಿಸಿ. ಫೈಲ್‌ಗಳು ಸರ್ವರ್‌ಗೆ ಅಪ್‌ಲೋಡ್ ಆಗುವುದಿಲ್ಲ.",
    applicationsTitle: "ಅರ್ಜಿ ಕಾರ್ಯಕ್ಷೇತ್ರ", applicationsText: "ಇವು ಕರಡು ದಾಖಲೆಗಳು ಮಾತ್ರ; ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗೆ ಸಲ್ಲಿಸಲಾಗಿಲ್ಲ.",
    language: "ಭಾಷೆ", allIndia: "ಪ್ರತಿ ರಾಜ್ಯ ಮತ್ತು ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶಕ್ಕಾಗಿ", catalogue: "ಆಯ್ದ ಕೇಂದ್ರ ಯೋಜನೆಗಳ ಪೈಲಟ್",
    official: "ಅಂತಿಮ ನಿರ್ಧಾರ ಸಂಬಂಧಿತ ಇಲಾಖೆಯದು", noUpload: "ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಆಗುವುದಿಲ್ಲ"
  },
  ta: {
    overview: "கண்ணோட்டம்", discover: "நலத்திட்டங்களைத் தேடு", profile: "எனது சுயவிவரம்", documents: "ஆவணங்கள்",
    applications: "எனது விண்ணப்பங்கள்", about: "இது எவ்வாறு செயல்படுகிறது", hello: "அரசுத் திட்டங்கள் மற்றும் நலன்களை எளிதாக அணுகலாம்.",
    intro: "உங்கள் சூழ்நிலையிலிருந்து சாத்தியமான உதவிவரை தெளிவான பாதை.", start: "தகுதி மதிப்பீட்டைத் தொடங்கு",
    sample: "மாதிரி குடும்பத்தை முயற்சி செய்", search: "திட்டங்கள் அல்லது உதவியைத் தேடு", verified: "ஆதார இணைப்புள்ள பட்டியல்",
    next: "அடுத்த படிகள்", featured: "சாத்தியமான நலன் வழிகள்", reviewed: "மதிப்பாய்வு செய்யப்பட்ட திட்டங்கள்",
    coverage: "சுயவிவர பரப்பு", languages: "இடைமுக மொழிகள்", screening: "மதிப்பீட்டு மையம்",
    run: "நலன் மதிப்பீட்டை இயக்கு", save: "சுயவிவரத்தைச் சேமி", saved: "இந்த உலாவியில் சுயவிவரம் சேமிக்கப்பட்டது",
    view: "விவரங்களைக் காண்க", prepare: "வரைவைத் தயாரி", noResult: "இன்னும் மதிப்பீட்டு முடிவுகள் இல்லை",
    noResultText: "தொடர்புடைய வழிகளைக் காண சுயவிவரத்தைப் பூர்த்தி செய்து மதிப்பீட்டை இயக்கவும்.",
    match: "சாத்தியமான பொருத்தம்", review: "சரிபார்ப்பு தேவை", noMatch: "பொருத்தமில்லை",
    source: "அதிகாரப்பூர்வ ஆதாரம்", privacy: "சுயவிவரமும் வரைவுகளும் இந்த உலாவியில் சேமிக்கப்படும். மதிப்பீடு மற்றும் வரைவு கோரிக்கைகளில் தொடர்புடைய விவரங்கள் செயலாக்கத்திற்காக பயன்பாட்டு சேவையகத்திற்கு அனுப்பப்படும்; முக்கிய அடையாள எண்களை உள்ளிட வேண்டாம்.",
    profileTitle: "குடிமகன் சுயவிவரத்தை உருவாக்கு", profileText: "தேவையான விவரங்களை மட்டும் பகிரவும்.",
    documentsTitle: "ஆவணப் பட்டியல்", documentsText: "கோப்பு குறிப்புகளைச் சேர்த்து ஒழுங்குபடுத்துங்கள். கோப்புகள் சேவையகத்தில் பதிவேற்றப்படாது.",
    applicationsTitle: "விண்ணப்பப் பணியிடம்", applicationsText: "இவை தயாரிப்பு வரைவுகள் மட்டுமே; அரசு தளத்தில் சமர்ப்பிக்கப்படவில்லை.",
    language: "மொழி", allIndia: "அனைத்து மாநிலங்கள் மற்றும் யூனியன் பிரதேசங்களுக்காக", catalogue: "தேர்ந்தெடுக்கப்பட்ட மத்திய திட்டங்களின் முன்னோடி",
    official: "இறுதி முடிவு சம்பந்தப்பட்ட துறையின்து", noUpload: "கோப்புகள் பதிவேற்றப்படாது"
  },
  te: {
    overview: "అవలోకనం", discover: "ప్రయోజనాలను కనుగొనండి", profile: "నా ప్రొఫైల్", documents: "పత్రాలు",
    applications: "నా దరఖాస్తులు", about: "ఇది ఎలా పనిచేస్తుంది", hello: "ప్రభుత్వ పథకాలు, ప్రయోజనాలను సులభంగా తెలుసుకోండి.",
    intro: "మీ పరిస్థితి నుంచి అందుబాటులో ఉండే సహాయం వరకు స్పష్టమైన మార్గం.", start: "అర్హత తనిఖీ ప్రారంభించండి",
    sample: "నమూనా కుటుంబాన్ని ప్రయత్నించండి", search: "పథకాలు లేదా సహాయాన్ని వెతకండి", verified: "మూలాలతో కూడిన జాబితా",
    next: "మీ తదుపరి చర్యలు", featured: "సంభావ్య ప్రయోజన మార్గాలు", reviewed: "సమీక్షించిన పథక రికార్డులు",
    coverage: "ప్రొఫైల్ పరిధి", languages: "ఇంటర్‌ఫేస్ భాషలు", screening: "పరిశీలన కార్యస్థలం",
    run: "ప్రయోజన అంచనాను అమలు చేయండి", save: "ప్రొఫైల్ సేవ్ చేయండి", saved: "ఈ బ్రౌజర్‌లో ప్రొఫైల్ సేవ్ అయింది",
    view: "వివరాలు చూడండి", prepare: "డ్రాఫ్ట్ సిద్ధం చేయండి", noResult: "ఇంకా పరిశీలన ఫలితాలు లేవు",
    noResultText: "సంబంధిత మార్గాలను చూడటానికి ప్రొఫైల్ పూర్తి చేసి అంచనాను అమలు చేయండి.",
    match: "సంభావ్య సరిపోలిక", review: "ధృవీకరణ అవసరం", noMatch: "సరిపోలలేదు",
    source: "అధికారిక మూలం", privacy: "ప్రొఫైల్ మరియు డ్రాఫ్ట్‌లు ఈ బ్రౌజర్‌లో సేవ్ అవుతాయి. అంచనా మరియు డ్రాఫ్ట్ అభ్యర్థనల్లో సంబంధిత వివరాలు ప్రాసెసింగ్ కోసం యాప్ సర్వర్‌కు పంపబడతాయి; సున్నితమైన గుర్తింపు సంఖ్యలను నమోదు చేయవద్దు.",
    profileTitle: "మీ పౌర ప్రొఫైల్‌ను సృష్టించండి", profileText: "అవసరమైన వివరాలను మాత్రమే పంచుకోండి.",
    documentsTitle: "పత్రాల జాబితా", documentsText: "పత్రాలను క్రమబద్ధీకరించడానికి ఫైల్ వివరాలను జోడించండి. ఫైళ్లు సర్వర్‌కు అప్‌లోడ్ కావు.",
    applicationsTitle: "దరఖాస్తుల కార్యస్థలం", applicationsText: "ఇవి తయారీ డ్రాఫ్ట్‌లు మాత్రమే; ప్రభుత్వ పోర్టల్‌కు సమర్పించబడలేదు.",
    language: "భాష", allIndia: "అన్ని రాష్ట్రాలు మరియు కేంద్రపాలిత ప్రాంతాల కోసం", catalogue: "ఎంచుకున్న కేంద్ర పథకాల పైలట్",
    official: "చివరి నిర్ణయం సంబంధిత శాఖదే", noUpload: "ఫైళ్లు అప్‌లోడ్ కావు"
  },
  ml: {
    overview: "അവലോകനം", discover: "ആനുകൂല്യങ്ങൾ കണ്ടെത്തുക", profile: "എന്റെ പ്രൊഫൈൽ", documents: "രേഖകൾ",
    applications: "എന്റെ അപേക്ഷകൾ", about: "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു", hello: "സർക്കാർ പദ്ധതികളും ആനുകൂല്യങ്ങളും എളുപ്പത്തിൽ കണ്ടെത്താം.",
    intro: "നിങ്ങളുടെ സാഹചര്യത്തിൽ നിന്ന് ലഭ്യമായേക്കാവുന്ന സഹായത്തിലേക്കുള്ള വ്യക്തമായ വഴി.", start: "യോഗ്യതാ പരിശോധന ആരംഭിക്കുക",
    sample: "മാതൃകാ കുടുംബം പരീക്ഷിക്കുക", search: "പദ്ധതികളോ സഹായമോ തിരയുക", verified: "ഉറവിടം ചേർത്ത പട്ടിക",
    next: "അടുത്ത ഘട്ടങ്ങൾ", featured: "സാധ്യതയുള്ള ആനുകൂല്യ മാർഗങ്ങൾ", reviewed: "പരിശോധിച്ച പദ്ധതി രേഖകൾ",
    coverage: "പ്രൊഫൈൽ പരിധി", languages: "ഇന്റർഫേസ് ഭാഷകൾ", screening: "പരിശോധനാ വർക്ക്സ്പേസ്",
    run: "ആനുകൂല്യ വിലയിരുത്തൽ നടത്തുക", save: "പ്രൊഫൈൽ സംരക്ഷിക്കുക", saved: "ഈ ബ്രൗസറിൽ പ്രൊഫൈൽ സംരക്ഷിച്ചു",
    view: "വിശദാംശങ്ങൾ കാണുക", prepare: "ഡ്രാഫ്റ്റ് തയ്യാറാക്കുക", noResult: "പരിശോധനാ ഫലങ്ങൾ ഇതുവരെ ഇല്ല",
    noResultText: "ബന്ധപ്പെട്ട വഴികൾ കാണാൻ പ്രൊഫൈൽ പൂരിപ്പിച്ച് വിലയിരുത്തൽ നടത്തുക.",
    match: "സാധ്യതയുള്ള പൊരുത്തം", review: "സ്ഥിരീകരണം ആവശ്യമാണ്", noMatch: "പൊരുത്തമില്ല",
    source: "ഔദ്യോഗിക ഉറവിടം", privacy: "പ്രൊഫൈലും ഡ്രാഫ്റ്റുകളും ഈ ബ്രൗസറിൽ സൂക്ഷിക്കുന്നു. വിലയിരുത്തൽ, ഡ്രാഫ്റ്റ് അഭ്യർത്ഥനകളിൽ ബന്ധപ്പെട്ട വിവരങ്ങൾ പ്രോസസ്സിംഗിനായി ആപ്പ് സെർവറിലേക്ക് അയയ്ക്കും; സെൻസിറ്റീവ് തിരിച്ചറിയൽ നമ്പറുകൾ നൽകാതിരിക്കുക.",
    profileTitle: "നിങ്ങളുടെ പൗര പ്രൊഫൈൽ സൃഷ്ടിക്കുക", profileText: "ആവശ്യമായ വിവരങ്ങൾ മാത്രം പങ്കിടുക.",
    documentsTitle: "രേഖാ ചെക്ക്‌ലിസ്റ്റ്", documentsText: "രേഖകൾ ക്രമീകരിക്കാൻ ഫയൽ വിവരങ്ങൾ ചേർക്കുക. ഫയലുകൾ സെർവറിലേക്ക് അപ്‌ലോഡ് ചെയ്യുന്നില്ല.",
    applicationsTitle: "അപേക്ഷാ വർക്ക്‌സ്‌പേസ്", applicationsText: "ഇവ തയ്യാറാക്കിയ ഡ്രാഫ്റ്റുകൾ മാത്രമാണ്; സർക്കാർ പോർട്ടലിൽ സമർപ്പിച്ചിട്ടില്ല.",
    language: "ഭാഷ", allIndia: "എല്ലാ സംസ്ഥാനങ്ങൾക്കും കേന്ദ്രഭരണ പ്രദേശങ്ങൾക്കും", catalogue: "തിരഞ്ഞെടുത്ത കേന്ദ്ര പദ്ധതികളുടെ പൈലറ്റ്",
    official: "അന്തിമ തീരുമാനം ബന്ധപ്പെട്ട വകുപ്പിന്റേതാണ്", noUpload: "ഫയലുകൾ അപ്‌ലോഡ് ചെയ്യുന്നില്ല"
  }
};

function formatMoney(value: number | "") {
  return value === "" ? "Not provided" : "₹" + value.toLocaleString("en-IN");
}
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="field"><span className="field-label">{label}</span>{children}{hint && <span className="field-hint">{hint}</span>}</label>;
}
function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>;
}
function YesNo({ value, onChange, unknown = false }: { value: boolean | null; onChange: (value: boolean | null) => void; unknown?: boolean }) {
  return <div className="segmented">
    <button type="button" className={value === true ? "selected" : ""} onClick={() => onChange(true)}>Yes</button>
    <button type="button" className={value === false ? "selected" : ""} onClick={() => onChange(false)}>No</button>
    {unknown && <button type="button" className={value === null ? "selected" : ""} onClick={() => onChange(null)}>Not sure</button>}
  </div>;
}
function statusLabel(state: Assessment["state"], t: (key: string) => string) {
  if (state === "potential_match") return t("match");
  if (state === "not_matched") return t("noMatch");
  return t("review");
}
function shortDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("overview");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [profile, setProfile] = useState<CitizenProfile>(EMPTY_PROFILE);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [toolTrace, setToolTrace] = useState<any[]>([]);
  const [applications, setApplications] = useState<LocalApplication[]>([]);
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [busy, setBusy] = useState(false);
  const [draftBusy, setDraftBusy] = useState("");
  const [intakeText, setIntakeText] = useState("");
  const [intakeBusy, setIntakeBusy] = useState(false);
  const [intakeRecognized, setIntakeRecognized] = useState<string[]>([]);
  const [expandedApplication, setExpandedApplication] = useState("");
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [expandedScheme, setExpandedScheme] = useState("");\n  const [backupBusy, setBackupBusy] = useState(false);

  const t = (key: string) => COPY[language][key] || COPY.en[key] || key;
  const activeResults = useMemo(() => {
    const byId = new Map(assessments.map((item) => [item.schemeId, item]));
    return SCHEMES.filter((scheme) => {
      const matchesText = [scheme.name, scheme.category, scheme.summary, scheme.ministry].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All categories" || scheme.category === category;
      return matchesText && matchesCategory && (assessments.length === 0 || byId.has(scheme.id));
    });
  }, [assessments, category, query]);

  useEffect(() => {
    try {
      const read = (key: string, fallback: any) => {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      };
      setProfile(read(STORAGE.profile, EMPTY_PROFILE));
      setLanguage(read(STORAGE.language, "en"));
      setApplications(read(STORAGE.applications, []));
      setDocuments(read(STORAGE.documents, []));
      setTasks(read(STORAGE.tasks, []));
      setAssessments(read(STORAGE.assessments, []));
    } catch {
      setNotice("Some saved browser data could not be read. You can continue with a fresh profile.");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE.profile, JSON.stringify(profile));
    localStorage.setItem(STORAGE.language, JSON.stringify(language));
    localStorage.setItem(STORAGE.applications, JSON.stringify(applications));
    localStorage.setItem(STORAGE.documents, JSON.stringify(documents));
    localStorage.setItem(STORAGE.tasks, JSON.stringify(tasks));
    localStorage.setItem(STORAGE.assessments, JSON.stringify(assessments));
  }, [hydrated, profile, language, applications, documents, tasks, assessments]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

\n  const exportBackup = () => {\n    const backup = { app: "JanaSetu", schemaVersion: 1, exportedAt: new Date().toISOString(), profile, language, applications, documents, tasks, assessments };\n    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });\n    const url = URL.createObjectURL(blob);\n    const link = document.createElement("a"); link.href = url; link.download = "janSetu-local-backup.json"; link.click(); URL.revokeObjectURL(url);\n    setNotice("Backup exported to this device. Treat it as private personal data.");\n  };\n  const importBackup = async (file?: File) => {\n    if (!file) return; setBackupBusy(true);\n    try {\n      const data = JSON.parse(await file.text());\n      if (data?.app !== "JanaSetu" || data?.schemaVersion !== 1 || !data?.profile) throw new Error("This is not a supported JanaSetu backup file.");\n      setProfile(data.profile); setLanguage(data.language || "en"); setApplications(Array.isArray(data.applications) ? data.applications : []); setDocuments(Array.isArray(data.documents) ? data.documents : []); setTasks(Array.isArray(data.tasks) ? data.tasks : []); setAssessments(Array.isArray(data.assessments) ? data.assessments : []);\n      setTab("profile"); setNotice("Backup restored in this browser. Review imported details before use.");\n    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to restore this backup."); } finally { setBackupBusy(false); }\n  };\n\n  const updateProfile = <K extends keyof CitizenProfile>(key: K, value: CitizenProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const fillSample = () => {
    setProfile(SAMPLE_PROFILE);
    setAssessments([]);
    setToolTrace([]);
    setTab("profile");
    setNotice("Sample household loaded. Review the profile and run the assessment.");
  };

  const submitIntake = async () => {
    if (!intakeText.trim()) {
      setNotice("Describe your situation in a sentence before continuing.");
      return;
    }
    setIntakeBusy(true);
    try {
      const response = await fetch("/api/intake/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: intakeText, language })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to extract profile facts.");
      const extracted = payload.updates || {};
      setProfile((current) => ({ ...current, ...extracted }));
      setIntakeRecognized(payload.recognizedFields || []);
      setTab("profile");
      setNotice(payload.recognizedFields?.length
        ? `Extracted ${payload.recognizedFields.length} profile detail(s). Review every value before assessment.`
        : "No profile facts were confidently recognized. Complete the form manually.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to process the description.");
    } finally {
      setIntakeBusy(false);
    }
  };

  const startVoiceInput = () => {
    const browser = window as unknown as {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Recognition) {
      setNotice("Voice input is not available in this browser. Use the text description instead.");
      return;
    }
    const recognition = new Recognition();
    const locales: Record<LanguageCode, string> = {
      en: "en-IN", hi: "hi-IN", kn: "kn-IN", ta: "ta-IN", te: "te-IN", ml: "ml-IN"
    };
    recognition.lang = locales[language];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (typeof transcript === "string") {
        setIntakeText((current) => current ? current + " " + transcript : transcript);
        setNotice("Voice transcript added. Review the text before extracting profile facts.");
      }
    };
    recognition.onerror = () => setNotice("Voice recognition did not complete. You can type the description instead.");
    recognition.start();
    setNotice("Listening… speak in the language selected above.");
  };

  const runAssessment = async () => {
    if (!profile.state) {
      setTab("profile");
      setNotice("Select a State or Union Territory before screening.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Assessment failed.");
      setAssessments(payload.assessments || []);
      setToolTrace(payload.trace || []);
      setTab("discover");
      setNotice("Assessment complete. Review the evidence and official sources.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to complete the assessment.");
    } finally {
      setBusy(false);
    }
  };

  const prepareDraft = async (schemeId: string) => {
    setDraftBusy(schemeId);
    try {
      const response = await fetch("/api/applications/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemeId, profile })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Draft creation failed.");
      setApplications((current) => [payload.draft, ...current.filter((item) => item.id !== payload.draft.id)]);
      setTab("applications");
      setNotice("Draft prepared and saved in this browser. It has not been submitted.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to prepare the draft.");
    } finally {
      setDraftBusy("");
    }
  };

  const addFollowup = async (application: LocalApplication) => {
    try {
      const response = await fetch("/api/tools/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemeName: application.schemeName })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Follow-up creation failed.");
      setTasks((current) => [payload.task, ...current]);
      setNotice("A reminder has been added to your local follow-up list.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to add reminder.");
    }
  };

  const addDocument = (file?: File) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      setNotice("Please select a file smaller than 12 MB.");
      return;
    }
    const entry: LocalDocument = {
      id: "DOC-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      name: file.name,
      type: file.type || "Unknown file type",
      size: file.size,
      addedAt: new Date().toISOString(),
      status: "Added — manual verification pending"
    };
    setDocuments((current) => [entry, ...current]);
    setNotice("File reference added. The file itself was not uploaded or stored.");
  };

  const navItems: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: t("overview"), icon: LayoutDashboard },
    { id: "discover", label: t("discover"), icon: Search },
    { id: "profile", label: t("profile"), icon: UserRound },
    { id: "documents", label: t("documents"), icon: FileCheck2 },
    { id: "applications", label: t("applications"), icon: ClipboardCheck },
    { id: "about", label: t("about"), icon: CircleAlert }
  ];

  const profileProgress = [
    Boolean(profile.fullName), Boolean(profile.age), Boolean(profile.gender),
    Boolean(profile.state), Boolean(profile.residenceType), profile.annualIncome !== "",
    Boolean(profile.occupation)
  ].filter(Boolean).length;
  const progress = Math.round((profileProgress / 7) * 100);

  const renderSchemeCard = (scheme: typeof SCHEMES[number]) => {
    const assessment = assessments.find((item) => item.schemeId === scheme.id);
    const expanded = expandedScheme === scheme.id;
    return <article className="scheme-card" key={scheme.id}>
      <div className="scheme-topline">
        <span className="scheme-category">{scheme.category}</span>
        <span className="source-dot"><ShieldCheck size={14}/> Source linked</span>
      </div>
      <div className="scheme-main">
        <div className="scheme-symbol">{scheme.category === "Agriculture" ? <Sprout/> : scheme.category === "Housing" ? <House/> : scheme.category === "Education" ? <GraduationCap/> : <HandHeart/>}</div>
        <div className="scheme-title-wrap">
          <h3>{scheme.name}</h3>
          <p>{scheme.ministry}</p>
        </div>
      </div>
      <p className="scheme-summary">{scheme.summary}</p>
      <div className="scheme-benefit"><span>Published benefit</span><strong>{scheme.benefit}</strong></div>
      {assessment && <div className={"assessment-banner " + assessment.state}>
        <span className="assessment-icon">{assessment.state === "not_matched" ? <X size={15}/> : assessment.state === "potential_match" ? <Check size={15}/> : <CircleAlert size={15}/>}</span>
        <div><strong>{statusLabel(assessment.state, t)}</strong><small>{assessment.headline}</small></div>
      </div>}
      <div className="scheme-actions">
        <button className="text-button" onClick={() => setExpandedScheme(expanded ? "" : scheme.id)}>{expanded ? "Hide details" : t("view")} <ChevronDown size={15}/></button>
        {assessment && assessment.state !== "not_matched" && <button className="button button-small button-primary" onClick={() => prepareDraft(scheme.id)} disabled={draftBusy === scheme.id}>{draftBusy === scheme.id ? "Preparing…" : t("prepare")} <ArrowUpRight size={15}/></button>}
      </div>
      {expanded && <div className="scheme-detail">
        <div><strong>Screening conditions</strong><ul>{scheme.ruleNotes.map((rule) => <li key={rule}>{rule}</li>)}</ul></div>
        {assessment && <div className="rule-list"><strong>Assessment evidence</strong>{assessment.checks.map((item) => <div className="rule-row" key={item.key}><span className={"rule-state " + item.state}>{item.state === "matched" ? <Check size={12}/> : item.state === "not_matched" ? <X size={12}/> : <CircleAlert size={12}/>}</span><div><b>{item.label}</b><small>{item.evidence}</small><em>{item.rule}</em></div></div>)}</div>}
        {assessment && <div><strong>Next recommended actions</strong><ul>{assessment.nextActions.map((action) => <li key={action}>{action}</li>)}</ul></div>}
        <a className="source-link" href={scheme.sourceUrl} target="_blank" rel="noreferrer">{t("source")}: {scheme.sourceName} <ArrowUpRight size={14}/></a>
        <p className="source-period">Source period: {scheme.sourcePeriod}. Accessed: {scheme.sourceChecked}.</p>
      </div>}
    </article>;
  };

  return (
    <div className="app-shell">
      <aside className={"sidebar " + (showMobileNav ? "sidebar-open" : "")}>
        <div className="brand">
          <div className="brand-mark"><span>ज</span></div>
          <div><strong>JanaSetu</strong><small>BENEFITS ACCESS</small></div>
          <button className="mobile-close" onClick={() => setShowMobileNav(false)} aria-label="Close navigation"><X size={18}/></button>
        </div>
        <div className="sidebar-kicker">GOVERNMENT BENEFITS WORKSPACE</div>
        <nav className="side-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={"nav-item " + (tab === item.id ? "active" : "")} onClick={() => { setTab(item.id); setShowMobileNav(false); }}>
              <Icon size={18}/><span>{item.label}</span>{item.id === "applications" && applications.length > 0 && <em>{applications.length}</em>}
            </button>;
          })}
        </nav>
        <div className="sidebar-spacer"/>
        <div className="sidebar-assist">
          <div className="assist-icon"><HandHeart size={18}/></div>
          <strong>Need help with government benefits?</strong>
          <p>Take your checklist to an authorized Common Service Centre or the responsible department.</p>
          <a href="https://locator.csccloud.in/" target="_blank" rel="noreferrer">Find a CSC <ArrowUpRight size={13}/></a>
        </div>
        <div className="sidebar-footer">
          <ShieldCheck size={15}/><span>Independent public-service navigator</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setShowMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button>
            <div className="breadcrumb"><span>JanaSetu</span><ChevronRight size={14}/><strong>{navItems.find((item) => item.id === tab)?.label}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="system-status"><span className="status-pulse"/> Local-first prototype</div>\n            <button className="button button-small button-outline backup-button" onClick={exportBackup} title="Export local data to a private JSON file"><Download size={13}/> Backup</button>\n            <label className="button button-small button-outline backup-button" title="Restore a JanaSetu JSON backup"><Upload size={13}/> Restore<input type="file" accept=".json,application/json" hidden disabled={backupBusy} onChange={(e) => { importBackup(e.target.files?.[0]); e.currentTarget.value = ""; }}/></label>
            <label className="language-control"><Globe2 size={16}/><span>{t("language")}</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
                {LANGUAGE_OPTIONS.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select><ChevronDown size={13}/>
            </label>
            <button className="avatar-button" onClick={() => setTab("profile")} aria-label="Open profile">{profile.fullName ? profile.fullName[0].toUpperCase() : <UserRound size={17}/>}</button>
          </div>
        </header>

        <div className="content-area">
          {tab === "overview" && <>
            <div className="welcome-row">
              <div><div className="eyebrow"><span className="eyebrow-line"/> GOVERNMENT BENEFITS WORKSPACE</div><h1>{t("hello")}</h1><p>{t("intro")}</p></div>
              <div className="date-chip"><CalendarClock size={15}/> {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</div>
            </div>

            <section className="hero-panel">
              <div className="hero-content">
                <div className="hero-label"><span/> A CLEARER WAY FORWARD</div>
                <h2>One profile.<br/><em>Clearer next steps.</em></h2>
                <p>Go beyond discovery: see which rule needs which evidence, what is still unknown, and what to prepare next.</p>
                <div className="hero-buttons">
                  <button className="button button-light" onClick={() => setTab("profile")}>{t("start")} <ArrowRight size={16}/></button>
                  <button className="button button-ghost" onClick={fillSample}>{t("sample")}</button>
                </div>
              </div>
              <div className="hero-illustration" aria-hidden="true">
                <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
                <div className="hero-paper"><div className="paper-seal"><Leaf size={24}/></div><span/><span/><span className="paper-short"/><div className="paper-check"><Check size={18}/></div></div>
                <div className="float-tag tag-one"><CheckCircle2 size={15}/> Evidence linked</div>
                <div className="float-tag tag-two"><FileCheck2 size={15}/> Next action ready</div>
              </div>
              <div className="hero-bottom-note"><LockKeyhole size={13}/> No Aadhaar or bank-account number required in this prototype.</div>
            </section>

            <section className="ecosystem-panel">
              <div>
                <div className="eyebrow">BUILT FOR THE REAL PUBLIC-SERVICE ECOSYSTEM</div>
                <h2>A preparation layer — not another government portal.</h2>
                <p>Use JanaSetu to organise your evidence and next steps. Official platforms and departments remain authoritative for scheme information, document services and application submission.</p>
              </div>
              <div className="ecosystem-links">
                <a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer">myScheme <ExternalLink size={12}/><small>Scheme discovery</small></a>
                <a href="https://web.umang.gov.in/" target="_blank" rel="noreferrer">UMANG <ExternalLink size={12}/><small>Government services</small></a>
                <a href="https://www.digilocker.gov.in/" target="_blank" rel="noreferrer">DigiLocker <ExternalLink size={12}/><small>Digital documents</small></a>
                <a href="https://locator.csccloud.in/" target="_blank" rel="noreferrer">Common Service Centres <ExternalLink size={12}/><small>Assisted access</small></a>
              </div>
            </section>

            <section className="panel intake-panel">
              <div className="intake-heading">
                <div className="eyebrow">START WITH YOUR SITUATION</div>
                <h2>Tell JanaSetu what you need help with.</h2>
                <p>Describe your household in your chosen language. We will suggest profile facts for you to review before any screening.</p>
              </div>
              <textarea
                className="intake-text"
                value={intakeText}
                onChange={(event) => setIntakeText(event.target.value)}
                maxLength={4000}
                placeholder={language === "hi"
                  ? "उदाहरण: मैं 34 साल की महिला किसान हूं, कर्नाटक में रहती हूं, वार्षिक घरेलू आय 1.5 लाख रुपये है।"
                  : language === "kn"
                    ? "ಉದಾಹರಣೆ: ನಾನು 34 ವರ್ಷದ ಮಹಿಳಾ ರೈತ, ಕರ್ನಾಟಕದಲ್ಲಿ ವಾಸಿಸುತ್ತೇನೆ, ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ ₹1.5 ಲಕ್ಷ."
                    : language === "ta"
                      ? "உதாரணம்: நான் 34 வயது பெண் விவசாயி, தமிழ்நாட்டில் வசிக்கிறேன், ஆண்டு குடும்ப வருமானம் ₹1.5 லட்சம்."
                      : language === "te"
                        ? "ఉదాహరణ: నేను 34 ఏళ్ల మహిళా రైతును, తెలంగాణలో ఉంటాను, వార్షిక కుటుంబ ఆదాయం ₹1.5 లక్షలు."
                        : language === "ml"
                          ? "ഉദാഹരണം: ഞാൻ 34 വയസ്സുള്ള വനിതാ കർഷകയാണ്, കേരളത്തിൽ താമസിക്കുന്നു, വാർഷിക കുടുംബ വരുമാനം ₹1.5 ലക്ഷം."
                          : "Example: I am a 34-year-old woman farmer in Karnataka. My annual household income is ₹1.5 lakh."}
              />
              <div className="intake-actions">
                <span><ShieldCheck size={14}/> Text extraction is a suggestion. Check every field. Browser speech recognition may use your browser provider.</span>
                <div>
                  <button className="button button-outline" onClick={startVoiceInput}><Mic size={15}/> Speak</button>
                  <button className="button button-primary" onClick={submitIntake} disabled={intakeBusy}>{intakeBusy ? "Reading…" : "Extract profile facts"} <ArrowRight size={15}/></button>
                </div>
              </div>
              {intakeRecognized.length > 0 && <div className="intake-recognized"><CheckCircle2 size={15}/> Suggested fields: {intakeRecognized.join(" · ")}. Review and correct them in My profile.</div>}
            </section>

            <div className="metric-grid">
              <div className="metric-card"><div className="metric-icon green"><BookOpen size={18}/></div><div><strong>{SCHEMES.length.toString().padStart(2, "0")}</strong><span>{t("reviewed")}</span></div><small>Central Government pilot · not complete</small></div>
              <div className="metric-card"><div className="metric-icon sand"><Globe2 size={18}/></div><div><strong>36</strong><span>{t("coverage")}</span></div><small>State/UT selection supported</small></div>
              <div className="metric-card"><div className="metric-icon clay"><MessageCircle size={18}/></div><div><strong>06</strong><span>{t("languages")}</span></div><small>English + 5 Indian languages</small></div>
              <div className="metric-card"><div className="metric-icon ink"><ShieldCheck size={18}/></div><div><strong>{applications.length.toString().padStart(2, "0")}</strong><span>Draft applications</span></div><small>Browser-only · backup to move devices</small></div>
            </div>

            <div className="dashboard-grid">
              <section className="panel next-panel">
                <div className="section-heading"><div><div className="eyebrow">GETTING STARTED</div><h2>{t("next")}</h2></div><span className="section-index">01—03</span></div>
                <div className="step-list">
                  <div className="step-row"><div className="step-number">01</div><div className="step-copy"><strong>Create your citizen profile</strong><p>Share your State/UT, household and relevant circumstances.</p></div><button onClick={() => setTab("profile")}><ArrowUpRight size={17}/></button></div>
                  <div className="step-row"><div className="step-number">02</div><div className="step-copy"><strong>Run an evidence-led assessment</strong><p>Review matching rules, unknown answers and official sources.</p></div><button onClick={runAssessment} disabled={!profile.state}><ArrowUpRight size={17}/></button></div>
                  <div className="step-row"><div className="step-number">03</div><div className="step-copy"><strong>Prepare your next action</strong><p>Build a checklist and keep a draft for your own review.</p></div><button onClick={() => setTab("applications")}><ArrowUpRight size={17}/></button></div>
                </div>
                <div className="profile-progress"><div className="progress-top"><span>Profile completeness</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: progress + "%" }}/></div><small>{profileProgress} of 7 essential profile fields provided</small></div>
              </section>
              <section className="panel trust-panel">
                <div className="trust-heading"><div className="trust-icon"><ShieldCheck size={22}/></div><div><div className="eyebrow">BUILT AROUND TRUST</div><h2>Know why. Know what’s next.</h2></div></div>
                <p>Every screening result shows the rule, the profile evidence used and the official source to check before acting.</p>
                <div className="trust-points"><span><Check size={14}/> Unknown stays unknown</span><span><Check size={14}/> Source-linked rules</span><span><Check size={14}/> Human approval before action</span></div>
                <button className="text-button" onClick={() => setTab("about")}>Read our approach <ArrowRight size={15}/></button>
              </section>
            </div>

            <div className="section-heading featured-heading"><div><div className="eyebrow">CURATED NATIONAL CATALOGUE</div><h2>{t("featured")}</h2></div><button className="text-button" onClick={() => setTab("discover")}>Explore all <ArrowRight size={15}/></button></div>
            <div className="scheme-grid">{SCHEMES.slice(0, 3).map(renderSchemeCard)}</div>
          </>}

          {tab === "profile" && <section className="page-section">
            <div className="page-title-row"><div><div className="eyebrow">CITIZEN PASSPORT</div><h1>{t("profileTitle")}</h1><p>{t("profileText")}</p></div><span className="private-chip"><LockKeyhole size={14}/> Local browser profile</span></div>
            <div className="form-layout">
              <div className="panel form-panel">
                <div className="form-section-title"><span>01</span><div><h2>About you</h2><p>Basic details used to select applicable rule sets.</p></div></div>
                <div className="form-grid">
                  <Field label="Full name (optional)"><input placeholder="Enter your name" value={profile.fullName} onChange={(e) => updateProfile("fullName", e.target.value)}/></Field>
                  <Field label="Age"><input type="number" min="0" max="120" placeholder="Age in years" value={profile.age} onChange={(e) => updateProfile("age", e.target.value === "" ? "" : Number(e.target.value))}/></Field>
                  <Field label="Gender (where a scheme requires it)"><Select value={profile.gender} onChange={(v) => updateProfile("gender", v as CitizenProfile["gender"])}><option value="">Select</option><option value="woman">Woman</option><option value="man">Man</option><option value="other">Other / prefer not to say</option></Select></Field>
                  <Field label="State / Union Territory"><Select value={profile.state} onChange={(v) => updateProfile("state", v)}><option value="">Choose your State / UT</option>{STATES_AND_UTS.map((state) => <option key={state}>{state}</option>)}</Select></Field>
                  <Field label="District (optional)"><input placeholder="District or city" value={profile.district} onChange={(e) => updateProfile("district", e.target.value)}/></Field>
                  <Field label="Area of residence"><Select value={profile.residenceType} onChange={(v) => updateProfile("residenceType", v as CitizenProfile["residenceType"])}><option value="">Select</option><option value="rural">Rural</option><option value="urban">Urban</option></Select></Field>
                  <Field label="Annual household income (₹)" hint="Enter an approximate annual amount."><input type="number" min="0" placeholder="e.g. 150000" value={profile.annualIncome} onChange={(e) => updateProfile("annualIncome", e.target.value === "" ? "" : Number(e.target.value))}/></Field>
                  <Field label="Occupation"><Select value={profile.occupation} onChange={(v) => updateProfile("occupation", v)}><option value="">Select occupation</option><option>Farmer</option><option>Agricultural worker</option><option>Student</option><option>Self-employed</option><option>Street vendor</option><option>Salaried employee</option><option>Unemployed</option><option>Homemaker</option><option>Other</option></Select></Field>
                </div>

                <div className="form-section-title subsection"><span>02</span><div><h2>Housing and household</h2><p>These questions only screen the housing and LPG records shown in this catalogue.</p></div></div>
                <div className="form-grid">
                  <Field label="Does your family own a pucca house anywhere in India?"><YesNo value={profile.ownsPuccaHouse} onChange={(v) => updateProfile("ownsPuccaHouse", v)} unknown/></Field>
                  <Field label="Was your family allotted a government house in the last 20 years?"><Select value={profile.previousHousingBenefit} onChange={(v) => updateProfile("previousHousingBenefit", v as CitizenProfile["previousHousingBenefit"])}><option value="unknown">Not sure</option><option value="yes">Yes</option><option value="no">No</option></Select></Field>
                  <Field label="Does anyone in your household have an LPG connection?"><YesNo value={profile.householdHasLpg} onChange={(v) => updateProfile("householdHasLpg", v)} unknown/></Field>
                  <Field label="Can the applicant provide the prescribed poor-household declaration for PMUY?"><YesNo value={profile.poorHouseholdDeclaration} onChange={(v) => updateProfile("poorHouseholdDeclaration", v)} unknown/></Field>
                </div>

                <div className="form-section-title subsection"><span>03</span><div><h2>Agriculture and exclusions</h2><p>For preliminary PM-KISAN screening; official land-record and exclusion checks are still required.</p></div></div>
                <div className="form-grid">
                  <Field label="Is cultivable land recorded in the State/UT land records?"><YesNo value={profile.hasCultivableLand} onChange={(v) => updateProfile("hasCultivableLand", v)} unknown/></Field>
                  <Field label="Does any family member fall under a PM-KISAN exclusion category?"><Select value={profile.pmKisanExcluded} onChange={(v) => updateProfile("pmKisanExcluded", v as CitizenProfile["pmKisanExcluded"])}><option value="unknown">Not sure</option><option value="yes">Yes</option><option value="no">No, after reviewing the list</option></Select></Field>
                </div>

                <div className="form-section-title subsection"><span>04</span><div><h2>Education</h2><p>For the cited PM-USP CSSS reference; academic-year rules must be rechecked.</p></div></div>
                <div className="form-grid">
                  <Field label="Are you currently a student?"><YesNo value={profile.isStudent} onChange={(v) => updateProfile("isStudent", Boolean(v))}/></Field>
                  <Field label="Above the 80th percentile in your Board / stream?"><YesNo value={profile.top20Percentile} onChange={(v) => updateProfile("top20Percentile", v)} unknown/></Field>
                  <Field label="Enrolled in a regular undergraduate course?"><YesNo value={profile.regularUndergraduate} onChange={(v) => updateProfile("regularUndergraduate", v)} unknown/></Field>
                  <Field label="Receiving another scholarship or fee reimbursement?"><YesNo value={profile.otherScholarship} onChange={(v) => updateProfile("otherScholarship", v)} unknown/></Field>
                  <Field label="Is your course a diploma or distance / correspondence course?"><YesNo value={profile.diplomaOrDistance} onChange={(v) => updateProfile("diplomaOrDistance", v)} unknown/></Field>
                </div>
                <div className="form-footer"><span><LockKeyhole size={14}/> No Aadhaar, bank account or document number is requested here.</span><button className="button button-primary" onClick={() => { setNotice(t("saved")); runAssessment(); }}>{t("run")} <ArrowRight size={16}/></button></div>
              </div>
              <aside className="profile-aside">
                <div className="panel aside-card">
                  <div className="progress-ring" style={{ background: "#dce8d9", border: "4px solid #2d684b" }}><div><strong>{progress}%</strong><small>complete</small></div></div>
                  <h3>Profile readiness</h3><p>More complete answers reduce unknown screening conditions. You can leave any field blank and return later.</p>
                </div>
                <div className="panel aside-card privacy-card"><ShieldCheck size={22}/><h3>Privacy by design</h3><p>Profile and application records are saved in this browser. When you run an assessment or prepare a draft, relevant profile fields are sent to the app server for processing. The prototype does not intentionally persist them on the server. Avoid sensitive identifiers and real documents.</p><span>Prototype data boundary</span></div>
              </aside>
            </div>
          </section>}

          {tab === "discover" && <section className="page-section">
            <div className="page-title-row"><div><div className="eyebrow">SCHEME INTELLIGENCE</div><h1>{t("screening")}</h1><p>Discover possible pathways and inspect the rule evidence before preparing a draft.</p></div><button className="button button-primary" onClick={runAssessment} disabled={busy}>{busy ? <><span className="spinner"/> Working…</> : <><Sparkles size={16}/>{t("run")}</>}</button></div>
            <div className="screening-summary">
              <div className="screen-summary-icon"><Activity size={20}/></div><div><strong>{assessments.length ? assessments.length + " relevant scheme records assessed" : "Your assessment is ready to run"}</strong><p>{assessments.length ? "The workflow used your saved profile and the current curated catalogue." : "Complete your profile first. The agent will select the applicable rule pathways."}</p></div><button className="text-button" onClick={() => setTab("profile")}>Edit profile <ArrowUpRight size={14}/></button>
            </div>
            {toolTrace.length > 0 && <div className="panel trace-panel">
              <div className="section-heading"><div><div className="eyebrow">EXECUTION TRACE</div><h2>What the agent did</h2></div><span className="trace-count">{toolTrace.length} tool steps</span></div>
              <div className="trace-list">{toolTrace.map((item) => <div className="trace-row" key={item.id}><span className="trace-check"><Check size={13}/></span><div><strong>{item.agent}</strong><small>{item.tool} · {item.detail}</small></div><span className="trace-duration">{item.durationMs} ms</span></div>)}</div>
              <p className="trace-note">This prototype uses deterministic server-side tools and a rule-based planner; it does not call an external LLM or government API.</p>
            </div>}
            <div className="catalogue-controls">
              <div className="search-box"><Search size={17}/><input placeholder={t("search")} value={query} onChange={(e) => setQuery(e.target.value)}/>{query && <button onClick={() => setQuery("")}><X size={14}/></button>}</div>
              <label className="filter-select"><span>Category</span><select value={category} onChange={(e) => setCategory(e.target.value)}><option>All categories</option>{Array.from(new Set(SCHEMES.map((item) => item.category))).map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14}/></label>
            </div>
            <div className="catalogue-head"><span>{activeResults.length} {assessments.length ? "assessed records" : "catalogue records"}</span><span>Official links · indicative screening only</span></div>
            {activeResults.length ? <div className="scheme-grid">{activeResults.map(renderSchemeCard)}</div> : <div className="empty-state"><Search size={28}/><h3>No scheme records found</h3><p>Try another keyword or category.</p><button className="text-button" onClick={() => { setQuery(""); setCategory("All categories"); }}>Clear filters</button></div>}
            {assessments.length === 0 && <div className="empty-guidance"><CircleAlert size={17}/><span>Results are not personalized until you run the assessment. The curated catalogue is not a complete list of Indian schemes.</span></div>}
          </section>}

          {tab === "documents" && <section className="page-section">
            <div className="page-title-row"><div><div className="eyebrow">EVIDENCE ORGANIZER</div><h1>{t("documentsTitle")}</h1><p>{t("documentsText")}</p></div><span className="private-chip"><LockKeyhole size={14}/> Metadata only</span></div>
            <div className="document-layout">
              <div className="panel upload-panel">
                <div className="upload-illustration"><Upload size={27}/></div><h2>Add a document reference</h2><p>Choose a PDF or image to add its filename and basic metadata to this browser's checklist. The file itself is not uploaded, parsed or retained by the server.</p>
                <label className="button button-primary upload-button"><Upload size={16}/> Choose a file<input type="file" accept=".pdf,image/*" onChange={(e) => addDocument(e.target.files?.[0])}/></label>
                <div className="upload-limits"><span>PDF, JPG, PNG</span><span>Maximum 12 MB</span></div>
              </div>
              <div className="panel document-list-panel">
                <div className="section-heading"><div><div className="eyebrow">YOUR RECORDS</div><h2>{documents.length} document references</h2></div><span className="section-index">LOCAL</span></div>
                {documents.length === 0 ? <div className="empty-state compact"><FileText size={26}/><h3>No document references yet</h3><p>Your checklist will appear here when you add a file.</p></div> : <div className="document-list">{documents.map((doc) => <div className="document-row" key={doc.id}><div className="file-icon"><FileText size={19}/></div><div className="document-info"><strong>{doc.name}</strong><small>{doc.type} · {(doc.size / 1024).toFixed(0)} KB · Added {shortDate(doc.addedAt)}</small><em>{doc.status}</em></div><button className="icon-button" onClick={() => setDocuments((current) => current.filter((item) => item.id !== doc.id))} aria-label="Remove document reference"><X size={16}/></button></div>)}</div>}
              </div>
            </div>
            <div className="empty-guidance"><ShieldCheck size={17}/><span>For security, do not add Aadhaar images, bank statements or other sensitive identity documents to this prototype. Use synthetic sample files for demonstrations.</span></div>
          </section>}

          {tab === "applications" && <section className="page-section">
            <div className="page-title-row"><div><div className="eyebrow">APPLICATION LIFECYCLE</div><h1>{t("applicationsTitle")}</h1><p>{t("applicationsText")}</p></div><div className="private-chip"><ClipboardCheck size={14}/> {applications.length} saved</div></div>
            {applications.length === 0 ? <div className="panel empty-large"><div className="empty-state"><ClipboardCheck size={32}/><h3>No application drafts yet</h3><p>Run an assessment, open a scheme and choose “Prepare draft” to create a reviewable application record.</p><button className="button button-primary" onClick={() => setTab("discover")}>Find benefits <ArrowRight size={15}/></button></div></div> :
              <div className="application-list">{applications.map((application) => <article className="panel application-card" key={application.id}><div className="application-top"><div className="application-icon"><FileCheck2 size={20}/></div><div><span className="draft-label">PREPARATION DRAFT</span><h3>{application.schemeName}</h3><p>{application.id} · Created {shortDate(application.createdAt)}</p></div><span className="status-pill neutral">Not submitted</span></div><div className="application-meta"><div><small>Applicant</small><strong>{application.citizenName}</strong></div><div><small>Location</small><strong>{application.district}, {application.state}</strong></div><div><small>Open checks</small><strong>{application.missingChecks.length} require review</strong></div></div>
                <div className="draft-field-toolbar">
                  <button className="text-button" onClick={() => setExpandedApplication(expandedApplication === application.id ? "" : application.id)}>
                    {expandedApplication === application.id ? "Hide prepared fields" : "Review prepared fields"} <ChevronDown size={14}/>
                  </button>
                  {application.reviewedAt
                    ? <span className="reviewed-label"><CheckCircle2 size={13}/> Citizen review recorded · {shortDate(application.reviewedAt)}</span>
                    : <button className="button button-small button-outline" onClick={() => setApplications((current) => current.map((item) => item.id === application.id ? { ...item, reviewedAt: new Date().toISOString(), status: "Reviewed by citizen — not submitted" } : item))}>Mark as reviewed</button>}
                </div>
                {expandedApplication === application.id && <div className="draft-field-grid">
                  {(application.fields || []).map((field) => <div className="draft-field" key={field.key}>
                    <span>{field.label}</span><strong>{field.value || "Not provided"}</strong>
                    <small>{field.source} · {field.status === "provided" ? "Provided" : "Needs information"}</small>
                  </div>)}
                  <p className="draft-field-note">These are profile preparation fields, not a verified mapping to an official department form. Confirm the form's current fields and values on the linked official source.</p>
                </div>}
                <p className="application-disclaimer"><CircleAlert size={15}/>{application.disclaimer}</p><div className="application-actions"><a className="text-button" href={application.sourceUrl} target="_blank" rel="noreferrer">Open official source <ArrowUpRight size={14}/></a><button className="button button-small button-outline" onClick={() => addFollowup(application)}><CalendarClock size={14}/> Add follow-up</button><button className="text-button danger-text" onClick={() => setApplications((current) => current.filter((item) => item.id !== application.id))}>Remove</button></div></article>)}</div>}
            {tasks.length > 0 && <div className="panel followup-panel"><div className="section-heading"><div><div className="eyebrow">FOLLOW-UP MEMORY</div><h2>Upcoming actions</h2></div><span className="trace-count">{tasks.length} reminders</span></div>{tasks.map((task) => <div className="task-row" key={task.id}><div className="task-date"><CalendarClock size={17}/></div><div><strong>{task.title}</strong><small>Suggested date: {shortDate(task.dueAt)} · {task.note}</small></div><button className="text-button" onClick={() => setTasks((current) => current.filter((item) => item.id !== task.id))}>Done</button></div>)}</div>}
          </section>}

          {tab === "about" && <section className="page-section">
            <div className="page-title-row"><div><div className="eyebrow">OUR APPROACH</div><h1>Clarity, evidence and citizen control.</h1><p>JanaSetu is an independent benefits navigation prototype. It complements official portals; it does not replace them.</p></div></div>
            <div className="about-grid">
              <article className="panel about-card"><div className="about-icon"><Search size={19}/></div><h2>Discover</h2><p>Use one reusable citizen profile to select relevant pathways from a curated catalogue of official scheme references.</p></article>
              <article className="panel about-card"><div className="about-icon"><ShieldCheck size={19}/></div><h2>Explain</h2><p>Each screening condition shows the rule, the profile field used and whether the evidence is matched, not matched or unknown.</p></article>
              <article className="panel about-card"><div className="about-icon"><FileCheck2 size={19}/></div><h2>Prepare</h2><p>Generate a local draft and a document checklist for review. The prototype does not submit to government portals.</p></article>
              <article className="panel about-card"><div className="about-icon"><CalendarClock size={19}/></div><h2>Remember</h2><p>Keep application drafts and follow-up reminders in this browser so a citizen can resume the workflow.</p></article>
            </div>
            <div className="panel source-panel"><div className="section-heading"><div><div className="eyebrow">DATA TRANSPARENCY</div><h2>What is in the current catalogue?</h2></div><span className="trace-count">4 curated records</span></div>
              {SCHEMES.map((scheme) => <div className="source-row" key={scheme.id}><div><strong>{scheme.name}</strong><small>{scheme.sourcePeriod}</small></div><a href={scheme.sourceUrl} target="_blank" rel="noreferrer">Official source <ArrowUpRight size={14}/></a></div>)}
              <div className="source-disclaimer"><CircleAlert size={16}/><p><strong>Coverage honesty:</strong> The prototype currently has {SCHEMES.length} curated Central Government scheme records. It does not yet include every Central or State/UT scheme. Selecting a State/UT personalizes profile context only; it does not mean that State’s catalogue is complete. Scheme records need an official source, eligibility conditions, application link, and last-verified date. Check myScheme and the relevant State portal for the full live catalogue.</p></div>
            </div>
            <div className="panel responsible-panel"><h2>Responsible-use boundary</h2><p>JanaSetu provides preliminary information and workflow support. It does not provide legal or official determinations, authenticate identity, make benefit decisions, guarantee receipt of benefits or act on behalf of a government department. Citizens should verify all details with the official source and responsible authority.</p><div className="responsible-links"><a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer">myScheme <ArrowUpRight size={13}/></a><a href="https://web.umang.gov.in/" target="_blank" rel="noreferrer">UMANG <ArrowUpRight size={13}/></a><a href="https://locator.csccloud.in/" target="_blank" rel="noreferrer">CSC locator <ArrowUpRight size={13}/></a></div></div>
          </section>}

          <footer className="page-footer"><span>© 2026 JanaSetu · Independent public-benefits navigation</span><span><ShieldCheck size={13}/> Evidence-led. Human-controlled.</span></footer>
        </div>
      </main>
      {notice && <div className="toast" role="status"><CheckCircle2 size={17}/><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={15}/></button></div>}
      {showMobileNav && <button className="nav-backdrop" onClick={() => setShowMobileNav(false)} aria-label="Close navigation"/>}
    </div>
  );
}
