"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Bell, BookOpen, Download, ExternalLink,
  Building2, CalendarClock, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleAlert, ClipboardCheck, Clock3, FileCheck2, FileText, Globe2, HandHeart,
  House, IndianRupee, Landmark, LayoutDashboard, ListChecks, LockKeyhole,
  MessageCircle, Search, ShieldCheck, Sparkles, Sprout, Upload, UserRound,
  Users, Wallet, X, Menu, GraduationCap, Leaf
} from "lucide-react";
import { runBenefitsAgent } from "@/lib/agent";
import snapshotMetadata from "@/data/smartduke-snapshot-meta.json";
import { parseCitizenMessage } from "@/lib/intake";
import { createDraftRecord } from "@/lib/draft";
import { localizedSchemeText } from "@/lib/scheme-translations";
import { invalidateUnapprovedApplications, invalidateUnapprovedAssessments } from "@/lib/assessment-safety";
import { parseBackupApplications, parseBackupAssessments, parseBackupDocuments, parseBackupLanguage, parseBackupProfile, parseBackupTasks, type DraftField, type LocalApplicationRecord, type LocalDocumentRecord, type LocalTaskRecord } from "@/lib/backup-validation";
import { encryptVault, decryptVault } from "@/lib/encrypted-vault";
import { restoreEncryptedWorkspace, syncEncryptedWorkspace } from "@/lib/workspace-sync";
import { saveLocalDocument, getLocalDocuments, deleteLocalDocument, replaceLocalDocuments } from "@/lib/local-document-vault";
import {
  LANGUAGE_OPTIONS, SCHEMES, STATES_AND_UTS,
  type Assessment, type CitizenProfile, type LanguageCode
} from "@/lib/catalog";

type Tab = "overview" | "discover" | "profile" | "documents" | "applications" | "about";
type LocalApplication = LocalApplicationRecord;
type LocalDocument = LocalDocumentRecord;
type LocalTask = LocalTaskRecord;

const STORAGE = {
  profile: "janSetu.profile.v1",
  language: "janSetu.language.v1",
  applications: "janSetu.applications.v1",
  documents: "janSetu.documents.v1",
  tasks: "janSetu.tasks.v1",
  assessments: "janSetu.assessments.v1"
};

function mergeCitizenProfile(local: CitizenProfile, remote: CitizenProfile): CitizenProfile {
  const merged: Record<string, unknown> = { ...remote };
  for (const [key, value] of Object.entries(local)) {
    if (value !== "" && value !== null && value !== undefined) (merged as Record<string, unknown>)[key] = value;
  }
  return merged as unknown as CitizenProfile;
}
function mergeWorkspaceRecords<T extends Record<string, unknown>>(local: T[], remote: T[], identity: (item: T) => string): T[] {
  const merged = new Map<string, T>();
  const timestamp = (item: T) => {
    const value = item.updatedAt ?? item.updated_at ?? item.createdAt ?? item.created_at ?? item.addedAt ?? item.dueAt;
    const parsed = typeof value === "string" ? Date.parse(value) : NaN;
    return Number.isFinite(parsed) ? parsed : -1;
  };
  for (const item of remote) merged.set(identity(item), item);
  for (const item of local) {
    const key = identity(item), existing = merged.get(key);
    if (!existing || timestamp(item) >= timestamp(existing)) merged.set(key, item);
  }
  return [...merged.values()];
}

const EMPTY_PROFILE: CitizenProfile = {
  fullName: "", age: "", gender: "", state: "", district: "", residenceType: "",
  annualIncome: "", occupation: "", hasCultivableLand: null, pmKisanExcluded: "unknown",
  ownsPuccaHouse: null, previousHousingBenefit: "unknown", householdHasLpg: null,
  poorHouseholdDeclaration: null, isStudent: false, top20Percentile: null,
  regularUndergraduate: null, otherScholarship: null, diplomaOrDistance: null
};


const COPY: Record<LanguageCode, Record<string, string>> = {
  en: {
    overview: "Overview", discover: "Find benefits", profile: "My profile", documents: "Documents",
    heroTitle1: "One profile.", heroTitle2: "Clear next steps.",
    heroDescription: "Go beyond finding schemes. See which rules need evidence, what remains uncertain and what to prepare next.",
    applications: "My applications", about: "How it works", hello: "Government benefits, made easier to access.",
    intro: "A clearer path from your circumstances to the support you may be able to access.",
    start: "Start eligibility check", search: "Search schemes or support",
    verified: "Source-linked catalogue", next: "Your next steps", featured: "Potential benefit pathways",
    reviewed: "Reviewed scheme records", coverage: "Profile coverage", languages: "Interface languages",
    screening: "Screening workspace", run: "Run benefit assessment", save: "Save profile",
    saved: "Profile saved in this browser", view: "View details", prepare: "Prepare draft",
    noResult: "No screening results yet", noResultText: "Complete your profile and run an assessment to see relevant pathways.",
    match: "Potential match", review: "Needs verification", noMatch: "Not matched",
    source: "Official source", privacy: "Your profile, assessments, drafts and reminders stay in this browser. Screening and text extraction run locally in this prototype. Exported vaults are password-encrypted; browser storage itself is not app-encrypted. Government portals receive data only if you choose to enter or submit it there.",
    profileTitle: "Build your citizen profile", profileText: "Share only the details needed to screen the pathways in this catalogue.",
    documentsTitle: "Document checklist", documentsText: "Files stay on this device in browser storage. Exported vaults are password-encrypted; browser storage itself is not app-encrypted. Files are not uploaded or automatically malware-scanned.",
    applicationsTitle: "Application workspace", applicationsText: "Drafts are preparation records. Nothing here has been submitted to a government portal.",
    language: "Language", allIndia: "Designed for every State and Union Territory", catalogue: "Source-linked Central + Karnataka starter catalogue · partial coverage",
    official: "Official decision remains with the department", noUpload: "Files are not uploaded",
    skip: "Skip to main content",
    benefitsAccess: "BENEFITS ACCESS",
    workspace: "GOVERNMENT BENEFITS WORKSPACE",
    independent: "Independent public-service navigator",
    localFirst: "Local-first prototype",
    backup: "Backup",
    restore: "Restore",
    evidence: "Evidence linked",
    nextReady: "Next action ready",
    noSensitive: "No Aadhaar or bank-account number required in this prototype.",
    ecosystem: "BUILT FOR THE REAL PUBLIC-SERVICE ECOSYSTEM",
    prepLayer: "A preparation layer — not another government portal.",
    ecosystemText: "Use JanaSetu to organise your evidence and next steps. Official platforms and departments remain authoritative for scheme information, document services and application submission.",
    schemeDiscovery: "Scheme discovery",
    govServices: "Government services",
    digitalDocs: "Digital documents",
    assistedAccess: "Assisted access",
    startSituation: "START WITH YOUR SITUATION",
    intakeNote: "Text extraction is a suggestion. Check every field before saving.",
    catalogueEntries: "Catalogue entries",
    stateSupport: "State/UT selection supported",
    indianLanguages: "English + 5 Indian languages",
    draftApps: "Draft applications",
    browserBackup: "Browser-only · backup to move devices",
    gettingStarted: "GETTING STARTED",
    createStep: "Create your citizen profile",
    assessmentStep: "Run an evidence-led assessment",
    prepareStep: "Prepare your next action",
    profileCompleteness: "Profile completeness",
    builtTrust: "BUILT AROUND TRUST",
    trustTitle: "Know why. Know what’s next.",
    unknown: "Unknown stays unknown",
    sourceRules: "Source-linked rules",
    humanApproval: "Human approval before action",
    readApproach: "Read our approach",
    curated: "CURATED NATIONAL CATALOGUE",
    exploreAll: "Explore all",
    passport: "CITIZEN PASSPORT",
    privacyBoundary: "Prototype data boundary",
    intelligence: "SCHEME INTELLIGENCE",
    execution: "EXECUTION TRACE",
    agentActions: "What the agent did",

    fullNameLabel: "Full name",
    ageLabel: "Age",
    genderLabel: "Gender",
    stateLabel: "State / Union Territory",
    districtLabel: "District",
    residenceLabel: "Residence type",
    incomeLabel: "Annual household income",
    occupationLabel: "Occupation",
    chooseState: "Choose a State/UT",
    select: "Select",
    woman: "Woman",
    man: "Man",
    otherGender: "Other / prefer not to say",
    rural: "Rural",
    urban: "Urban",
    occupationSelect: "Select occupation",
    farmer: "Farmer",
    agriWorker: "Agricultural worker",
    student: "Student",
    selfEmployed: "Self-employed",
    vendor: "Vendor / small business",
    salaried: "Salaried",
    unemployed: "Unemployed",
    homemaker: "Homemaker",
    other: "Other",
    yes: "Yes",
    no: "No",
    notSure: "Not sure",
    intakeTitle: "Describe your situation in your own words",
    intakeDescription: "We may extract suggested details from your description. Check every field before continuing.",
    aboutYou: "About you",
    aboutYouText: "Provide only the details needed for an initial screening of relevant schemes.",
    housing: "Housing situation",
    housingText: "Questions about your home and previous government housing support.",
    agri: "Agriculture and land",
    agriText: "Questions about agricultural land and farmer schemes.",
    education: "Education and scholarships",
    educationText: "Questions about student status and scholarship support.",
    profileReady: "Profile readiness",
    privacyTitle: "Privacy by design",
    localProfile: "Local profile in this browser",
    humanHelp: "Need help with government schemes?",
    ownsHouse: "Does your family own a pucca house anywhere in India?",
    govtHouse: "Has your family received a government house in the last 20 years?",
    lpg: "Does anyone in your household have an LPG connection?",
    poorDecl: "Can the applicant provide the required poor-household declaration for PMUY?",
    landRecords: "Is cultivable land recorded in the State/UT land records?",
    kisanExclusion: "Does anyone in the family fall under a PM-KISAN exclusion category?",
    currentlyStudent: "Are you currently a student?",
    percentile: "Are you above the 80th percentile in your board/stream?",
    undergrad: "Are you enrolled in a regular undergraduate course?",
    scholarship: "Do you receive another scholarship or fee reimbursement?",
    distanceCourse: "Is your course a diploma or distance/correspondence course?",
    noAfterReview: "No, after checking the list",


  },
  hi: {
    overview: "अवलोकन", discover: "लाभ खोजें", profile: "मेरी प्रोफ़ाइल", documents: "दस्तावेज़",
    heroTitle1: "एक प्रोफ़ाइल।", heroTitle2: "अगले कदम स्पष्ट।",
    heroDescription: "केवल योजनाएँ न खोजें। समझें कि किन नियमों के लिए प्रमाण चाहिए, क्या अनिश्चित है और आगे क्या तैयार करना है।",
    applications: "मेरे आवेदन", about: "यह कैसे काम करता है", hello: "सरकारी योजनाओं और लाभों तक आसान पहुँच।",
    intro: "आपकी परिस्थितियों से संभावित सहायता तक एक स्पष्ट रास्ता।", start: "पात्रता जाँच शुरू करें", search: "योजनाएँ या सहायता खोजें", verified: "स्रोत-संदर्भित सूची",
    next: "आपके अगले कदम", featured: "संभावित लाभ के रास्ते", reviewed: "समीक्षित योजना रिकॉर्ड",
    coverage: "प्रोफ़ाइल कवरेज", languages: "इंटरफ़ेस भाषाएँ", screening: "जाँच कार्यक्षेत्र",
    run: "लाभ आकलन चलाएँ", save: "प्रोफ़ाइल सहेजें", saved: "प्रोफ़ाइल इस ब्राउज़र में सहेजी गई",
    view: "विवरण देखें", prepare: "ड्राफ़्ट तैयार करें", noResult: "अभी कोई जाँच परिणाम नहीं",
    noResultText: "प्रासंगिक विकल्प देखने के लिए प्रोफ़ाइल पूरी करें और आकलन चलाएँ।",
    match: "संभावित मिलान", review: "सत्यापन आवश्यक", noMatch: "मिलान नहीं",
    source: "आधिकारिक स्रोत", privacy: "आपकी प्रोफ़ाइल, जाँच, ड्राफ़्ट और रिमाइंडर इसी ब्राउज़र में रहते हैं। डेमो की नियम-जाँच और टेक्स्ट निष्कर्षण स्थानीय रूप से होता है। बैकअप वॉल्ट पासवर्ड से एन्क्रिप्ट होता है; ब्राउज़र स्टोरेज स्वयं ऐप-स्तर पर एन्क्रिप्टेड नहीं है। सरकारी पोर्टल को जानकारी तभी जाती है जब आप स्वयं वहाँ भरें या जमा करें।",
    profileTitle: "अपनी नागरिक प्रोफ़ाइल बनाएँ", profileText: "केवल आवश्यक जानकारी साझा करें।",
    documentsTitle: "दस्तावेज़ सूची", documentsText: "फ़ाइलें इसी डिवाइस के ब्राउज़र स्टोरेज में रहती हैं। एक्सपोर्ट किया गया वॉल्ट पासवर्ड से एन्क्रिप्ट होता है; ब्राउज़र स्टोरेज स्वयं ऐप-स्तर पर एन्क्रिप्टेड नहीं है। फ़ाइलें अपलोड या अपने-आप मैलवेयर स्कैन नहीं होतीं।",
    applicationsTitle: "आवेदन कार्यक्षेत्र", applicationsText: "ये तैयारी के ड्राफ़्ट हैं; कोई आवेदन सरकारी पोर्टल पर जमा नहीं हुआ है।",
    language: "भाषा", allIndia: "हर राज्य और केंद्र शासित प्रदेश के लिए", catalogue: "चयनित केंद्रीय योजनाओं का पायलट",
    official: "अंतिम निर्णय संबंधित विभाग का होगा", noUpload: "फ़ाइलें अपलोड नहीं होतीं",
    skip: "मुख्य सामग्री पर जाएँ",
    benefitsAccess: "लाभ तक पहुँच",
    workspace: "सरकारी लाभ कार्यक्षेत्र",
    independent: "स्वतंत्र सार्वजनिक सेवा मार्गदर्शक",
    localFirst: "स्थानीय-प्रथम प्रोटोटाइप",
    backup: "बैकअप",
    restore: "पुनर्स्थापित करें",
    evidence: "स्रोत प्रमाण जुड़ा है",
    nextReady: "अगला कदम तैयार",
    noSensitive: "इस प्रोटोटाइप में आधार या बैंक खाता संख्या आवश्यक नहीं है।",
    ecosystem: "वास्तविक सार्वजनिक सेवा व्यवस्था के लिए",
    prepLayer: "तैयारी का माध्यम — कोई सरकारी पोर्टल नहीं।",
    ecosystemText: "अपने प्रमाण और अगले कदम व्यवस्थित करने के लिए JanaSetu का उपयोग करें। योजनाओं, दस्तावेज़ सेवाओं और आवेदन जमा करने के लिए आधिकारिक विभाग ही प्रामाणिक हैं।",
    schemeDiscovery: "योजना खोज",
    govServices: "सरकारी सेवाएँ",
    digitalDocs: "डिजिटल दस्तावेज़",
    assistedAccess: "सहायता प्राप्त सेवा",
    startSituation: "अपनी स्थिति से शुरू करें",
    intakeNote: "पाठ से निकली जानकारी केवल सुझाव है। सहेजने से पहले हर फ़ील्ड जाँचें।",
    catalogueEntries: "सूची में प्रविष्टियाँ",
    stateSupport: "राज्य/केंद्रशासित प्रदेश चयन उपलब्ध",
    indianLanguages: "अंग्रेज़ी + 5 भारतीय भाषाएँ",
    draftApps: "आवेदन के ड्राफ़्ट",
    browserBackup: "केवल ब्राउज़र में · डिवाइस बदलने के लिए बैकअप",
    gettingStarted: "शुरू करें",
    createStep: "अपनी नागरिक प्रोफ़ाइल बनाएँ",
    assessmentStep: "प्रमाण-आधारित आकलन चलाएँ",
    prepareStep: "अगला कदम तैयार करें",
    profileCompleteness: "प्रोफ़ाइल पूर्णता",
    builtTrust: "विश्वास को ध्यान में रखकर",
    trustTitle: "कारण जानें। अगला कदम समझें।",
    unknown: "अज्ञात जानकारी अज्ञात ही रहेगी",
    sourceRules: "स्रोत-संदर्भित नियम",
    humanApproval: "कार्रवाई से पहले मानव स्वीकृति",
    readApproach: "हमारा तरीका पढ़ें",
    curated: "राष्ट्रीय योजना सूची",
    exploreAll: "सभी देखें",
    passport: "नागरिक प्रोफ़ाइल",
    privacyBoundary: "प्रोटोटाइप डेटा सीमा",
    intelligence: "योजना जानकारी",
    execution: "कार्रवाई का विवरण",
    agentActions: "सिस्टम ने क्या किया",

    fullNameLabel: "पूरा नाम",
    ageLabel: "आयु",
    genderLabel: "लिंग",
    stateLabel: "राज्य / केंद्र शासित प्रदेश",
    districtLabel: "ज़िला",
    residenceLabel: "निवास का प्रकार",
    incomeLabel: "वार्षिक पारिवारिक आय",
    occupationLabel: "व्यवसाय",
    chooseState: "राज्य चुनें",
    select: "चुनें",
    woman: "महिला",
    man: "पुरुष",
    otherGender: "अन्य / बताना नहीं चाहते",
    rural: "ग्रामीण",
    urban: "शहरी",
    occupationSelect: "व्यवसाय चुनें",
    farmer: "किसान",
    agriWorker: "कृषि मज़दूर",
    student: "छात्र",
    selfEmployed: "स्वरोज़गार",
    vendor: "विक्रेता / छोटा व्यापारी",
    salaried: "वेतनभोगी",
    unemployed: "बेरोज़गार",
    homemaker: "गृहकार्य",
    other: "अन्य",
    yes: "हाँ",
    no: "नहीं",
    notSure: "पक्का नहीं",
    intakeTitle: "अपनी स्थिति अपने शब्दों में बताएँ",
    intakeDescription: "आपके बताए विवरण से संभावित जानकारी निकाली जाएगी। आगे बढ़ने से पहले हर फ़ील्ड जाँचें।",
    aboutYou: "आपके बारे में",
    aboutYouText: "केवल वही जानकारी दें जो संबंधित योजना की प्रारंभिक जाँच के लिए आवश्यक है।",
    housing: "आवास की स्थिति",
    housingText: "घर और पिछले सरकारी आवास लाभों से जुड़े प्रश्न।",
    agri: "कृषि और भूमि",
    agriText: "कृषि भूमि और किसान योजना से जुड़े प्रश्न।",
    education: "शिक्षा और छात्रवृत्ति",
    educationText: "छात्र स्थिति और छात्रवृत्ति से जुड़े प्रश्न।",
    profileReady: "प्रोफ़ाइल की तैयारी",
    privacyTitle: "डिज़ाइन में गोपनीयता",
    localProfile: "इस ब्राउज़र में स्थानीय प्रोफ़ाइल",
    humanHelp: "सरकारी योजनाओं के लिए सहायता चाहिए?",
    ownsHouse: "क्या आपके परिवार के पास भारत में कहीं पक्का घर है?",
    govtHouse: "क्या पिछले 20 वर्षों में परिवार को सरकारी आवास मिला है?",
    lpg: "क्या आपके घर में किसी के पास LPG कनेक्शन है?",
    poorDecl: "क्या आवेदक PMUY के लिए निर्धारित गरीब परिवार घोषणा दे सकता है?",
    landRecords: "क्या कृषि भूमि राज्य/UT के भूमि रिकॉर्ड में दर्ज है?",
    kisanExclusion: "क्या परिवार का कोई सदस्य PM-KISAN अपवर्जन श्रेणी में आता है?",
    currentlyStudent: "क्या आप वर्तमान में विद्यार्थी हैं?",
    percentile: "क्या आप बोर्ड/स्ट्रीम में 80वें पर्सेंटाइल से ऊपर हैं?",
    undergrad: "क्या आप नियमित स्नातक पाठ्यक्रम में नामांकित हैं?",
    scholarship: "क्या आपको कोई अन्य छात्रवृत्ति या शुल्क प्रतिपूर्ति मिलती है?",
    distanceCourse: "क्या आपका पाठ्यक्रम डिप्लोमा या दूरस्थ/पत्राचार पाठ्यक्रम है?",
    noAfterReview: "सूची जाँचने के बाद नहीं",

  },
  kn: {
    overview: "ಅವಲೋಕನ", discover: "ಸೌಲಭ್ಯಗಳನ್ನು ಹುಡುಕಿ", profile: "ನನ್ನ ಪ್ರೊಫೈಲ್", documents: "ದಾಖಲೆಗಳು",
    heroTitle1: "ಒಂದು ಪ್ರೊಫೈಲ್.", heroTitle2: "ಮುಂದಿನ ಹಂತಗಳು ಸ್ಪಷ್ಟ.",
    heroDescription: "ಯೋಜನೆಗಳನ್ನು ಹುಡುಕುವುದಷ್ಟೇ ಅಲ್ಲ. ಯಾವ ನಿಯಮಕ್ಕೆ ಯಾವ ದಾಖಲೆ ಬೇಕು, ಯಾವುದು ಇನ್ನೂ ಸ್ಪಷ್ಟವಿಲ್ಲ ಮತ್ತು ಮುಂದೆ ಏನು ಸಿದ್ಧಪಡಿಸಬೇಕು ಎಂಬುದನ್ನು ತಿಳಿಯಿರಿ.",
    applications: "ನನ್ನ ಅರ್ಜಿಗಳು", about: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ", hello: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸೌಲಭ್ಯಗಳನ್ನು ಸುಲಭವಾಗಿ ಪಡೆಯಿರಿ.",
    intro: "ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯಿಂದ ಸಾಧ್ಯವಿರುವ ನೆರವಿನವರೆಗೆ ಸ್ಪಷ್ಟ ದಾರಿ.", start: "ಅರ್ಹತೆ ಪರಿಶೀಲನೆ ಪ್ರಾರಂಭಿಸಿ", search: "ಯೋಜನೆಗಳು ಅಥವಾ ನೆರವು ಹುಡುಕಿ", verified: "ಮೂಲ-ಸೂಚನೆಯ ಪಟ್ಟಿ",
    next: "ನಿಮ್ಮ ಮುಂದಿನ ಹಂತಗಳು", featured: "ಸಂಭಾವ್ಯ ಸೌಲಭ್ಯ ಮಾರ್ಗಗಳು", reviewed: "ಪರಿಶೀಲಿಸಿದ ಯೋಜನೆ ದಾಖಲೆಗಳು",
    coverage: "ಪ್ರೊಫೈಲ್ ವ್ಯಾಪ್ತಿ", languages: "ಇಂಟರ್ಫೇಸ್ ಭಾಷೆಗಳು", screening: "ಪರಿಶೀಲನಾ ಕಾರ್ಯಕ್ಷೇತ್ರ",
    run: "ಸೌಲಭ್ಯ ಮೌಲ್ಯಮಾಪನ ನಡೆಸಿ", save: "ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ", saved: "ಪ್ರೊಫೈಲ್ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ",
    view: "ವಿವರಗಳನ್ನು ನೋಡಿ", prepare: "ಕರಡು ಸಿದ್ಧಪಡಿಸಿ", noResult: "ಇನ್ನೂ ಪರಿಶೀಲನಾ ಫಲಿತಾಂಶಗಳಿಲ್ಲ",
    noResultText: "ಸಂಬಂಧಿತ ಮಾರ್ಗಗಳನ್ನು ನೋಡಲು ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ ಮತ್ತು ಮೌಲ್ಯಮಾಪನ ನಡೆಸಿ.",
    match: "ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ", review: "ಪರಿಶೀಲನೆ ಅಗತ್ಯ", noMatch: "ಹೊಂದಾಣಿಕೆ ಇಲ್ಲ",
    source: "ಅಧಿಕೃತ ಮೂಲ", privacy: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್, ಮೌಲ್ಯಮಾಪನ, ಕರಡು ಮತ್ತು ನೆನಪಿನ ಸೂಚನೆಗಳು ಈ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಉಳಿಯುತ್ತವೆ. ಡೆಮೊ ನಿಯಮ ಪರಿಶೀಲನೆ ಮತ್ತು ಪಠ್ಯ ಹೊರತೆಗೆಯುವಿಕೆ ಸ್ಥಳೀಯವಾಗಿ ನಡೆಯುತ್ತದೆ. ರಫ್ತು ಮಾಡಿದ ವಾಲ್ಟ್ ಪಾಸ್‌ವರ್ಡ್‌ನಿಂದ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಆಗುತ್ತದೆ; ಬ್ರೌಸರ್ ಸಂಗ್ರಹಣೆ ಆ್ಯಪ್-ಮಟ್ಟದಲ್ಲಿ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಆಗಿಲ್ಲ. ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗೆ ಮಾಹಿತಿ ನೀವು ಸ್ವತಃ ಭರ್ತಿ ಅಥವಾ ಸಲ್ಲಿಸಿದಾಗ ಮಾತ್ರ ಹೋಗುತ್ತದೆ.",
    profileTitle: "ನಿಮ್ಮ ನಾಗರಿಕ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ", profileText: "ಅಗತ್ಯವಿರುವ ವಿವರಗಳನ್ನು ಮಾತ್ರ ಹಂಚಿಕೊಳ್ಳಿ.",
    documentsTitle: "ದಾಖಲೆಗಳ ಪಟ್ಟಿ", documentsText: "ಫೈಲ್‌ಗಳು ಈ ಸಾಧನದ ಬ್ರೌಸರ್ ಸಂಗ್ರಹಣೆಯಲ್ಲೇ ಇರುತ್ತವೆ. ರಫ್ತು ಮಾಡಿದ ವಾಲ್ಟ್ ಪಾಸ್‌ವರ್ಡ್‌ನಿಂದ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಆಗುತ್ತದೆ; ಬ್ರೌಸರ್ ಸಂಗ್ರಹಣೆ ಸ್ವತಃ ಆ್ಯಪ್-ಮಟ್ಟದಲ್ಲಿ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಆಗಿರುವುದಿಲ್ಲ. ಫೈಲ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡುವುದಿಲ್ಲ ಅಥವಾ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮಾಲ್‌ವೇರ್ ಸ್ಕ್ಯಾನ್ ಮಾಡುವುದಿಲ್ಲ.",
    applicationsTitle: "ಅರ್ಜಿ ಕಾರ್ಯಕ್ಷೇತ್ರ", applicationsText: "ಇವು ಕರಡು ದಾಖಲೆಗಳು ಮಾತ್ರ; ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗೆ ಸಲ್ಲಿಸಲಾಗಿಲ್ಲ.",
    language: "ಭಾಷೆ", allIndia: "ಪ್ರತಿ ರಾಜ್ಯ ಮತ್ತು ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶಕ್ಕಾಗಿ", catalogue: "ಆಯ್ದ ಕೇಂದ್ರ ಯೋಜನೆಗಳ ಪೈಲಟ್",
    official: "ಅಂತಿಮ ನಿರ್ಧಾರ ಸಂಬಂಧಿತ ಇಲಾಖೆಯದು", noUpload: "ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಆಗುವುದಿಲ್ಲ",
    skip: "ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ತೆರಳಿ",
    benefitsAccess: "ಸೌಲಭ್ಯಗಳ ಪ್ರವೇಶ",
    workspace: "ಸರ್ಕಾರಿ ಸೌಲಭ್ಯ ಕಾರ್ಯಕ್ಷೇತ್ರ",
    independent: "ಸ್ವತಂತ್ರ ಸಾರ್ವಜನಿಕ ಸೇವಾ ಮಾರ್ಗದರ್ಶಿ",
    localFirst: "ಸ್ಥಳೀಯ-ಪ್ರಥಮ ಮಾದರಿ",
    backup: "ಬ್ಯಾಕಪ್",
    restore: "ಮರುಸ್ಥಾಪಿಸಿ",
    evidence: "ಮೂಲ ಸಾಕ್ಷ್ಯ ಜೋಡಿಸಲಾಗಿದೆ",
    nextReady: "ಮುಂದಿನ ಕ್ರಮ ಸಿದ್ಧ",
    noSensitive: "ಈ ಮಾದರಿಯಲ್ಲಿ ಆಧಾರ್ ಅಥವಾ ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ ಅಗತ್ಯವಿಲ್ಲ.",
    ecosystem: "ನೈಜ ಸಾರ್ವಜನಿಕ ಸೇವಾ ವ್ಯವಸ್ಥೆಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ",
    prepLayer: "ಸಿದ್ಧತಾ ವೇದಿಕೆ — ಮತ್ತೊಂದು ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್ ಅಲ್ಲ.",
    ecosystemText: "ನಿಮ್ಮ ಸಾಕ್ಷ್ಯ ಮತ್ತು ಮುಂದಿನ ಹಂತಗಳನ್ನು ವ್ಯವಸ್ಥಿತಗೊಳಿಸಲು JanaSetu ಬಳಸಿ. ಯೋಜನೆ ಮಾಹಿತಿ, ದಾಖಲೆ ಸೇವೆ ಮತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಕೆಗೆ ಅಧಿಕೃತ ಇಲಾಖೆಗಳೇ ಅಂತಿಮ ಮೂಲ.",
    schemeDiscovery: "ಯೋಜನೆ ಹುಡುಕಾಟ",
    govServices: "ಸರ್ಕಾರಿ ಸೇವೆಗಳು",
    digitalDocs: "ಡಿಜಿಟಲ್ ದಾಖಲೆಗಳು",
    assistedAccess: "ಸಹಾಯಿತ ಸೇವೆ",
    startSituation: "ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯಿಂದ ಪ್ರಾರಂಭಿಸಿ",
    intakeNote: "ಪಠ್ಯದಿಂದ ಪಡೆದ ಮಾಹಿತಿ ಕೇವಲ ಸಲಹೆ. ಉಳಿಸುವ ಮೊದಲು ಪ್ರತಿಯೊಂದು ಕ್ಷೇತ್ರವನ್ನು ಪರಿಶೀಲಿಸಿ.",
    catalogueEntries: "ಪಟ್ಟಿಯ ದಾಖಲೆಗಳು",
    stateSupport: "ರಾಜ್ಯ/ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶ ಆಯ್ಕೆ ಲಭ್ಯ",
    indianLanguages: "ಇಂಗ್ಲಿಷ್ + 5 ಭಾರತೀಯ ಭಾಷೆಗಳು",
    draftApps: "ಅರ್ಜಿ ಕರಡುಗಳು",
    browserBackup: "ಬ್ರೌಸರ್‌ನಲ್ಲೇ · ಸಾಧನ ಬದಲಾವಣೆಗೆ ಬ್ಯಾಕಪ್",
    gettingStarted: "ಪ್ರಾರಂಭಿಸಿ",
    createStep: "ನಿಮ್ಮ ನಾಗರಿಕ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ",
    assessmentStep: "ಸಾಕ್ಷ್ಯಾಧಾರಿತ ಮೌಲ್ಯಮಾಪನ ನಡೆಸಿ",
    prepareStep: "ಮುಂದಿನ ಕ್ರಮ ಸಿದ್ಧಪಡಿಸಿ",
    profileCompleteness: "ಪ್ರೊಫೈಲ್ ಪೂರ್ಣತೆ",
    builtTrust: "ನಂಬಿಕೆಯನ್ನು ಆಧರಿಸಿ",
    trustTitle: "ಕಾರಣ ತಿಳಿಯಿರಿ. ಮುಂದಿನ ಹಂತ ತಿಳಿಯಿರಿ.",
    unknown: "ಅಜ್ಞಾತವು ಅಜ್ಞಾತವಾಗಿಯೇ ಉಳಿಯುತ್ತದೆ",
    sourceRules: "ಮೂಲ-ಸೂಚನೆಯ ನಿಯಮಗಳು",
    humanApproval: "ಕ್ರಮಕ್ಕೂ ಮೊದಲು ಮಾನವ ಅನುಮೋದನೆ",
    readApproach: "ನಮ್ಮ ವಿಧಾನ ಓದಿ",
    curated: "ರಾಷ್ಟ್ರೀಯ ಯೋಜನೆಗಳ ಪಟ್ಟಿ",
    exploreAll: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ",
    passport: "ನಾಗರಿಕ ಪ್ರೊಫೈಲ್",
    privacyBoundary: "ಮಾದರಿ ಡೇಟಾ ಮಿತಿ",
    intelligence: "ಯೋಜನೆ ಮಾಹಿತಿ",
    execution: "ಕಾರ್ಯಗತಗೊಳಿಸುವ ಹಾದಿ",
    agentActions: "ಸಿಸ್ಟಮ್ ಮಾಡಿದ ಕೆಲಸ",

    fullNameLabel: "ಪೂರ್ಣ ಹೆಸರು",
    ageLabel: "ವಯಸ್ಸು",
    genderLabel: "ಲಿಂಗ",
    stateLabel: "ರಾಜ್ಯ / ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶ",
    districtLabel: "ಜಿಲ್ಲೆ",
    residenceLabel: "ವಾಸಸ್ಥಳದ ಪ್ರಕಾರ",
    incomeLabel: "ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ",
    occupationLabel: "ಉದ್ಯೋಗ",
    chooseState: "ರಾಜ್ಯ ಆಯ್ಕೆಮಾಡಿ",
    select: "ಆಯ್ಕೆಮಾಡಿ",
    woman: "ಮಹಿಳೆ",
    man: "ಪುರುಷ",
    otherGender: "ಇತರೆ / ಹೇಳಲು ಇಷ್ಟವಿಲ್ಲ",
    rural: "ಗ್ರಾಮೀಣ",
    urban: "ನಗರ",
    occupationSelect: "ಉದ್ಯೋಗ ಆಯ್ಕೆಮಾಡಿ",
    farmer: "ರೈತ",
    agriWorker: "ಕೃಷಿ ಕಾರ್ಮಿಕ",
    student: "ವಿದ್ಯಾರ್ಥಿ",
    selfEmployed: "ಸ್ವಯಂ ಉದ್ಯೋಗಿ",
    vendor: "ಮಾರಾಟಗಾರ / ಸಣ್ಣ ವ್ಯಾಪಾರಿ",
    salaried: "ವೇತನ ಪಡೆಯುವವರು",
    unemployed: "ನಿರುದ್ಯೋಗಿ",
    homemaker: "ಗೃಹಿಣಿ",
    other: "ಇತರೆ",
    yes: "ಹೌದು",
    no: "ಇಲ್ಲ",
    notSure: "ಖಚಿತವಿಲ್ಲ",
    intakeTitle: "ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ನಿಮ್ಮದೇ ಪದಗಳಲ್ಲಿ ತಿಳಿಸಿ",
    intakeDescription: "ನೀವು ನೀಡಿದ ವಿವರಗಳಿಂದ ಸಾಧ್ಯವಾದ ಮಾಹಿತಿಯನ್ನು ಗುರುತಿಸಲಾಗುತ್ತದೆ. ಮುಂದುವರಿಯುವ ಮೊದಲು ಪ್ರತಿಯೊಂದು ಕ್ಷೇತ್ರ ಪರಿಶೀಲಿಸಿ.",
    aboutYou: "ನಿಮ್ಮ ಬಗ್ಗೆ",
    aboutYouText: "ಸಂಬಂಧಿತ ಯೋಜನೆಯ ಪ್ರಾಥಮಿಕ ಪರಿಶೀಲನೆಗೆ ಅಗತ್ಯವಿರುವ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ನೀಡಿ.",
    housing: "ವಸತಿ ಸ್ಥಿತಿ",
    housingText: "ಮನೆ ಮತ್ತು ಹಿಂದಿನ ಸರ್ಕಾರಿ ವಸತಿ ನೆರವಿನ ಕುರಿತು ಪ್ರಶ್ನೆಗಳು.",
    agri: "ಕೃಷಿ ಮತ್ತು ಭೂಮಿ",
    agriText: "ಕೃಷಿಭೂಮಿ ಮತ್ತು ರೈತ ಯೋಜನೆಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳು.",
    education: "ಶಿಕ್ಷಣ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿವೇತನ",
    educationText: "ವಿದ್ಯಾರ್ಥಿ ಸ್ಥಿತಿ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿವೇತನದ ಪ್ರಶ್ನೆಗಳು.",
    profileReady: "ಪ್ರೊಫೈಲ್ ಸಿದ್ಧತೆ",
    privacyTitle: "ವಿನ್ಯಾಸದಲ್ಲೇ ಗೌಪ್ಯತೆ",
    localProfile: "ಈ ಬ್ರೌಸರ್‌ನ ಸ್ಥಳೀಯ ಪ್ರೊಫೈಲ್",
    humanHelp: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ಸಹಾಯ ಬೇಕೇ?",
    ownsHouse: "ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಭಾರತದಲ್ಲಿ ಎಲ್ಲಾದರೂ ಪಕ್ಕಾ ಮನೆ ಇದೆಯೇ?",
    govtHouse: "ಕಳೆದ 20 ವರ್ಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಸರ್ಕಾರಿ ಮನೆ ಮಂಜೂರಾಗಿದೆಯೇ?",
    lpg: "ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಯಾರಿಗಾದರೂ LPG ಸಂಪರ್ಕ ಇದೆಯೇ?",
    poorDecl: "ಅರ್ಜಿದಾರರು PMUY ಗಾಗಿ ಅಗತ್ಯವಿರುವ ಬಡ ಕುಟುಂಬ ಘೋಷಣೆಯನ್ನು ನೀಡಬಹುದೇ?",
    landRecords: "ಕೃಷಿಯೋಗ್ಯ ಭೂಮಿ ರಾಜ್ಯ/UT ಭೂ ದಾಖಲೆಗಳಲ್ಲಿ ಇದೆಯೇ?",
    kisanExclusion: "ಕುಟುಂಬದ ಯಾರಾದರೂ PM-KISAN ಹೊರತಾಗುವ ವರ್ಗಕ್ಕೆ ಸೇರುತ್ತಾರೆಯೇ?",
    currentlyStudent: "ನೀವು ಪ್ರಸ್ತುತ ವಿದ್ಯಾರ್ಥಿಯೇ?",
    percentile: "ನೀವು ಬೋರ್ಡ್/ಸ್ಟ್ರೀಮ್‌ನಲ್ಲಿ 80ನೇ ಪರ್ಸೆಂಟೈಲ್‌ಗಿಂತ ಮೇಲಿದ್ದೀರಾ?",
    undergrad: "ನೀವು ನಿಯಮಿತ ಪದವಿ ಕೋರ್ಸ್‌ಗೆ ಸೇರಿದ್ದೀರಾ?",
    scholarship: "ಬೇರೆ ವಿದ್ಯಾರ್ಥಿವೇತನ ಅಥವಾ ಶುಲ್ಕ ಮರುಪಾವತಿ ಪಡೆಯುತ್ತಿದ್ದೀರಾ?",
    distanceCourse: "ನಿಮ್ಮ ಕೋರ್ಸ್ ಡಿಪ್ಲೊಮಾ ಅಥವಾ ದೂರ/ಪತ್ರವ್ಯವಹಾರ ಕೋರ್ಸ್ ಆಗಿದೆಯೇ?",
    noAfterReview: "ಪಟ್ಟಿಯನ್ನು ಪರಿಶೀಲಿಸಿದ ನಂತರ ಇಲ್ಲ",

  },
  ta: {
    overview: "கண்ணோட்டம்", discover: "நலத்திட்டங்களைத் தேடு", profile: "எனது சுயவிவரம்", documents: "ஆவணங்கள்",
    heroTitle1: "ஒரு சுயவிவரம்.", heroTitle2: "அடுத்த படிகள் தெளிவாக.",
    heroDescription: "திட்டங்களைக் கண்டுபிடிப்பதைக் கடந்து செல்லுங்கள். எந்த விதிக்கு ஆதாரம் தேவை, எது இன்னும் உறுதியில்லை, அடுத்து என்ன தயார் செய்ய வேண்டும் என்பதை அறியுங்கள்.",
    applications: "எனது விண்ணப்பங்கள்", about: "இது எவ்வாறு செயல்படுகிறது", hello: "அரசுத் திட்டங்கள் மற்றும் நலன்களை எளிதாக அணுகலாம்.",
    intro: "உங்கள் சூழ்நிலையிலிருந்து சாத்தியமான உதவிவரை தெளிவான பாதை.", start: "தகுதி மதிப்பீட்டைத் தொடங்கு", search: "திட்டங்கள் அல்லது உதவியைத் தேடு", verified: "ஆதார இணைப்புள்ள பட்டியல்",
    next: "அடுத்த படிகள்", featured: "சாத்தியமான நலன் வழிகள்", reviewed: "மதிப்பாய்வு செய்யப்பட்ட திட்டங்கள்",
    coverage: "சுயவிவர பரப்பு", languages: "இடைமுக மொழிகள்", screening: "மதிப்பீட்டு மையம்",
    run: "நலன் மதிப்பீட்டை இயக்கு", save: "சுயவிவரத்தைச் சேமி", saved: "இந்த உலாவியில் சுயவிவரம் சேமிக்கப்பட்டது",
    view: "விவரங்களைக் காண்க", prepare: "வரைவைத் தயாரி", noResult: "இன்னும் மதிப்பீட்டு முடிவுகள் இல்லை",
    noResultText: "தொடர்புடைய வழிகளைக் காண சுயவிவரத்தைப் பூர்த்தி செய்து மதிப்பீட்டை இயக்கவும்.",
    match: "சாத்தியமான பொருத்தம்", review: "சரிபார்ப்பு தேவை", noMatch: "பொருத்தமில்லை",
    source: "அதிகாரப்பூர்வ ஆதாரம்", privacy: "உங்கள் சுயவிவரம், மதிப்பீடு, வரைவுகள் மற்றும் நினைவூட்டல்கள் இந்த உலாவியிலேயே இருக்கும். டெமோ விதி மதிப்பீடும் உரை பிரித்தெடுப்பும் உள்ளூரிலேயே நடக்கும். ஏற்றுமதி செய்யும் வால்ட் கடவுச்சொல்லால் குறியாக்கம் செய்யப்படும்; உலாவி சேமிப்பகம் செயலி-நிலையில் குறியாக்கம் செய்யப்படவில்லை. அரசு தளத்திற்கு நீங்கள் தானாகவே நிரப்பி அல்லது சமர்ப்பிக்கும்போது மட்டுமே தகவல் செல்லும்.",
    profileTitle: "குடிமகன் சுயவிவரத்தை உருவாக்கு", profileText: "தேவையான விவரங்களை மட்டும் பகிரவும்.",
    documentsTitle: "ஆவணப் பட்டியல்", documentsText: "கோப்புகள் இந்தச் சாதனத்தின் உலாவி சேமிப்பகத்தில் இருக்கும். ஏற்றுமதி செய்யும் வால்ட் கடவுச்சொல்லால் குறியாக்கம் செய்யப்படும்; உலாவி சேமிப்பகம் செயலி-நிலையில் குறியாக்கம் செய்யப்படவில்லை. கோப்புகள் பதிவேற்றப்படவோ தானாகவே தீம்பொருள் சோதனை செய்யப்படவோ மாட்டா.",
    applicationsTitle: "விண்ணப்பப் பணியிடம்", applicationsText: "இவை தயாரிப்பு வரைவுகள் மட்டுமே; அரசு தளத்தில் சமர்ப்பிக்கப்படவில்லை.",
    language: "மொழி", allIndia: "அனைத்து மாநிலங்கள் மற்றும் யூனியன் பிரதேசங்களுக்காக", catalogue: "தேர்ந்தெடுக்கப்பட்ட மத்திய திட்டங்களின் முன்னோடி",
    official: "இறுதி முடிவு சம்பந்தப்பட்ட துறையின்து", noUpload: "கோப்புகள் பதிவேற்றப்படாது",
    skip: "முக்கிய உள்ளடக்கத்திற்குச் செல்",
    benefitsAccess: "நலன்களை அணுகுதல்",
    workspace: "அரசு நலன் பணியிடம்",
    independent: "சுயாதீன பொது சேவை வழிகாட்டி",
    localFirst: "உள்ளூரை முதன்மைப்படுத்தும் முன்மாதிரி",
    backup: "காப்புப்பிரதி",
    restore: "மீட்டமை",
    evidence: "ஆதாரம் இணைக்கப்பட்டது",
    nextReady: "அடுத்த செயல் தயார்",
    noSensitive: "இந்த முன்மாதிரியில் ஆதார் அல்லது வங்கிக் கணக்கு எண் தேவையில்லை.",
    ecosystem: "உண்மையான பொது சேவை அமைப்பிற்காக உருவாக்கப்பட்டது",
    prepLayer: "தயாரிப்பு உதவி தளம் — மற்றொரு அரசு இணையதளம் அல்ல.",
    ecosystemText: "உங்கள் ஆதாரங்களையும் அடுத்த படிகளையும் ஒழுங்குபடுத்த JanaSetu-ஐப் பயன்படுத்துங்கள். திட்டத் தகவல், ஆவணச் சேவைகள் மற்றும் விண்ணப்பச் சமர்ப்பிப்புக்கு அதிகாரப்பூர்வ துறைகளே ஆதாரம்.",
    schemeDiscovery: "திட்டத் தேடல்",
    govServices: "அரசு சேவைகள்",
    digitalDocs: "மின்னணு ஆவணங்கள்",
    assistedAccess: "உதவியுடன் அணுகல்",
    startSituation: "உங்கள் சூழ்நிலையிலிருந்து தொடங்குங்கள்",
    intakeNote: "உரையிலிருந்து எடுக்கப்படும் தகவல் ஒரு பரிந்துரை மட்டுமே. சேமிப்பதற்கு முன் ஒவ்வொரு புலத்தையும் சரிபார்க்கவும்.",
    catalogueEntries: "பட்டியல் பதிவுகள்",
    stateSupport: "மாநிலம்/யூனியன் பிரதேசத் தேர்வு ஆதரவு",
    indianLanguages: "ஆங்கிலம் + 5 இந்திய மொழிகள்",
    draftApps: "விண்ணப்ப வரைவு",
    browserBackup: "உலாவியில் மட்டும் · சாதனம் மாற்ற காப்புப்பிரதி",
    gettingStarted: "தொடங்குதல்",
    createStep: "குடிமகன் சுயவிவரத்தை உருவாக்கு",
    assessmentStep: "ஆதார அடிப்படையிலான மதிப்பீட்டை இயக்கு",
    prepareStep: "அடுத்த செயலைத் தயார் செய்",
    profileCompleteness: "சுயவிவர நிறைவு",
    builtTrust: "நம்பிக்கையை மையமாகக் கொண்டு",
    trustTitle: "ஏன் என்பதை அறிக. அடுத்து என்ன என்பதை அறிக.",
    unknown: "தெரியாதது தெரியாததாகவே இருக்கும்",
    sourceRules: "ஆதாரத்துடன் இணைந்த விதிகள்",
    humanApproval: "செயலுக்கு முன் மனித ஒப்புதல்",
    readApproach: "எங்கள் அணுகுமுறையைப் படிக்கவும்",
    curated: "தேசிய திட்டப் பட்டியல்",
    exploreAll: "அனைத்தையும் காண்க",
    passport: "குடிமகன் சுயவிவரம்",
    privacyBoundary: "முன்மாதிரி தரவு வரம்பு",
    intelligence: "திட்டத் தகவல்",
    execution: "செயல்பாட்டு தடம்",
    agentActions: "அமைப்பு செய்தவை",

    fullNameLabel: "முழுப் பெயர்",
    ageLabel: "வயது",
    genderLabel: "பாலினம்",
    stateLabel: "மாநிலம் / யூனியன் பிரதேசம்",
    districtLabel: "மாவட்டம்",
    residenceLabel: "வசிப்பிடம் வகை",
    incomeLabel: "ஆண்டு குடும்ப வருமானம்",
    occupationLabel: "தொழில்",
    chooseState: "மாநிலத்தைத் தேர்ந்தெடுக்கவும்",
    select: "தேர்ந்தெடுக்கவும்",
    woman: "பெண்",
    man: "ஆண்",
    otherGender: "மற்றவை / தெரிவிக்க விருப்பமில்லை",
    rural: "கிராமப்புறம்",
    urban: "நகர்ப்புறம்",
    occupationSelect: "தொழிலைத் தேர்ந்தெடுக்கவும்",
    farmer: "விவசாயி",
    agriWorker: "விவசாயத் தொழிலாளர்",
    student: "மாணவர்",
    selfEmployed: "சுயதொழில்",
    vendor: "விற்பனையாளர் / சிறு வணிகர்",
    salaried: "ஊதியம் பெறுபவர்",
    unemployed: "வேலையில்லாதவர்",
    homemaker: "குடும்பப் பராமரிப்பாளர்",
    other: "மற்றவை",
    yes: "ஆம்",
    no: "இல்லை",
    notSure: "உறுதியாகத் தெரியவில்லை",
    intakeTitle: "உங்கள் நிலைமையை உங்கள் சொற்களில் பகிரவும்",
    intakeDescription: "நீங்கள் வழங்கும் விவரங்களிலிருந்து சாத்தியமான தகவல்கள் எடுக்கப்படும். தொடர்வதற்கு முன் ஒவ்வொரு புலத்தையும் சரிபார்க்கவும்.",
    aboutYou: "உங்களைப் பற்றி",
    aboutYouText: "தொடர்புடைய திட்டத்தின் ஆரம்பச் சரிபார்ப்புக்குத் தேவையான விவரங்களை மட்டும் வழங்கவும்.",
    housing: "வீட்டு நிலை",
    housingText: "வீடு மற்றும் முந்தைய அரசு வீட்டு உதவி பற்றிய கேள்விகள்.",
    agri: "விவசாயம் மற்றும் நிலம்",
    agriText: "விவசாய நிலம் மற்றும் விவசாயி திட்டம் தொடர்பான கேள்விகள்.",
    education: "கல்வி மற்றும் உதவித்தொகை",
    educationText: "மாணவர் நிலை மற்றும் உதவித்தொகை தொடர்பான கேள்விகள்.",
    profileReady: "சுயவிவரத் தயார்நிலை",
    privacyTitle: "வடிவமைப்பிலேயே தனியுரிமை",
    localProfile: "இந்த உலாவியில் உள்ளூர் சுயவிவரம்",
    humanHelp: "அரசுத் திட்டங்களுக்கு உதவி வேண்டுமா?",
    ownsHouse: "உங்கள் குடும்பத்திற்கு இந்தியாவில் எங்காவது பக்கா வீடு உள்ளதா?",
    govtHouse: "கடந்த 20 ஆண்டுகளில் உங்கள் குடும்பத்திற்கு அரசு வீடு ஒதுக்கப்பட்டதா?",
    lpg: "உங்கள் வீட்டில் யாருக்காவது LPG இணைப்பு உள்ளதா?",
    poorDecl: "PMUY-க்கான ஏழைக் குடும்ப அறிவிப்பை விண்ணப்பதாரர் வழங்க முடியுமா?",
    landRecords: "சாகுபடி நிலம் மாநில/UT நிலப் பதிவுகளில் உள்ளதா?",
    kisanExclusion: "குடும்பத்தில் யாராவது PM-KISAN விலக்கு வகையில் வருகிறார்களா?",
    currentlyStudent: "நீங்கள் தற்போது மாணவரா?",
    percentile: "வாரியம்/பிரிவில் 80வது சதவீத நிலையை விட மேலா?",
    undergrad: "வழக்கமான இளங்கலைப் படிப்பில் சேர்ந்துள்ளீர்களா?",
    scholarship: "வேறு உதவித்தொகை அல்லது கட்டணத் திருப்பிச் செலுத்துதல் கிடைக்கிறதா?",
    distanceCourse: "உங்கள் படிப்பு டிப்ளமோ அல்லது தொலை/தொடர்புக் கல்வியா?",
    noAfterReview: "பட்டியலைச் சரிபார்த்த பிறகு இல்லை",

  },
  te: {
    overview: "అవలోకనం", discover: "ప్రయోజనాలను కనుగొనండి", profile: "నా ప్రొఫైల్", documents: "పత్రాలు",
    heroTitle1: "ఒక ప్రొఫైల్.", heroTitle2: "తదుపరి దశలు స్పష్టం.",
    heroDescription: "పథకాలను కనుగొనడమే కాకుండా, ఏ నియమానికి ఏ ఆధారం అవసరం, ఏది ఇంకా అనిశ్చితం, తర్వాత ఏమి సిద్ధం చేయాలో తెలుసుకోండి.",
    applications: "నా దరఖాస్తులు", about: "ఇది ఎలా పనిచేస్తుంది", hello: "ప్రభుత్వ పథకాలు, ప్రయోజనాలను సులభంగా తెలుసుకోండి.",
    intro: "మీ పరిస్థితి నుంచి అందుబాటులో ఉండే సహాయం వరకు స్పష్టమైన మార్గం.", start: "అర్హత తనిఖీ ప్రారంభించండి", search: "పథకాలు లేదా సహాయాన్ని వెతకండి", verified: "మూలాలతో కూడిన జాబితా",
    next: "మీ తదుపరి చర్యలు", featured: "సంభావ్య ప్రయోజన మార్గాలు", reviewed: "సమీక్షించిన పథక రికార్డులు",
    coverage: "ప్రొఫైల్ పరిధి", languages: "ఇంటర్‌ఫేస్ భాషలు", screening: "పరిశీలన కార్యస్థలం",
    run: "ప్రయోజన అంచనాను అమలు చేయండి", save: "ప్రొఫైల్ సేవ్ చేయండి", saved: "ఈ బ్రౌజర్‌లో ప్రొఫైల్ సేవ్ అయింది",
    view: "వివరాలు చూడండి", prepare: "డ్రాఫ్ట్ సిద్ధం చేయండి", noResult: "ఇంకా పరిశీలన ఫలితాలు లేవు",
    noResultText: "సంబంధిత మార్గాలను చూడటానికి ప్రొఫైల్ పూర్తి చేసి అంచనాను అమలు చేయండి.",
    match: "సంభావ్య సరిపోలిక", review: "ధృవీకరణ అవసరం", noMatch: "సరిపోలలేదు",
    source: "అధికారిక మూలం", privacy: "మీ ప్రొఫైల్, అంచనా, డ్రాఫ్ట్‌లు, రిమైండర్‌లు ఈ బ్రౌజర్‌లోనే ఉంటాయి. డెమో నియమ పరిశీలన, వచన విశ్లేషణ స్థానికంగానే జరుగుతాయి. ఎగుమతి చేసిన వాల్ట్ పాస్‌వర్డ్‌తో ఎన్‌క్రిప్ట్ అవుతుంది; బ్రౌజర్ నిల్వ యాప్-స్థాయిలో ఎన్‌క్రిప్ట్ చేయబడదు. ప్రభుత్వ పోర్టల్‌కు మీరు స్వయంగా నింపి లేదా సమర్పించినప్పుడే సమాచారం వెళ్తుంది.",
    profileTitle: "మీ పౌర ప్రొఫైల్‌ను సృష్టించండి", profileText: "అవసరమైన వివరాలను మాత్రమే పంచుకోండి.",
    documentsTitle: "పత్రాల జాబితా", documentsText: "ఫైళ్లు ఈ పరికరంలోని బ్రౌజర్ నిల్వలో ఉంటాయి. ఎగుమతి చేసిన వాల్ట్ పాస్‌వర్డ్‌తో ఎన్‌క్రిప్ట్ అవుతుంది; బ్రౌజర్ నిల్వ యాప్-స్థాయిలో ఎన్‌క్రిప్ట్ చేయబడదు. ఫైళ్లు అప్‌లోడ్ చేయబడవు లేదా ఆటోమేటిక్‌గా మాల్వేర్ స్కాన్ చేయబడవు.",
    applicationsTitle: "దరఖాస్తుల కార్యస్థలం", applicationsText: "ఇవి తయారీ డ్రాఫ్ట్‌లు మాత్రమే; ప్రభుత్వ పోర్టల్‌కు సమర్పించబడలేదు.",
    language: "భాష", allIndia: "అన్ని రాష్ట్రాలు మరియు కేంద్రపాలిత ప్రాంతాల కోసం", catalogue: "ఎంచుకున్న కేంద్ర పథకాల పైలట్",
    official: "చివరి నిర్ణయం సంబంధిత శాఖదే", noUpload: "ఫైళ్లు అప్‌లోడ్ కావు",
    skip: "ప్రధాన విషయానికి వెళ్లండి",
    benefitsAccess: "ప్రయోజనాల ప్రాప్యత",
    workspace: "ప్రభుత్వ ప్రయోజనాల కార్యస్థలం",
    independent: "స్వతంత్ర ప్రజా సేవల మార్గదర్శి",
    localFirst: "స్థానిక ప్రాధాన్య నమూనా",
    backup: "బ్యాకప్",
    restore: "పునరుద్ధరించు",
    evidence: "ఆధారాలు జోడించబడ్డాయి",
    nextReady: "తదుపరి చర్య సిద్ధం",
    noSensitive: "ఈ నమూనాలో ఆధార్ లేదా బ్యాంకు ఖాతా సంఖ్య అవసరం లేదు.",
    ecosystem: "నిజమైన ప్రజా సేవల వ్యవస్థ కోసం నిర్మించబడింది",
    prepLayer: "సిద్ధత వేదిక — మరో ప్రభుత్వ పోర్టల్ కాదు.",
    ecosystemText: "మీ ఆధారాలు, తదుపరి చర్యలను క్రమబద్ధం చేయడానికి JanaSetu ఉపయోగించండి. పథకాల సమాచారం, పత్ర సేవలు, దరఖాస్తుల సమర్పణకు అధికారిక శాఖలే ప్రామాణికం.",
    schemeDiscovery: "పథకాల అన్వేషణ",
    govServices: "ప్రభుత్వ సేవలు",
    digitalDocs: "డిజిటల్ పత్రాలు",
    assistedAccess: "సహాయక ప్రాప్యత",
    startSituation: "మీ పరిస్థితితో ప్రారంభించండి",
    intakeNote: "వచనం నుంచి తీసిన సమాచారం సూచన మాత్రమే. సేవ్ చేసే ముందు ప్రతి ఫీల్డ్‌ను తనిఖీ చేయండి.",
    catalogueEntries: "కేటలాగ్ నమోదులు",
    stateSupport: "రాష్ట్రం/కేంద్రపాలిత ప్రాంతం ఎంపిక",
    indianLanguages: "ఆంగ్లం + 5 భారతీయ భాషలు",
    draftApps: "దరఖాస్తు ముసాయిదాలు",
    browserBackup: "బ్రౌజర్‌లో మాత్రమే · పరికరం మార్చడానికి బ్యాకప్",
    gettingStarted: "ప్రారంభించండి",
    createStep: "మీ పౌర ప్రొఫైల్ సృష్టించండి",
    assessmentStep: "ఆధారాలతో ప్రయోజన అంచనా నడపండి",
    prepareStep: "తదుపరి చర్య సిద్ధం చేయండి",
    profileCompleteness: "ప్రొఫైల్ పూర్తి స్థాయి",
    builtTrust: "నమ్మకాన్ని ఆధారంగా చేసుకుని",
    trustTitle: "ఎందుకో తెలుసుకోండి. తర్వాత ఏమిటో తెలుసుకోండి.",
    unknown: "తెలియనిది తెలియనిదిగానే ఉంటుంది",
    sourceRules: "మూల ఆధారిత నియమాలు",
    humanApproval: "చర్యకు ముందు మానవ ఆమోదం",
    readApproach: "మా విధానాన్ని చదవండి",
    curated: "జాతీయ పథకాల జాబితా",
    exploreAll: "అన్నీ చూడండి",
    passport: "పౌర ప్రొఫైల్",
    privacyBoundary: "నమూనా డేటా పరిమితి",
    intelligence: "పథకాల సమాచారం",
    execution: "కార్యాచరణ ట్రేస్",
    agentActions: "సిస్టమ్ చేసిన పని",

    fullNameLabel: "పూర్తి పేరు",
    ageLabel: "వయస్సు",
    genderLabel: "లింగం",
    stateLabel: "రాష్ట్రం / కేంద్రపాలిత ప్రాంతం",
    districtLabel: "జిల్లా",
    residenceLabel: "నివాస రకం",
    incomeLabel: "వార్షిక కుటుంబ ఆదాయం",
    occupationLabel: "వృత్తి",
    chooseState: "రాష్ట్రాన్ని ఎంచుకోండి",
    select: "ఎంచుకోండి",
    woman: "మహిళ",
    man: "పురుషుడు",
    otherGender: "ఇతర / చెప్పదలచుకోలేదు",
    rural: "గ్రామీణ",
    urban: "పట్టణ",
    occupationSelect: "వృత్తిని ఎంచుకోండి",
    farmer: "రైతు",
    agriWorker: "వ్యవసాయ కార్మికుడు",
    student: "విద్యార్థి",
    selfEmployed: "స్వయం ఉపాధి",
    vendor: "విక్రేత / చిన్న వ్యాపారి",
    salaried: "జీతం పొందేవారు",
    unemployed: "నిరుద్యోగి",
    homemaker: "గృహిణి",
    other: "ఇతర",
    yes: "అవును",
    no: "కాదు",
    notSure: "ఖచ్చితంగా తెలియదు",
    intakeTitle: "మీ పరిస్థితిని మీ మాటల్లో వివరించండి",
    intakeDescription: "మీరు అందించిన వివరాల నుంచి సాధ్యమైన సమాచారాన్ని గుర్తిస్తాం. కొనసాగించే ముందు ప్రతి ఫీల్డ్‌ను తనిఖీ చేయండి.",
    aboutYou: "మీ గురించి",
    aboutYouText: "సంబంధిత పథకం ప్రాథమిక పరిశీలనకు అవసరమైన వివరాలనే ఇవ్వండి.",
    housing: "నివాస పరిస్థితి",
    housingText: "ఇల్లు మరియు గత ప్రభుత్వ గృహ సహాయం గురించి ప్రశ్నలు.",
    agri: "వ్యవసాయం మరియు భూమి",
    agriText: "వ్యవసాయ భూమి, రైతు పథకం సంబంధిత ప్రశ్నలు.",
    education: "విద్య మరియు స్కాలర్‌షిప్",
    educationText: "విద్యార్థి స్థితి, స్కాలర్‌షిప్‌లకు సంబంధించిన ప్రశ్నలు.",
    profileReady: "ప్రొఫైల్ సిద్ధత",
    privacyTitle: "రూపకల్పనలోనే గోప్యత",
    localProfile: "ఈ బ్రౌజర్‌లో స్థానిక ప్రొఫైల్",
    humanHelp: "ప్రభుత్వ పథకాల కోసం సహాయం కావాలా?",
    ownsHouse: "మీ కుటుంబానికి భారతదేశంలో ఎక్కడైనా పక్కా ఇల్లు ఉందా?",
    govtHouse: "గత 20 ఏళ్లలో మీ కుటుంబానికి ప్రభుత్వ ఇల్లు మంజూరైందా?",
    lpg: "మీ ఇంట్లో ఎవరికైనా LPG కనెక్షన్ ఉందా?",
    poorDecl: "PMUY కోసం అవసరమైన పేద కుటుంబ ప్రకటనను దరఖాస్తుదారు ఇవ్వగలరా?",
    landRecords: "సాగు భూమి రాష్ట్ర/UT భూ రికార్డుల్లో ఉందా?",
    kisanExclusion: "కుటుంబంలో ఎవరైనా PM-KISAN మినహాయింపు వర్గంలో ఉన్నారా?",
    currentlyStudent: "మీరు ప్రస్తుతం విద్యార్థినా?",
    percentile: "బోర్డు/స్ట్రీమ్‌లో 80వ పర్సెంటైల్ కంటే పైన ఉన్నారా?",
    undergrad: "సాధారణ డిగ్రీ కోర్సులో చేరారా?",
    scholarship: "మరొక స్కాలర్‌షిప్ లేదా ఫీజు రీయింబర్స్‌మెంట్ పొందుతున్నారా?",
    distanceCourse: "మీ కోర్సు డిప్లొమా లేదా దూర/కరస్పాండెన్స్ కోర్సా?",
    noAfterReview: "జాబితాను పరిశీలించిన తర్వాత కాదు",

  },
  ml: {
    overview: "അവലോകനം", discover: "ആനുകൂല്യങ്ങൾ കണ്ടെത്തുക", profile: "എന്റെ പ്രൊഫൈൽ", documents: "രേഖകൾ",
    heroTitle1: "ഒരു പ്രൊഫൈൽ.", heroTitle2: "അടുത്ത ഘട്ടങ്ങൾ വ്യക്തം.",
    heroDescription: "പദ്ധതികൾ കണ്ടെത്തുന്നതിൽ മാത്രം ഒതുങ്ങരുത്. ഏത് നിയമത്തിന് തെളിവ് വേണം, എന്താണ് അനിശ്ചിതം, ഇനി എന്ത് തയ്യാറാക്കണം എന്നിവ മനസ്സിലാക്കുക.",
    applications: "എന്റെ അപേക്ഷകൾ", about: "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു", hello: "സർക്കാർ പദ്ധതികളും ആനുകൂല്യങ്ങളും എളുപ്പത്തിൽ കണ്ടെത്താം.",
    intro: "നിങ്ങളുടെ സാഹചര്യത്തിൽ നിന്ന് ലഭ്യമായേക്കാവുന്ന സഹായത്തിലേക്കുള്ള വ്യക്തമായ വഴി.", start: "യോഗ്യതാ പരിശോധന ആരംഭിക്കുക", search: "പദ്ധതികളോ സഹായമോ തിരയുക", verified: "ഉറവിടം ചേർത്ത പട്ടിക",
    next: "അടുത്ത ഘട്ടങ്ങൾ", featured: "സാധ്യതയുള്ള ആനുകൂല്യ മാർഗങ്ങൾ", reviewed: "പരിശോധിച്ച പദ്ധതി രേഖകൾ",
    coverage: "പ്രൊഫൈൽ പരിധി", languages: "ഇന്റർഫേസ് ഭാഷകൾ", screening: "പരിശോധനാ വർക്ക്സ്പേസ്",
    run: "ആനുകൂല്യ വിലയിരുത്തൽ നടത്തുക", save: "പ്രൊഫൈൽ സംരക്ഷിക്കുക", saved: "ഈ ബ്രൗസറിൽ പ്രൊഫൈൽ സംരക്ഷിച്ചു",
    view: "വിശദാംശങ്ങൾ കാണുക", prepare: "ഡ്രാഫ്റ്റ് തയ്യാറാക്കുക", noResult: "പരിശോധനാ ഫലങ്ങൾ ഇതുവരെ ഇല്ല",
    noResultText: "ബന്ധപ്പെട്ട വഴികൾ കാണാൻ പ്രൊഫൈൽ പൂരിപ്പിച്ച് വിലയിരുത്തൽ നടത്തുക.",
    match: "സാധ്യതയുള്ള പൊരുത്തം", review: "സ്ഥിരീകരണം ആവശ്യമാണ്", noMatch: "പൊരുത്തമില്ല",
    source: "ഔദ്യോഗിക ഉറവിടം", privacy: "നിങ്ങളുടെ പ്രൊഫൈൽ, വിലയിരുത്തൽ, ഡ്രാഫ്റ്റുകൾ, ഓർമ്മപ്പെടുത്തലുകൾ ഈ ബ്രൗസറിൽ തന്നെ സൂക്ഷിക്കുന്നു. ഡെമോ നിയമ പരിശോധനയും ടെക്സ്റ്റ് വിശകലനവും പ്രാദേശികമായി നടക്കുന്നു. എക്സ്പോർട്ട് ചെയ്യുന്ന വാൾട്ട് പാസ്‌വേഡ് ഉപയോഗിച്ച് എൻക്രിപ്റ്റ് ചെയ്യും; ബ്രൗസർ സ്റ്റോറേജ് ആപ്പ്-തലത്തിൽ എൻക്രിപ്റ്റ് ചെയ്തിട്ടില്ല. സർക്കാർ പോർട്ടലിലേക്ക് നിങ്ങൾ സ്വയം പൂരിപ്പിക്കുകയോ സമർപ്പിക്കുകയോ ചെയ്താൽ മാത്രമേ വിവരങ്ങൾ പോകൂ.",
    profileTitle: "നിങ്ങളുടെ പൗര പ്രൊഫൈൽ സൃഷ്ടിക്കുക", profileText: "ആവശ്യമായ വിവരങ്ങൾ മാത്രം പങ്കിടുക.",
    documentsTitle: "രേഖാ ചെക്ക്‌ലിസ്റ്റ്", documentsText: "ഫയലുകൾ ഈ ഉപകരണത്തിലെ ബ്രൗസർ സ്റ്റോറേജിൽ തന്നെ തുടരും. എക്സ്പോർട്ട് ചെയ്യുന്ന വാൾട്ട് പാസ്‌വേഡ് ഉപയോഗിച്ച് എൻക്രിപ്റ്റ് ചെയ്യും; ബ്രൗസർ സ്റ്റോറേജ് ആപ്പ്-തലത്തിൽ എൻക്രിപ്റ്റ് ചെയ്തിട്ടില്ല. ഫയലുകൾ അപ്‌ലോഡ് ചെയ്യുകയോ സ്വയമേവ മാൽവെയർ സ്കാൻ ചെയ്യുകയോ ഇല്ല.",
    applicationsTitle: "അപേക്ഷാ വർക്ക്‌സ്‌പേസ്", applicationsText: "ഇവ തയ്യാറാക്കിയ ഡ്രാഫ്റ്റുകൾ മാത്രമാണ്; സർക്കാർ പോർട്ടലിൽ സമർപ്പിച്ചിട്ടില്ല.",
    language: "ഭാഷ", allIndia: "എല്ലാ സംസ്ഥാനങ്ങൾക്കും കേന്ദ്രഭരണ പ്രദേശങ്ങൾക്കും", catalogue: "തിരഞ്ഞെടുത്ത കേന്ദ്ര പദ്ധതികളുടെ പൈലറ്റ്",
    official: "അന്തിമ തീരുമാനം ബന്ധപ്പെട്ട വകുപ്പിന്റേതാണ്", noUpload: "ഫയലുകൾ അപ്‌ലോഡ് ചെയ്യുന്നില്ല",
    fullNameLabel: "പൂർണ്ണ പേര് (ഐച്ഛികം)",
    ageLabel: "പ്രായം",
    genderLabel: "ലിംഗം (ആവശ്യമെങ്കിൽ)",
    stateLabel: "സംസ്ഥാനം / കേന്ദ്രഭരണ പ്രദേശം",
    districtLabel: "ജില്ല (ഐച്ഛികം)",
    residenceLabel: "താമസ പ്രദേശം",
    incomeLabel: "വാർഷിക കുടുംബ വരുമാനം (₹)",
    occupationLabel: "തൊഴിൽ",
    chooseState: "സംസ്ഥാനം / കേന്ദ്രഭരണ പ്രദേശം തിരഞ്ഞെടുക്കുക",
    select: "തിരഞ്ഞെടുക്കുക",
    woman: "സ്ത്രീ",
    man: "പുരുഷൻ",
    otherGender: "മറ്റുള്ളവ / പറയാൻ താൽപ്പര്യമില്ല",
    rural: "ഗ്രാമീണം",
    urban: "നഗരം",
    occupationSelect: "തൊഴിൽ തിരഞ്ഞെടുക്കുക",
    farmer: "കർഷകൻ",
    agriWorker: "കാർഷിക തൊഴിലാളി",
    student: "വിദ്യാർത്ഥി",
    selfEmployed: "സ്വയം തൊഴിൽ",
    vendor: "തെരുവ് കച്ചവടക്കാരൻ",
    salaried: "ശമ്പളമുള്ള ജീവനക്കാരൻ",
    unemployed: "തൊഴിലില്ലാത്തവർ",
    homemaker: "ഗൃഹിണി",
    other: "മറ്റുള്ളവ",
    yes: "അതെ",
    no: "ഇല്ല",
    notSure: "ഉറപ്പില്ല",
    intakeTitle: "എന്ത് സഹായമാണ് വേണ്ടതെന്ന് JanaSetu-യോട് പറയുക.",
    intakeDescription: "തിരഞ്ഞെടുത്ത ഭാഷയിൽ കുടുംബ വിവരങ്ങൾ എഴുതുക. പരിശോധനയ്ക്ക് മുമ്പ് പരിശോധിക്കാവുന്ന പ്രൊഫൈൽ വിവരങ്ങൾ നിർദ്ദേശിക്കും.",
    aboutYou: "നിങ്ങളെക്കുറിച്ച്",
    aboutYouText: "ബാധകമായ നിയമങ്ങൾ തിരഞ്ഞെടുക്കാൻ ആവശ്യമായ അടിസ്ഥാന വിവരങ്ങൾ.",
    housing: "വീട്, കുടുംബം",
    housingText: "ഈ ചോദ്യങ്ങൾ ഈ പട്ടികയിലെ ഭവന, LPG പദ്ധതികളുടെ പ്രാഥമിക പരിശോധനയ്ക്കു മാത്രമാണ്.",
    agri: "കൃഷിയും ഒഴിവാക്കലുകളും",
    agriText: "PM-KISAN പ്രാഥമിക പരിശോധനയ്ക്കായി; ഭൂ രേഖകളും ഒഴിവാക്കലുകളും ഔദ്യോഗികമായി പരിശോധിക്കണം.",
    education: "വിദ്യാഭ്യാസം",
    educationText: "PM-USP CSSS വിവരത്തിനായി; അക്കാദമിക് വർഷത്തിലെ നിയമങ്ങൾ വീണ്ടും പരിശോധിക്കുക.",
    profileReady: "പ്രൊഫൈൽ തയ്യാറെടുപ്പ്",
    privacyTitle: "രൂപകൽപ്പനയിൽ തന്നെ സ്വകാര്യത",
    localProfile: "ഈ ബ്രൗസറിലെ പ്രാദേശിക പ്രൊഫൈൽ",
    humanHelp: "സർക്കാർ പദ്ധതികൾക്കായി സഹായം വേണോ?",
    ownsHouse: "നിങ്ങളുടെ കുടുംബത്തിന് ഇന്ത്യയിൽ എവിടെയെങ്കിലും പക്കാ വീട് ഉണ്ടോ?",
    govtHouse: "കഴിഞ്ഞ 20 വർഷത്തിനിടെ നിങ്ങളുടെ കുടുംബത്തിന് സർക്കാർ വീട് അനുവദിച്ചിട്ടുണ്ടോ?",
    lpg: "നിങ്ങളുടെ വീട്ടിൽ ആർക്കെങ്കിലും LPG കണക്ഷൻ ഉണ്ടോ?",
    poorDecl: "PMUY-ക്കുള്ള നിർദ്ദിഷ്ട ദരിദ്ര കുടുംബ പ്രഖ്യാപനം അപേക്ഷകന് നൽകാനാകുമോ?",
    landRecords: "കൃഷിയോഗ്യ ഭൂമി സംസ്ഥാന/UT ഭൂ രേഖകളിൽ ഉണ്ടോ?",
    kisanExclusion: "കുടുംബത്തിലെ ആരെങ്കിലും PM-KISAN ഒഴിവാക്കൽ വിഭാഗത്തിൽപ്പെടുന്നുണ്ടോ?",
    currentlyStudent: "നിങ്ങൾ ഇപ്പോൾ വിദ്യാർത്ഥിയാണോ?",
    percentile: "ബോർഡ്/സ്ട്രീമിൽ 80-ാം പെർസെന്റൈലിന് മുകളിലാണോ?",
    undergrad: "സാധാരണ ബിരുദ കോഴ്‌സിൽ ചേർന്നിട്ടുണ്ടോ?",
    scholarship: "മറ്റൊരു സ്കോളർഷിപ്പ് അല്ലെങ്കിൽ ഫീസ് റീഇംബഴ്‌സ്‌മെന്റ് ലഭിക്കുന്നുണ്ടോ?",
    distanceCourse: "നിങ്ങളുടെ കോഴ്‌സ് ഡിപ്ലോമയോ ദൂര/കറസ്പോണ്ടൻസ് കോഴ്‌സോ ആണോ?",
    noSensitive: "ഇവിടെ ആധാർ, ബാങ്ക് അക്കൗണ്ട് അല്ലെങ്കിൽ രേഖാ നമ്പർ ചോദിക്കുന്നില്ല.",
    noAfterReview: "പട്ടിക പരിശോധിച്ചതിന് ശേഷം ഇല്ല",
    skip: "പ്രധാന ഉള്ളടക്കത്തിലേക്ക് പോകുക",
    benefitsAccess: "ആനുകൂല്യങ്ങളിലേക്കുള്ള പ്രവേശനം",
    workspace: "സർക്കാർ ആനുകൂല്യ പ്രവർത്തനമേഖല",
    independent: "സ്വതന്ത്ര പൊതുസേവന മാർഗദർശി",
    localFirst: "ലോക്കൽ-ഫസ്റ്റ് മാതൃക",
    backup: "ബാക്കപ്പ്",
    restore: "പുനഃസ്ഥാപിക്കുക",
    evidence: "തെളിവ് ബന്ധിപ്പിച്ചു",
    nextReady: "അടുത്ത നടപടി തയ്യാറാണ്",
    ecosystem: "യഥാർത്ഥ പൊതുസേവന സംവിധാനത്തിനായി നിർമ്മിച്ചത്",
    prepLayer: "തയ്യാറെടുപ്പ് സഹായം — മറ്റൊരു സർക്കാർ പോർട്ടൽ അല്ല.",
    ecosystemText: "തെളിവുകളും അടുത്ത നടപടികളും ക്രമീകരിക്കാൻ JanaSetu ഉപയോഗിക്കുക. പദ്ധതി വിവരങ്ങൾക്കും രേഖാ സേവനങ്ങൾക്കും അപേക്ഷ സമർപ്പണത്തിനും ഔദ്യോഗിക വകുപ്പുകളാണ് പ്രാമാണികം.",
    schemeDiscovery: "പദ്ധതി കണ്ടെത്തൽ",
    govServices: "സർക്കാർ സേവനങ്ങൾ",
    digitalDocs: "ഡിജിറ്റൽ രേഖകൾ",
    assistedAccess: "സഹായത്തോടെയുള്ള പ്രവേശനം",
    startSituation: "നിങ്ങളുടെ സാഹചര്യത്തിൽ നിന്ന് ആരംഭിക്കുക",
    intakeNote: "ടെക്സ്റ്റിൽ നിന്ന് ലഭിക്കുന്ന വിവരങ്ങൾ നിർദ്ദേശം മാത്രമാണ്. സംരക്ഷിക്കുന്നതിന് മുമ്പ് ഓരോ ഫീൽഡും പരിശോധിക്കുക.",
    catalogueEntries: "കാറ്റലോഗ് രേഖകൾ",
    stateSupport: "സംസ്ഥാനം/കേന്ദ്രഭരണ പ്രദേശം തിരഞ്ഞെടുക്കാം",
    indianLanguages: "ഇംഗ്ലീഷ് + 5 ഇന്ത്യൻ ഭാഷകൾ",
    draftApps: "അപേക്ഷാ കരടുകൾ",
    browserBackup: "ബ്രൗസറിൽ മാത്രം · ഉപകരണം മാറ്റാൻ ബാക്കപ്പ്",
    gettingStarted: "തുടങ്ങാം",
    createStep: "നിങ്ങളുടെ പൗര പ്രൊഫൈൽ സൃഷ്ടിക്കുക",
    assessmentStep: "തെളിവ് അടിസ്ഥാനമാക്കിയ വിലയിരുത്തൽ നടത്തുക",
    prepareStep: "അടുത്ത നടപടി തയ്യാറാക്കുക",
    profileCompleteness: "പ്രൊഫൈൽ പൂർത്തീകരണം",
    builtTrust: "വിശ്വാസത്തെ അടിസ്ഥാനമാക്കി",
    trustTitle: "കാരണം അറിയുക. അടുത്ത നടപടി മനസ്സിലാക്കുക.",
    unknown: "അറിയാത്തത് അറിയാത്തതായിരിക്കും",
    sourceRules: "ഉറവിടം ബന്ധിപ്പിച്ച നിയമങ്ങൾ",
    humanApproval: "നടപടിക്ക് മുമ്പ് മനുഷ്യ അംഗീകാരം",
    readApproach: "ഞങ്ങളുടെ സമീപനം വായിക്കുക",
    curated: "ദേശീയ പദ്ധതികളുടെ പട്ടിക",
    exploreAll: "എല്ലാം കാണുക",
    passport: "പൗര പ്രൊഫൈൽ",
    privacyBoundary: "മാതൃകാ ഡാറ്റ പരിധി",
    intelligence: "പദ്ധതി വിവരങ്ങൾ",
    execution: "പ്രവർത്തന ട്രേസ്",
    agentActions: "സിസ്റ്റം ചെയ്ത പ്രവർത്തനം",

  },
};

const UI_COPY: Record<LanguageCode, Record<string, string>> = {
  en: {publishedBenefit:"Potential benefit · verify with department",screeningConditions:"Screening conditions",assessmentEvidence:"Assessment evidence",nextRecommendedActions:"Next recommended actions",officialChannel:"Official application / service channel",catalogueOnly:"Catalogue entry only — JanaSetu has not automated an eligibility decision for this scheme. Confirm requirements with the department.",budgetReferenceOnly:"Budget line item only — this is a public budget head, not yet verified as a citizen-facing scheme. No individual entitlement or application route is inferred.",governmentWorkspace:"GOVERNMENT BENEFITS WORKSPACE",noAadhaarNote:"No Aadhaar or bank-account number required in this prototype.",noAadhaarRequest:"No Aadhaar, bank account or document number is requested here.",verifyRules:"Source-linked · verify current rules and deadlines.",sourceIndexed:"Source indexed · verify rules",ruleScreened:"Rule-screened · source linked",loading:"Loading open-data records…",next50:"Load next 50 dataset records",datasetPaginated:"External dataset browsing is paginated. Search the dataset by keyword above.",schemeRecords:"document references",localLabel:"LOCAL",followupMemory:"FOLLOW-UP MEMORY",coverageText:"JanaSetu includes source-linked records and an external open-data catalogue. It does not yet have complete, independently verified Central or State/UT scheme coverage. Verify all scheme rules and application routes with official departments.",schemeAssistant:"Install the citizen-controlled browser form assistant",manualSubmit:"Review every filled field. Portal scripts may react to field changes; check the page before proceeding.",mySchemeSearch:"Search official myScheme",datasetAttribution:"Open dataset attribution",snapshotDate:"Dataset snapshot",datasetMachineParsed:"Eligibility data is machine-parsed and is not used to determine eligibility. Search covers the full local index. Verify every record with its official source.",datasetFreshnessWarning:"The publisher snapshot is older than 90 days. It is not a current-status feed; verify scheme status and deadlines with the official source.",securityDocs:"For security, do not add Aadhaar images, bank statements or other sensitive identity documents to this prototype. Use synthetic sample files for demonstrations.",aboutDiscoverText:"Use one reusable citizen profile to select relevant pathways from a curated catalogue of official scheme references.",aboutExplainText:"Each screening condition shows the rule, the profile field used and whether the evidence is matched, not matched or unknown.",aboutPrepareText:"Generate a local draft and a document checklist for review. The prototype does not submit to government portals.",aboutRememberText:"Keep application drafts and follow-up reminders in this browser so a citizen can resume the workflow.",responsibleUseText:"JanaSetu provides preliminary information and workflow support. It does not provide legal or official determinations, authenticate identity, make benefit decisions, guarantee receipt of benefits or act on behalf of a government department. Citizens should verify all details with the official source and responsible authority.",followupDate:"Suggested date",evidenceOrganizer:"EVIDENCE ORGANIZER",metadataOnly:"Metadata only",documentUploadText:"Choose a PDF or image to store it on this device and add it to your checklist. Files are not uploaded or automatically malware-scanned.",maxFileSize:"Maximum 12 MB",noDocRefs:"No document references yet",docChecklistEmpty:"Your checklist will appear here when you add a file.",draftStatus:"PREPARATION DRAFT",draftNotSubmitted:"Not submitted",openChecks:"Open checks",markReviewed:"Mark as reviewed",reviewDraftFields:"Review prepared fields",hideDraftFields:"Hide prepared fields",citizenReviewed:"Citizen review recorded",draftInfoDisclaimer:"These are profile preparation fields, not a verified mapping to an official department form. Confirm current fields and values on the official source.",openOfficial:"Open official source",addReminder:"Add follow-up",removeItem:"Remove",upcoming:"Upcoming actions",reminderPlural:"reminders",noDrafts:"No application drafts yet",draftHelp:"Run an assessment, open a scheme and choose “Prepare draft” to create a reviewable application record.",coverageTitle:"Coverage honesty",responsibleBoundary:"Responsible-use boundary",dataTransparency:"DATA TRANSPARENCY",catalogueHeading:"What is in the current catalogue?",builtIn:"built-in records",officialSource:"Official source",cscLocator:"CSC locator",footerIndependent:"Independent public-benefits navigation",footerTrust:"Evidence-led. Human-controlled.",openSchemeList:"Need the full live Central + State/UT Government scheme list?",assessmentHeading:"Discover possible pathways and inspect the rule evidence before preparing a draft.",assessmentReady:"Your assessment is ready to run",assessedWorkflow:"The workflow used your saved profile and the current curated catalogue.",completeProfileFirst:"Complete your profile first. The agent will select applicable rule pathways.",editProfile:"Edit profile",toolSteps:"tool steps",agentTrace:"This prototype uses deterministic server-side tools and a rule-based planner; it does not call an external LLM or government API.",aboutDescription:"JanaSetu is an independent government-benefits navigation prototype. It complements official portals; it does not replace them.",aboutTitle:"Clarity, evidence and citizen control.",addDocumentReference:"Add a document reference",addFollowup:"Add follow-up",allCategories:"All categories",applicant:"Applicant",applicationLifecycle:"APPLICATION LIFECYCLE",backupTitle:"Export an encrypted JanaSetu vault",category:"Category",checklistAppears:"Your checklist will appear here when you add a file.",chooseFile:"Choose a file",clearFilters:"Clear filters",complete:"complete",clearerWay:"A CLEARER WAY FORWARD",closeNav:"Close navigation",coverageHonesty:"Coverage honesty",createDraftHelp:"Run an assessment, open a scheme and choose “Prepare draft” to create a reviewable application record.",cscHelp:"Take your checklist to an authorized Common Service Centre or the responsible department.",currentCatalogue:"What is in the current catalogue?",discoverTitle:"Discover",dismiss:"Dismiss notification",done:"Done",evidenceLed:"Evidence-led. Human-controlled.",evidenceLinked:"Evidence linked",explainTitle:"Explain",extractFacts:"Extract profile facts",findBenefits:"Find benefits",findCSC:"Find a CSC",footerText:"Independent public-benefits navigation",hidePreparedFields:"Hide prepared fields",humanApprovalBeforeAction:"Human approval before action",incomeHint:"Enter an approximate annual amount.",intakeSafety:"Text extraction is a suggestion. Check every field before saving.",keepDraft:"Build a checklist and keep a draft for your own review.",loadNext:"Load next 50 dataset records",loadingDataset:"Loading open-data records…",localStatus:"Local-first prototype",location:"Location",max12MB:"Maximum 12 MB",needsInformation:"Needs information",nextActionReady:"Next action ready",noDocumentRefs:"No document references yet",noSchemes:"No scheme records found",notPersonalized:"Four deterministic rule prototypes are pending independent review and are not eligibility decisions. External dataset records are discovery-only.",notProvided:"Not provided",notSubmitted:"Not submitted",openNav:"Open navigation",openOfficialSource:"Open official source",openProfile:"Open profile",ourApproach:"OUR APPROACH",preparationDraft:"PREPARATION DRAFT",prepareTitle:"Prepare",privacyLink:"Privacy",privacyProfileText:"Your profile, assessments, drafts and reminders stay in this browser. Screening and text extraction run locally in this prototype. Exported vaults are password-encrypted; browser storage itself is not app-encrypted. Government portals receive data only if you choose to enter or submit it there.",profileMoreComplete:"More complete answers reduce unknown screening conditions. You can leave any field blank and return later.",provided:"Provided",rememberTitle:"Remember",reminders:"reminders",remove:"Remove",restoreTitle:"Restore an encrypted JanaSetu vault",reviewPreparedFields:"Review prepared fields",reviewProfile:"Review and correct them in My profile.",reviewRules:"Review matching rules, unknown answers and official sources.",screeningExplanation:"Every screening result shows the rule, the profile evidence used and the official source to check before acting.",shareCircumstances:"Share your State/UT, household and relevant circumstances.",sourceLinkedRules:"Source-linked rules",suggestedDate:"Suggested date",suggestedFields:"Suggested fields",termsLink:"Terms",tryKeyword:"Try another keyword or category.",unknownStaysUnknown:"Unknown stays unknown",upcomingActions:"Upcoming actions",yourRecords:"YOUR RECORDS",exploreAll:"Explore all",readApproach:"Read our approach",noticeStorageRecovered:"Some saved browser data could not be read. You can continue with a fresh profile.",noticeBackupExported:"Backup exported to this device. Treat it as private personal data.",noticeBackupRestored:"Backup restored in this browser. Review imported details before use.",noticeBackupRestoreFailed:"Unable to restore this backup.",noticeDescribeBefore:"Describe your situation in a sentence before continuing.",noticeIntakeFacts:"Extracted facts. Review them before saving.",noticeIntakeEmpty:"No supported profile facts were found. Try a clearer description.",noticeIntakeFailed:"Unable to process the description.",noticeSelectState:"Select a State or Union Territory before screening.",noticeAssessmentDone:"Assessment completed locally. Review the evidence and official sources.",noticeAssessmentFailed:"Unable to complete the assessment.",noticeDraftPrepared:"Draft prepared and saved only in this browser. It has not been submitted.",noticeDraftFailed:"Unable to prepare the draft.",noticeReminderSaved:"Reminder saved only in this browser.",noticeFileTooLarge:"Please select a file smaller than 12 MB.",noticeFileAdded:"File saved in this browser only. It has not been malware-scanned.",searchFallback:"The publisher search service is unavailable. JanaSetu is searching the complete locally indexed snapshot instead; results are discovery-only and the snapshot may be stale.",catalogueApiUnavailable:"The open-data catalogue could not be loaded. Use the official myScheme link.",assessedRecords:"relevant scheme records assessed",displayed:"displayed",openDataRows:"open-data rows",ruleScreenedCount:"rule prototypes · independent review pending",schemeApprovalPending:"Scheme source approval pending",schemeUnavailable:"Scheme is no longer in the current catalogue",officialVerificationRequired:"Official eligibility verification required",requireReview:"require review",ruleScreenedStatus:"Rule prototype · independent review pending",sourceIndexedStatus:"Source indexed · verify rules",ruleScreenedMetric:"rule prototypes",remainderRequireVerification:"pending independent review",commonServiceCentres:"Common Service Centres",openCitizenProfile:"Open citizen profile",runBenefitsAssessment:"Run benefits assessment",openApplicationWorkspace:"Open application workspace",working:"Working…",fileTypes:"PDF, JPG, PNG",addedLabel:"Added",removeDocumentReference:"Remove document reference",draftFieldNote:"These are profile preparation fields, not a verified mapping to an official department form. Confirm the current fields and values on the linked official source.",draftNotSubmittedDisclaimer:"This is a preparation draft created by JanaSetu. It has not been submitted to a government portal.",manualVerificationPending:"Added — manual verification pending",incomeExample:"e.g. 150000",sourcePeriodLabel:"Source period",categoryAgriculture:"Agriculture",categoryHousing:"Housing",categoryEducation:"Education",categoryEmployment:"Employment",categoryEnergy:"Energy",categoryEnergyHousehold:"Energy & household",categoryFoodSecurity:"Food security",categoryHealth:"Health",categoryInsurance:"Insurance",categoryKarnatakaBudget:"Karnataka budget reference",categoryScholarship:"Scholarship",categorySkills:"Skills",categoryTransport:"Transport",categoryWomenChild:"Women & child",sourceLanguageNotice:"Scheme names and source records may remain in English or their original source language. UI translations are for convenience; verify scheme conditions with the official source.",hideDetails:"Hide details",viewDetails:"View details",accessedLabel:"Accessed",approvalNextAction:"Wait for two independent source and rule approvals.",officialVerifyNextAction:"Verify current conditions with the official department.",essentialProfileFieldsProvided:"{provided} of 7 essential profile fields provided",createdLabel:"Created",citizenReviewRecorded:"Citizen review recorded",savedDrafts:"drafts saved",unknownFileType:"Unknown file type",prepareLocalChecklist:"Prepare local checklist",localPrepOnly:"Local preparation only — not an application case.",pendingDraftDisclaimer:"Preparation record only — not an eligibility decision or submitted application."},
  hi: {localStatus:"स्थानीय-प्रथम प्रोटोटाइप",clearerWay:"आगे बढ़ने का स्पष्ट रास्ता",evidenceLinked:"प्रमाण जुड़ा है",nextActionReady:"अगला कदम तैयार",intakeSafety:"पाठ से निकली जानकारी केवल सुझाव है। सहेजने से पहले हर फ़ील्ड जाँचें।",extractFacts:"प्रोफ़ाइल जानकारी निकालें",suggestedFields:"सुझाए गए फ़ील्ड",reviewProfile:"मेरी प्रोफ़ाइल में जाँचें और सुधारें।",shareCircumstances:"अपना राज्य/केंद्रशासित प्रदेश, परिवार और संबंधित परिस्थितियाँ बताएँ।",reviewRules:"मिलान नियम, अज्ञात उत्तर और आधिकारिक स्रोत देखें।",keepDraft:"जाँच सूची बनाएँ और अपने लिए ड्राफ़्ट रखें।",screeningExplanation:"हर परिणाम में नियम, उपयोग किया गया प्रोफ़ाइल प्रमाण और कार्रवाई से पहले जाँचने वाला आधिकारिक स्रोत दिखता है।",unknownStaysUnknown:"अज्ञात जानकारी अज्ञात ही रहेगी",sourceLinkedRules:"स्रोत-संदर्भित नियम",humanApprovalBeforeAction:"कार्रवाई से पहले मानव स्वीकृति",incomeHint:"अनुमानित वार्षिक राशि दर्ज करें।",profileMoreComplete:"अधिक पूर्ण उत्तर अज्ञात शर्तें कम करते हैं। कोई फ़ील्ड खाली छोड़कर बाद में लौट सकते हैं।",privacyProfileText:"आपकी प्रोफ़ाइल, जाँच, ड्राफ़्ट और रिमाइंडर इसी ब्राउज़र में रहते हैं। डेमो की नियम-जाँच और टेक्स्ट निष्कर्षण स्थानीय रूप से होता है। बैकअप वॉल्ट पासवर्ड से एन्क्रिप्ट होता है; ब्राउज़र स्टोरेज स्वयं ऐप-स्तर पर एन्क्रिप्टेड नहीं है। सरकारी पोर्टल को जानकारी तभी जाती है जब आप स्वयं वहाँ भरें या जमा करें।",assessmentHeading:"संभावित मार्ग खोजें और ड्राफ़्ट बनाने से पहले नियम प्रमाण देखें।",assessmentReady:"आपका आकलन चलाने के लिए तैयार है",assessedWorkflow:"इस प्रक्रिया ने आपकी सहेजी प्रोफ़ाइल और वर्तमान सूची का उपयोग किया।",completeProfileFirst:"पहले प्रोफ़ाइल पूरी करें। एजेंट लागू नियम मार्ग चुन सकेगा।",editProfile:"प्रोफ़ाइल संपादित करें",openSchemeList:"केंद्र + राज्य/UT की पूरी लाइव सरकारी योजना सूची चाहिए?",category:"श्रेणी",allCategories:"सभी श्रेणियाँ",noSchemes:"कोई योजना रिकॉर्ड नहीं मिला",tryKeyword:"दूसरा शब्द या श्रेणी आज़माएँ।",clearFilters:"फ़िल्टर साफ़ करें",loadingDataset:"ओपन-डेटा रिकॉर्ड लोड हो रहे हैं…",loadNext:"अगले 50 डेटासेट रिकॉर्ड लोड करें",notPersonalized:"चार निश्चित नियम प्रोटोटाइप स्वतंत्र समीक्षा की प्रतीक्षा में हैं; ये पात्रता का निर्णय नहीं हैं। बाहरी डेटासेट रिकॉर्ड केवल खोज के लिए हैं।",evidenceOrganizer:"प्रमाण व्यवस्थित करें",metadataOnly:"केवल मेटाडेटा",addDocumentReference:"दस्तावेज़ संदर्भ जोड़ें",chooseFile:"फ़ाइल चुनें",max12MB:"अधिकतम 12 MB",yourRecords:"आपके रिकॉर्ड",noDocumentRefs:"अभी कोई दस्तावेज़ संदर्भ नहीं",checklistAppears:"फ़ाइल जोड़ने पर सूची यहाँ दिखेगी।",applicationLifecycle:"आवेदन प्रक्रिया",noDrafts:"अभी कोई आवेदन ड्राफ़्ट नहीं",createDraftHelp:"आकलन चलाएँ, योजना खोलें और समीक्षा योग्य रिकॉर्ड बनाने के लिए “ड्राफ़्ट तैयार करें” चुनें।",findBenefits:"लाभ खोजें",preparationDraft:"तैयारी ड्राफ़्ट",notSubmitted:"जमा नहीं किया गया",applicant:"आवेदक",location:"स्थान",openChecks:"बाकी जाँच",hidePreparedFields:"तैयार फ़ील्ड छिपाएँ",reviewPreparedFields:"तैयार फ़ील्ड देखें",markReviewed:"समीक्षित चिह्नित करें",notProvided:"प्रदान नहीं किया",provided:"प्रदान किया गया",needsInformation:"जानकारी चाहिए",openOfficialSource:"आधिकारिक स्रोत खोलें",addFollowup:"अनुवर्ती जोड़ें",remove:"हटाएँ",upcomingActions:"आगामी कार्रवाइयाँ",reminders:"रिमाइंडर",suggestedDate:"सुझाई गई तारीख",done:"हो गया",ourApproach:"हमारा दृष्टिकोण",aboutTitle:"स्पष्टता, प्रमाण और नागरिक नियंत्रण।",aboutDescription:"JanaSetu एक स्वतंत्र सरकारी लाभ मार्गदर्शन प्रोटोटाइप है। यह आधिकारिक पोर्टलों का पूरक है, विकल्प नहीं।",discoverTitle:"खोजें",explainTitle:"समझाएँ",prepareTitle:"तैयार करें",rememberTitle:"याद रखें",dataTransparency:"डेटा पारदर्शिता",currentCatalogue:"वर्तमान सूची में क्या है?",coverageHonesty:"कवरेज की स्पष्टता",responsibleBoundary:"जिम्मेदार उपयोग सीमा",officialSource:"आधिकारिक स्रोत",cscLocator:"CSC लोकेटर",footerText:"स्वतंत्र सरकारी लाभ मार्गदर्शन",evidenceLed:"प्रमाण-आधारित। नागरिक-नियंत्रित.",closeNav:"नेविगेशन बंद करें",openNav:"नेविगेशन खोलें",openProfile:"प्रोफ़ाइल खोलें",dismiss:"सूचना हटाएँ",backupTitle:"एन्क्रिप्टेड JanaSetu वॉल्ट एक्सपोर्ट करें",restoreTitle:"एन्क्रिप्टेड JanaSetu वॉल्ट पुनर्स्थापित करें",cscHelp:"अपनी सूची अधिकृत कॉमन सर्विस सेंटर या संबंधित विभाग को दिखाएँ।",findCSC:"CSC खोजें",privacyLink:"गोपनीयता",termsLink:"नियम",publishedBenefit:"संभावित लाभ · विभाग से पुष्टि करें",screeningConditions:"जाँच की शर्तें",assessmentEvidence:"आकलन प्रमाण",nextRecommendedActions:"अगली सुझाई गई कार्रवाइयाँ",officialChannel:"आधिकारिक आवेदन / सेवा माध्यम",catalogueOnly:"केवल सूची प्रविष्टि — JanaSetu ने इस योजना के लिए पात्रता निर्णय स्वचालित नहीं किया है। विभाग से आवश्यकताएँ सत्यापित करें।",budgetReferenceOnly:"केवल बजट मद — यह सरकारी बजट शीर्ष है, अभी नागरिकों के लिए योजना के रूप में सत्यापित नहीं है। इससे किसी व्यक्ति का लाभ या आवेदन मार्ग नहीं माना गया है।",governmentWorkspace:"सरकारी लाभ कार्यक्षेत्र",noAadhaarRequest:"यहाँ आधार, बैंक खाता या दस्तावेज़ नंबर नहीं माँगा जाता।",noAadhaarNote:"इस प्रोटोटाइप में आधार या बैंक खाता संख्या आवश्यक नहीं है।",sourceIndexed:"स्रोत सूचीबद्ध · नियम सत्यापित करें",ruleScreened:"नियम-जाँच · स्रोत जुड़ा है",loading:"ओपन-डेटा रिकॉर्ड लोड हो रहे हैं…",next50:"अगले 50 डेटासेट रिकॉर्ड लोड करें",datasetPaginated:"बाहरी डेटासेट पृष्ठों में दिखता है। ऊपर कीवर्ड से खोजें।",schemeRecords:"दस्तावेज़ संदर्भ",localLabel:"स्थानीय",followupMemory:"अनुवर्ती स्मरण",coverageText:"JanaSetu में स्रोत-संदर्भित रिकॉर्ड और बाहरी डेटासेट है। केंद्र या राज्य/UT की पूरी स्वतंत्र रूप से सत्यापित योजना कवरेज अभी उपलब्ध नहीं है। सभी नियम और आवेदन मार्ग आधिकारिक विभाग से सत्यापित करें।",schemeAssistant:"नागरिक-नियंत्रित ब्राउज़र फ़ॉर्म सहायक स्थापित करें",manualSubmit:"भरे गए हर फ़ील्ड की समीक्षा करें। पोर्टल की स्क्रिप्ट फ़ील्ड बदलने पर प्रतिक्रिया दे सकती हैं; आगे बढ़ने से पहले पेज जाँचें।",mySchemeSearch:"आधिकारिक myScheme खोजें",datasetAttribution:"ओपन डेटासेट श्रेय",snapshotDate:"डेटासेट स्नैपशॉट",datasetMachineParsed:"पात्रता जानकारी मशीन द्वारा निकाली गई है और निर्णय के लिए उपयोग नहीं होती। खोज पूरे स्थानीय सूचकांक में होती है। हर योजना आधिकारिक स्रोत से जाँचें।",datasetFreshnessWarning:"प्रकाशक का स्नैपशॉट 90 दिनों से पुराना है। यह वर्तमान स्थिति फ़ीड नहीं है; योजना की स्थिति और समय-सीमा आधिकारिक स्रोत से जाँचें।",securityDocs:"सुरक्षा के लिए इस प्रोटोटाइप में आधार छवि, बैंक विवरण या संवेदनशील पहचान दस्तावेज़ न जोड़ें। डेमो में नमूना फ़ाइलें उपयोग करें।",aboutDiscoverText:"आधिकारिक योजनाओं की चयनित सूची से उपयुक्त मार्ग चुनने के लिए एक नागरिक प्रोफ़ाइल का उपयोग करें।",aboutExplainText:"हर जाँच में नियम, उपयोग किया गया प्रोफ़ाइल फ़ील्ड और प्रमाण की स्थिति दिखाई जाती है।",aboutPrepareText:"समीक्षा के लिए स्थानीय ड्राफ़्ट और दस्तावेज़ सूची बनाएँ। प्रोटोटाइप सरकारी पोर्टल पर आवेदन जमा नहीं करता।",aboutRememberText:"इस ब्राउज़र में ड्राफ़्ट और अनुस्मारक रखें ताकि नागरिक बाद में प्रक्रिया जारी रख सके।",responsibleUseText:"JanaSetu प्रारंभिक जानकारी और प्रक्रिया सहायता देता है। यह कानूनी या आधिकारिक निर्णय नहीं देता, पहचान सत्यापित नहीं करता, लाभ स्वीकृत नहीं करता या सरकार की ओर से कार्य नहीं करता। आधिकारिक स्रोत से जानकारी जाँचें।",followupDate:"सुझाई गई तारीख",documentUploadText:"PDF या इमेज चुनें। यह इसी डिवाइस पर स्टोर होगी और चेकलिस्ट में जुड़ेगी। फ़ाइलें अपलोड या अपने-आप मैलवेयर स्कैन नहीं होतीं।",maxFileSize:"अधिकतम 12 MB",noDocRefs:"अभी कोई दस्तावेज़ संदर्भ नहीं",docChecklistEmpty:"फ़ाइल जोड़ने पर सूची यहाँ दिखेगी।",draftStatus:"तैयारी ड्राफ़्ट",draftNotSubmitted:"जमा नहीं किया गया",reviewDraftFields:"तैयार फ़ील्ड देखें",hideDraftFields:"तैयार फ़ील्ड छिपाएँ",citizenReviewed:"नागरिक समीक्षा दर्ज",draftInfoDisclaimer:"ये प्रोफ़ाइल तैयारी फ़ील्ड हैं, किसी सरकारी फ़ॉर्म से सत्यापित मैपिंग नहीं। आधिकारिक स्रोत पर वर्तमान फ़ील्ड जाँचें।",openOfficial:"आधिकारिक स्रोत खोलें",addReminder:"अनुवर्ती जोड़ें",removeItem:"हटाएँ",upcoming:"आगामी कार्रवाइयाँ",reminderPlural:"रिमाइंडर",draftHelp:"आकलन चलाएँ, योजना खोलें और समीक्षा योग्य रिकॉर्ड बनाने के लिए “ड्राफ़्ट तैयार करें” चुनें।",coverageTitle:"कवरेज की स्पष्टता",catalogueHeading:"वर्तमान सूची में क्या है?",builtIn:"अंतर्निहित रिकॉर्ड",footerIndependent:"स्वतंत्र सरकारी लाभ मार्गदर्शन",footerTrust:"प्रमाण-आधारित। नागरिक-नियंत्रित।",toolSteps:"टूल चरण",agentTrace:"यह प्रोटोटाइप निश्चित सर्वर टूल और नियम-आधारित योजनाकार का उपयोग करता है; बाहरी LLM या सरकारी API नहीं।",complete:"पूर्ण",verifyRules:"स्रोत जुड़ा है · वर्तमान नियम और समय-सीमा जाँचें।",noticeStorageRecovered:"कुछ सहेजा गया ब्राउज़र डेटा पढ़ा नहीं जा सका। आप नई प्रोफ़ाइल से जारी रख सकते हैं।",noticeBackupExported:"बैकअप इस डिवाइस पर निर्यात हुआ। इसे निजी डेटा मानें।",noticeBackupRestored:"बैकअप इस ब्राउज़र में पुनर्स्थापित हुआ। उपयोग से पहले विवरण जाँचें।",noticeBackupRestoreFailed:"बैकअप पुनर्स्थापित नहीं हो सका।",noticeDescribeBefore:"आगे बढ़ने से पहले एक वाक्य में अपनी स्थिति बताएँ।",noticeIntakeFacts:"जानकारी निकाली गई। सहेजने से पहले जाँचें।",noticeIntakeEmpty:"समर्थित प्रोफ़ाइल जानकारी नहीं मिली। अधिक स्पष्ट विवरण दें।",noticeIntakeFailed:"विवरण संसाधित नहीं हो सका।",noticeSelectState:"आकलन से पहले राज्य या केंद्रशासित प्रदेश चुनें।",noticeAssessmentDone:"आकलन स्थानीय रूप से पूरा हुआ। प्रमाण और आधिकारिक स्रोत जाँचें।",noticeAssessmentFailed:"आकलन पूरा नहीं हो सका।",noticeDraftPrepared:"ड्राफ़्ट केवल इस ब्राउज़र में सहेजा गया। जमा नहीं हुआ।",noticeDraftFailed:"ड्राफ़्ट तैयार नहीं हो सका।",noticeReminderSaved:"अनुस्मारक केवल इस ब्राउज़र में सहेजा गया।",noticeFileTooLarge:"12 MB से छोटी फ़ाइल चुनें।",noticeFileAdded:"फ़ाइल केवल इसी ब्राउज़र में सहेजी गई है। इसका मैलवेयर स्कैन नहीं हुआ है।",searchFallback:"प्रकाशक की खोज सेवा उपलब्ध नहीं है। JanaSetu इसके बजाय पूरे स्थानीय सूचकांक वाले स्नैपशॉट में खोज कर रहा है; परिणाम केवल खोज-सहायता के लिए हैं और डेटा पुराना हो सकता है।",catalogueApiUnavailable:"खुले डेटासेट को अभी लोड नहीं किया जा सका। आधिकारिक myScheme लिंक का उपयोग करें।",assessedRecords:"प्रासंगिक योजना रिकॉर्ड का आकलन",displayed:"दिखाए गए",openDataRows:"ओपन-डेटा पंक्तियाँ",ruleScreenedCount:"नियम प्रोटोटाइप · स्वतंत्र समीक्षा लंबित",schemeApprovalPending:"योजना स्रोत की स्वीकृति लंबित",schemeUnavailable:"योजना अब वर्तमान सूची में नहीं है",officialVerificationRequired:"आधिकारिक पात्रता सत्यापन आवश्यक",requireReview:"समीक्षा आवश्यक",ruleScreenedStatus:"नियम प्रोटोटाइप · स्वतंत्र समीक्षा लंबित",sourceIndexedStatus:"स्रोत सूचीबद्ध · नियम जाँचें",ruleScreenedMetric:"नियम प्रोटोटाइप",remainderRequireVerification:"स्वतंत्र समीक्षा लंबित",commonServiceCentres:"कॉमन सर्विस सेंटर",openCitizenProfile:"नागरिक प्रोफ़ाइल खोलें",runBenefitsAssessment:"लाभ आकलन चलाएँ",openApplicationWorkspace:"आवेदन कार्यक्षेत्र खोलें",working:"कार्य जारी है…",fileTypes:"PDF, JPG, PNG",addedLabel:"जोड़ा गया",removeDocumentReference:"दस्तावेज़ संदर्भ हटाएँ",draftFieldNote:"ये प्रोफ़ाइल तैयारी फ़ील्ड हैं, किसी आधिकारिक विभागीय फ़ॉर्म का सत्यापित मिलान नहीं। लिंक किए गए आधिकारिक स्रोत पर वर्तमान फ़ील्ड और मान जाँचें।",draftNotSubmittedDisclaimer:"यह JanaSetu द्वारा तैयार किया गया ड्राफ़्ट है। इसे सरकारी पोर्टल पर जमा नहीं किया गया है।",manualVerificationPending:"जोड़ा गया — मैन्युअल सत्यापन लंबित",incomeExample:"उदा. 150000",sourcePeriodLabel:"स्रोत अवधि",categoryAgriculture:"कृषि",categoryHousing:"आवास",categoryEducation:"शिक्षा",categoryEmployment:"रोज़गार",categoryEnergy:"ऊर्जा",categoryEnergyHousehold:"ऊर्जा और घरेलू उपयोग",categoryFoodSecurity:"खाद्य सुरक्षा",categoryHealth:"स्वास्थ्य",categoryInsurance:"बीमा",categoryKarnatakaBudget:"कर्नाटक बजट संदर्भ",categoryScholarship:"छात्रवृत्ति",categorySkills:"कौशल",categoryTransport:"परिवहन",categoryWomenChild:"महिला और बाल",sourceLanguageNotice:"योजना के नाम और स्रोत रिकॉर्ड अंग्रेज़ी या मूल स्रोत भाषा में हो सकते हैं। UI अनुवाद सुविधा के लिए हैं; आधिकारिक स्रोत से शर्तें जाँचें।",hideDetails:"विवरण छिपाएँ",viewDetails:"विवरण देखें",accessedLabel:"देखा गया",approvalNextAction:"स्रोत और नियमों की दो स्वतंत्र स्वीकृतियों की प्रतीक्षा करें।",officialVerifyNextAction:"वर्तमान शर्तों की पुष्टि आधिकारिक विभाग से करें।",essentialProfileFieldsProvided:"7 में से {provided} आवश्यक प्रोफ़ाइल फ़ील्ड दिए गए",createdLabel:"बनाया गया",citizenReviewRecorded:"नागरिक समीक्षा दर्ज",savedDrafts:"ड्राफ़्ट सहेजे गए",unknownFileType:"अज्ञात फ़ाइल प्रकार",prepareLocalChecklist:"स्थानीय चेकलिस्ट तैयार करें",localPrepOnly:"केवल स्थानीय तैयारी — यह आवेदन रिकॉर्ड नहीं है।",pendingDraftDisclaimer:"यह केवल तैयारी रिकॉर्ड है — पात्रता का निर्णय या जमा किया गया आवेदन नहीं।"},
  kn: {localStatus:"ಸ್ಥಳೀಯ-ಪ್ರಥಮ ಪ್ರೋಟೋಟೈಪ್",clearerWay:"ಮುಂದಿನ ದಾರಿ ಸ್ಪಷ್ಟವಾಗಲಿ",evidenceLinked:"ಸಾಕ್ಷ್ಯ ಜೋಡಿಸಲಾಗಿದೆ",nextActionReady:"ಮುಂದಿನ ಕ್ರಮ ಸಿದ್ಧ",intakeSafety:"ಪಠ್ಯದಿಂದ ಪಡೆದ ಮಾಹಿತಿ ಕೇವಲ ಸಲಹೆ. ಉಳಿಸುವ ಮೊದಲು ಪ್ರತಿಯೊಂದು ಕ್ಷೇತ್ರವನ್ನು ಪರಿಶೀಲಿಸಿ.",extractFacts:"ಪ್ರೊಫೈಲ್ ವಿವರಗಳನ್ನು ಹೊರತೆಗೆಯಿರಿ",suggestedFields:"ಸೂಚಿಸಿದ ಕ್ಷೇತ್ರಗಳು",reviewProfile:"ನನ್ನ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸರಿಪಡಿಸಿ.",shareCircumstances:"ನಿಮ್ಮ ರಾಜ್ಯ/UT, ಕುಟುಂಬ ಮತ್ತು ಸಂಬಂಧಿತ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",reviewRules:"ಹೊಂದಾಣಿಕೆ ನಿಯಮಗಳು, ತಿಳಿಯದ ಉತ್ತರಗಳು ಮತ್ತು ಅಧಿಕೃತ ಮೂಲಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",keepDraft:"ಪರಿಶೀಲನಾ ಪಟ್ಟಿಯನ್ನು ರಚಿಸಿ ಮತ್ತು ಕರಡು ಉಳಿಸಿ.",screeningExplanation:"ಪ್ರತಿ ಫಲಿತಾಂಶವು ನಿಯಮ, ಬಳಸಿದ ಪ್ರೊಫೈಲ್ ಸಾಕ್ಷ್ಯ ಮತ್ತು ಪರಿಶೀಲಿಸಬೇಕಾದ ಅಧಿಕೃತ ಮೂಲವನ್ನು ತೋರಿಸುತ್ತದೆ.",unknownStaysUnknown:"ತಿಳಿಯದದ್ದು ತಿಳಿಯದಂತೆಯೇ ಉಳಿಯುತ್ತದೆ",sourceLinkedRules:"ಮೂಲ-ಸಂಬಂಧಿತ ನಿಯಮಗಳು",humanApprovalBeforeAction:"ಕ್ರಮಕ್ಕೂ ಮೊದಲು ಮಾನವ ಅನುಮೋದನೆ",incomeHint:"ಅಂದಾಜು ವಾರ್ಷಿಕ ಮೊತ್ತ ನಮೂದಿಸಿ.",profileMoreComplete:"ಪೂರ್ಣ ಉತ್ತರಗಳು ತಿಳಿಯದ ಷರತ್ತುಗಳನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತವೆ. ಖಾಲಿ ಕ್ಷೇತ್ರಗಳನ್ನು ನಂತರ ಭರ್ತಿ ಮಾಡಬಹುದು.",privacyProfileText:"ನಿಮ್ಮ ಪ್ರೊಫೈಲ್, ಮೌಲ್ಯಮಾಪನ, ಕರಡು ಮತ್ತು ನೆನಪಿನ ಸೂಚನೆಗಳು ಈ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಉಳಿಯುತ್ತವೆ. ಡೆಮೊ ನಿಯಮ ಪರಿಶೀಲನೆ ಮತ್ತು ಪಠ್ಯ ಹೊರತೆಗೆಯುವಿಕೆ ಸ್ಥಳೀಯವಾಗಿ ನಡೆಯುತ್ತದೆ. ರಫ್ತು ಮಾಡಿದ ವಾಲ್ಟ್ ಪಾಸ್‌ವರ್ಡ್‌ನಿಂದ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಆಗುತ್ತದೆ; ಬ್ರೌಸರ್ ಸಂಗ್ರಹಣೆ ಆ್ಯಪ್-ಮಟ್ಟದಲ್ಲಿ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಆಗಿಲ್ಲ. ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗೆ ಮಾಹಿತಿ ನೀವು ಸ್ವತಃ ಭರ್ತಿ ಅಥವಾ ಸಲ್ಲಿಸಿದಾಗ ಮಾತ್ರ ಹೋಗುತ್ತದೆ.",assessmentHeading:"ಸಂಭಾವ್ಯ ಮಾರ್ಗಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ಕರಡು ಮಾಡುವ ಮೊದಲು ನಿಯಮ ಸಾಕ್ಷ್ಯ ಪರಿಶೀಲಿಸಿ.",assessmentReady:"ಮೌಲ್ಯಮಾಪನ ನಡೆಸಲು ಸಿದ್ಧವಾಗಿದೆ",assessedWorkflow:"ಈ ಪ್ರಕ್ರಿಯೆ ನಿಮ್ಮ ಉಳಿಸಿದ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಆಯ್ದ ಪಟ್ಟಿಯನ್ನು ಬಳಸಿದೆ.",completeProfileFirst:"ಮೊದಲು ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ. ನಂತರ ಅನ್ವಯಿಸುವ ನಿಯಮಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಬಹುದು.",editProfile:"ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ",openSchemeList:"ಕೇಂದ್ರ + ರಾಜ್ಯ/UT ಸಂಪೂರ್ಣ ಯೋಜನೆಗಳ ಪಟ್ಟಿಯೇ ಬೇಕೇ?",category:"ವರ್ಗ",allCategories:"ಎಲ್ಲಾ ವರ್ಗಗಳು",noSchemes:"ಯೋಜನೆ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ",tryKeyword:"ಬೇರೆ ಪದ ಅಥವಾ ವರ್ಗ ಪ್ರಯತ್ನಿಸಿ.",clearFilters:"ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ",loadingDataset:"ತೆರೆದ ಡೇಟಾ ದಾಖಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",loadNext:"ಮುಂದಿನ 50 ಡೇಟಾಸೆಟ್ ದಾಖಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ",notPersonalized:"ನಾಲ್ಕು ನಿರ್ದಿಷ್ಟ ನಿಯಮ ಪ್ರೋಟೋಟೈಪ್‌ಗಳು ಸ್ವತಂತ್ರ ಪರಿಶೀಲನೆಗಾಗಿ ಕಾಯುತ್ತಿವೆ; ಇವು ಅರ್ಹತಾ ನಿರ್ಧಾರಗಳಲ್ಲ. ಬಾಹ್ಯ ಡೇಟಾಸೆಟ್ ದಾಖಲೆಗಳು ಹುಡುಕಾಟಕ್ಕಾಗಿ ಮಾತ್ರ.",evidenceOrganizer:"ಸಾಕ್ಷ್ಯ ಸಂಘಟಕ",metadataOnly:"ಮೆಟಾಡೇಟಾ ಮಾತ್ರ",addDocumentReference:"ದಾಖಲೆ ಉಲ್ಲೇಖ ಸೇರಿಸಿ",chooseFile:"ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ",max12MB:"ಗರಿಷ್ಠ 12 MB",yourRecords:"ನಿಮ್ಮ ದಾಖಲೆಗಳು",noDocumentRefs:"ಇನ್ನೂ ದಾಖಲೆ ಉಲ್ಲೇಖಗಳಿಲ್ಲ",checklistAppears:"ಫೈಲ್ ಸೇರಿಸಿದಾಗ ನಿಮ್ಮ ಪಟ್ಟಿ ಇಲ್ಲಿ ಕಾಣುತ್ತದೆ.",applicationLifecycle:"ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆ",noDrafts:"ಇನ್ನೂ ಅರ್ಜಿ ಕರಡುಗಳಿಲ್ಲ",createDraftHelp:"ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ, ಯೋಜನೆ ತೆರೆಯಿರಿ ಮತ್ತು ಪರಿಶೀಲಿಸಬಹುದಾದ ದಾಖಲೆ ರಚಿಸಲು “ಕರಡು ತಯಾರಿಸಿ” ಆಯ್ಕೆಮಾಡಿ.",findBenefits:"ಪ್ರಯೋಜನಗಳನ್ನು ಹುಡುಕಿ",preparationDraft:"ತಯಾರಿ ಕರಡು",notSubmitted:"ಸಲ್ಲಿಸಲಾಗಿಲ್ಲ",applicant:"ಅರ್ಜಿದಾರ",location:"ಸ್ಥಳ",openChecks:"ಬಾಕಿ ಪರಿಶೀಲನೆಗಳು",hidePreparedFields:"ತಯಾರಿಸಿದ ಕ್ಷೇತ್ರಗಳನ್ನು ಮರೆಮಾಡಿ",reviewPreparedFields:"ತಯಾರಿಸಿದ ಕ್ಷೇತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",markReviewed:"ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತು ಮಾಡಿ",notProvided:"ನೀಡಿಲ್ಲ",provided:"ನೀಡಲಾಗಿದೆ",needsInformation:"ಮಾಹಿತಿ ಅಗತ್ಯ",openOfficialSource:"ಅಧಿಕೃತ ಮೂಲ ತೆರೆಯಿರಿ",addFollowup:"ಮುಂದಿನ ನೆನಪಿನ ಕಾರ್ಯ ಸೇರಿಸಿ",remove:"ತೆಗೆದುಹಾಕಿ",upcomingActions:"ಮುಂದಿನ ಕಾರ್ಯಗಳು",reminders:"ನೆನಪಿನ ಸೂಚನೆಗಳು",suggestedDate:"ಸೂಚಿಸಿದ ದಿನಾಂಕ",done:"ಮುಗಿದಿದೆ",ourApproach:"ನಮ್ಮ ವಿಧಾನ",aboutTitle:"ಸ್ಪಷ್ಟತೆ, ಸಾಕ್ಷ್ಯ ಮತ್ತು ನಾಗರಿಕ ನಿಯಂತ್ರಣ.",aboutDescription:"JanaSetu ಸ್ವತಂತ್ರ ಸರ್ಕಾರಿ ಪ್ರಯೋಜನ ಮಾರ್ಗದರ್ಶನ ಪ್ರೋಟೋಟೈಪ್. ಇದು ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳಿಗೆ ಪೂರಕ; ಬದಲಾವಣೆ ಅಲ್ಲ.",discoverTitle:"ಹುಡುಕಿ",explainTitle:"ವಿವರಿಸಿ",prepareTitle:"ಸಿದ್ಧಪಡಿಸಿ",rememberTitle:"ನೆನಪಿಡಿ",dataTransparency:"ಡೇಟಾ ಪಾರದರ್ಶಕತೆ",currentCatalogue:"ಪ್ರಸ್ತುತ ಪಟ್ಟಿಯಲ್ಲಿ ಏನಿದೆ?",coverageHonesty:"ಕವರೆಜ್ ಸ್ಪಷ್ಟತೆ",responsibleBoundary:"ಜವಾಬ್ದಾರಿಯುತ ಬಳಕೆಯ ಮಿತಿ",officialSource:"ಅಧಿಕೃತ ಮೂಲ",cscLocator:"CSC ಸ್ಥಳ ಹುಡುಕಿ",footerText:"ಸ್ವತಂತ್ರ ಸರ್ಕಾರಿ ಪ್ರಯೋಜನ ಮಾರ್ಗದರ್ಶಿ",evidenceLed:"ಸಾಕ್ಷ್ಯ ಆಧಾರಿತ. ನಾಗರಿಕ ನಿಯಂತ್ರಿತ.",closeNav:"ನ್ಯಾವಿಗೇಶನ್ ಮುಚ್ಚಿ",openNav:"ನ್ಯಾವಿಗೇಶನ್ ತೆರೆಯಿರಿ",openProfile:"ಪ್ರೊಫೈಲ್ ತೆರೆಯಿರಿ",dismiss:"ಸೂಚನೆ ಮುಚ್ಚಿ",backupTitle:"ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ JanaSetu ವಾಲ್ಟ್ ರಫ್ತುಮಾಡಿ",restoreTitle:"ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ JanaSetu ವಾಲ್ಟ್ ಮರುಸ್ಥಾಪಿಸಿ",cscHelp:"ನಿಮ್ಮ ಪರಿಶೀಲನಾ ಪಟ್ಟಿಯನ್ನು ಅಧಿಕೃತ ಕೇಂದ್ರ ಅಥವಾ ಇಲಾಖೆಗೆ ತೆಗೆದುಕೊಂಡು ಹೋಗಿ.",findCSC:"CSC ಹುಡುಕಿ",privacyLink:"ಗೌಪ್ಯತೆ",termsLink:"ನಿಯಮಗಳು",publishedBenefit:"ಸಂಭಾವ್ಯ ಪ್ರಯೋಜನ · ಇಲಾಖೆಯೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ",screeningConditions:"ಪರಿಶೀಲನಾ ಷರತ್ತುಗಳು",assessmentEvidence:"ಮೌಲ್ಯಮಾಪನ ಸಾಕ್ಷ್ಯ",nextRecommendedActions:"ಮುಂದಿನ ಶಿಫಾರಸು ಕ್ರಮಗಳು",officialChannel:"ಅಧಿಕೃತ ಅರ್ಜಿ / ಸೇವಾ ಮಾರ್ಗ",catalogueOnly:"ಪಟ್ಟಿ ದಾಖಲೆ ಮಾತ್ರ — ಈ ಯೋಜನೆಗೆ JanaSetu ಅರ್ಹತೆಯನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನಿರ್ಧರಿಸಿಲ್ಲ. ಇಲಾಖೆಯಿಂದ ನಿಯಮಗಳನ್ನು ದೃಢಪಡಿಸಿ.",budgetReferenceOnly:"ಬಜೆಟ್ ಶೀರ್ಷಿಕೆ ಮಾತ್ರ — ಇದು ಸರ್ಕಾರಿ ಬಜೆಟ್‌ನ ವೆಚ್ಚದ ಶೀರ್ಷಿಕೆ; ನಾಗರಿಕರಿಗೆ ಲಭ್ಯವಿರುವ ಯೋಜನೆ ಎಂದು ಇನ್ನೂ ದೃಢಪಡಿಸಿಲ್ಲ. ವೈಯಕ್ತಿಕ ಹಕ್ಕು ಅಥವಾ ಅರ್ಜಿ ಮಾರ್ಗವನ್ನು ಊಹಿಸಲಾಗುವುದಿಲ್ಲ.",governmentWorkspace:"ಸರ್ಕಾರಿ ಪ್ರಯೋಜನ ಕಾರ್ಯಕ್ಷೇತ್ರ",noAadhaarRequest:"ಇಲ್ಲಿ ಆಧಾರ್, ಬ್ಯಾಂಕ್ ಖಾತೆ ಅಥವಾ ದಾಖಲೆ ಸಂಖ್ಯೆ ಕೇಳುವುದಿಲ್ಲ.",noAadhaarNote:"ಈ ಪ್ರೋಟೋಟೈಪ್‌ನಲ್ಲಿ ಆಧಾರ್ ಅಥವಾ ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ ಅಗತ್ಯವಿಲ್ಲ.",sourceIndexed:"ಮೂಲ ಸೂಚಿಸಲಾಗಿದೆ · ನಿಯಮ ಪರಿಶೀಲಿಸಿ",ruleScreened:"ನಿಯಮ ಪರಿಶೀಲನೆ · ಮೂಲ ಜೋಡಿಸಲಾಗಿದೆ",loading:"ತೆರೆದ ಡೇಟಾ ದಾಖಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",next50:"ಮುಂದಿನ 50 ಡೇಟಾಸೆಟ್ ದಾಖಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ",datasetPaginated:"ಬಾಹ್ಯ ಡೇಟಾಸೆಟ್ ಪುಟಗಳಾಗಿ ಲೋಡ್ ಆಗುತ್ತದೆ. ಮೇಲಿನ ಕೀವರ್ಡ್ ಮೂಲಕ ಹುಡುಕಿ.",schemeRecords:"ದಾಖಲೆ ಉಲ್ಲೇಖಗಳು",localLabel:"ಸ್ಥಳೀಯ",followupMemory:"ಮುಂದಿನ ಕಾರ್ಯ ನೆನಪು",coverageText:"JanaSetu ಮೂಲ-ಸಂಬಂಧಿತ ದಾಖಲೆಗಳು ಮತ್ತು ಬಾಹ್ಯ ಡೇಟಾಸೆಟ್ ಹೊಂದಿದೆ. ಸಂಪೂರ್ಣ ಪರಿಶೀಲಿಸಿದ ಕೇಂದ್ರ ಅಥವಾ ರಾಜ್ಯ/UT ಯೋಜನೆಗಳ ವ್ಯಾಪ್ತಿ ಇನ್ನೂ ಇಲ್ಲ. ಎಲ್ಲಾ ನಿಯಮಗಳು ಮತ್ತು ಅರ್ಜಿ ಮಾರ್ಗಗಳನ್ನು ಅಧಿಕೃತ ಇಲಾಖೆಯಿಂದ ಪರಿಶೀಲಿಸಿ.",schemeAssistant:"ನಾಗರಿಕ ನಿಯಂತ್ರಿತ ಬ್ರೌಸರ್ ಫಾರ್ಮ್ ಸಹಾಯಕ ಸ್ಥಾಪಿಸಿ",manualSubmit:"ತುಂಬಿದ ಪ್ರತಿಯೊಂದು ಕ್ಷೇತ್ರವನ್ನೂ ಪರಿಶೀಲಿಸಿ. ಕ್ಷೇತ್ರ ಬದಲಾವಣೆಗಳಿಗೆ ಪೋರ್ಟಲ್ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳು ಪ್ರತಿಕ್ರಿಯಿಸಬಹುದು; ಮುಂದುವರಿಯುವ ಮೊದಲು ಪುಟವನ್ನು ಪರಿಶೀಲಿಸಿ.",mySchemeSearch:"ಅಧಿಕೃತ myScheme ಹುಡುಕಿ",datasetAttribution:"ತೆರೆದ ಡೇಟಾಸೆಟ್ ಉಲ್ಲೇಖ",snapshotDate:"ಡೇಟಾಸೆಟ್ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್",datasetMachineParsed:"ಅರ್ಹತೆ ಮಾಹಿತಿಯನ್ನು ಯಂತ್ರದಿಂದ ಹೊರತೆಗೆಯಲಾಗಿದೆ; ನಿರ್ಧಾರಕ್ಕೆ ಬಳಸುವುದಿಲ್ಲ. ಹುಡುಕಾಟವು ಸಂಪೂರ್ಣ ಸ್ಥಳೀಯ ಸೂಚ್ಯಂಕದಲ್ಲಿ ನಡೆಯುತ್ತದೆ. ಪ್ರತಿ ಯೋಜನೆಯನ್ನು ಅಧಿಕೃತ ಮೂಲದಿಂದ ಪರಿಶೀಲಿಸಿ.",datasetFreshnessWarning:"ಪ್ರಕಾಶಕರ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್ 90 ದಿನಗಳಿಗಿಂತ ಹಳೆಯದು. ಇದು ಪ್ರಸ್ತುತ ಸ್ಥಿತಿಯ ಫೀಡ್ ಅಲ್ಲ; ಯೋಜನೆಯ ಸ್ಥಿತಿ ಮತ್ತು ಗಡುವನ್ನು ಅಧಿಕೃತ ಮೂಲದಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.",securityDocs:"ಭದ್ರತೆಗಾಗಿ ಈ ಪ್ರೋಟೋಟೈಪ್‌ಗೆ ಆಧಾರ್ ಚಿತ್ರ, ಬ್ಯಾಂಕ್ ವಿವರ ಅಥವಾ ಸೂಕ್ಷ್ಮ ಗುರುತಿನ ದಾಖಲೆ ಸೇರಿಸಬೇಡಿ. ಡೆಮೊಗೆ ಮಾದರಿ ಫೈಲ್ ಬಳಸಿ.",aboutDiscoverText:"ಅಧಿಕೃತ ಯೋಜನೆಗಳ ಆಯ್ದ ಪಟ್ಟಿಯಿಂದ ಸೂಕ್ತ ಮಾರ್ಗಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ಒಂದೇ ನಾಗರಿಕ ಪ್ರೊಫೈಲ್ ಬಳಸಿ.",aboutExplainText:"ಪ್ರತಿ ಪರಿಶೀಲನೆಯಲ್ಲಿ ನಿಯಮ, ಬಳಸಿದ ಪ್ರೊಫೈಲ್ ಕ್ಷೇತ್ರ ಮತ್ತು ಸಾಕ್ಷ್ಯದ ಸ್ಥಿತಿ ತೋರಿಸಲಾಗುತ್ತದೆ.",aboutPrepareText:"ಪರಿಶೀಲನೆಗೆ ಸ್ಥಳೀಯ ಕರಡು ಮತ್ತು ದಾಖಲೆ ಪಟ್ಟಿಯನ್ನು ರಚಿಸಿ. ಪ್ರೋಟೋಟೈಪ್ ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸುವುದಿಲ್ಲ.",aboutRememberText:"ನಾಗರಿಕರು ನಂತರ ಮುಂದುವರಿಸಲು ಕರಡು ಮತ್ತು ನೆನಪುಗಳನ್ನು ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಇರಿಸಿ.",responsibleUseText:"JanaSetu ಪ್ರಾಥಮಿಕ ಮಾಹಿತಿ ಮತ್ತು ಪ್ರಕ್ರಿಯಾ ಸಹಾಯ ನೀಡುತ್ತದೆ. ಇದು ಕಾನೂನು ಅಥವಾ ಅಧಿಕೃತ ನಿರ್ಧಾರ ನೀಡುವುದಿಲ್ಲ, ಗುರುತನ್ನು ದೃಢೀಕರಿಸುವುದಿಲ್ಲ, ಪ್ರಯೋಜನವನ್ನು ಖಚಿತಪಡಿಸುವುದಿಲ್ಲ ಅಥವಾ ಸರ್ಕಾರದ ಪರವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುವುದಿಲ್ಲ. ಅಧಿಕೃತ ಮೂಲದಿಂದ ವಿವರ ಪರಿಶೀಲಿಸಿ.",followupDate:"ಸೂಚಿಸಿದ ದಿನಾಂಕ",documentUploadText:"PDF ಅಥವಾ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಅದನ್ನು ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಿ ಚೆಕ್‌ಲಿಸ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗುತ್ತದೆ. ಫೈಲ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡುವುದಿಲ್ಲ ಅಥವಾ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮಾಲ್‌ವೇರ್ ಸ್ಕ್ಯಾನ್ ಮಾಡುವುದಿಲ್ಲ.",maxFileSize:"ಗರಿಷ್ಠ 12 MB",noDocRefs:"ಇನ್ನೂ ದಾಖಲೆ ಉಲ್ಲೇಖಗಳಿಲ್ಲ",docChecklistEmpty:"ಫೈಲ್ ಸೇರಿಸಿದಾಗ ನಿಮ್ಮ ಪಟ್ಟಿ ಇಲ್ಲಿ ಕಾಣುತ್ತದೆ.",draftStatus:"ತಯಾರಿ ಕರಡು",draftNotSubmitted:"ಸಲ್ಲಿಸಲಾಗಿಲ್ಲ",reviewDraftFields:"ತಯಾರಿಸಿದ ಕ್ಷೇತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",hideDraftFields:"ತಯಾರಿಸಿದ ಕ್ಷೇತ್ರಗಳನ್ನು ಮರೆಮಾಡಿ",citizenReviewed:"ನಾಗರಿಕ ಪರಿಶೀಲನೆ ದಾಖಲಿಸಲಾಗಿದೆ",draftInfoDisclaimer:"ಇವು ಪ್ರೊಫೈಲ್ ತಯಾರಿ ಕ್ಷೇತ್ರಗಳು; ಅಧಿಕೃತ ಫಾರ್ಮ್‌ಗೆ ದೃಢೀಕೃತ ಮ್ಯಾಪಿಂಗ್ ಅಲ್ಲ. ಅಧಿಕೃತ ಮೂಲದಲ್ಲಿ ಪ್ರಸ್ತುತ ಕ್ಷೇತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",openOfficial:"ಅಧಿಕೃತ ಮೂಲ ತೆರೆಯಿರಿ",addReminder:"ಮುಂದಿನ ನೆನಪಿನ ಕಾರ್ಯ ಸೇರಿಸಿ",removeItem:"ತೆಗೆದುಹಾಕಿ",upcoming:"ಮುಂದಿನ ಕಾರ್ಯಗಳು",reminderPlural:"ನೆನಪಿನ ಸೂಚನೆಗಳು",draftHelp:"ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ, ಯೋಜನೆ ತೆರೆಯಿರಿ ಮತ್ತು ಪರಿಶೀಲಿಸಬಹುದಾದ ದಾಖಲೆ ರಚಿಸಲು “ಕರಡು ತಯಾರಿಸಿ” ಆಯ್ಕೆಮಾಡಿ.",coverageTitle:"ಕವರೆಜ್ ಸ್ಪಷ್ಟತೆ",catalogueHeading:"ಪ್ರಸ್ತುತ ಪಟ್ಟಿಯಲ್ಲಿ ಏನಿದೆ?",builtIn:"ಅಂತರ್ನಿರ್ಮಿತ ದಾಖಲೆಗಳು",footerIndependent:"ಸ್ವತಂತ್ರ ಸರ್ಕಾರಿ ಪ್ರಯೋಜನ ಮಾರ್ಗದರ್ಶಿ",footerTrust:"ಸಾಕ್ಷ್ಯ ಆಧಾರಿತ. ನಾಗರಿಕ ನಿಯಂತ್ರಿತ.",toolSteps:"ಟೂಲ್ ಹಂತಗಳು",agentTrace:"ಈ ಪ್ರೋಟೋಟೈಪ್ ನಿಯಮ-ಆಧಾರಿತ ಯೋಜಕ ಮತ್ತು ನಿರ್ದಿಷ್ಟ ಸರ್ವರ್ ಟೂಲ್‌ಗಳನ್ನು ಬಳಸುತ್ತದೆ; ಹೊರಗಿನ LLM ಅಥವಾ ಸರ್ಕಾರಿ API ಬಳಸುವುದಿಲ್ಲ.",complete:"ಪೂರ್ಣ",verifyRules:"ಮೂಲ ಜೋಡಿಸಲಾಗಿದೆ · ಪ್ರಸ್ತುತ ನಿಯಮಗಳು ಮತ್ತು ಗಡುವು ಪರಿಶೀಲಿಸಿ.",noticeStorageRecovered:"ಕೆಲವು ಉಳಿಸಿದ ಬ್ರೌಸರ್ ಡೇಟಾವನ್ನು ಓದಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಹೊಸ ಪ್ರೊಫೈಲ್‌ನೊಂದಿಗೆ ಮುಂದುವರಿಯಬಹುದು.",noticeBackupExported:"ಬ್ಯಾಕಪ್ ಈ ಸಾಧನಕ್ಕೆ ರಫ್ತು ಮಾಡಲಾಗಿದೆ. ಇದನ್ನು ಖಾಸಗಿ ಡೇಟಾ ಎಂದು ಪರಿಗಣಿಸಿ.",noticeBackupRestored:"ಬ್ಯಾಕಪ್ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ. ಬಳಕೆಗೆ ಮೊದಲು ವಿವರ ಪರಿಶೀಲಿಸಿ.",noticeBackupRestoreFailed:"ಬ್ಯಾಕಪ್ ಮರುಸ್ಥಾಪಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",noticeDescribeBefore:"ಮುಂದುವರಿಯುವ ಮೊದಲು ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ಒಂದು ವಾಕ್ಯದಲ್ಲಿ ವಿವರಿಸಿ.",noticeIntakeFacts:"ವಿವರಗಳನ್ನು ಹೊರತೆಗೆಯಲಾಗಿದೆ. ಉಳಿಸುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ.",noticeIntakeEmpty:"ಬೆಂಬಲಿತ ಪ್ರೊಫೈಲ್ ವಿವರಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಇನ್ನಷ್ಟು ಸ್ಪಷ್ಟವಾಗಿ ವಿವರಿಸಿ.",noticeIntakeFailed:"ವಿವರಣೆಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",noticeSelectState:"ಪರಿಶೀಲನೆಗೂ ಮೊದಲು ರಾಜ್ಯ ಅಥವಾ ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶ ಆಯ್ಕೆಮಾಡಿ.",noticeAssessmentDone:"ಮೌಲ್ಯಮಾಪನ ಸ್ಥಳೀಯವಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ. ಸಾಕ್ಷ್ಯ ಮತ್ತು ಅಧಿಕೃತ ಮೂಲಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",noticeAssessmentFailed:"ಮೌಲ್ಯಮಾಪನ ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",noticeDraftPrepared:"ಕರಡು ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಉಳಿಸಲಾಗಿದೆ. ಸಲ್ಲಿಸಲಾಗಿಲ್ಲ.",noticeDraftFailed:"ಕರಡು ತಯಾರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",noticeReminderSaved:"ನೆನಪಿನ ಸೂಚನೆ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಉಳಿಸಲಾಗಿದೆ.",noticeFileTooLarge:"12 MB ಗಿಂತ ಚಿಕ್ಕ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ.",noticeFileAdded:"ಫೈಲ್ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಉಳಿಸಲಾಗಿದೆ. ಮಾಲ್‌ವೇರ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿಲ್ಲ.",searchFallback:"ಪ್ರಕಾಶಕರ ಹುಡುಕಾಟ ಸೇವೆ ಲಭ್ಯವಿಲ್ಲ. JanaSetu ಬದಲಿಗೆ ಸಂಪೂರ್ಣ ಸ್ಥಳೀಯ ಸೂಚ್ಯಂಕದ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್‌ನಲ್ಲಿ ಹುಡುಕುತ್ತಿದೆ; ಫಲಿತಾಂಶಗಳು ಮಾಹಿತಿ ಹುಡುಕಲು ಮಾತ್ರ, ಡೇಟಾ ಹಳೆಯದಾಗಿರಬಹುದು.",catalogueApiUnavailable:"ತೆರೆದ ಡೇಟಾಸೆಟ್ ಅನ್ನು ಈಗ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಅಧಿಕೃತ myScheme ಲಿಂಕ್ ಬಳಸಿ.",assessedRecords:"ಸಂಬಂಧಿತ ಯೋಜನೆ ದಾಖಲೆಗಳ ಮೌಲ್ಯಮಾಪನ",displayed:"ತೋರಿಸಲಾಗಿದೆ",openDataRows:"ತೆರೆದ ಡೇಟಾ ಸಾಲುಗಳು",ruleScreenedCount:"ನಿಯಮ ಪ್ರೋಟೋಟೈಪ್‌ಗಳು · ಸ್ವತಂತ್ರ ಪರಿಶೀಲನೆ ಬಾಕಿ",schemeApprovalPending:"ಯೋಜನೆಯ ಮೂಲ ಅನುಮೋದನೆ ಬಾಕಿಯಿದೆ",schemeUnavailable:"ಯೋಜನೆ ಈಗಿನ ಪಟ್ಟಿಯಲ್ಲಿ ಇಲ್ಲ",officialVerificationRequired:"ಅಧಿಕೃತ ಅರ್ಹತೆ ಪರಿಶೀಲನೆ ಅಗತ್ಯ",requireReview:"ಪರಿಶೀಲನೆ ಅಗತ್ಯ",ruleScreenedStatus:"ನಿಯಮ ಪ್ರೋಟೋಟೈಪ್ · ಸ್ವತಂತ್ರ ಪರಿಶೀಲನೆ ಬಾಕಿ",sourceIndexedStatus:"ಮೂಲ ಸೂಚಿಸಲಾಗಿದೆ · ನಿಯಮ ಪರಿಶೀಲಿಸಿ",ruleScreenedMetric:"ನಿಯಮ ಪ್ರೋಟೋಟೈಪ್‌ಗಳು",remainderRequireVerification:"ಸ್ವತಂತ್ರ ಪರಿಶೀಲನೆ ಬಾಕಿ",commonServiceCentres:"ಸಾಮಾನ್ಯ ಸೇವಾ ಕೇಂದ್ರಗಳು",openCitizenProfile:"ನಾಗರಿಕ ಪ್ರೊಫೈಲ್ ತೆರೆಯಿರಿ",runBenefitsAssessment:"ಸೌಲಭ್ಯ ಮೌಲ್ಯಮಾಪನ ನಡೆಸಿ",openApplicationWorkspace:"ಅರ್ಜಿ ಕಾರ್ಯಸ್ಥಳ ತೆರೆಯಿರಿ",working:"ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ…",fileTypes:"PDF, JPG, PNG",addedLabel:"ಸೇರಿಸಲಾಗಿದೆ",removeDocumentReference:"ದಾಖಲೆ ಉಲ್ಲೇಖ ತೆಗೆದುಹಾಕಿ",draftFieldNote:"ಇವು ಪ್ರೊಫೈಲ್ ತಯಾರಿ ಕ್ಷೇತ್ರಗಳು; ಅಧಿಕೃತ ಇಲಾಖೆಯ ಫಾರ್ಮ್‌ಗೆ ಪರಿಶೀಲಿತ ಮ್ಯಾಪಿಂಗ್ ಅಲ್ಲ. ಅಧಿಕೃತ ಮೂಲದಲ್ಲಿ ಪ್ರಸ್ತುತ ಕ್ಷೇತ್ರಗಳು ಮತ್ತು ಮೌಲ್ಯಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",draftNotSubmittedDisclaimer:"ಇದು JanaSetu ತಯಾರಿಸಿದ ಅರ್ಜಿ ಕರಡು. ಇದನ್ನು ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗೆ ಸಲ್ಲಿಸಲಾಗಿಲ್ಲ.",manualVerificationPending:"ಸೇರಿಸಲಾಗಿದೆ — ಕೈಯಾರೆ ಪರಿಶೀಲನೆ ಬಾಕಿ",incomeExample:"ಉದಾ. 150000",sourcePeriodLabel:"ಮೂಲ ಅವಧಿ",categoryAgriculture:"ಕೃಷಿ",categoryHousing:"ವಸತಿ",categoryEducation:"ಶಿಕ್ಷಣ",categoryEmployment:"ಉದ್ಯೋಗ",categoryEnergy:"ಶಕ್ತಿ",categoryEnergyHousehold:"ಶಕ್ತಿ ಮತ್ತು ಗೃಹ ಬಳಕೆ",categoryFoodSecurity:"ಆಹಾರ ಭದ್ರತೆ",categoryHealth:"ಆರೋಗ್ಯ",categoryInsurance:"ವಿಮೆ",categoryKarnatakaBudget:"ಕರ್ನಾಟಕ ಬಜೆಟ್ ಉಲ್ಲೇಖ",categoryScholarship:"ವಿದ್ಯಾರ್ಥಿವೇತನ",categorySkills:"ಕೌಶಲ್ಯಗಳು",categoryTransport:"ಸಾರಿಗೆ",categoryWomenChild:"ಮಹಿಳೆ ಮತ್ತು ಮಗು",sourceLanguageNotice:"ಯೋಜನೆಯ ಹೆಸರುಗಳು ಮತ್ತು ಮೂಲ ದಾಖಲೆಗಳು ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಮೂಲ ಭಾಷೆಯಲ್ಲಿರಬಹುದು. UI ಅನುವಾದಗಳು ಸಹಾಯಕ್ಕಾಗಿ; ಅಧಿಕೃತ ಮೂಲದಲ್ಲಿ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",hideDetails:"ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ",viewDetails:"ವಿವರಗಳನ್ನು ನೋಡಿ",accessedLabel:"ಪ್ರವೇಶಿಸಿದ ದಿನಾಂಕ",approvalNextAction:"ಮೂಲ ಮತ್ತು ನಿಯಮಗಳಿಗೆ ಎರಡು ಸ್ವತಂತ್ರ ಅನುಮೋದನೆಗಳಿಗಾಗಿ ಕಾಯಿರಿ.",officialVerifyNextAction:"ಪ್ರಸ್ತುತ ಷರತ್ತುಗಳನ್ನು ಅಧಿಕೃತ ಇಲಾಖೆಯೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.",essentialProfileFieldsProvided:"7 ಅಗತ್ಯ ಪ್ರೊಫೈಲ್ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ {provided} ಒದಗಿಸಲಾಗಿದೆ",createdLabel:"ರಚಿಸಲಾಗಿದೆ",citizenReviewRecorded:"ನಾಗರಿಕ ಪರಿಶೀಲನೆ ದಾಖಲಿಸಲಾಗಿದೆ",savedDrafts:"ಕರಡುಗಳು ಉಳಿಸಲಾಗಿದೆ",unknownFileType:"ಅಜ್ಞಾತ ಫೈಲ್ ಪ್ರಕಾರ",prepareLocalChecklist:"ಸ್ಥಳೀಯ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ ತಯಾರಿಸಿ",localPrepOnly:"ಸ್ಥಳೀಯ ಸಿದ್ಧತೆ ಮಾತ್ರ — ಇದು ಅರ್ಜಿ ದಾಖಲೆಯಲ್ಲ.",pendingDraftDisclaimer:"ಇದು ಸಿದ್ಧತಾ ದಾಖಲೆ ಮಾತ್ರ — ಅರ್ಹತಾ ನಿರ್ಧಾರವೂ ಅಲ್ಲ, ಸಲ್ಲಿಸಿದ ಅರ್ಜಿಯೂ ಅಲ್ಲ."},
  ta: {localStatus:"உள்ளூர் முன்னுரிமை முன்மாதிரி",clearerWay:"அடுத்த படி தெளிவாக",evidenceLinked:"ஆதாரம் இணைக்கப்பட்டது",nextActionReady:"அடுத்த செயல் தயார்",intakeSafety:"உரையிலிருந்து எடுக்கப்படும் தகவல் ஒரு பரிந்துரை மட்டுமே. சேமிப்பதற்கு முன் ஒவ்வொரு புலத்தையும் சரிபார்க்கவும்.",extractFacts:"சுயவிவரத் தகவலைப் பிரித்தெடு",suggestedFields:"பரிந்துரைக்கப்பட்ட புலங்கள்",reviewProfile:"என் சுயவிவரத்தில் சரிபார்த்து திருத்தவும்.",shareCircumstances:"உங்கள் மாநிலம்/UT, குடும்பம் மற்றும் தொடர்புடைய சூழ்நிலைகளைப் பகிரவும்.",reviewRules:"பொருந்தும் விதிகள், தெரியாத பதில்கள் மற்றும் அதிகாரப்பூர்வ ஆதாரங்களைப் பாருங்கள்.",keepDraft:"சரிபார்ப்புப் பட்டியலை உருவாக்கி வரைவை வைத்திருங்கள்.",screeningExplanation:"ஒவ்வொரு முடிவும் விதி, பயன்படுத்திய சுயவிவர ஆதாரம் மற்றும் சரிபார்க்க வேண்டிய அதிகாரப்பூர்வ ஆதாரத்தைக் காட்டுகிறது.",unknownStaysUnknown:"தெரியாதது தெரியாததாகவே இருக்கும்",sourceLinkedRules:"ஆதாரத்துடன் இணைந்த விதிகள்",humanApprovalBeforeAction:"செயலுக்கு முன் மனித ஒப்புதல்",incomeHint:"தோராயமான ஆண்டு தொகையை உள்ளிடவும்.",profileMoreComplete:"முழுமையான பதில்கள் தெரியாத நிபந்தனைகளைக் குறைக்கும். காலியான புலங்களை பின்னர் நிரப்பலாம்.",privacyProfileText:"உங்கள் சுயவிவரம், மதிப்பீடு, வரைவுகள் மற்றும் நினைவூட்டல்கள் இந்த உலாவியிலேயே இருக்கும். டெமோ விதி மதிப்பீடும் உரை பிரித்தெடுப்பும் உள்ளூரிலேயே நடக்கும். ஏற்றுமதி செய்யும் வால்ட் கடவுச்சொல்லால் குறியாக்கம் செய்யப்படும்; உலாவி சேமிப்பகம் செயலி-நிலையில் குறியாக்கம் செய்யப்படவில்லை. அரசு தளத்திற்கு நீங்கள் தானாகவே நிரப்பி அல்லது சமர்ப்பிக்கும்போது மட்டுமே தகவல் செல்லும்.",assessmentHeading:"சாத்தியமான வழிகளைத் தேடி, வரைவு தயாரிக்கும் முன் விதி ஆதாரத்தைப் பாருங்கள்.",assessmentReady:"மதிப்பீடு தொடங்கத் தயாராக உள்ளது",assessedWorkflow:"சேமிக்கப்பட்ட சுயவிவரமும் தற்போதைய பட்டியலும் பயன்படுத்தப்பட்டன.",completeProfileFirst:"முதலில் சுயவிவரத்தை நிரப்பவும். பின்னர் பொருந்தும் விதிகள் தேர்வு செய்யப்படும்.",editProfile:"சுயவிவரத்தைத் திருத்து",openSchemeList:"முழு மத்திய + மாநில/UT அரசு திட்டப் பட்டியல் வேண்டுமா?",category:"வகை",allCategories:"அனைத்து வகைகள்",noSchemes:"திட்டப் பதிவுகள் கிடைக்கவில்லை",tryKeyword:"வேறு சொல் அல்லது வகையை முயற்சிக்கவும்.",clearFilters:"வடிகட்டிகளை நீக்கு",loadingDataset:"திறந்த தரவுப் பதிவுகள் ஏற்றப்படுகின்றன…",loadNext:"அடுத்த 50 தரவுப் பதிவுகளை ஏற்று",notPersonalized:"நான்கு நிர்ணயிக்கப்பட்ட விதி முன்மாதிரிகள் சுயாதீன மதிப்பாய்வுக்காக காத்திருக்கின்றன; அவை தகுதி முடிவுகள் அல்ல. வெளிப்புற தரவுத்தள பதிவுகள் தேடலுக்காக மட்டுமே.",evidenceOrganizer:"ஆதார அமைப்பாளர்",metadataOnly:"மெட்டாடேட்டா மட்டும்",addDocumentReference:"ஆவணக் குறிப்பைச் சேர்",chooseFile:"கோப்பைத் தேர்ந்தெடு",max12MB:"அதிகபட்சம் 12 MB",yourRecords:"உங்கள் பதிவுகள்",noDocumentRefs:"ஆவணக் குறிப்புகள் இன்னும் இல்லை",checklistAppears:"கோப்பைச் சேர்த்ததும் பட்டியல் இங்கே தோன்றும்.",applicationLifecycle:"விண்ணப்ப செயல்முறை",noDrafts:"விண்ணப்ப வரைவு இன்னும் இல்லை",createDraftHelp:"மதிப்பீட்டை இயக்கி, திட்டத்தைத் திறந்து, மதிப்பாய்வு செய்யக்கூடிய பதிவை உருவாக்க “வரைவைத் தயாரி” என்பதைத் தேர்ந்தெடுக்கவும்.",findBenefits:"நன்மைகளைத் தேடு",preparationDraft:"தயாரிப்பு வரைவு",notSubmitted:"சமர்ப்பிக்கப்படவில்லை",applicant:"விண்ணப்பதாரர்",location:"இடம்",openChecks:"நிலுவைச் சரிபார்ப்புகள்",hidePreparedFields:"தயார் செய்யப்பட்ட புலங்களை மறை",reviewPreparedFields:"தயார் செய்யப்பட்ட புலங்களை மதிப்பாய்வு செய்",markReviewed:"மதிப்பாய்வு செய்யப்பட்டதாகக் குறி",notProvided:"வழங்கப்படவில்லை",provided:"வழங்கப்பட்டது",needsInformation:"தகவல் தேவை",openOfficialSource:"அதிகாரப்பூர்வ ஆதாரத்தைத் திற",addFollowup:"தொடர்புச் செயலியைச் சேர்",remove:"நீக்கு",upcomingActions:"வரவிருக்கும் செயல்கள்",reminders:"நினைவூட்டல்கள்",suggestedDate:"பரிந்துரைக்கப்பட்ட தேதி",done:"முடிந்தது",ourApproach:"எங்கள் அணுகுமுறை",aboutTitle:"தெளிவு, ஆதாரம் மற்றும் குடிமக்கள் கட்டுப்பாடு.",aboutDescription:"JanaSetu ஒரு சுயாதீன அரசு நலத் திட்ட வழிகாட்டி முன்மாதிரி. இது அதிகாரப்பூர்வ தளங்களுக்கு துணை; மாற்றாகாது.",discoverTitle:"கண்டறி",explainTitle:"விளக்கு",prepareTitle:"தயார் செய்",rememberTitle:"நினைவில் வை",dataTransparency:"தரவு வெளிப்படைத்தன்மை",currentCatalogue:"தற்போதைய பட்டியலில் என்ன உள்ளது?",coverageHonesty:"கவரேஜ் வெளிப்படைத்தன்மை",responsibleBoundary:"பொறுப்பான பயன்பாட்டு வரம்பு",officialSource:"அதிகாரப்பூர்வ ஆதாரம்",cscLocator:"CSC இருப்பிடத் தேடல்",footerText:"சுயாதீன அரசு நல வழிகாட்டி",evidenceLed:"ஆதார அடிப்படையில். குடிமக்கள் கட்டுப்பாட்டில்.",closeNav:"வழிசெலுத்தலை மூடு",openNav:"வழிசெலுத்தலைத் திற",openProfile:"சுயவிவரத்தைத் திற",dismiss:"அறிவிப்பை நீக்கு",backupTitle:"குறியாக்கப்பட்ட JanaSetu வால்ட்டை ஏற்றுமதி செய்",restoreTitle:"குறியாக்கப்பட்ட JanaSetu வால்ட்டை மீட்டமை",cscHelp:"உங்கள் பட்டியலை அங்கீகரிக்கப்பட்ட CSC அல்லது துறைக்கு எடுத்துச் செல்லுங்கள்.",findCSC:"CSC-ஐத் தேடு",privacyLink:"தனியுரிமை",termsLink:"விதிமுறைகள்",aboutDiscoverText:"அதிகாரப்பூர்வ திட்டக் குறிப்புகளின் தேர்ந்தெடுக்கப்பட்ட பட்டியலில் இருந்து பொருத்தமான வழிகளைத் தேர்வுசெய்ய ஒரே குடிமக்கள் சுயவிவரத்தைப் பயன்படுத்தவும்.",aboutExplainText:"ஒவ்வொரு நிபந்தனையிலும் விதி, பயன்படுத்திய சுயவிவரப் புலம் மற்றும் ஆதார நிலை காட்டப்படும்.",aboutPrepareText:"மதிப்பாய்வுக்காக உள்ளூர் வரைவு மற்றும் ஆவணப் பட்டியலை உருவாக்கவும். முன்மாதிரி அரசு விண்ணப்பங்களைச் சமர்ப்பிக்காது.",aboutRememberText:"குடிமக்கள் பின்னர் தொடர இந்த உலாவியில் வரைவு மற்றும் நினைவூட்டல்களை வைத்திருங்கள்.",addReminder:"தொடர்புச் செயலியைச் சேர்",agentTrace:"இந்த முன்மாதிரி விதி அடிப்படையிலான திட்டமிடலையும் குறிப்பிட்ட சர்வர் கருவிகளையும் பயன்படுத்துகிறது; வெளிப்புற LLM அல்லது அரசு API-ஐ அழைக்காது.",assessmentEvidence:"மதிப்பீட்டு ஆதாரம்",builtIn:"உள்ளமைக்கப்பட்ட பதிவுகள்",catalogueHeading:"தற்போதைய பட்டியலில் என்ன உள்ளது?",catalogueOnly:"பட்டியல் பதிவு மட்டுமே — இந்தத் திட்டத்திற்கான தகுதியை JanaSetu தானாக முடிவு செய்யவில்லை. துறையிடம் விதிகளை உறுதிப்படுத்தவும்.",budgetReferenceOnly:"பட்ஜெட் தலைப்பு மட்டுமே — இது அரசு பட்ஜெட் ஒதுக்கீட்டுத் தலைப்பு; குடிமக்களுக்கான திட்டம் என இன்னும் உறுதிப்படுத்தப்படவில்லை. தனிநபர் உரிமையையோ விண்ணப்ப வழியையோ ஊகிக்கவில்லை.",citizenReviewed:"குடிமக்கள் மதிப்பாய்வு பதிவு செய்யப்பட்டது",coverageText:"JanaSetu ஆதார இணைப்புள்ள பதிவுகள் மற்றும் வெளிப்புற தரவுத்தொகுப்பைக் கொண்டுள்ளது. முழுமையான, சுயாதீனமாகச் சரிபார்க்கப்பட்ட மத்திய அல்லது மாநில/UT திட்டப் பட்டியல் இன்னும் இல்லை. தற்போதைய விதிகள் மற்றும் விண்ணப்ப வழிகளை அதிகாரப்பூர்வ துறையிடம் சரிபார்க்கவும்.",coverageTitle:"கவரேஜ் வெளிப்படைத்தன்மை",datasetAttribution:"திறந்த தரவுத்தொகுப்பு அங்கீகாரம்",datasetMachineParsed:"தகுதி விவரங்கள் இயந்திரத்தால் பிரித்தெடுக்கப்பட்டவை; முடிவெடுக்கப் பயன்படுத்தப்படுவதில்லை. தேடல் முழு உள்ளூர் குறியீட்டில் நடக்கிறது. ஒவ்வொரு திட்டத்தையும் அதிகாரப்பூர்வ ஆதாரத்தில் சரிபார்க்கவும்.",datasetFreshnessWarning:"தரவுத் தொகுப்பு 90 நாட்களைக் கடந்த பழையது. இது தற்போதைய நிலை ஊட்டம் அல்ல; திட்டத்தின் நிலை மற்றும் கடைசி தேதியை அதிகாரப்பூர்வ ஆதாரத்தில் சரிபார்க்கவும்.",datasetPaginated:"வெளிப்புற தரவுத்தொகுப்பு பக்கங்களாக ஏற்றப்படும். மேலே முக்கியச் சொல்லைத் தேடவும்.",docChecklistEmpty:"கோப்பைச் சேர்த்ததும் பட்டியல் இங்கே தோன்றும்.",documentUploadText:"PDF அல்லது படத்தைத் தேர்ந்தெடுக்கவும். அது இந்தச் சாதனத்தில் சேமிக்கப்பட்டு பட்டியலில் சேர்க்கப்படும். கோப்புகள் பதிவேற்றப்படவோ தானாகவே தீம்பொருள் சோதனை செய்யப்படவோ மாட்டா.",draftHelp:"மதிப்பீட்டை இயக்கி, திட்டத்தைத் திறந்து, மதிப்பாய்வு செய்யக்கூடிய பதிவை உருவாக்க “வரைவைத் தயாரி” என்பதைத் தேர்ந்தெடுக்கவும்.",draftInfoDisclaimer:"இவை சுயவிவரத் தயாரிப்பு புலங்கள்; அதிகாரப்பூர்வ படிவத்துடன் சரிபார்க்கப்பட்ட இணைப்பு அல்ல. இணைக்கப்பட்ட அதிகாரப்பூர்வ ஆதாரத்தில் தற்போதைய புலங்களை உறுதிப்படுத்தவும்.",draftNotSubmitted:"சமர்ப்பிக்கப்படவில்லை",draftStatus:"தயாரிப்பு வரைவு",followupDate:"பரிந்துரைக்கப்பட்ட தேதி",followupMemory:"தொடர்புச் நினைவூட்டல்",footerIndependent:"சுயாதீன அரசு நல வழிகாட்டி",footerTrust:"ஆதார அடிப்படையில். குடிமக்கள் கட்டுப்பாட்டில்.",governmentWorkspace:"அரசு நலத் திட்டப் பணியிடம்",hideDraftFields:"தயார் செய்யப்பட்ட புலங்களை மறை",loading:"திறந்த தரவுப் பதிவுகள் ஏற்றப்படுகின்றன…",localLabel:"உள்ளூர்",manualSubmit:"நிரப்பப்பட்ட ஒவ்வொரு புலத்தையும் சரிபார்க்கவும். புல மாற்றங்களுக்கு போர்டல் ஸ்கிரிப்டுகள் பதிலளிக்கலாம்; தொடர்வதற்கு முன் பக்கத்தைச் சரிபார்க்கவும்.",maxFileSize:"அதிகபட்சம் 12 MB",mySchemeSearch:"அதிகாரப்பூர்வ myScheme-ஐத் தேடு",next50:"அடுத்த 50 தரவுப் பதிவுகளை ஏற்று",nextRecommendedActions:"அடுத்த பரிந்துரைக்கப்பட்ட செயல்கள்",noAadhaarNote:"இந்த முன்மாதிரியில் ஆதார் அல்லது வங்கி கணக்கு எண் தேவையில்லை.",noDocRefs:"ஆவணக் குறிப்புகள் இன்னும் இல்லை",officialChannel:"அதிகாரப்பூர்வ விண்ணப்பம் / சேவை வழி",openOfficial:"அதிகாரப்பூர்வ ஆதாரத்தைத் திற",publishedBenefit:"சாத்தியமான நன்மை · துறையிடம் சரிபார்க்கவும்",reminderPlural:"நினைவூட்டல்கள்",removeItem:"நீக்கு",responsibleUseText:"JanaSetu ஆரம்ப தகவல் மற்றும் செயல்முறை உதவியை வழங்குகிறது. இது சட்ட அல்லது அதிகாரப்பூர்வ முடிவுகளை வழங்காது, அடையாளத்தை உறுதிப்படுத்தாது, நன்மைகளை முடிவு செய்யாது அல்லது அரசின் சார்பில் செயல்படாது. அதிகாரப்பூர்வ ஆதாரத்தில் விவரங்களைச் சரிபார்க்கவும்.",reviewDraftFields:"தயார் செய்யப்பட்ட புலங்களை மதிப்பாய்வு செய்",ruleScreened:"விதி சரிபார்ப்பு · ஆதாரம் இணைக்கப்பட்டது",schemeAssistant:"குடிமக்கள் கட்டுப்பாட்டிலுள்ள உலாவி படிவ உதவியை நிறுவவும்",schemeRecords:"ஆவணக் குறிப்புகள்",screeningConditions:"சரிபார்ப்பு நிபந்தனைகள்",securityDocs:"பாதுகாப்புக்காக இந்த முன்மாதிரியில் ஆதார் படங்கள், வங்கி அறிக்கைகள் அல்லது முக்கிய அடையாள ஆவணங்களைச் சேர்க்க வேண்டாம். டெமோவுக்கு மாதிரி கோப்புகளைப் பயன்படுத்தவும்.",snapshotDate:"தரவுத்தொகுப்பு snapshot",sourceIndexed:"ஆதாரம் பட்டியலிடப்பட்டது · விதிகளைச் சரிபார்க்கவும்",toolSteps:"கருவி படிகள்",upcoming:"வரவிருக்கும் செயல்கள்",verifyRules:"ஆதாரம் இணைக்கப்பட்டது · தற்போதைய விதிகளைச் சரிபார்க்கவும்",complete:"முழுமை",noAadhaarRequest:"இங்கு ஆதார், வங்கி கணக்கு அல்லது ஆவண எண் கேட்கப்படவில்லை.",noticeStorageRecovered:"சில சேமிக்கப்பட்ட உலாவித் தரவைப் படிக்க முடியவில்லை. புதிய சுயவிவரத்துடன் தொடரலாம்.",noticeBackupExported:"காப்புப்பிரதி இந்தச் சாதனத்திற்கு ஏற்றுமதி செய்யப்பட்டது. தனிப்பட்ட தரவாகக் கருதவும்.",noticeBackupRestored:"இந்த உலாவியில் காப்புப்பிரதி மீட்டமைக்கப்பட்டது. பயன்படுத்தும் முன் விவரங்களைச் சரிபார்க்கவும்.",noticeBackupRestoreFailed:"காப்புப்பிரதியை மீட்டமைக்க முடியவில்லை.",noticeDescribeBefore:"தொடர்வதற்கு முன் உங்கள் நிலையை ஒரு வாக்கியத்தில் விவரிக்கவும்.",noticeIntakeFacts:"தகவல்கள் பிரித்தெடுக்கப்பட்டன. சேமிப்பதற்கு முன் சரிபார்க்கவும்.",noticeIntakeEmpty:"ஆதரிக்கப்படும் சுயவிவரத் தகவல் கிடைக்கவில்லை. தெளிவாக விவரிக்கவும்.",noticeIntakeFailed:"விவரத்தைச் செயலாக்க முடியவில்லை.",noticeSelectState:"மதிப்பீட்டுக்கு முன் மாநிலம் அல்லது யூனியன் பிரதேசத்தைத் தேர்ந்தெடுக்கவும்.",noticeAssessmentDone:"மதிப்பீடு உள்ளூரில் முடிந்தது. ஆதாரம் மற்றும் அதிகாரப்பூர்வ மூலங்களைச் சரிபார்க்கவும்.",noticeAssessmentFailed:"மதிப்பீட்டை முடிக்க முடியவில்லை.",noticeDraftPrepared:"வரைவு இந்த உலாவியில் மட்டும் சேமிக்கப்பட்டது. சமர்ப்பிக்கப்படவில்லை.",noticeDraftFailed:"வரைவைத் தயாரிக்க முடியவில்லை.",noticeReminderSaved:"நினைவூட்டல் இந்த உலாவியில் மட்டும் சேமிக்கப்பட்டது.",noticeFileTooLarge:"12 MB-க்கு குறைவான கோப்பைத் தேர்ந்தெடுக்கவும்.",noticeFileAdded:"கோப்பு இந்த உலாவியில் மட்டும் சேமிக்கப்பட்டது. தீம்பொருள் சோதனை செய்யப்படவில்லை.",searchFallback:"வெளியீட்டாளரின் தேடல் சேவை கிடைக்கவில்லை. JanaSetu அதற்குப் பதிலாக முழு உள்ளூர் தரவுக் குறியீட்டில் தேடுகிறது; முடிவுகள் தகவல் கண்டறிதலுக்கானவை மட்டுமே, தரவு பழையதாக இருக்கலாம்.",catalogueApiUnavailable:"திறந்த தரவுத்தொகுப்பை இப்போது ஏற்ற முடியவில்லை. அதிகாரப்பூர்வ myScheme இணைப்பைப் பயன்படுத்தவும்.",assessedRecords:"தொடர்புடைய திட்டப் பதிவுகள் மதிப்பிடப்பட்டன",displayed:"காட்டப்பட்டது",openDataRows:"திறந்த தரவு வரிசைகள்",ruleScreenedCount:"விதி முன்மாதிரிகள் · சுயாதீன மதிப்பாய்வு நிலுவையில்",schemeApprovalPending:"திட்ட மூலத்தின் ஒப்புதல் நிலுவையில் உள்ளது",schemeUnavailable:"திட்டம் தற்போதைய பட்டியலில் இல்லை",officialVerificationRequired:"அதிகாரப்பூர்வ தகுதி சரிபார்ப்பு தேவை",requireReview:"மதிப்பாய்வு தேவை",ruleScreenedStatus:"விதி முன்மாதிரி · சுயாதீன மதிப்பாய்வு நிலுவையில்",sourceIndexedStatus:"மூலம் குறியிடப்பட்டது · விதிகளைச் சரிபார்க்கவும்",ruleScreenedMetric:"விதி முன்மாதிரிகள்",remainderRequireVerification:"சுயாதீன மதிப்பாய்வு நிலுவையில்",commonServiceCentres:"பொது சேவை மையங்கள்",openCitizenProfile:"குடிமகன் சுயவிவரத்தைத் திற",runBenefitsAssessment:"நலத்திட்ட மதிப்பீட்டை இயக்கு",openApplicationWorkspace:"விண்ணப்பப் பணியிடத்தைத் திற",working:"செயல்படுகிறது…",fileTypes:"PDF, JPG, PNG",addedLabel:"சேர்க்கப்பட்டது",removeDocumentReference:"ஆவணக் குறிப்பை நீக்கு",draftFieldNote:"இவை சுயவிவரத் தயாரிப்பு புலங்கள்; அதிகாரப்பூர்வ துறைப் படிவத்துடன் சரிபார்க்கப்பட்ட பொருத்தம் அல்ல. இணைக்கப்பட்ட அதிகாரப்பூர்வ மூலத்தில் தற்போதைய புலங்களையும் மதிப்புகளையும் சரிபார்க்கவும்.",draftNotSubmittedDisclaimer:"இது JanaSetu தயாரித்த விண்ணப்ப வரைவு. அரசு தளத்தில் சமர்ப்பிக்கப்படவில்லை.",manualVerificationPending:"சேர்க்கப்பட்டது — கைமுறை சரிபார்ப்பு நிலுவையில்",incomeExample:"எ.கா. 150000",sourcePeriodLabel:"மூல காலம்",categoryAgriculture:"வேளாண்மை",categoryHousing:"வீட்டுவசதி",categoryEducation:"கல்வி",categoryEmployment:"வேலைவாய்ப்பு",categoryEnergy:"ஆற்றல்",categoryEnergyHousehold:"ஆற்றல் மற்றும் குடும்பப் பயன்பாடு",categoryFoodSecurity:"உணவுப் பாதுகாப்பு",categoryHealth:"சுகாதாரம்",categoryInsurance:"காப்பீடு",categoryKarnatakaBudget:"கர்நாடக பட்ஜெட் குறிப்பு",categoryScholarship:"உதவித்தொகை",categorySkills:"திறன்கள்",categoryTransport:"போக்குவரத்து",categoryWomenChild:"பெண்கள் மற்றும் குழந்தைகள்",sourceLanguageNotice:"திட்டப் பெயர்கள் மற்றும் மூலப் பதிவுகள் ஆங்கிலம் அல்லது அசல் மொழியில் இருக்கலாம். UI மொழிபெயர்ப்புகள் உதவிக்காக; அதிகாரப்பூர்வ மூலத்தில் விதிகளைச் சரிபார்க்கவும்.",hideDetails:"விவரங்களை மறை",viewDetails:"விவரங்களைப் பார்",accessedLabel:"பார்த்த தேதி",approvalNextAction:"மூலமும் விதிகளும் இரண்டு சுயாதீன ஒப்புதல்களைப் பெறும் வரை காத்திருக்கவும்.",officialVerifyNextAction:"தற்போதைய நிபந்தனைகளை அதிகாரப்பூர்வ துறையிடம் சரிபார்க்கவும்.",essentialProfileFieldsProvided:"7 முக்கிய சுயவிவரப் புலங்களில் {provided} வழங்கப்பட்டுள்ளன",createdLabel:"உருவாக்கப்பட்டது",citizenReviewRecorded:"குடிமகன் மதிப்பாய்வு பதிவு செய்யப்பட்டது",savedDrafts:"வரைவுகள் சேமிக்கப்பட்டன",unknownFileType:"தெரியாத கோப்பு வகை",prepareLocalChecklist:"உள்ளூர் சரிபார்ப்புப் பட்டியலைத் தயாரி",localPrepOnly:"உள்ளூர் தயாரிப்பு மட்டும் — இது விண்ணப்பப் பதிவு அல்ல.",pendingDraftDisclaimer:"இது தயாரிப்பு பதிவு மட்டுமே — தகுதி முடிவோ சமர்ப்பிக்கப்பட்ட விண்ணப்பமோ அல்ல."},
  te: {localStatus:"స్థానిక-ప్రథమ నమూనా",clearerWay:"తదుపరి దారి స్పష్టంగా",evidenceLinked:"ఆధారం జతచేయబడింది",nextActionReady:"తదుపరి చర్య సిద్ధం",intakeSafety:"వచనం నుంచి తీసిన సమాచారం సూచన మాత్రమే. సేవ్ చేసే ముందు ప్రతి ఫీల్డ్‌ను తనిఖీ చేయండి.",extractFacts:"ప్రొఫైల్ వివరాలను తీసుకోండి",suggestedFields:"సూచించిన ఫీల్డ్‌లు",reviewProfile:"నా ప్రొఫైల్‌లో తనిఖీ చేసి సరిచేయండి.",shareCircumstances:"మీ రాష్ట్రం/UT, కుటుంబం మరియు సంబంధిత పరిస్థితులను పంచుకోండి.",reviewRules:"సరిపోలే నియమాలు, తెలియని సమాధానాలు మరియు అధికారిక మూలాలను పరిశీలించండి.",keepDraft:"చెక్‌లిస్ట్ రూపొందించి డ్రాఫ్ట్‌ను ఉంచండి.",screeningExplanation:"ప్రతి ఫలితం నియమం, ఉపయోగించిన ప్రొఫైల్ ఆధారం మరియు చర్యకు ముందు తనిఖీ చేయాల్సిన అధికారిక మూలాన్ని చూపుతుంది.",unknownStaysUnknown:"తెలియనిది తెలియనిగానే ఉంటుంది",sourceLinkedRules:"మూలంతో అనుసంధానించిన నియమాలు",humanApprovalBeforeAction:"చర్యకు ముందు మానవ ఆమోదం",incomeHint:"సుమారు వార్షిక మొత్తాన్ని నమోదు చేయండి.",profileMoreComplete:"పూర్తి సమాధానాలు తెలియని పరిస్థితులను తగ్గిస్తాయి. ఖాళీ ఫీల్డ్‌లను తర్వాత పూరించవచ్చు.",privacyProfileText:"మీ ప్రొఫైల్, అంచనా, డ్రాఫ్ట్‌లు, రిమైండర్‌లు ఈ బ్రౌజర్‌లోనే ఉంటాయి. డెమో నియమ పరిశీలన, వచన విశ్లేషణ స్థానికంగానే జరుగుతాయి. ఎగుమతి చేసిన వాల్ట్ పాస్‌వర్డ్‌తో ఎన్‌క్రిప్ట్ అవుతుంది; బ్రౌజర్ నిల్వ యాప్-స్థాయిలో ఎన్‌క్రిప్ట్ చేయబడదు. ప్రభుత్వ పోర్టల్‌కు మీరు స్వయంగా నింపి లేదా సమర్పించినప్పుడే సమాచారం వెళ్తుంది.",assessmentHeading:"సంభావ్య మార్గాలను కనుగొని డ్రాఫ్ట్‌కు ముందు నియమ ఆధారాన్ని పరిశీలించండి.",assessmentReady:"అంచనా ప్రారంభించడానికి సిద్ధంగా ఉంది",assessedWorkflow:"ఈ ప్రక్రియ మీ సేవ్ చేసిన ప్రొఫైల్, ప్రస్తుత కేటలాగ్‌ను ఉపయోగించింది.",completeProfileFirst:"ముందుగా ప్రొఫైల్ పూర్తి చేయండి. ఆపై వర్తించే నియమ మార్గాలు ఎంపికవుతాయి.",editProfile:"ప్రొఫైల్ సవరించండి",openSchemeList:"పూర్తి కేంద్ర + రాష్ట్ర/UT ప్రభుత్వ పథకాల జాబితా కావాలా?",category:"వర్గం",allCategories:"అన్ని వర్గాలు",noSchemes:"పథక రికార్డులు కనబడలేదు",tryKeyword:"మరొక పదం లేదా వర్గం ప్రయత్నించండి.",clearFilters:"ఫిల్టర్‌లను తొలగించండి",loadingDataset:"ఓపెన్ డేటా రికార్డులు లోడ్ అవుతున్నాయి…",loadNext:"తదుపరి 50 డేటాసెట్ రికార్డులు లోడ్ చేయండి",notPersonalized:"నాలుగు నిర్ణీత నియమ నమూనాలు స్వతంత్ర సమీక్ష కోసం వేచి ఉన్నాయి; అవి అర్హత నిర్ణయాలు కావు. బాహ్య డేటాసెట్ రికార్డులు శోధన కోసం మాత్రమే.",evidenceOrganizer:"ఆధారాల నిర్వాహకం",metadataOnly:"మెటాడేటా మాత్రమే",addDocumentReference:"పత్ర సూచనను జోడించండి",chooseFile:"ఫైల్ ఎంచుకోండి",max12MB:"గరిష్ఠం 12 MB",yourRecords:"మీ రికార్డులు",noDocumentRefs:"ఇంకా పత్ర సూచనలు లేవు",checklistAppears:"ఫైల్ జోడించినప్పుడు మీ చెక్‌లిస్ట్ ఇక్కడ కనిపిస్తుంది.",applicationLifecycle:"దరఖాస్తు ప్రక్రియ",noDrafts:"ఇంకా దరఖాస్తు డ్రాఫ్ట్‌లు లేవు",createDraftHelp:"అంచనా నడిపి, పథకాన్ని తెరిచి, సమీక్షించగల రికార్డు కోసం “డ్రాఫ్ట్ సిద్ధం” ఎంచుకోండి.",findBenefits:"ప్రయోజనాలను కనుగొనండి",preparationDraft:"తయారీ డ్రాఫ్ట్",notSubmitted:"సమర్పించలేదు",applicant:"దరఖాస్తుదారు",location:"స్థానం",openChecks:"పెండింగ్ తనిఖీలు",hidePreparedFields:"సిద్ధం చేసిన ఫీల్డ్‌లను దాచండి",reviewPreparedFields:"సిద్ధం చేసిన ఫీల్డ్‌లను సమీక్షించండి",markReviewed:"సమీక్షించబడినట్లు గుర్తించండి",notProvided:"అందించలేదు",provided:"అందించారు",needsInformation:"సమాచారం అవసరం",openOfficialSource:"అధికారిక మూలాన్ని తెరవండి",addFollowup:"ఫాలో-అప్ జోడించండి",remove:"తొలగించండి",upcomingActions:"రాబోయే చర్యలు",reminders:"రిమైండర్లు",suggestedDate:"సూచించిన తేదీ",done:"పూర్తయింది",ourApproach:"మా విధానం",aboutTitle:"స్పష్టత, ఆధారం మరియు పౌర నియంత్రణ.",aboutDescription:"JanaSetu స్వతంత్ర ప్రభుత్వ ప్రయోజనాల మార్గదర్శక నమూనా. ఇది అధికారిక పోర్టల్‌లకు తోడ్పాటు మాత్రమే; ప్రత్యామ్నాయం కాదు.",discoverTitle:"కనుగొనండి",explainTitle:"వివరించండి",prepareTitle:"సిద్ధం చేయండి",rememberTitle:"గుర్తుంచుకోండి",dataTransparency:"డేటా పారదర్శకత",currentCatalogue:"ప్రస్తుత కేటలాగ్‌లో ఏముంది?",coverageHonesty:"కవరేజ్ స్పష్టత",responsibleBoundary:"బాధ్యతాయుత వినియోగ పరిమితి",officialSource:"అధికారిక మూలం",cscLocator:"CSC లొకేటర్",footerText:"స్వతంత్ర ప్రభుత్వ ప్రయోజన మార్గదర్శకం",evidenceLed:"ఆధార ఆధారితం. పౌర నియంత్రణలో.",closeNav:"నావిగేషన్ మూసివేయండి",openNav:"నావిగేషన్ తెరవండి",openProfile:"ప్రొఫైల్ తెరవండి",dismiss:"నోటీసును తొలగించండి",backupTitle:"ఎన్‌క్రిప్ట్ చేసిన JanaSetu వాల్ట్‌ను ఎగుమతి చేయండి",restoreTitle:"ఎన్‌క్రిప్ట్ చేసిన JanaSetu వాల్ట్‌ను పునరుద్ధరించండి",cscHelp:"మీ చెక్‌లిస్ట్‌ను అధీకృత CSC లేదా శాఖకు తీసుకెళ్లండి.",findCSC:"CSC కనుగొనండి",privacyLink:"గోప్యత",termsLink:"నిబంధనలు",aboutDiscoverText:"అధికారిక పథకాల ఎంపిక చేసిన జాబితా నుంచి సంబంధిత మార్గాలను ఎంచుకోవడానికి ఒకే పౌర ప్రొఫైల్ ఉపయోగించండి.",aboutExplainText:"ప్రతి పరిశీలనలో నియమం, ఉపయోగించిన ప్రొఫైల్ ఫీల్డ్ మరియు ఆధార స్థితి చూపబడుతుంది.",aboutPrepareText:"సమీక్ష కోసం స్థానిక డ్రాఫ్ట్, పత్ర చెక్‌లిస్ట్ రూపొందించండి. నమూనా ప్రభుత్వ పోర్టల్‌కు సమర్పించదు.",aboutRememberText:"పౌరుడు తర్వాత కొనసాగించేందుకు డ్రాఫ్ట్‌లు, రిమైండర్‌లను ఈ బ్రౌజర్‌లో ఉంచండి.",addReminder:"ఫాలో-అప్ జోడించండి",agentTrace:"ఈ నమూనా నిర్ణీత సర్వర్ టూల్స్, నియమ-ఆధారిత ప్లానర్‌ను ఉపయోగిస్తుంది; బాహ్య LLM లేదా ప్రభుత్వ APIని పిలవదు.",assessmentEvidence:"అంచనా ఆధారం",builtIn:"అంతర్నిర్మిత రికార్డులు",catalogueHeading:"ప్రస్తుత కేటలాగ్‌లో ఏముంది?",catalogueOnly:"కేటలాగ్ నమోదు మాత్రమే — ఈ పథకానికి JanaSetu అర్హతను ఆటోమేటిక్‌గా నిర్ణయించలేదు. శాఖతో నిబంధనలు ధృవీకరించండి.",budgetReferenceOnly:"బడ్జెట్ అంశం మాత్రమే — ఇది ప్రభుత్వ బడ్జెట్ కేటాయింపు శీర్షిక; పౌరులకు అందే పథకంగా ఇంకా ధృవీకరించలేదు. వ్యక్తిగత ప్రయోజనం లేదా దరఖాస్తు మార్గాన్ని ఊహించలేదు.",citizenReviewed:"పౌర సమీక్ష నమోదు చేయబడింది",coverageText:"JanaSetu మూల-లింక్ రికార్డులు మరియు బాహ్య డేటాసెట్‌ను కలిగి ఉంది. పూర్తి స్వతంత్రంగా ధృవీకరించిన కేంద్ర లేదా రాష్ట్ర/UT పథకాల కవరేజ్ ఇంకా లేదు. ప్రస్తుత నియమాలు, దరఖాస్తు మార్గాలను అధికారిక శాఖతో ధృవీకరించండి.",coverageTitle:"కవరేజ్ స్పష్టత",datasetAttribution:"ఓపెన్ డేటాసెట్ గుర్తింపు",datasetMachineParsed:"అర్హత సమాచారం యంత్రం ద్వారా తీసుకున్నది; నిర్ణయానికి ఉపయోగించరు. శోధన మొత్తం స్థానిక సూచికలో జరుగుతుంది. ప్రతి పథకం, దరఖాస్తు మార్గాన్ని అధికారిక మూలంలో ధృవీకరించండి.",datasetFreshnessWarning:"ప్రచురణకర్త స్నాప్‌షాట్ 90 రోజులకు మించిన పాతది. ఇది ప్రస్తుత స్థితి ఫీడ్ కాదు; పథకం స్థితి, గడువులను అధికారిక మూలంలో ధృవీకరించండి.",datasetPaginated:"బాహ్య డేటాసెట్ పేజీలుగా లోడ్ అవుతుంది. పై కీవర్డ్‌తో శోధించండి.",docChecklistEmpty:"ఫైల్ జోడించినప్పుడు మీ చెక్‌లిస్ట్ ఇక్కడ కనిపిస్తుంది.",documentUploadText:"PDF లేదా చిత్రాన్ని ఎంచుకోండి. అది ఈ పరికరంలో నిల్వై చెక్‌లిస్ట్‌కు జోడించబడుతుంది. ఫైళ్లు అప్‌లోడ్ చేయబడవు లేదా ఆటోమేటిక్‌గా మాల్వేర్ స్కాన్ చేయబడవు.",draftHelp:"అంచనా నడిపి, పథకాన్ని తెరిచి, సమీక్షించగల రికార్డు కోసం “డ్రాఫ్ట్ సిద్ధం” ఎంచుకోండి.",draftInfoDisclaimer:"ఇవి ప్రొఫైల్ సిద్ధత ఫీల్డ్‌లు మాత్రమే; అధికారిక శాఖ ఫారమ్‌తో ధృవీకరించిన మ్యాపింగ్ కాదు. లింక్ చేసిన అధికారిక మూలంలో ప్రస్తుత ఫీల్డ్‌లను నిర్ధారించండి.",draftNotSubmitted:"సమర్పించలేదు",draftStatus:"తయారీ డ్రాఫ్ట్",followupDate:"సూచించిన తేదీ",followupMemory:"ఫాలో-అప్ గుర్తు",footerIndependent:"స్వతంత్ర ప్రభుత్వ ప్రయోజన మార్గదర్శకం",footerTrust:"ఆధార ఆధారితం. పౌర నియంత్రణలో.",governmentWorkspace:"ప్రభుత్వ ప్రయోజనాల కార్యస్థలం",hideDraftFields:"సిద్ధం చేసిన ఫీల్డ్‌లను దాచండి",loading:"ఓపెన్ డేటా రికార్డులు లోడ్ అవుతున్నాయి…",localLabel:"స్థానికం",manualSubmit:"నింపిన ప్రతి ఫీల్డ్‌ను పరిశీలించండి. ఫీల్డ్ మార్పులకు పోర్టల్ స్క్రిప్ట్‌లు స్పందించవచ్చు; కొనసాగించే ముందు పేజీని తనిఖీ చేయండి.",maxFileSize:"గరిష్ఠం 12 MB",mySchemeSearch:"అధికారిక myScheme శోధించండి",next50:"తదుపరి 50 డేటాసెట్ రికార్డులు లోడ్ చేయండి",nextRecommendedActions:"తదుపరి సూచించిన చర్యలు",noAadhaarNote:"ఈ నమూనాలో ఆధార్ లేదా బ్యాంక్ ఖాతా సంఖ్య అవసరం లేదు.",noDocRefs:"ఇంకా పత్ర సూచనలు లేవు",officialChannel:"అధికారిక దరఖాస్తు / సేవా మార్గం",openOfficial:"అధికారిక మూలాన్ని తెరవండి",publishedBenefit:"సంభావ్య ప్రయోజనం · శాఖతో నిర్ధారించండి",reminderPlural:"రిమైండర్లు",removeItem:"తొలగించండి",responsibleUseText:"JanaSetu ప్రాథమిక సమాచారం, ప్రక్రియ సహాయం అందిస్తుంది. ఇది చట్టపరమైన లేదా అధికారిక నిర్ణయాలు ఇవ్వదు, గుర్తింపును ధృవీకరించదు, ప్రయోజనాలను ఆమోదించదు లేదా ప్రభుత్వ తరఫున పనిచేయదు. అధికారిక మూలంలో వివరాలను ధృవీకరించండి.",reviewDraftFields:"సిద్ధం చేసిన ఫీల్డ్‌లను సమీక్షించండి",ruleScreened:"నియమ పరిశీలన · మూలం జతచేయబడింది",schemeAssistant:"పౌర నియంత్రిత బ్రౌజర్ ఫారమ్ సహాయకాన్ని ఇన్‌స్టాల్ చేయండి",schemeRecords:"పత్ర సూచనలు",screeningConditions:"పరిశీలన నిబంధనలు",securityDocs:"భద్రత కోసం ఈ నమూనాలో ఆధార్ చిత్రాలు, బ్యాంక్ స్టేట్‌మెంట్‌లు లేదా సున్నితమైన గుర్తింపు పత్రాలను జోడించవద్దు. డెమో కోసం నమూనా ఫైళ్లను ఉపయోగించండి.",snapshotDate:"డేటాసెట్ స్నాప్‌షాట్",sourceIndexed:"మూలం సూచించబడింది · నియమాలను ధృవీకరించండి",toolSteps:"టూల్ దశలు",upcoming:"రాబోయే చర్యలు",verifyRules:"మూలం జతచేయబడింది · ప్రస్తుత నియమాలను తనిఖీ చేయండి",complete:"పూర్తి",noAadhaarRequest:"ఇక్కడ ఆధార్, బ్యాంక్ ఖాతా లేదా పత్ర సంఖ్య అడగరు.",noticeStorageRecovered:"కొన్ని సేవ్ చేసిన బ్రౌజర్ డేటాను చదవలేకపోయాం. కొత్త ప్రొఫైల్‌తో కొనసాగవచ్చు.",noticeBackupExported:"బ్యాకప్ ఈ పరికరానికి ఎగుమతి చేయబడింది. దీన్ని వ్యక్తిగత డేటాగా పరిగణించండి.",noticeBackupRestored:"బ్యాకప్ ఈ బ్రౌజర్‌లో పునరుద్ధరించబడింది. ఉపయోగించే ముందు వివరాలు పరిశీలించండి.",noticeBackupRestoreFailed:"బ్యాకప్‌ను పునరుద్ధరించలేకపోయాం.",noticeDescribeBefore:"కొనసాగించే ముందు మీ పరిస్థితిని ఒక వాక్యంలో వివరించండి.",noticeIntakeFacts:"వివరాలు తీసుకోబడ్డాయి. సేవ్ చేసే ముందు పరిశీలించండి.",noticeIntakeEmpty:"మద్దతు ఉన్న ప్రొఫైల్ వివరాలు కనబడలేదు. స్పష్టంగా వివరించండి.",noticeIntakeFailed:"వివరణను ప్రాసెస్ చేయలేకపోయాం.",noticeSelectState:"అంచనా ముందు రాష్ట్రం లేదా కేంద్రపాలిత ప్రాంతం ఎంచుకోండి.",noticeAssessmentDone:"అంచనా స్థానికంగా పూర్తయింది. ఆధారం, అధికారిక మూలాలు పరిశీలించండి.",noticeAssessmentFailed:"అంచనాను పూర్తి చేయలేకపోయాం.",noticeDraftPrepared:"డ్రాఫ్ట్ ఈ బ్రౌజర్‌లో మాత్రమే సేవ్ చేయబడింది. సమర్పించలేదు.",noticeDraftFailed:"డ్రాఫ్ట్ సిద్ధం చేయలేకపోయాం.",noticeReminderSaved:"రిమైండర్ ఈ బ్రౌజర్‌లో మాత్రమే సేవ్ చేయబడింది.",noticeFileTooLarge:"12 MB కంటే చిన్న ఫైల్ ఎంచుకోండి.",noticeFileAdded:"ఫైల్ ఈ బ్రౌజర్‌లో మాత్రమే సేవ్ చేయబడింది. మాల్వేర్ స్కాన్ చేయబడలేదు.",searchFallback:"ప్రచురణకర్త శోధన సేవ అందుబాటులో లేదు. JanaSetu బదులుగా పూర్తి స్థానిక సూచిక స్నాప్‌షాట్‌లో శోధిస్తోంది; ఫలితాలు సమాచారం కనుగొనడానికి మాత్రమే, డేటా పాతదై ఉండవచ్చు.",catalogueApiUnavailable:"ఓపెన్ డేటాసెట్‌ను ఇప్పుడు లోడ్ చేయలేకపోయాం. అధికారిక myScheme లింక్‌ను ఉపయోగించండి.",assessedRecords:"సంబంధిత పథక రికార్డులు అంచనా వేయబడ్డాయి",displayed:"చూపబడినవి",openDataRows:"ఓపెన్ డేటా వరుసలు",ruleScreenedCount:"నియమ నమూనాలు · స్వతంత్ర సమీక్ష పెండింగ్",schemeApprovalPending:"పథకం మూల ఆమోదం పెండింగ్‌లో ఉంది",schemeUnavailable:"పథకం ప్రస్తుత జాబితాలో లేదు",officialVerificationRequired:"అధికారిక అర్హత ధృవీకరణ అవసరం",requireReview:"సమీక్ష అవసరం",ruleScreenedStatus:"నియమ నమూనా · స్వతంత్ర సమీక్ష పెండింగ్",sourceIndexedStatus:"మూలం సూచించబడింది · నియమాలను తనిఖీ చేయండి",ruleScreenedMetric:"నియమ నమూనాలు",remainderRequireVerification:"స్వతంత్ర సమీక్ష పెండింగ్",commonServiceCentres:"సామాన్య సేవా కేంద్రాలు",openCitizenProfile:"పౌర ప్రొఫైల్ తెరవండి",runBenefitsAssessment:"ప్రయోజనాల అంచనా నడపండి",openApplicationWorkspace:"దరఖాస్తు కార్యస్థలం తెరవండి",working:"పని జరుగుతోంది…",fileTypes:"PDF, JPG, PNG",addedLabel:"జోడించబడింది",removeDocumentReference:"పత్ర సూచనను తొలగించండి",draftFieldNote:"ఇవి ప్రొఫైల్ సిద్ధం చేసే ఫీల్డ్‌లు మాత్రమే; అధికారిక శాఖ ఫారమ్‌తో ధృవీకరించిన మ్యాపింగ్ కాదు. లింక్ చేసిన అధికారిక మూలంలో ప్రస్తుత ఫీల్డ్‌లు, విలువలను తనిఖీ చేయండి.",draftNotSubmittedDisclaimer:"ఇది JanaSetu రూపొందించిన దరఖాస్తు ముసాయిదా. ప్రభుత్వ పోర్టల్‌కు సమర్పించబడలేదు.",manualVerificationPending:"జోడించబడింది — మాన్యువల్ ధృవీకరణ పెండింగ్",incomeExample:"ఉదా. 150000",sourcePeriodLabel:"మూల కాలం",categoryAgriculture:"వ్యవసాయం",categoryHousing:"గృహవసతి",categoryEducation:"విద్య",categoryEmployment:"ఉద్యోగం",categoryEnergy:"శక్తి",categoryEnergyHousehold:"శక్తి మరియు గృహ వినియోగం",categoryFoodSecurity:"ఆహార భద్రత",categoryHealth:"ఆరోగ్యం",categoryInsurance:"బీమా",categoryKarnatakaBudget:"కర్ణాటక బడ్జెట్ సూచన",categoryScholarship:"విద్యార్థి వేతనం",categorySkills:"నైపుణ్యాలు",categoryTransport:"రవాణా",categoryWomenChild:"మహిళలు మరియు పిల్లలు",sourceLanguageNotice:"పథకం పేర్లు, మూల రికార్డులు ఇంగ్లీష్ లేదా అసలు భాషలో ఉండవచ్చు. UI అనువాదాలు సౌలభ్యం కోసం; అధికారిక మూలంలో నియమాలను తనిఖీ చేయండి.",hideDetails:"వివరాలు దాచండి",viewDetails:"వివరాలు చూడండి",accessedLabel:"చూసిన తేదీ",approvalNextAction:"మూలం, నియమాలకు రెండు స్వతంత్ర ఆమోదాలు వచ్చే వరకు వేచి ఉండండి.",officialVerifyNextAction:"ప్రస్తుత నిబంధనలను అధికారిక శాఖతో ధృవీకరించండి.",essentialProfileFieldsProvided:"7 ముఖ్యమైన ప్రొఫైల్ ఫీల్డ్‌లలో {provided} అందించబడ్డాయి",createdLabel:"సృష్టించబడింది",citizenReviewRecorded:"పౌర సమీక్ష నమోదు చేయబడింది",savedDrafts:"డ్రాఫ్ట్‌లు సేవ్ చేయబడ్డాయి",unknownFileType:"తెలియని ఫైల్ రకం",prepareLocalChecklist:"స్థానిక చెక్‌లిస్ట్ సిద్ధం చేయండి",localPrepOnly:"స్థానిక సిద్ధత మాత్రమే — ఇది దరఖాస్తు రికార్డు కాదు.",pendingDraftDisclaimer:"ఇది సిద్ధత రికార్డు మాత్రమే — అర్హత నిర్ణయం లేదా సమర్పించిన దరఖాస్తు కాదు."},
  ml: {localStatus:"ലോക്കൽ-ഫസ്റ്റ് പ്രോട്ടോടൈപ്പ്",clearerWay:"അടുത്ത ഘട്ടം വ്യക്തം",evidenceLinked:"തെളിവ് ചേർത്തു",nextActionReady:"അടുത്ത നടപടി തയ്യാറാണ്",intakeSafety:"ടെക്സ്റ്റിൽ നിന്ന് ലഭിക്കുന്ന വിവരങ്ങൾ നിർദ്ദേശം മാത്രമാണ്. സംരക്ഷിക്കുന്നതിന് മുമ്പ് ഓരോ ഫീൽഡും പരിശോധിക്കുക.",extractFacts:"പ്രൊഫൈൽ വിവരങ്ങൾ എടുക്കുക",suggestedFields:"നിർദ്ദേശിച്ച ഫീൽഡുകൾ",reviewProfile:"എന്റെ പ്രൊഫൈലിൽ പരിശോധിച്ച് തിരുത്തുക.",shareCircumstances:"നിങ്ങളുടെ സംസ്ഥാനം/UT, കുടുംബം, ബന്ധപ്പെട്ട സാഹചര്യങ്ങൾ പങ്കിടുക.",reviewRules:"പൊരുത്തപ്പെടുന്ന നിയമങ്ങൾ, അറിയാത്ത ഉത്തരങ്ങൾ, ഔദ്യോഗിക ഉറവിടങ്ങൾ പരിശോധിക്കുക.",keepDraft:"ചെക്ക്‌ലിസ്റ്റ് തയ്യാറാക്കി ഡ്രാഫ്റ്റ് സൂക്ഷിക്കുക.",screeningExplanation:"ഓരോ ഫലവും നിയമം, ഉപയോഗിച്ച പ്രൊഫൈൽ തെളിവ്, പരിശോധിക്കേണ്ട ഔദ്യോഗിക ഉറവിടം എന്നിവ കാണിക്കുന്നു.",unknownStaysUnknown:"അറിയാത്തത് അറിയാത്തതായിരിക്കും",sourceLinkedRules:"ഉറവിടം ചേർത്ത നിയമങ്ങൾ",humanApprovalBeforeAction:"നടപടിക്ക് മുമ്പ് മനുഷ്യ അംഗീകാരം",incomeHint:"ഏകദേശ വാർഷിക തുക നൽകുക.",profileMoreComplete:"കൂടുതൽ പൂർണ്ണമായ ഉത്തരങ്ങൾ അറിയാത്ത വ്യവസ്ഥകൾ കുറയ്ക്കും. ഒഴിവാക്കിയ ഫീൽഡുകൾ പിന്നീട് പൂരിപ്പിക്കാം.",privacyProfileText:"നിങ്ങളുടെ പ്രൊഫൈൽ, വിലയിരുത്തൽ, ഡ്രാഫ്റ്റുകൾ, ഓർമ്മപ്പെടുത്തലുകൾ ഈ ബ്രൗസറിൽ തന്നെ സൂക്ഷിക്കുന്നു. ഡെമോ നിയമ പരിശോധനയും ടെക്സ്റ്റ് വിശകലനവും പ്രാദേശികമായി നടക്കുന്നു. എക്സ്പോർട്ട് ചെയ്യുന്ന വാൾട്ട് പാസ്‌വേഡ് ഉപയോഗിച്ച് എൻക്രിപ്റ്റ് ചെയ്യും; ബ്രൗസർ സ്റ്റോറേജ് ആപ്പ്-തലത്തിൽ എൻക്രിപ്റ്റ് ചെയ്തിട്ടില്ല. സർക്കാർ പോർട്ടലിലേക്ക് നിങ്ങൾ സ്വയം പൂരിപ്പിക്കുകയോ സമർപ്പിക്കുകയോ ചെയ്താൽ മാത്രമേ വിവരങ്ങൾ പോകൂ.",assessmentHeading:"സാധ്യമായ മാർഗങ്ങൾ കണ്ടെത്തി ഡ്രാഫ്റ്റിന് മുമ്പ് നിയമ തെളിവുകൾ പരിശോധിക്കുക.",assessmentReady:"വിലയിരുത്തൽ ആരംഭിക്കാൻ തയ്യാറാണ്",assessedWorkflow:"ഈ പ്രവൃത്തി നിങ്ങളുടെ സംരക്ഷിച്ച പ്രൊഫൈലും നിലവിലെ പട്ടികയും ഉപയോഗിച്ചു.",completeProfileFirst:"ആദ്യം പ്രൊഫൈൽ പൂർത്തിയാക്കുക. തുടർന്ന് ബാധകമായ നിയമങ്ങൾ തിരഞ്ഞെടുക്കാം.",editProfile:"പ്രൊഫൈൽ തിരുത്തുക",openSchemeList:"പൂർണ്ണ കേന്ദ്ര + സംസ്ഥാന/UT സർക്കാർ പദ്ധതികളുടെ പട്ടിക വേണോ?",category:"വിഭാഗം",allCategories:"എല്ലാ വിഭാഗങ്ങളും",noSchemes:"പദ്ധതി രേഖകൾ കണ്ടെത്തിയില്ല",tryKeyword:"മറ്റൊരു വാക്കോ വിഭാഗമോ ശ്രമിക്കുക.",clearFilters:"ഫിൽട്ടറുകൾ നീക്കുക",loadingDataset:"ഓപ്പൺ ഡാറ്റ രേഖകൾ ലോഡ് ചെയ്യുന്നു…",loadNext:"അടുത്ത 50 ഡാറ്റാസെറ്റ് രേഖകൾ ലോഡ് ചെയ്യുക",notPersonalized:"നാല് നിർണ്ണയിച്ച നിയമ പ്രോട്ടോടൈപ്പുകൾ സ്വതന്ത്ര അവലോകനത്തിനായി കാത്തിരിക്കുന്നു; അവ യോഗ്യതാ തീരുമാനങ്ങളല്ല. ബാഹ്യ ഡാറ്റാസെറ്റ് രേഖകൾ തിരച്ചിലിനായി മാത്രമാണ്.",evidenceOrganizer:"തെളിവ് ക്രമീകരണം",metadataOnly:"മെറ്റാഡാറ്റ മാത്രം",addDocumentReference:"രേഖാ പരാമർശം ചേർക്കുക",chooseFile:"ഫയൽ തിരഞ്ഞെടുക്കുക",max12MB:"പരമാവധി 12 MB",yourRecords:"നിങ്ങളുടെ രേഖകൾ",noDocumentRefs:"രേഖാ പരാമർശങ്ങളൊന്നുമില്ല",checklistAppears:"ഫയൽ ചേർത്താൽ പട്ടിക ഇവിടെ കാണാം.",applicationLifecycle:"അപേക്ഷാ പ്രക്രിയ",noDrafts:"അപേക്ഷാ ഡ്രാഫ്റ്റുകളൊന്നുമില്ല",createDraftHelp:"വിലയിരുത്തൽ നടത്തി, പദ്ധതി തുറന്ന്, പരിശോധിക്കാവുന്ന രേഖ സൃഷ്ടിക്കാൻ “ഡ്രാഫ്റ്റ് തയ്യാറാക്കുക” തിരഞ്ഞെടുക്കുക.",findBenefits:"ആനുകൂല്യങ്ങൾ കണ്ടെത്തുക",preparationDraft:"തയ്യാറെടുപ്പ് ഡ്രാഫ്റ്റ്",notSubmitted:"സമർപ്പിച്ചിട്ടില്ല",applicant:"അപേക്ഷകൻ",location:"സ്ഥലം",openChecks:"ബാക്കിയുള്ള പരിശോധനകൾ",hidePreparedFields:"തയ്യാറാക്കിയ ഫീൽഡുകൾ മറയ്ക്കുക",reviewPreparedFields:"തയ്യാറാക്കിയ ഫീൽഡുകൾ പരിശോധിക്കുക",markReviewed:"പരിശോധിച്ചതായി അടയാളപ്പെടുത്തുക",notProvided:"നൽകിയിട്ടില്ല",provided:"നൽകി",needsInformation:"വിവരം ആവശ്യമാണ്",openOfficialSource:"ഔദ്യോഗിക ഉറവിടം തുറക്കുക",addFollowup:"ഫോളോ-അപ്പ് ചേർക്കുക",remove:"നീക്കുക",upcomingActions:"വരാനിരിക്കുന്ന നടപടികൾ",reminders:"ഓർമ്മപ്പെടുത്തലുകൾ",suggestedDate:"നിർദ്ദേശിച്ച തീയതി",done:"പൂർത്തിയായി",ourApproach:"ഞങ്ങളുടെ സമീപനം",aboutTitle:"വ്യക്തത, തെളിവ്, പൗര നിയന്ത്രണം.",aboutDescription:"JanaSetu ഒരു സ്വതന്ത്ര സർക്കാർ ആനുകൂല്യ മാർഗനിർദ്ദേശ പ്രോട്ടോടൈപ്പാണ്. ഔദ്യോഗിക പോർട്ടലുകൾക്ക് പകരമല്ല, അനുബന്ധമാണ്.",discoverTitle:"കണ്ടെത്തുക",explainTitle:"വിവരിക്കുക",prepareTitle:"തയ്യാറാക്കുക",rememberTitle:"ഓർമ്മിക്കുക",dataTransparency:"ഡാറ്റാ സുതാര്യത",currentCatalogue:"നിലവിലെ പട്ടികയിൽ എന്തുണ്ട്?",coverageHonesty:"കവറേജ് സുതാര്യത",responsibleBoundary:"ഉത്തരവാദിത്തമുള്ള ഉപയോഗ പരിധി",officialSource:"ഔദ്യോഗിക ഉറവിടം",cscLocator:"CSC ലൊക്കേറ്റർ",footerText:"സ്വതന്ത്ര സർക്കാർ ആനുകൂല്യ മാർഗനിർദ്ദേശം",evidenceLed:"തെളിവ് അടിസ്ഥാനമാക്കി. പൗര നിയന്ത്രണത്തിൽ.",closeNav:"നാവിഗേഷൻ അടയ്ക്കുക",openNav:"നാവിഗേഷൻ തുറക്കുക",openProfile:"പ്രൊഫൈൽ തുറക്കുക",dismiss:"അറിയിപ്പ് നീക്കുക",backupTitle:"എൻക്രിപ്റ്റ് ചെയ്ത JanaSetu വാൾട്ട് എക്സ്പോർട്ട് ചെയ്യുക",restoreTitle:"എൻക്രിപ്റ്റ് ചെയ്ത JanaSetu വാൾട്ട് പുനഃസ്ഥാപിക്കുക",cscHelp:"നിങ്ങളുടെ ചെക്ക്‌ലിസ്റ്റ് അംഗീകൃത CSC അല്ലെങ്കിൽ വകുപ്പിൽ കൊണ്ടുപോകുക.",findCSC:"CSC കണ്ടെത്തുക",privacyLink:"സ്വകാര്യത",termsLink:"നിബന്ധനകൾ",aboutDiscoverText:"ഔദ്യോഗിക പദ്ധതികളുടെ തിരഞ്ഞെടുത്ത പട്ടികയിൽ നിന്ന് അനുയോജ്യമായ മാർഗങ്ങൾ തിരഞ്ഞെടുക്കാൻ ഒരേ പൗര പ്രൊഫൈൽ ഉപയോഗിക്കുക.",aboutExplainText:"ഓരോ പരിശോധനയിലും നിയമം, ഉപയോഗിച്ച പ്രൊഫൈൽ ഫീൽഡ്, തെളിവിന്റെ നില എന്നിവ കാണിക്കുന്നു.",aboutPrepareText:"പരിശോധനയ്ക്കായി പ്രാദേശിക ഡ്രാഫ്റ്റും രേഖാ പട്ടികയും സൃഷ്ടിക്കുക. പ്രോട്ടോടൈപ്പ് സർക്കാർ അപേക്ഷകൾ സമർപ്പിക്കില്ല.",aboutRememberText:"പൗരന് പിന്നീട് തുടരാൻ ഡ്രാഫ്റ്റുകളും ഓർമ്മപ്പെടുത്തലുകളും ഈ ബ്രൗസറിൽ സൂക്ഷിക്കുക.",addReminder:"ഫോളോ-അപ്പ് ചേർക്കുക",agentTrace:"ഈ പ്രോട്ടോടൈപ്പ് നിർദ്ദിഷ്ട സെർവർ ടൂളുകളും നിയമാധിഷ്ഠിത പ്ലാനറും ഉപയോഗിക്കുന്നു; ബാഹ്യ LLM അല്ലെങ്കിൽ സർക്കാർ API വിളിക്കുന്നില്ല.",assessmentEvidence:"വിലയിരുത്തൽ തെളിവ്",builtIn:"അന്തർനിർമ്മിത രേഖകൾ",catalogueHeading:"നിലവിലെ പട്ടികയിൽ എന്തുണ്ട്?",catalogueOnly:"കാറ്റലോഗ് രേഖ മാത്രം — ഈ പദ്ധതിക്ക് JanaSetu യോഗ്യതാ തീരുമാനം ഓട്ടോമേറ്റ് ചെയ്തിട്ടില്ല. വകുപ്പിൽ നിന്ന് വ്യവസ്ഥകൾ സ്ഥിരീകരിക്കുക.",budgetReferenceOnly:"ബജറ്റ് ഇനം മാത്രം — ഇത് സർക്കാർ ബജറ്റിലെ ചെലവ് തലക്കെട്ടാണ്; പൗരന്മാർക്ക് ലഭിക്കുന്ന പദ്ധതിയാണെന്ന് ഇതുവരെ സ്ഥിരീകരിച്ചിട്ടില്ല. വ്യക്തിഗത ആനുകൂല്യമോ അപേക്ഷാ മാർഗമോ അനുമാനിക്കുന്നില്ല.",citizenReviewed:"പൗര പരിശോധന രേഖപ്പെടുത്തി",coverageText:"JanaSetu ഉറവിട-ലിങ്ക് ചെയ്ത രേഖകളും ബാഹ്യ ഡാറ്റാസെറ്റും നൽകുന്നു. പൂർണ്ണമായി സ്വതന്ത്രമായി പരിശോധിച്ച കേന്ദ്ര അല്ലെങ്കിൽ സംസ്ഥാന/UT പദ്ധതികളുടെ കവറേജ് ഇപ്പോഴും ഇല്ല. നിലവിലെ നിയമങ്ങളും അപേക്ഷാ മാർഗങ്ങളും ഔദ്യോഗിക വകുപ്പിൽ പരിശോധിക്കുക.",coverageTitle:"കവറേജ് സുതാര്യത",datasetAttribution:"ഓപ്പൺ ഡാറ്റാസെറ്റ് attribution",datasetMachineParsed:"യോഗ്യതാ വിവരങ്ങൾ യന്ത്രം ഉപയോഗിച്ച് എടുത്തതാണ്; തീരുമാനത്തിന് ഉപയോഗിക്കുന്നില്ല. തിരച്ചിൽ മുഴുവൻ പ്രാദേശിക സൂചികയിലാണ്. ഓരോ പദ്ധതിയും അപേക്ഷാ മാർഗവും ഔദ്യോഗിക ഉറവിടത്തിൽ പരിശോധിക്കുക.",datasetFreshnessWarning:"പ്രസാധകന്റെ സ്നാപ്ഷോട്ട് 90 ദിവസത്തിലധികം പഴക്കമുള്ളതാണ്. ഇത് നിലവിലെ നിലയുടെ ഫീഡ് അല്ല; പദ്ധതി നിലയും അവസാന തീയതിയും ഔദ്യോഗിക ഉറവിടത്തിൽ പരിശോധിക്കുക.",datasetPaginated:"ബാഹ്യ ഡാറ്റാസെറ്റ് പേജുകളായി ലോഡ് ചെയ്യും. മുകളിൽ കീവേഡ് തിരയുക.",docChecklistEmpty:"ഫയൽ ചേർത്താൽ പട്ടിക ഇവിടെ കാണാം.",documentUploadText:"PDF അല്ലെങ്കിൽ ചിത്രം തിരഞ്ഞെടുക്കുക. അത് ഈ ഉപകരണത്തിൽ സൂക്ഷിച്ച് ചെക്ക്ലിസ്റ്റിൽ ചേർക്കും. ഫയലുകൾ അപ്‌ലോഡ് ചെയ്യുകയോ സ്വയമേവ മാൽവെയർ സ്കാൻ ചെയ്യുകയോ ഇല്ല.",draftHelp:"വിലയിരുത്തൽ നടത്തി, പദ്ധതി തുറന്ന്, പരിശോധിക്കാവുന്ന രേഖ സൃഷ്ടിക്കാൻ “ഡ്രാഫ്റ്റ് തയ്യാറാക്കുക” തിരഞ്ഞെടുക്കുക.",draftInfoDisclaimer:"ഇവ പ്രൊഫൈൽ തയ്യാറെടുപ്പ് ഫീൽഡുകളാണ്; ഔദ്യോഗിക ഫോമിലേക്കുള്ള സ്ഥിരീകരിച്ച മാപ്പിംഗ് അല്ല. ഔദ്യോഗിക ഉറവിടത്തിലെ നിലവിലെ ഫീൽഡുകൾ പരിശോധിക്കുക.",draftNotSubmitted:"സമർപ്പിച്ചിട്ടില്ല",draftStatus:"തയ്യാറെടുപ്പ് ഡ്രാഫ്റ്റ്",followupDate:"നിർദ്ദേശിച്ച തീയതി",followupMemory:"ഫോളോ-അപ്പ് ഓർമ്മപ്പെടുത്തൽ",footerIndependent:"സ്വതന്ത്ര സർക്കാർ ആനുകൂല്യ മാർഗനിർദ്ദേശം",footerTrust:"തെളിവ് അടിസ്ഥാനമാക്കി. പൗര നിയന്ത്രണത്തിൽ.",governmentWorkspace:"സർക്കാർ ആനുകൂല്യ പ്രവർത്തനസ്ഥലം",hideDraftFields:"തയ്യാറാക്കിയ ഫീൽഡുകൾ മറയ്ക്കുക",loading:"ഓപ്പൺ ഡാറ്റ രേഖകൾ ലോഡ് ചെയ്യുന്നു…",localLabel:"പ്രാദേശികം",manualSubmit:"നിറച്ച ഓരോ ഫീൽഡും പരിശോധിക്കുക. ഫീൽഡ് മാറ്റങ്ങളോട് പോർട്ടൽ സ്ക്രിപ്റ്റുകൾ പ്രതികരിച്ചേക്കാം; തുടരുന്നതിന് മുമ്പ് പേജ് പരിശോധിക്കുക.",maxFileSize:"പരമാവധി 12 MB",mySchemeSearch:"ഔദ്യോഗിക myScheme തിരയുക",next50:"അടുത്ത 50 ഡാറ്റാസെറ്റ് രേഖകൾ ലോഡ് ചെയ്യുക",nextRecommendedActions:"അടുത്ത ശുപാർശ ചെയ്ത നടപടികൾ",noAadhaarNote:"ഈ പ്രോട്ടോടൈപ്പിൽ ആധാർ അല്ലെങ്കിൽ ബാങ്ക് അക്കൗണ്ട് നമ്പർ ആവശ്യമില്ല.",noDocRefs:"രേഖാ പരാമർശങ്ങളൊന്നുമില്ല",officialChannel:"ഔദ്യോഗിക അപേക്ഷ / സേവന മാർഗം",openOfficial:"ഔദ്യോഗിക ഉറവിടം തുറക്കുക",publishedBenefit:"സാധ്യതയുള്ള ആനുകൂല്യം · വകുപ്പുമായി സ്ഥിരീകരിക്കുക",reminderPlural:"ഓർമ്മപ്പെടുത്തലുകൾ",removeItem:"നീക്കുക",responsibleUseText:"JanaSetu പ്രാഥമിക വിവരവും പ്രവർത്തന സഹായവും നൽകുന്നു. നിയമപരമായോ ഔദ്യോഗികമായോ തീരുമാനങ്ങൾ നൽകുന്നില്ല, തിരിച്ചറിയൽ സ്ഥിരീകരിക്കുന്നില്ല, ആനുകൂല്യം ഉറപ്പുനൽകുന്നില്ല, സർക്കാരിന് വേണ്ടി പ്രവർത്തിക്കുന്നില്ല. ഔദ്യോഗിക ഉറവിടത്തിൽ വിവരങ്ങൾ പരിശോധിക്കുക.",reviewDraftFields:"തയ്യാറാക്കിയ ഫീൽഡുകൾ പരിശോധിക്കുക",ruleScreened:"നിയമ പരിശോധന · ഉറവിടം ചേർത്തു",schemeAssistant:"പൗരൻ നിയന്ത്രിക്കുന്ന ബ്രൗസർ ഫോം സഹായം ഇൻസ്റ്റാൾ ചെയ്യുക",schemeRecords:"രേഖാ പരാമർശങ്ങൾ",screeningConditions:"പരിശോധനാ വ്യവസ്ഥകൾ",securityDocs:"സുരക്ഷയ്ക്കായി ഈ പ്രോട്ടോടൈപ്പിൽ ആധാർ ചിത്രങ്ങൾ, ബാങ്ക് സ്റ്റേറ്റ്മെന്റുകൾ, സെൻസിറ്റീവ് തിരിച്ചറിയൽ രേഖകൾ ചേർക്കരുത്. ഡെമോയ്ക്ക് മാതൃകാ ഫയലുകൾ ഉപയോഗിക്കുക.",snapshotDate:"ഡാറ്റാസെറ്റ് സ്നാപ്പ്ഷോട്ട്",sourceIndexed:"ഉറവിടം സൂചിപ്പിച്ചു · നിയമങ്ങൾ പരിശോധിക്കുക",toolSteps:"ടൂൾ ഘട്ടങ്ങൾ",upcoming:"വരാനിരിക്കുന്ന നടപടികൾ",verifyRules:"ഉറവിടം ചേർത്തു · നിലവിലെ നിയമങ്ങൾ പരിശോധിക്കുക",complete:"പൂർണ്ണം",noAadhaarRequest:"ഇവിടെ ആധാർ, ബാങ്ക് അക്കൗണ്ട് അല്ലെങ്കിൽ രേഖാ നമ്പർ ചോദിക്കുന്നില്ല.",noticeStorageRecovered:"ചില സംരക്ഷിച്ച ബ്രൗസർ ഡാറ്റ വായിക്കാൻ കഴിഞ്ഞില്ല. പുതിയ പ്രൊഫൈലുമായി തുടരാം.",noticeBackupExported:"ബാക്കപ്പ് ഈ ഉപകരണത്തിലേക്ക് കയറ്റുമതി ചെയ്തു. സ്വകാര്യ ഡാറ്റയായി കരുതുക.",noticeBackupRestored:"ഈ ബ്രൗസറിൽ ബാക്കപ്പ് പുനഃസ്ഥാപിച്ചു. ഉപയോഗിക്കുന്നതിന് മുമ്പ് വിവരങ്ങൾ പരിശോധിക്കുക.",noticeBackupRestoreFailed:"ബാക്കപ്പ് പുനഃസ്ഥാപിക്കാൻ കഴിഞ്ഞില്ല.",noticeDescribeBefore:"തുടരുന്നതിന് മുമ്പ് നിങ്ങളുടെ സാഹചര്യം ഒരു വാക്യത്തിൽ വിവരിക്കുക.",noticeIntakeFacts:"വിവരങ്ങൾ വേർതിരിച്ചെടുത്തു. സംരക്ഷിക്കുന്നതിന് മുമ്പ് പരിശോധിക്കുക.",noticeIntakeEmpty:"പിന്തുണയ്ക്കുന്ന പ്രൊഫൈൽ വിവരങ്ങൾ കണ്ടെത്തിയില്ല. കൂടുതൽ വ്യക്തമായി വിവരിക്കുക.",noticeIntakeFailed:"വിവരണം പ്രോസസ്സ് ചെയ്യാൻ കഴിഞ്ഞില്ല.",noticeSelectState:"പരിശോധനയ്ക്ക് മുമ്പ് സംസ്ഥാനം അല്ലെങ്കിൽ കേന്ദ്രഭരണ പ്രദേശം തിരഞ്ഞെടുക്കുക.",noticeAssessmentDone:"വിലയിരുത്തൽ പ്രാദേശികമായി പൂർത്തിയായി. തെളിവും ഔദ്യോഗിക ഉറവിടങ്ങളും പരിശോധിക്കുക.",noticeAssessmentFailed:"വിലയിരുത്തൽ പൂർത്തിയാക്കാൻ കഴിഞ്ഞില്ല.",noticeDraftPrepared:"ഡ്രാഫ്റ്റ് ഈ ബ്രൗസറിൽ മാത്രം സംരക്ഷിച്ചു. സമർപ്പിച്ചിട്ടില്ല.",noticeDraftFailed:"ഡ്രാഫ്റ്റ് തയ്യാറാക്കാൻ കഴിഞ്ഞില്ല.",noticeReminderSaved:"ഓർമ്മപ്പെടുത്തൽ ഈ ബ്രൗസറിൽ മാത്രം സംരക്ഷിച്ചു.",noticeFileTooLarge:"12 MB-ൽ താഴെയുള്ള ഫയൽ തിരഞ്ഞെടുക്കുക.",noticeFileAdded:"ഫയൽ ഈ ബ്രൗസറിൽ മാത്രം സംരക്ഷിച്ചു. മാൽവെയർ സ്കാൻ ചെയ്തിട്ടില്ല.",searchFallback:"പ്രസാധകന്റെ തിരച്ചിൽ സേവനം ലഭ്യമല്ല. JanaSetu പകരം മുഴുവൻ പ്രാദേശിക സൂചികയിലുള്ള സ്നാപ്ഷോട്ടിൽ തിരയുന്നു; ഫലങ്ങൾ വിവരങ്ങൾ കണ്ടെത്താനുള്ളവ മാത്രമാണ്, ഡാറ്റ പഴയതായിരിക്കാം.",catalogueApiUnavailable:"ഓപ്പൺ ഡാറ്റാസെറ്റ് ഇപ്പോൾ ലോഡ് ചെയ്യാനായില്ല. ഔദ്യോഗിക myScheme ലിങ്ക് ഉപയോഗിക്കുക.",assessedRecords:"ബന്ധപ്പെട്ട പദ്ധതി രേഖകൾ വിലയിരുത്തി",displayed:"കാണിച്ചത്",openDataRows:"ഓപ്പൺ ഡാറ്റ വരികൾ",ruleScreenedCount:"നിയമ പ്രോട്ടോടൈപ്പുകൾ · സ്വതന്ത്ര അവലോകനം ബാക്കി",schemeApprovalPending:"പദ്ധതി ഉറവിട അംഗീകാരം കാത്തിരിക്കുന്നു",schemeUnavailable:"പദ്ധതി നിലവിലെ പട്ടികയിൽ ഇല്ല",officialVerificationRequired:"ഔദ്യോഗിക യോഗ്യതാ പരിശോധന ആവശ്യമാണ്",requireReview:"പരിശോധന ആവശ്യമാണ്",ruleScreenedStatus:"നിയമ പ്രോട്ടോടൈപ്പ് · സ്വതന്ത്ര അവലോകനം ബാക്കി",sourceIndexedStatus:"ഉറവിടം സൂചിപ്പിച്ചു · നിയമങ്ങൾ പരിശോധിക്കുക",ruleScreenedMetric:"നിയമ പ്രോട്ടോടൈപ്പുകൾ",remainderRequireVerification:"സ്വതന്ത്ര അവലോകനം ബാക്കി",commonServiceCentres:"സാധാരണ സേവന കേന്ദ്രങ്ങൾ",openCitizenProfile:"പൗരന്റെ പ്രൊഫൈൽ തുറക്കുക",runBenefitsAssessment:"ആനുകൂല്യ വിലയിരുത്തൽ നടത്തുക",openApplicationWorkspace:"അപേക്ഷാ പ്രവർത്തനമേഖല തുറക്കുക",working:"പ്രവർത്തിക്കുന്നു…",fileTypes:"PDF, JPG, PNG",addedLabel:"ചേർത്തു",removeDocumentReference:"രേഖാ റഫറൻസ് നീക്കം ചെയ്യുക",draftFieldNote:"ഇവ പ്രൊഫൈൽ തയ്യാറാക്കാനുള്ള ഫീൽഡുകളാണ്; ഔദ്യോഗിക വകുപ്പ് ഫോമുമായി സ്ഥിരീകരിച്ച മാപ്പിംഗ് അല്ല. ലിങ്ക് ചെയ്ത ഔദ്യോഗിക ഉറവിടത്തിൽ നിലവിലെ ഫീൽഡുകളും മൂല്യങ്ങളും പരിശോധിക്കുക.",draftNotSubmittedDisclaimer:"ഇത് JanaSetu തയ്യാറാക്കിയ അപേക്ഷാ ഡ്രാഫ്റ്റാണ്. സർക്കാർ പോർട്ടലിൽ സമർപ്പിച്ചിട്ടില്ല.",manualVerificationPending:"ചേർത്തു — മാനുവൽ പരിശോധന കാത്തിരിക്കുന്നു",incomeExample:"ഉദാ. 150000",sourcePeriodLabel:"ഉറവിട കാലയളവ്",categoryAgriculture:"കൃഷി",categoryHousing:"ഭവനം",categoryEducation:"വിദ്യാഭ്യാസം",categoryEmployment:"തൊഴിൽ",categoryEnergy:"ഊർജം",categoryEnergyHousehold:"ഊർജവും ഗൃഹോപയോഗവും",categoryFoodSecurity:"ഭക്ഷ്യസുരക്ഷ",categoryHealth:"ആരോഗ്യം",categoryInsurance:"ഇൻഷുറൻസ്",categoryKarnatakaBudget:"കർണാടക ബജറ്റ് പരാമർശം",categoryScholarship:"സ്കോളർഷിപ്പ്",categorySkills:"കഴിവുകൾ",categoryTransport:"ഗതാഗതം",categoryWomenChild:"സ്ത്രീകളും കുട്ടികളും",sourceLanguageNotice:"പദ്ധതികളുടെ പേരുകളും ഉറവിട രേഖകളും ഇംഗ്ലീഷിലോ മൂലഭാഷയിലോ ആയിരിക്കാം. UI വിവർത്തനങ്ങൾ സഹായത്തിനാണ്; ഔദ്യോഗിക ഉറവിടത്തിൽ നിബന്ധനകൾ പരിശോധിക്കുക.",hideDetails:"വിശദാംശങ്ങൾ മറയ്ക്കുക",viewDetails:"വിശദാംശങ്ങൾ കാണുക",accessedLabel:"പരിശോധിച്ച തീയതി",approvalNextAction:"ഉറവിടത്തിനും നിയമങ്ങൾക്കും രണ്ട് സ്വതന്ത്ര അംഗീകാരങ്ങൾ ലഭിക്കുന്നതുവരെ കാത്തിരിക്കുക.",officialVerifyNextAction:"നിലവിലെ നിബന്ധനകൾ ഔദ്യോഗിക വകുപ്പിൽ പരിശോധിക്കുക.",essentialProfileFieldsProvided:"7 പ്രധാന പ്രൊഫൈൽ ഫീൽഡുകളിൽ {provided} നൽകി",createdLabel:"സൃഷ്ടിച്ചത്",citizenReviewRecorded:"പൗര പരിശോധന രേഖപ്പെടുത്തി",savedDrafts:"ഡ്രാഫ്റ്റുകൾ സംരക്ഷിച്ചു",unknownFileType:"അറിയാത്ത ഫയൽ തരം",prepareLocalChecklist:"പ്രാദേശിക ചെക്ക്ലിസ്റ്റ് തയ്യാറാക്കുക",localPrepOnly:"പ്രാദേശിക തയ്യാറെടുപ്പ് മാത്രം — ഇത് അപേക്ഷാ രേഖയല്ല.",pendingDraftDisclaimer:"ഇത് തയ്യാറെടുപ്പ് രേഖ മാത്രം — യോഗ്യതാ തീരുമാനമോ സമർപ്പിച്ച അപേക്ഷയോ അല്ല."}
};

function formatMoney(value: number | "", locale = "en-IN", notProvided = "Not provided") {
  return value === "" ? notProvided : "₹" + value.toLocaleString(locale);
}
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="field"><span className="field-label">{label}</span>{children}{hint && <span className="field-hint">{hint}</span>}</label>;
}
function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>;
}
function YesNo({ value, onChange, unknown = false, t }: { value: boolean | null; onChange: (value: boolean | null) => void; unknown?: boolean; t: (key: string) => string }) {
  return <div className="segmented">
    <button type="button" className={value === true ? "selected" : ""} onClick={() => onChange(true)}>{t("yes")}</button>
    <button type="button" className={value === false ? "selected" : ""} onClick={() => onChange(false)}>{t("no")}</button>
    {unknown && <button type="button" className={value === null ? "selected" : ""} onClick={() => onChange(null)}>{t("notSure")}</button>}
  </div>;
}
function statusLabel(state: Assessment["state"], t: (key: string) => string) {
  if (state === "potential_match") return t("match");
  if (state === "not_matched") return t("noMatch");
  return t("review");
}
function shortDate(date: string, language: LanguageCode = "en") {
  const locale = ({ en: "en-IN", hi: "hi-IN", kn: "kn-IN", ta: "ta-IN", te: "te-IN", ml: "ml-IN" } as const)[language];
  return new Date(date).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
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
  const [hasLocalLanguage, setHasLocalLanguage] = useState(false);
  const [cloudUserId, setCloudUserId] = useState("");
  const [cloudSavedAt, setCloudSavedAt] = useState("");
  const [cloudError, setCloudError] = useState("");
  const [cloudSyncAvailable, setCloudSyncAvailable] = useState(false);
  const [cloudPolicyVersion, setCloudPolicyVersion] = useState("");
  const [cloudDraftPolicyVersion, setCloudDraftPolicyVersion] = useState("");
  const [cloudConsented, setCloudConsented] = useState(false);
  const [cloudStatusLoaded, setCloudStatusLoaded] = useState(false);
  const [cloudSyncRevision, setCloudSyncRevision] = useState(0);
  const [syncPassword, setSyncPassword] = useState("");
  const [syncConsentChecked, setSyncConsentChecked] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [expandedScheme, setExpandedScheme] = useState("");
  const [backupBusy, setBackupBusy] = useState(false);
  const [openDataSchemes, setOpenDataSchemes] = useState<(typeof SCHEMES)[number][]>([]);
  const [openDataTotal, setOpenDataTotal] = useState(4693);
  const [openDataOffset, setOpenDataOffset] = useState(0);
  const [openDataNext, setOpenDataNext] = useState<number | null>(0);
  const [openDataLoading, setOpenDataLoading] = useState(false);
  const [openDataError, setOpenDataError] = useState(false);
  const [openDataSearchFallback, setOpenDataSearchFallback] = useState(false);
  const [openDataFreshness, setOpenDataFreshness] = useState<"stale" | "within_policy">("stale");

  const tFor = (lang: LanguageCode, key: string) => UI_COPY[lang][key] || COPY[lang][key] || UI_COPY.en[key] || COPY.en[key] || key;
  const t = (key: string) => tFor(language, key);
  const categoryLabel = (category: string) => {
    const keyByCategory: Record<string, string> = {
      Agriculture: "categoryAgriculture", Housing: "categoryHousing", Education: "categoryEducation",
      Employment: "categoryEmployment", Energy: "categoryEnergy", "Energy & household": "categoryEnergyHousehold",
      "Food security": "categoryFoodSecurity", Health: "categoryHealth", Insurance: "categoryInsurance",
      "Karnataka budget reference": "categoryKarnatakaBudget", Scholarship: "categoryScholarship", Skills: "categorySkills",
      Transport: "categoryTransport", "Women & child": "categoryWomenChild"
    };
    return category.split(",").map((part) => t(keyByCategory[part.trim()] || part.trim())).join(", ");
  };

  useEffect(() => {
    const locale: Record<LanguageCode, string> = { en: "en-IN", hi: "hi-IN", kn: "kn-IN", ta: "ta-IN", te: "te-IN", ml: "ml-IN" };
    document.documentElement.lang = locale[language] || "en-IN";
  }, [language]);
  const activeResults = useMemo(() => {
    const matches = (scheme: (typeof SCHEMES)[number]) => {
      const translated = localizedSchemeText(scheme.id, language);
      const matchesText = [scheme.name, scheme.category, scheme.summary, scheme.ministry, scheme.geography, translated?.summary, translated?.benefit, ...(translated?.ruleNotes ?? [])]
        .filter(Boolean).join(" ").toLocaleLowerCase().includes(query.toLocaleLowerCase());
      const matchesCategory = category === "All categories" || scheme.category.split(",").map((item) => item.trim()).includes(category) || scheme.tags.some((tag) => tag.trim() === category);
      return matchesText && matchesCategory;
    };
    const local = SCHEMES.filter(matches);
    const names = new Set(local.map((scheme) => scheme.name.trim().toLowerCase()));
    const external = openDataSchemes.filter((scheme) => {
      const matchesCategory = category === "All categories" || scheme.category.split(",").map((item) => item.trim()).includes(category) || scheme.tags.some((tag) => tag.trim() === category);
      return matchesCategory && !names.has(scheme.name.trim().toLowerCase());
    });
    return [...local, ...external];
  }, [category, language, query, openDataSchemes]);

  useEffect(() => {
    if (tab !== "discover") return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setOpenDataLoading(true);
      setOpenDataError(false);
      setOpenDataSearchFallback(false);
      try {
        const params = new URLSearchParams({ q: query, offset: String(openDataOffset), limit: "50" });
        if (category !== "All categories") params.set("category", category);
        const response = await fetch("/api/schemes/open-data?" + params.toString(), { signal: controller.signal });
        if (!response.ok) throw new Error("Open catalogue source unavailable. Use the official myScheme link while it recovers.");
        const data = await response.json();
        const records = Array.isArray(data.records) ? data.records as (typeof SCHEMES)[number][] : [];
        setOpenDataTotal(Number.isFinite(data.total) ? Number(data.total) : Number(data.catalogueTotal || 4693));
        setOpenDataNext(typeof data.nextOffset === "number" ? data.nextOffset : null);
        setOpenDataSearchFallback(Boolean(data.searchFallbackWarning));
        setOpenDataFreshness(data.freshness === "within_policy" ? "within_policy" : "stale");
        setOpenDataSchemes((current) => openDataOffset === 0 ? records : [...current, ...records]);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setOpenDataError(true);
      } finally {
        if (!controller.signal.aborted) setOpenDataLoading(false);
      }
    }, query ? 300 : 0);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [tab, query, category, openDataOffset]);

  useEffect(() => {
    const read = (key: string, fallback: any) => {
      try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
      catch { return fallback; }
    };
    const localProfile = parseBackupProfile(read(STORAGE.profile, EMPTY_PROFILE));
    const localLanguage = parseBackupLanguage(read(STORAGE.language, "en"));
    setHasLocalLanguage(localStorage.getItem(STORAGE.language) !== null);
    const localApplications: LocalApplication[] = invalidateUnapprovedApplications<LocalApplication>(parseBackupApplications(read(STORAGE.applications, []), { trustLocalStorage: true }));
    const localDocuments = parseBackupDocuments(read(STORAGE.documents, []));
    const localTasks = parseBackupTasks(read(STORAGE.tasks, []));
    const localAssessments = invalidateUnapprovedAssessments(parseBackupAssessments(read(STORAGE.assessments, []), { trustLocalStorage: true }));
    setProfile(localProfile || EMPTY_PROFILE);
    setLanguage(localLanguage);
    setApplications(localApplications);
    setDocuments(localDocuments);
    setTasks(localTasks);
    setAssessments(localAssessments);
    if (!localProfile) setNotice(t("noticeStorageRecovered"));
    setHydrated(true);

    let active = true;
    (async () => {
      try {
        const authResponse = await fetch("/api/auth", { cache: "no-store" });
        const auth = authResponse.ok ? await authResponse.json() : null;
        if (!active) return;
        if (!auth?.user?.id) { setCloudStatusLoaded(true); return; }
        setCloudUserId(String(auth.user.id));
        const response = await fetch("/api/workspace/sync/status", { cache: "no-store" });
        if (!response.ok) throw new Error("Encrypted sync policy status is unavailable.");
        const status = await response.json();
        if (!active) return;
        setCloudSyncAvailable(status.available === true && typeof status.policy?.version === "string");
        setCloudPolicyVersion(typeof status.policy?.version === "string" ? status.policy.version : "");
        setCloudDraftPolicyVersion(typeof status.draft_version === "string" ? status.draft_version : "");
        setCloudConsented(status.consented === true);
      } catch (error) {
        if (active) setCloudError(error instanceof Error ? error.message : "Encrypted sync status is unavailable.");
      } finally {
        if (active) setCloudStatusLoaded(true);
      }
    })();
    return () => { active = false; };
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


  const syncWorkspaceNow = async () => {
    if (!cloudUserId) { setCloudError("Sign in to use encrypted cross-device sync."); return; }
    if (!cloudSyncAvailable || !cloudPolicyVersion) { setCloudError("Cloud sync is disabled until its privacy policy is independently approved."); return; }
    if (!cloudConsented && !syncConsentChecked) { setCloudError("Review the approved policy and confirm consent before syncing."); return; }
    if (syncPassword.length < 12) { setCloudError("Use a vault password with at least 12 characters."); return; }
    setSyncBusy(true);
    setCloudError("");
    try {
      if (!cloudConsented) {
        const consent = await fetch("/api/consents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            purpose: "cloud_workspace_sync",
            policy_version: cloudPolicyVersion,
            granted: true,
            scope: { action_type: "workspace_sync" }
          })
        });
        const consentResult = await consent.json().catch(() => ({}));
        if (!consent.ok) throw new Error(typeof consentResult.error === "string" ? consentResult.error : "Cloud sync consent could not be recorded.");
        setCloudConsented(true);
      }

      // Restore first and use compare-and-swap so a stale device cannot overwrite a newer cloud revision.
      const snapshot = await restoreEncryptedWorkspace(syncPassword);
      let mergedProfile = profile;
      let mergedLanguage = language;
      let mergedApplications = applications;
      let mergedDocuments = documents;
      let mergedTasks = tasks;
      let mergedAssessments = assessments;
      if (snapshot.payload !== null) {
        const remote = snapshot.payload as Record<string, unknown>;
        if (remote.app !== "JanaSetu" || remote.schemaVersion !== 1 || !remote.profile) throw new Error("The encrypted cloud vault has an unsupported workspace format.");
        const remoteProfile = parseBackupProfile(remote.profile);
        if (!remoteProfile) throw new Error("The encrypted cloud profile failed validation.");
        mergedProfile = mergeCitizenProfile(profile, remoteProfile);
        mergedLanguage = hasLocalLanguage ? language : parseBackupLanguage(remote.language);
        mergedApplications = mergeWorkspaceRecords(applications, invalidateUnapprovedApplications<LocalApplication>(parseBackupApplications(remote.applications, { trustLocalStorage: true })) as LocalApplication[], item => String(item.id));
        mergedDocuments = mergeWorkspaceRecords(documents, parseBackupDocuments(remote.documents), item => item.id);
        mergedTasks = mergeWorkspaceRecords(tasks, parseBackupTasks(remote.tasks), item => item.id);
        mergedAssessments = mergeWorkspaceRecords(assessments as unknown as Record<string, unknown>[], invalidateUnapprovedAssessments(parseBackupAssessments(remote.assessments, { trustLocalStorage: true })) as unknown as Record<string, unknown>[], item => String(item.schemeId)) as unknown as Assessment[];
      }

      const payload = {
        app: "JanaSetu",
        schemaVersion: 1,
        profile: mergedProfile,
        language: mergedLanguage,
        applications: mergedApplications,
        documents: mergedDocuments,
        tasks: mergedTasks,
        assessments: mergedAssessments
      };
      const saved = await syncEncryptedWorkspace(payload, syncPassword, snapshot.revision);
      // Apply the remote merge without overwriting edits made while the network request was running.
      setProfile(current => mergeCitizenProfile(current, mergedProfile));
      setLanguage(current => hasLocalLanguage ? current : mergedLanguage);
      setApplications(current => mergeWorkspaceRecords(current, mergedApplications, item => String(item.id)));
      setDocuments(current => mergeWorkspaceRecords(current, mergedDocuments, item => item.id));
      setTasks(current => mergeWorkspaceRecords(current, mergedTasks, item => item.id));
      setAssessments(current => mergeWorkspaceRecords(current as unknown as Record<string, unknown>[], mergedAssessments as unknown as Record<string, unknown>[], item => String(item.schemeId)) as unknown as Assessment[]);
      setCloudSyncRevision(saved.revision);
      setCloudSavedAt(saved.updated_at || new Date().toISOString());
      setCloudError("");
      setSyncConsentChecked(false);
      setSyncPassword("");
      setNotice("Encrypted workspace synced. Document file bytes remain on this device; only document references were synchronized.");
    } catch (error) {
      setCloudError(error instanceof Error ? error.message : "Encrypted workspace sync failed. Your local data was not deleted.");
    } finally {
      setSyncBusy(false);
    }
  };

  const exportBackup = async () => {
    const password = window.prompt("Create a vault password (at least 12 characters). JanaSetu cannot recover it.");
    if (password === null) return;
    const confirmation = window.prompt("Re-enter the vault password to confirm.");
    if (confirmation === null) return;
    if (password !== confirmation) { setNotice("Passwords do not match. Nothing was exported."); return; }
    setBackupBusy(true);
    try {
      const storedFiles = await getLocalDocuments();
      const documentFiles = await Promise.all(storedFiles.map(async (item) => {
        const bytes = new Uint8Array(await item.blob.arrayBuffer());
        let binary = ""; for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        return { id: item.id, name: item.name, type: item.type, data: btoa(binary) };
      }));
      const totalBytes = documentFiles.reduce((sum, item) => sum + Math.floor(item.data.length * 3 / 4), 0);
      if (totalBytes > 25 * 1024 * 1024) throw new Error("Local documents exceed the 25 MB portable vault limit.");
      const backup = { app: "JanaSetu", schemaVersion: 1, exportedAt: new Date().toISOString(), profile, language, applications, documents, tasks, assessments, documentFiles };
      const blob = await encryptVault(backup, password);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = "JanaSetu-Encrypted-Vault.janasetu"; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Encrypted vault exported. Keep the password safe; it cannot be recovered.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Vault export failed."); }
    finally { setBackupBusy(false); }
  };
  const importBackup = async (file?: File) => {
    if (!file) return;
    const password = window.prompt("Enter the password for this JanaSetu encrypted vault.");
    if (password === null) return;
    setBackupBusy(true);
    try {
      const data = await decryptVault(file, password) as any;
      if (data?.app !== "JanaSetu" || data?.schemaVersion !== 1 || !data?.profile) throw new Error("This is not a supported JanaSetu vault file.");
      const importedProfile = parseBackupProfile(data.profile);
      if (!importedProfile) throw new Error("Backup profile is invalid.");
      const importedLanguage = parseBackupLanguage(data.language);
      const importedDocuments = parseBackupDocuments(data.documents);
      const allowedDocumentIds = new Set(importedDocuments.map((item) => item.id));
      const fileItems = Array.isArray(data.documentFiles) ? data.documentFiles.filter((item: any) =>
        item && typeof item.id === "string" && allowedDocumentIds.has(item.id) &&
        typeof item.name === "string" && item.name.length <= 255 &&
        ["application/pdf", "image/jpeg", "image/png"].includes(item.type) &&
        typeof item.data === "string" && item.data.length <= 16 * 1024 * 1024 &&
        item.data.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(item.data)
      ).slice(0, 100) : [];
      const encodedTotal = fileItems.reduce((sum: number, item: any) => sum + item.data.length, 0);
      if (encodedTotal > 36 * 1024 * 1024) throw new Error("Vault document payload exceeds the import limit.");
      await replaceLocalDocuments(fileItems);
      setProfile(importedProfile); setLanguage(importedLanguage);
      setApplications(invalidateUnapprovedApplications(parseBackupApplications(data.applications)));
      setDocuments(importedDocuments);
      setTasks(parseBackupTasks(data.tasks));
      setAssessments(invalidateUnapprovedAssessments(parseBackupAssessments(data.assessments)));
      setTab("profile"); setNotice(tFor(importedLanguage, "noticeBackupRestored"));
    } catch (error) { setNotice(error instanceof Error ? error.message : t("noticeBackupRestoreFailed")); } finally { setBackupBusy(false); }
  };

  const updateProfile = <K extends keyof CitizenProfile>(key: K, value: CitizenProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };


  const submitIntake = async () => {
    if (!intakeText.trim()) { setNotice(t("noticeDescribeBefore")); return; }
    setIntakeBusy(true);
    try {
      const payload = parseCitizenMessage(intakeText);
      setProfile((current) => ({ ...current, ...(payload.updates || {}) }));
      setIntakeRecognized(payload.recognizedFields || []);
      setTab("profile");
      setNotice(payload.recognizedFields?.length ? t("noticeIntakeFacts") : t("noticeIntakeEmpty"));
    } catch (error) {
      setNotice(t("noticeIntakeFailed"));
    } finally { setIntakeBusy(false); }
  };



  const runAssessment = async () => {
    if (!profile.state) { setTab("profile"); setNotice(t("noticeSelectState")); return; }
    setBusy(true); setNotice("");
    try {
      const payload = runBenefitsAgent(profile);
      setAssessments(payload.assessments || []);
      setToolTrace(payload.trace || []);
      setTab("discover");
      setNotice(t("noticeAssessmentDone"));
    } catch (error) {
      setNotice(t("noticeAssessmentFailed"));
    } finally { setBusy(false); }
  };

  const prepareDraft = (schemeId: string) => {
    setDraftBusy(schemeId);
    try {
      const { draft } = createDraftRecord(schemeId, profile);
      setApplications((current) => [draft, ...current.filter((item) => item.id !== draft.id)]);
      setTab("applications");
      setNotice(t("noticeDraftPrepared"));
    } catch (error) {
      setNotice(t("noticeDraftFailed"));
    } finally { setDraftBusy(""); }
  };

  const addFollowup = (application: LocalApplication) => {
    const due = new Date(); due.setDate(due.getDate() + 7);
    const task: LocalTask = {
      id: "TASK-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      title: "Review next step for " + application.schemeName,
      dueAt: due.toISOString(), status: "Pending",
      note: "Prototype reminder only. Confirm the current application window with the official department."
    };
    setTasks((current) => [task, ...current]);
    setNotice(t("noticeReminderSaved"));
  };

  const addDocument = async (file?: File) => {
    if (!file) return;
    if (file.size < 1 || file.size > 12 * 1024 * 1024) {
      setNotice(t("noticeFileTooLarge"));
      return;
    }
    const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const validPdf = file.type === "application/pdf" && String.fromCharCode(...signature.slice(0, 5)) === "%PDF-";
    const validJpeg = file.type === "image/jpeg" && signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
    const png = [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a];
    const validPng = file.type === "image/png" && png.every((value,index) => signature[index] === value);
    if (!validPdf && !validJpeg && !validPng) {
      setNotice("Unsupported file. Select a valid PDF, JPEG or PNG.");
      return;
    }
    const entry: LocalDocument = {
      id: "DOC-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      name: file.name,
      type: file.type || t("unknownFileType"),
      size: file.size,
      addedAt: new Date().toISOString(),
      status: "Added — manual verification pending"
    };
    try { await saveLocalDocument(entry.id, file, entry.name, entry.type); }
    catch { setNotice("This browser could not store the file locally. No document was added."); return; }
    setDocuments((current) => [entry, ...current]);
    setNotice("Document saved on this device only. It has not been malware-scanned.");
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
    const translatedScheme = localizedSchemeText(scheme.id, language);
    const schemeSummary = translatedScheme?.summary || scheme.summary;
    const schemeBenefit = translatedScheme?.benefit || scheme.benefit;
    const schemeRuleNotes = translatedScheme?.ruleNotes || scheme.ruleNotes;
    return <article className="scheme-card" key={scheme.id}>
      <div className="scheme-topline">
        <span className="scheme-category">{categoryLabel(scheme.category)}</span>
        <span className="source-dot"><ShieldCheck size={14}/> {scheme.catalogueStatus === "rule-screened" ? t("ruleScreenedStatus") : t("sourceIndexedStatus")}</span>
      </div>
      <div className="scheme-main">
        <div className="scheme-symbol">{scheme.category === "Agriculture" ? <Sprout/> : scheme.category === "Housing" ? <House/> : scheme.category === "Education" ? <GraduationCap/> : <HandHeart/>}</div>
        <div className="scheme-title-wrap">
          <h3>{scheme.name}</h3>
          <p>{scheme.ministry}</p>
        </div>
      </div>
      <p className="scheme-summary">{schemeSummary}</p>
      <div className="scheme-benefit"><span>{t("publishedBenefit")}</span><strong>{schemeBenefit}</strong></div>
      {assessment && <div className={"assessment-banner " + assessment.state}>
        <span className="assessment-icon">{assessment.state === "not_matched" ? <X size={15}/> : assessment.state === "potential_match" ? <Check size={15}/> : <CircleAlert size={15}/>}</span>
        <div><strong>{statusLabel(assessment.state, t)}</strong><small>{scheme.reviewStatus !== "approved" ? t("schemeApprovalPending") : assessment.headline}</small></div>
      </div>}
      <div className="scheme-actions">
        <button className="text-button" onClick={() => setExpandedScheme(expanded ? "" : scheme.id)}>{expanded ? t("hideDetails") : t("viewDetails")} <ChevronDown size={15}/></button>
        {assessment && assessment.state !== "not_matched" && <><button className="button button-small button-primary" onClick={() => prepareDraft(scheme.id)} disabled={draftBusy === scheme.id}>{draftBusy === scheme.id ? t("working") : scheme.reviewStatus === "approved" ? t("prepare") : t("prepareLocalChecklist")} <ArrowUpRight size={15}/></button>{scheme.reviewStatus !== "approved" && <p className="source-period">{t("localPrepOnly")}</p>}</>}
      </div>
      {expanded && <div className="scheme-detail">
        <div><strong>{t("screeningConditions")}</strong><ul>{schemeRuleNotes.map((rule) => <li key={rule}>{rule}</li>)}</ul></div>
        {assessment && <div className="rule-list"><strong>{t("assessmentEvidence")}</strong>{assessment.checks.map((item) => <div className="rule-row" key={item.key}><span className={"rule-state " + item.state}>{item.state === "matched" ? <Check size={12}/> : item.state === "not_matched" ? <X size={12}/> : <CircleAlert size={12}/>}</span><div><b>{item.label}</b><small>{item.evidence}</small><em>{item.rule}</em></div></div>)}</div>}
        {assessment && <div><strong>{t("nextRecommendedActions")}</strong><ul>{(scheme.reviewStatus !== "approved" ? [t("approvalNextAction"), t("officialVerifyNextAction")] : assessment.nextActions).map((action) => <li key={action}>{action}</li>)}</ul></div>}
        <a className="source-link" href={scheme.sourceUrl} target="_blank" rel="noreferrer">{t("source")}: {scheme.sourceName} <ArrowUpRight size={14}/></a>
        {scheme.applicationUrl && <a className="source-link" href={scheme.applicationUrl} target="_blank" rel="noreferrer">{t("officialChannel")} <ArrowUpRight size={14}/></a>}
        {scheme.recordKind === "budget-line-item-lead" ? <p className="source-period">{t("budgetReferenceOnly")}</p> : scheme.catalogueStatus === "catalogue-only" && <p className="source-period">{t("catalogueOnly")}</p>}
        <p className="source-period">{t("sourcePeriodLabel")}: {scheme.sourcePeriod}. {t("accessedLabel")}: {scheme.sourceChecked}.</p>
      </div>}
    </article>;
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t("skip")}</a>
      <aside className={"sidebar " + (showMobileNav ? "sidebar-open" : "")}>
        <div className="brand">
          <div className="brand-mark"><img src="/janasetu-mark.svg" alt="" /></div>
          <div><strong>JanaSetu</strong><small>{t("benefitsAccess")}</small></div>
          <button className="mobile-close" onClick={() => setShowMobileNav(false)} aria-label={t("closeNav")}><X size={18}/></button>
        </div>
        <div className="sidebar-kicker">{t("workspace")}</div>
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
          <strong>{t("humanHelp")}</strong>
          <p>{t("cscHelp")}</p>
          <a href="https://locator.csccloud.in/" target="_blank" rel="noreferrer">{t("findCSC")} <ArrowUpRight size={13}/></a>
        </div>
        <div className="sidebar-footer">
          <ShieldCheck size={15}/><span>{t("independent")}</span><span className="footer-policy-links"><a href="/privacy">{t("privacyLink")}</a><a href="/terms">{t("termsLink")}</a></span>
        </div>
      </aside>

      <main className="main-area" id="main-content" data-language={language}>
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setShowMobileNav(true)} aria-label={t("openNav")}><Menu size={20}/></button>
            <div className="breadcrumb"><span>JanaSetu</span><ChevronRight size={14}/><strong>{navItems.find((item) => item.id === tab)?.label}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="system-status"><span className="status-pulse"/> {t("localStatus")}</div>
            <button className="button button-small button-outline backup-button" onClick={exportBackup} title="Export a password-encrypted .janasetu file; the password is never uploaded"><Download size={13}/> {t("backup")}</button>
            <label className="button button-small button-outline backup-button" title="Import a password-encrypted .janasetu file"><Upload size={13}/> {t("restore")}<input type="file" accept=".janasetu,application/vnd.janasetu.vault+json" hidden disabled={backupBusy} onChange={(e) => { importBackup(e.target.files?.[0]); e.currentTarget.value = ""; }}/></label>
            <label className="language-control"><Globe2 size={16}/><span>{t("language")}</span>
              <select aria-label={t("language")} value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
                {LANGUAGE_OPTIONS.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select><ChevronDown size={13}/>
            </label>
            <button className="avatar-button" onClick={() => setTab("profile")} aria-label={t("openProfile")}><span className="avatar-fallback" aria-hidden="true">{profile.fullName ? profile.fullName[0].toUpperCase() : <UserRound size={17}/>}</span></button>
          </div>
        </header>

        <div className="content-area">
          {tab === "overview" && <>
            <div className="welcome-row">
              <div><div className="eyebrow"><span className="eyebrow-line"/> {t("governmentWorkspace")}</div><h1>{t("hello")}</h1><p>{t("intro")}</p></div>
              <div className="date-chip"><CalendarClock size={15}/> {hydrated ? new Date().toLocaleDateString(({ en: "en-IN", hi: "hi-IN", kn: "kn-IN", ta: "ta-IN", te: "te-IN", ml: "ml-IN" } as const)[language], { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : ""}</div>
            </div>

            <section className="cloud-status encrypted-sync-panel" aria-live="polite">
              <div className="encrypted-sync-copy">
                <strong>Encrypted cross-device sync</strong>
                <p>{!cloudStatusLoaded ? "Checking account and privacy-policy status…" : !cloudUserId ? "Sign in to check whether encrypted sync is available for your account." : !cloudSyncAvailable ? "Disabled pending independent privacy/legal approval. Your workspace stays on this device." : cloudConsented ? "Approved policy accepted. Sync is manual and uses your vault password." : "An approved policy is available. Review it and explicitly opt in before syncing."}</p>
                {cloudDraftPolicyVersion && !cloudSyncAvailable && <small>Policy draft {cloudDraftPolicyVersion} is inactive and cannot be accepted yet.</small>}
                {cloudSavedAt && <small>Last encrypted sync: {new Date(cloudSavedAt).toLocaleString()}</small>}
                {cloudSyncAvailable && <a href="https://github.com/PSP-YN/JanaSetu-AI/blob/main/docs/ENCRYPTED-CROSS-DEVICE-SYNC.md" target="_blank" rel="noreferrer">Read the cloud-sync policy and recovery limitations</a>}
                {cloudSyncAvailable && !cloudConsented && <label className="sync-consent-check"><input type="checkbox" checked={syncConsentChecked} onChange={event => setSyncConsentChecked(event.target.checked)}/> I have read the approved policy and agree to encrypted workspace synchronization.</label>}
                {cloudSyncAvailable && <label className="sync-password-label">Vault password<input type="password" autoComplete="off" value={syncPassword} onChange={event => setSyncPassword(event.target.value)} placeholder="At least 12 characters" disabled={syncBusy}/></label>}
                {cloudSyncAvailable && <button className="button button-primary" onClick={syncWorkspaceNow} disabled={syncBusy || !cloudUserId || (!cloudConsented && !syncConsentChecked) || syncPassword.length < 12}>{syncBusy ? "Syncing encrypted vault…" : cloudConsented ? "Sync this device now" : "Enable encrypted sync"}</button>}
                {cloudSyncAvailable && cloudSyncRevision > 0 && <small>Cloud revision {cloudSyncRevision}. A newer remote revision blocks stale writes; restore and reconcile before retrying.</small>}
                {cloudError && <p className="sync-error" role="alert">{cloudError}</p>}
              </div>
            </section>
            <section className="hero-panel">
              <div className="hero-content">
                <div className="hero-label"><span/> {t("clearerWay")}</div>
                <h2>{t("heroTitle1")}<br/><em>{t("heroTitle2")}</em></h2>
                <p>{t("heroDescription")}</p>
                <div className="hero-buttons">
                  <button className="button button-light" onClick={() => setTab("profile")}>{t("start")} <ArrowRight size={16}/></button>
                </div>
              </div>
              <div className="hero-illustration" aria-hidden="true">
                <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
                <div className="hero-paper"><div className="paper-seal"><Leaf size={24}/></div><span/><span/><span className="paper-short"/><div className="paper-check"><Check size={18}/></div></div>
                <div className="float-tag tag-one"><CheckCircle2 size={15}/> {t("evidenceLinked")}</div>
                <div className="float-tag tag-two"><FileCheck2 size={15}/> {t("nextActionReady")}</div>
              </div>
              <div className="hero-bottom-note"><LockKeyhole size={13}/> {t("noAadhaarNote")}</div>
            </section>

            <section className="ecosystem-panel">
              <div>
                <div className="eyebrow">{t("ecosystem")}</div>
                <h2>{t("prepLayer")}</h2>
                <p>{t("ecosystemText")}</p>
              </div>
              <div className="ecosystem-links">
                <a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer">myScheme <ExternalLink size={12}/><small>{t("schemeDiscovery")}</small></a>
                <a href="https://web.umang.gov.in/" target="_blank" rel="noreferrer">UMANG <ExternalLink size={12}/><small>{t("govServices")}</small></a>
                <a href="https://www.digilocker.gov.in/" target="_blank" rel="noreferrer">DigiLocker <ExternalLink size={12}/><small>{t("digitalDocs")}</small></a>
                <a href="https://locator.csccloud.in/" target="_blank" rel="noreferrer">{t("commonServiceCentres")} <ExternalLink size={12}/><small>{t("assistedAccess")}</small></a>
              </div>
            </section>

            <section className="panel intake-panel">
              <div className="intake-heading">
                <div className="eyebrow">{t("startSituation")}</div>
                <h2>{t("intakeTitle")}</h2>
                <p>{t("intakeDescription")}</p>
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
                <span><ShieldCheck size={14}/> {t("intakeSafety")}</span>
                <div>
                  <button className="button button-primary" onClick={submitIntake} disabled={intakeBusy}>{intakeBusy ? "Reading…" : t("extractFacts")} <ArrowRight size={15}/></button>
                </div>
              </div>
              {intakeRecognized.length > 0 && <div className="intake-recognized"><CheckCircle2 size={15}/> {t("suggestedFields")}: {intakeRecognized.join(" · ")}. {t("reviewProfile")}</div>}
            </section>

            <div className="metric-grid">
              <div className="metric-card"><div className="metric-icon green"><BookOpen size={18}/></div><div><strong>{SCHEMES.length.toString().padStart(2, "0")}</strong><span>{t("catalogueEntries")}</span></div><small>{SCHEMES.filter((item) => item.catalogueStatus === "rule-screened").length} {t("ruleScreenedMetric")} · {SCHEMES.filter((item) => item.reviewStatus !== "approved").length} {t("remainderRequireVerification")}</small></div>
              <div className="metric-card"><div className="metric-icon sand"><Globe2 size={18}/></div><div><strong>36</strong><span>{t("coverage")}</span></div><small>{t("stateSupport")}</small></div>
              <div className="metric-card"><div className="metric-icon clay"><MessageCircle size={18}/></div><div><strong>06</strong><span>{t("languages")}</span></div><small>{t("indianLanguages")}</small></div>
              <div className="metric-card"><div className="metric-icon ink"><ShieldCheck size={18}/></div><div><strong>{applications.length.toString().padStart(2, "0")}</strong><span>{t("draftApps")}</span></div><small>{t("browserBackup")}</small></div>
            </div>

            <div className="dashboard-grid">
              <section className="panel next-panel">
                <div className="section-heading"><div><div className="eyebrow">{t("gettingStarted")}</div><h2>{t("next")}</h2></div><span className="section-index">01—03</span></div>
                <div className="step-list">
                  <div className="step-row"><div className="step-number">01</div><div className="step-copy"><strong>{t("createStep")}</strong><p>{t("shareCircumstances")}</p></div><button aria-label={t("openCitizenProfile")} onClick={() => setTab("profile")}><ArrowUpRight size={17}/></button></div>
                  <div className="step-row"><div className="step-number">02</div><div className="step-copy"><strong>{t("assessmentStep")}</strong><p>{t("reviewRules")}</p></div><button aria-label={t("runBenefitsAssessment")} onClick={runAssessment} disabled={!profile.state}><ArrowUpRight size={17}/></button></div>
                  <div className="step-row"><div className="step-number">03</div><div className="step-copy"><strong>{t("prepareStep")}</strong><p>{t("keepDraft")}</p></div><button aria-label={t("openApplicationWorkspace")} onClick={() => setTab("applications")}><ArrowUpRight size={17}/></button></div>
                </div>
                <div className="profile-progress"><div className="progress-top"><span>{t("profileCompleteness")}</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: progress + "%" }}/></div><small>{t("essentialProfileFieldsProvided").replace("{provided}", String(profileProgress))}</small></div>
              </section>
              <section className="panel trust-panel">
                <div className="trust-heading"><div className="trust-icon"><ShieldCheck size={22}/></div><div><div className="eyebrow">{t("builtTrust")}</div><h2>{t("trustTitle")}</h2></div></div>
                <p>{t("screeningExplanation")}</p>
                <div className="trust-points"><span><Check size={14}/> {t("unknownStaysUnknown")}</span><span><Check size={14}/> {t("sourceLinkedRules")}</span><span><Check size={14}/> {t("humanApprovalBeforeAction")}</span></div>
                <button className="text-button" onClick={() => setTab("about")}>{t("readApproach")} <ArrowRight size={15}/></button>
              </section>
            </div>

            <div className="section-heading featured-heading"><div><div className="eyebrow">{t("curated")}</div><h2>{t("featured")}</h2></div><button className="text-button" onClick={() => setTab("discover")}>{t("exploreAll")} <ArrowRight size={15}/></button></div>
            <div className="scheme-grid">{SCHEMES.slice(0, 3).map(renderSchemeCard)}</div>
          </>}

          {tab === "profile" && <section className="page-section">
            <div className="page-title-row"><div><div className="eyebrow">{t("passport")}</div><h1>{t("profileTitle")}</h1><p>{t("profileText")}</p></div><span className="private-chip"><LockKeyhole size={14}/> {t("localProfile")}</span></div>
            <div className="form-layout">
              <div className="panel form-panel">
                <div className="form-section-title"><span>01</span><div><h2>{t("aboutYou")}</h2><p>{t("aboutYouText")}</p></div></div>
                <div className="form-grid">
                  <Field label={t("fullNameLabel")}><input placeholder={t("fullNameLabel")} value={profile.fullName} onChange={(e) => updateProfile("fullName", e.target.value)}/></Field>
                  <Field label={t("ageLabel")}><input type="number" min="0" max="120" placeholder={t("ageLabel")} value={profile.age} onChange={(e) => updateProfile("age", e.target.value === "" ? "" : Number(e.target.value))}/></Field>
                  <Field label={t("genderLabel")}><Select value={profile.gender} onChange={(v) => updateProfile("gender", v as CitizenProfile["gender"])}><option value="">{t("select")}</option><option value="woman">{t("woman")}</option><option value="man">{t("man")}</option><option value="other">{t("otherGender")}</option></Select></Field>
                  <Field label={t("stateLabel")}><Select value={profile.state} onChange={(v) => updateProfile("state", v)}><option value="">{t("chooseState")}</option>{STATES_AND_UTS.map((state) => <option key={state}>{state}</option>)}</Select></Field>
                  <Field label={t("districtLabel")}><input placeholder={t("districtLabel")} value={profile.district} onChange={(e) => updateProfile("district", e.target.value)}/></Field>
                  <Field label={t("residenceLabel")}><Select value={profile.residenceType} onChange={(v) => updateProfile("residenceType", v as CitizenProfile["residenceType"])}><option value="">{t("select")}</option><option value="rural">{t("rural")}</option><option value="urban">{t("urban")}</option></Select></Field>
                  <Field label={t("incomeLabel")} hint={t("incomeHint")}><input type="number" min="0" placeholder={t("incomeExample")} value={profile.annualIncome} onChange={(e) => updateProfile("annualIncome", e.target.value === "" ? "" : Number(e.target.value))}/></Field>
                  <Field label={t("occupationLabel")}><Select value={profile.occupation} onChange={(v) => updateProfile("occupation", v)}><option value="">{t("occupationSelect")}</option><option value="Farmer">{t("farmer")}</option><option value="Agricultural worker">{t("agriWorker")}</option><option value="Student">{t("student")}</option><option value="Self-employed">{t("selfEmployed")}</option><option value="Vendor">{t("vendor")}</option><option value="Salaried">{t("salaried")}</option><option value="Unemployed">{t("unemployed")}</option><option value="Homemaker">{t("homemaker")}</option><option value="Other">{t("other")}</option></Select></Field>
                </div>

                <div className="form-section-title subsection"><span>02</span><div><h2>{t("housing")}</h2><p>{t("housingText")}</p></div></div>
                <div className="form-grid">
                  <Field label={t("ownsHouse")}><YesNo t={t} value={profile.ownsPuccaHouse} onChange={(v) => updateProfile("ownsPuccaHouse", v)} unknown/></Field>
                  <Field label={t("govtHouse")}><Select value={profile.previousHousingBenefit} onChange={(v) => updateProfile("previousHousingBenefit", v as CitizenProfile["previousHousingBenefit"])}><option value="unknown">{t("notSure")}</option><option value="yes">{t("yes")}</option><option value="no">{t("no")}</option></Select></Field>
                  <Field label={t("lpg")}><YesNo t={t} value={profile.householdHasLpg} onChange={(v) => updateProfile("householdHasLpg", v)} unknown/></Field>
                  <Field label={t("poorDecl")}><YesNo t={t} value={profile.poorHouseholdDeclaration} onChange={(v) => updateProfile("poorHouseholdDeclaration", v)} unknown/></Field>
                </div>

                <div className="form-section-title subsection"><span>03</span><div><h2>{t("agri")}</h2><p>{t("agriText")}</p></div></div>
                <div className="form-grid">
                  <Field label={t("landRecords")}><YesNo t={t} value={profile.hasCultivableLand} onChange={(v) => updateProfile("hasCultivableLand", v)} unknown/></Field>
                  <Field label={t("kisanExclusion")}><Select value={profile.pmKisanExcluded} onChange={(v) => updateProfile("pmKisanExcluded", v as CitizenProfile["pmKisanExcluded"])}><option value="unknown">{t("notSure")}</option><option value="yes">{t("yes")}</option><option value="no">{t("noAfterReview")}</option></Select></Field>
                </div>

                <div className="form-section-title subsection"><span>04</span><div><h2>{t("education")}</h2><p>{t("educationText")}</p></div></div>
                <div className="form-grid">
                  <Field label={t("currentlyStudent")}><YesNo t={t} value={profile.isStudent} onChange={(v) => updateProfile("isStudent", Boolean(v))}/></Field>
                  <Field label={t("percentile")}><YesNo t={t} value={profile.top20Percentile} onChange={(v) => updateProfile("top20Percentile", v)} unknown/></Field>
                  <Field label={t("undergrad")}><YesNo t={t} value={profile.regularUndergraduate} onChange={(v) => updateProfile("regularUndergraduate", v)} unknown/></Field>
                  <Field label={t("scholarship")}><YesNo t={t} value={profile.otherScholarship} onChange={(v) => updateProfile("otherScholarship", v)} unknown/></Field>
                  <Field label={t("distanceCourse")}><YesNo t={t} value={profile.diplomaOrDistance} onChange={(v) => updateProfile("diplomaOrDistance", v)} unknown/></Field>
                </div>
                <div className="form-footer"><span><LockKeyhole size={14}/> {t("noAadhaarRequest")}</span><button className="button button-primary" onClick={() => { setNotice(t("saved")); runAssessment(); }}>{t("run")} <ArrowRight size={16}/></button></div>
              </div>
              <aside className="profile-aside">
                <div className="panel aside-card">
                  <div className="progress-ring" style={{ background: "#f6d6b8", border: "4px solid #c45a12" }}><div><strong>{progress}%</strong><small>{t("complete")}</small></div></div>
                  <h3>{t("profileReady")}</h3><p>{t("profileMoreComplete")}</p>
                </div>
                <div className="panel aside-card privacy-card"><ShieldCheck size={22}/><h3>{t("privacyTitle")}</h3><p>{t("privacyProfileText")}</p><span>{t("privacyBoundary")}</span></div>
              </aside>
            </div>
          </section>}

          {tab === "discover" && <section className="page-section">
            <div className="page-title-row"><div><div className="eyebrow">{t("intelligence")}</div><h1>{t("screening")}</h1><p>{t("assessmentHeading")}</p></div><button className="button button-primary" onClick={runAssessment} disabled={busy}>{busy ? <><span className="spinner"/> {t("working")}</> : <><Sparkles size={16}/>{t("run")}</>}</button></div>
            <div className="screening-summary">
              <div className="screen-summary-icon"><Activity size={20}/></div><div><strong>{assessments.length ? assessments.length + " " + t("assessedRecords") : t("assessmentReady")}</strong><p>{assessments.length ? t("assessedWorkflow") : t("completeProfileFirst")}</p></div><button className="text-button" onClick={() => setTab("profile")}>{t("editProfile")} <ArrowUpRight size={14}/></button>
            </div>
            {toolTrace.length > 0 && <div className="panel trace-panel">
              <div className="section-heading"><div><div className="eyebrow">{t("execution")}</div><h2>{t("agentActions")}</h2></div><span className="trace-count">{toolTrace.length} {t("toolSteps")}</span></div>
              <div className="trace-list">{toolTrace.map((item) => <div className="trace-row" key={item.id}><span className="trace-check"><Check size={13}/></span><div><strong>{item.agent}</strong><small>{item.tool} · {item.detail}</small></div><span className="trace-duration">{item.durationMs} ms</span></div>)}</div>
              <p className="trace-note">{t("agentTrace")}</p>
            </div>}
            <div className="full-catalogue-cta"><div><strong>{t("openSchemeList")}</strong><p>{t("coverageText")} <a href="https://github.com/PSP-YN/JanaSetu-AI/tree/main/extension" target="_blank" rel="noreferrer">{t("schemeAssistant")}</a> ({t("manualSubmit")})</p></div><a className="button button-primary" href="https://search.myscheme.gov.in/" target="_blank" rel="noreferrer">{t("mySchemeSearch")} <ExternalLink size={15}/></a></div>
            <div className="catalogue-controls">
              <div className="search-box"><Search size={17}/><input placeholder={t("search")} value={query} onChange={(e) => { setQuery(e.target.value); setOpenDataOffset(0); }}/>{query && <button onClick={() => setQuery("")}><X size={14}/></button>}</div>
              <label className="filter-select"><span>{t("category")}</span><select value={category} onChange={(e) => { setCategory(e.target.value); setOpenDataOffset(0); }}><option>{t("allCategories")}</option>{Array.from(new Set([...SCHEMES.map((item) => item.category), ...openDataSchemes.flatMap((item) => item.category.split(",").map((category) => category.trim()))])).filter(Boolean).sort().map((item) => <option key={item} value={item}>{categoryLabel(item)}</option>)}</select><ChevronDown size={14}/></label>
            </div>
            <div className="catalogue-head"><span>{activeResults.length} {t("displayed")} · {openDataTotal.toLocaleString("en-IN")} {t("openDataRows")} · {SCHEMES.filter((item) => item.catalogueStatus === "rule-screened").length} {t("ruleScreenedCount")}</span><span>{t("verifyRules")}</span></div>
            <div className="source-disclaimer"><CircleAlert size={16}/><p><strong>{t("datasetAttribution")}:</strong> SmartDuke Technologies, Indian Government Schemes Dataset 2026, CC BY 4.0. {t("snapshotDate")}: {new Date(snapshotMetadata.collectionDate + "T00:00:00Z").toLocaleDateString(({ en: "en-IN", hi: "hi-IN", kn: "kn-IN", ta: "ta-IN", te: "te-IN", ml: "ml-IN" } as const)[language], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}. {t("datasetMachineParsed")}</p>{openDataFreshness === "stale" && <p>{t("datasetFreshnessWarning")}</p>}</div>
            {openDataError && <div className="source-disclaimer"><CircleAlert size={16}/><p>{t("catalogueApiUnavailable")}</p></div>}
            {query && openDataSearchFallback && <div className="source-disclaimer"><CircleAlert size={16}/><p>{t("searchFallback")}</p></div>}
            {activeResults.length ? <div className="scheme-grid">{activeResults.map(renderSchemeCard)}</div> : <div className="empty-state"><Search size={28}/><h3>{t("noSchemes")}</h3><p>{t("tryKeyword")}</p><button className="text-button" onClick={() => { setQuery(""); setCategory("All categories"); }}>{t("clearFilters")}</button></div>}
            {openDataNext !== null && <div className="catalogue-load-more"><button className="button button-secondary" disabled={openDataLoading} onClick={() => setOpenDataOffset(openDataNext)}>{openDataLoading ? <><span className="spinner"/> {t("loading")}</> : t("next50")}</button><small>{t("datasetPaginated")}</small></div>}
            {assessments.length === 0 && <div className="empty-guidance"><CircleAlert size={17}/><span>{t("notPersonalized")}</span></div>}
          </section>}

          {tab === "documents" && <section className="page-section">
            <div className="page-title-row"><div><div className="eyebrow">{t("evidenceOrganizer")}</div><h1>{t("documentsTitle")}</h1><p>{t("documentsText")}</p></div><span className="private-chip"><LockKeyhole size={14}/> {t("metadataOnly")}</span></div>
            <div className="document-layout">
              <div className="panel upload-panel">
                <div className="upload-illustration"><Upload size={27}/></div><h2>{t("addDocumentReference")}</h2><p>{t("documentUploadText")}</p>
                <label className="button button-primary upload-button"><Upload size={16}/> {t("chooseFile")}<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(e) => addDocument(e.target.files?.[0])}/></label>
                <div className="upload-limits"><span>{t("fileTypes")}</span><span>{t("max12MB")}</span></div>
              </div>
              <div className="panel document-list-panel">
                <div className="section-heading"><div><div className="eyebrow">{t("yourRecords")}</div><h2>{documents.length} {t("schemeRecords")}</h2></div><span className="section-index">{t("localLabel")}</span></div>
                {documents.length === 0 ? <div className="empty-state compact"><FileText size={26}/><h3>{t("noDocumentRefs")}</h3><p>{t("checklistAppears")}</p></div> : <div className="document-list">{documents.map((doc) => <div className="document-row" key={doc.id}><div className="file-icon"><FileText size={19}/></div><div className="document-info"><strong>{doc.name}</strong><small>{doc.type} · {(doc.size / 1024).toFixed(0)} KB · {t("addedLabel")} {shortDate(doc.addedAt, language)}</small><em>{t("manualVerificationPending")}</em></div><button className="icon-button" onClick={async () => { await deleteLocalDocument(doc.id).catch(() => undefined); setDocuments((current) => current.filter((item) => item.id !== doc.id)); }} aria-label={t("removeDocumentReference")}><X size={16}/></button></div>)}</div>}
              </div>
            </div>
            <div className="empty-guidance"><ShieldCheck size={17}/><span>{t("securityDocs")}</span></div>
          </section>}

          {tab === "applications" && <section className="page-section">
            <div className="page-title-row"><div><div className="eyebrow">{t("applicationLifecycle")}</div><h1>{t("applicationsTitle")}</h1><p>{t("applicationsText")}</p></div><div className="private-chip"><ClipboardCheck size={14}/> {applications.length} {t("savedDrafts")}</div></div>
            {applications.length === 0 ? <div className="panel empty-large"><div className="empty-state"><ClipboardCheck size={32}/><h3>{t("noDrafts")}</h3><p>{t("createDraftHelp")}</p><button className="button button-primary" onClick={() => setTab("discover")}>{t("findBenefits")} <ArrowRight size={15}/></button></div></div> :
              <div className="application-list">{applications.map((application) => <article className="panel application-card" key={application.id}><div className="application-top"><div className="application-icon"><FileCheck2 size={20}/></div><div><span className="draft-label">{t("preparationDraft")}</span><h3>{application.schemeName}</h3><p>{application.id} · {t("createdLabel")} {shortDate(application.createdAt, language)}</p></div><span className="status-pill neutral">{t("notSubmitted")}</span></div><div className="application-meta"><div><small>{t("applicant")}</small><strong>{application.citizenName}</strong></div><div><small>{t("location")}</small><strong>{application.district}, {application.state}</strong></div><div><small>{t("openChecks")}</small><strong>{application.schemeReviewStatus === "missing" ? t("schemeUnavailable") : application.schemeReviewStatus !== "approved" ? t("schemeApprovalPending") : application.assessmentState === "needs_verification" ? t("officialVerificationRequired") : application.missingChecks.length + " " + t("requireReview")}</strong></div></div><p className="application-status-note">{t("pendingDraftDisclaimer")}</p>
                <div className="draft-field-toolbar">
                  <button className="text-button" onClick={() => setExpandedApplication(expandedApplication === application.id ? "" : application.id)}>
                    {expandedApplication === application.id ? t("hidePreparedFields") : t("reviewPreparedFields")} <ChevronDown size={14}/>
                  </button>
                  {application.reviewedAt
                    ? <span className="reviewed-label"><CheckCircle2 size={13}/> {t("citizenReviewRecorded")} · {shortDate(application.reviewedAt, language)}</span>
                    : <button className="button button-small button-outline" onClick={() => setApplications((current) => current.map((item) => item.id === application.id ? { ...item, reviewedAt: new Date().toISOString(), status: "Reviewed by citizen — not submitted" } : item))}>{t("markReviewed")}</button>}
                </div>
                {expandedApplication === application.id && <div className="draft-field-grid">
                  {(application.fields || []).map((field) => <div className="draft-field" key={field.key}>
                    <span>{field.label}</span><strong>{field.value || t("notProvided")}</strong>
                    <small>{field.source} · {field.status === "provided" ? t("provided") : t("needsInformation")}</small>
                  </div>)}
                  <p className="draft-field-note">{t("draftFieldNote")}</p>
                </div>}
                <p className="application-disclaimer"><CircleAlert size={15}/>{t("draftNotSubmittedDisclaimer")}</p><div className="application-actions"><a className="text-button" href={application.sourceUrl} target="_blank" rel="noreferrer">{t("openOfficialSource")} <ArrowUpRight size={14}/></a><button className="button button-small button-outline" onClick={() => addFollowup(application)}><CalendarClock size={14}/> {t("addFollowup")}</button><button className="text-button danger-text" onClick={() => setApplications((current) => current.filter((item) => item.id !== application.id))}>{t("remove")}</button></div></article>)}</div>}
            {tasks.length > 0 && <div className="panel followup-panel"><div className="section-heading"><div><div className="eyebrow">{t("followupMemory")}</div><h2>{t("upcomingActions")}</h2></div><span className="trace-count">{tasks.length} {t("reminderPlural")}</span></div>{tasks.map((task) => <div className="task-row" key={task.id}><div className="task-date"><CalendarClock size={17}/></div><div><strong>{task.title}</strong><small>{t("followupDate")}: {shortDate(task.dueAt, language)} · {task.note}</small></div><button className="text-button" onClick={() => setTasks((current) => current.filter((item) => item.id !== task.id))}>{t("done")}</button></div>)}</div>}
          </section>}

          {tab === "about" && <section className="page-section">
            <div className="page-title-row"><div><div className="eyebrow">{t("ourApproach")}</div><h1>{t("aboutTitle")}</h1><p>{t("aboutDescription")}</p></div></div>
            <div className="about-grid">
              <article className="panel about-card"><div className="about-icon"><Search size={19}/></div><h2>{t("discoverTitle")}</h2><p>{t("aboutDiscoverText")}</p></article>
              <article className="panel about-card"><div className="about-icon"><ShieldCheck size={19}/></div><h2>{t("explainTitle")}</h2><p>{t("aboutExplainText")}</p></article>
              <article className="panel about-card"><div className="about-icon"><FileCheck2 size={19}/></div><h2>{t("prepareTitle")}</h2><p>{t("aboutPrepareText")}</p></article>
              <article className="panel about-card"><div className="about-icon"><CalendarClock size={19}/></div><h2>{t("rememberTitle")}</h2><p>{t("aboutRememberText")}</p></article>
            </div>
            <div className="panel source-panel"><div className="section-heading"><div><div className="eyebrow">{t("dataTransparency")}</div><h2>{t("currentCatalogue")}</h2></div><span className="trace-count">{SCHEMES.length} built-in records</span></div>
              {SCHEMES.map((scheme) => <div className="source-row" key={scheme.id}><div><strong>{scheme.name}</strong><small>{scheme.sourcePeriod}</small></div><a href={scheme.sourceUrl} target="_blank" rel="noreferrer">{t("officialSource")} <ArrowUpRight size={14}/></a></div>)}
              <div className="source-disclaimer"><CircleAlert size={16}/><p><strong>{t("coverageHonesty")}:</strong> {SCHEMES.length} {t("builtIn")} · {t("coverageText")}</p></div>
            </div>
            <div className="panel responsible-panel"><h2>{t("responsibleBoundary")}</h2><p>{t("responsibleUseText")}</p><div className="responsible-links"><a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer">myScheme <ArrowUpRight size={13}/></a><a href="https://web.umang.gov.in/" target="_blank" rel="noreferrer">UMANG <ArrowUpRight size={13}/></a><a href="https://locator.csccloud.in/" target="_blank" rel="noreferrer">{t("cscLocator")} <ArrowUpRight size={13}/></a></div></div>
          </section>}

          <footer className="page-footer"><span>© 2026 JanaSetu · {t("footerText")}</span><span><ShieldCheck size={13}/> {t("evidenceLed")}</span></footer>
        </div>
      </main>
      {notice && <div className="toast" role="status"><CheckCircle2 size={17}/><span>{notice}</span><button onClick={() => setNotice("")} aria-label={t("dismiss")}><X size={15}/></button></div>}
      {showMobileNav && <button className="nav-backdrop" onClick={() => setShowMobileNav(false)} aria-label={t("closeNav")}/>}
    </div>
  );
}
