import { STATES_AND_UTS, type CitizenProfile } from "./catalog";

const STATE_ALIASES: Record<string, string[]> = {
  "Karnataka": ["ಕರ್ನಾಟಕ", "कर्नाटक", "கா்நாடகா"],
  "Tamil Nadu": ["தமிழ்நாடு", "तमिलनाडु"],
  "Kerala": ["കേരളം", "केरल", "கேரளா"],
  "Andhra Pradesh": ["ఆంధ్రప్రదేశ్", "आंध्र प्रदेश"],
  "Telangana": ["తెలంగాణ", "तेलंगाना"],
  "Maharashtra": ["महाराष्ट्र", "மகாராஷ்டிரா"],
  "Uttar Pradesh": ["उत्तर प्रदेश"],
  "Madhya Pradesh": ["मध्य प्रदेश"],
  "West Bengal": ["পশ্চিমবঙ্গ", "पश्चिम बंगाल"],
  "Gujarat": ["ગુજરાત", "गुजरात"],
  "Rajasthan": ["राजस्थान"],
  "Bihar": ["बिहार"],
  "Odisha": ["ଓଡ଼ିଶା", "ओडिशा"],
  "Punjab": ["ਪੰਜਾਬ", "पंजाब"],
  "Haryana": ["हरियाणा"],
  "Assam": ["অসম", "असम"],
  "Goa": ["गोवा"],
  "Delhi": ["दिल्ली", "டெல்லி"],
  "Jharkhand": ["झारखंड"],
  "Chhattisgarh": ["छत्तीसगढ़"],
  "Uttarakhand": ["उत्तराखंड"],
  "Himachal Pradesh": ["हिमाचल प्रदेश"],
  "Tripura": ["ত্রিপুরা"],
  "Manipur": ["মণিপুর"],
  "Meghalaya": ["मेघालय"],
  "Mizoram": ["मिजोरम"],
  "Nagaland": ["नागालैंड"],
  "Sikkim": ["सिक्किम"],
  "Arunachal Pradesh": ["अरुणाचल प्रदेश"],
  "Jammu and Kashmir": ["जम्मू और कश्मीर", "जम्मू कश्मीर"],
  "Ladakh": ["लद्दाख"],
  "Puducherry": ["புதுச்சேரி", "पुडुचेरी"],
  "Chandigarh": ["चंडीगढ़"],
  "Andaman and Nicobar Islands": ["अंडमान और निकोबार"],
  "Lakshadweep": ["लक्षद्वीप"]
};

export interface IntakeResult {
  updates: Partial<CitizenProfile>;
  recognizedFields: string[];
  followUpQuestions: string[];
  note: string;
}

function has(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term.toLowerCase()));
}

function parseIncome(text: string): number | undefined {
  const lakhMatch = text.match(/(?:₹|rs\.?\s*)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(?:lakh|lac|लाख|லட்சம்|లక్ష(?:లు)?|ಲಕ್ಷ|ലಕ್ಷം)/i);
  if (lakhMatch) {
    const value = Number(lakhMatch[1].replace(/,/g, ""));
    if (Number.isFinite(value) && value >= 0 && value <= 1000) return Math.round(value * 100000);
  }
  const amountMatch = text.match(/(?:annual\s+(?:household\s+)?income|yearly\s+income|वार्षिक\s*आय|सालाना\s*आय|வருட\s*வருமானம்|ವಾರ್ಷಿಕ\s*ಆದಾಯ|వార్షిక\s*ఆదాయం|വാർഷിക\s*വരുമാനം)[^0-9]{0,24}([0-9][0-9,]{2,})/i);
  if (amountMatch) {
    const value = Number(amountMatch[1].replace(/,/g, ""));
    if (Number.isFinite(value) && value >= 0 && value <= 100000000) return value;
  }
  return undefined;
}

export function parseCitizenMessage(message: string): IntakeResult {
  const text = message.normalize("NFC").toLowerCase();
  const updates: Partial<CitizenProfile> = {};
  const recognizedFields: string[] = [];
  const followUpQuestions: string[] = [];

  const ageMatch = text.match(/(?:^|\D)(\d{1,3})\s*(?:years?\s*old|years?|yrs?|साल|वर्ष|வயது|ವಯಸ್ಸು|సంవత్సరాలు|వయసు|വയസ്സ്)/i);
  if (ageMatch) {
    const age = Number(ageMatch[1]);
    if (age >= 0 && age <= 120) { updates.age = age; recognizedFields.push("Age"); }
  }

  const income = parseIncome(text);
  if (income !== undefined) { updates.annualIncome = income; recognizedFields.push("Annual household income"); }

  const state = STATES_AND_UTS.find((item) => text.includes(item.toLowerCase())) ||
    Object.entries(STATE_ALIASES).find(([, aliases]) => aliases.some((alias) => text.includes(alias.toLowerCase())))?.[0];
  if (state) { updates.state = state; recognizedFields.push("State / Union Territory"); }

  if (has(text, ["woman", "female", "महिला", "स्त्री", "பெண்", "ಮಹಿಳೆ", "స్త్రీ", "സ്ത്രീ", "பெண்மணி"])) {
    updates.gender = "woman"; recognizedFields.push("Gender");
  } else if (has(text, ["man", "male", "पुरुष", "ஆண்", "ಪುರುಷ", "పురుషుడు", "പുരുഷൻ"])) {
    updates.gender = "man"; recognizedFields.push("Gender");
  }

  if (has(text, ["farmer", "agriculture", "किसान", "कृषक", "விவசாயி", "ರೈತ", "రైతు", "കർഷകൻ"])) {
    updates.occupation = "Farmer"; recognizedFields.push("Occupation");
  } else if (has(text, ["student", "विद्यार्थी", "छात्र", "மாணவர்", "ವಿದ್ಯಾರ್ಥಿ", "విద్యార్థి", "വിദ്യാർത്ഥി"])) {
    updates.occupation = "Student"; updates.isStudent = true; recognizedFields.push("Occupation", "Student status");
  }

  if (has(text, ["rural", "village", "ग्रामीण", "गांव", "கிராமம்", "ಗ್ರಾಮೀಣ", "గ్రామీణ", "ഗ്രാമം"])) {
    updates.residenceType = "rural"; recognizedFields.push("Area of residence");
  } else if (has(text, ["urban", "city", "शहरी", "शहर", "நகரம்", "ನಗರ", "పట్టణ", "നഗരം"])) {
    updates.residenceType = "urban"; recognizedFields.push("Area of residence");
  }

  if (has(text, ["cultivable land", "land in my name", "own farmland", "खेती की जमीन", "कृषि भूमि", "விவசாய நிலம்", "ಕೃಷಿ ಭೂಮಿ", "వ్యవసాయ భూమి", "കൃഷിഭൂമി"])) {
    updates.hasCultivableLand = !has(text, ["no land", "भूमि नहीं", "நிலம் இல்லை", "ಭೂಮಿ ಇಲ್ಲ", "భూమి లేదు", "ഭൂമിയില്ല"]);
    recognizedFields.push("Cultivable land (self-declared)");
  }

  if (has(text, ["no lpg", "no gas connection", "without lpg", "एलपीजी नहीं", "गैस कनेक्शन नहीं", "எரிவாயு இணைப்பு இல்லை", "ಗ್ಯಾಸ್ ಸಂಪರ್ಕ ಇಲ್ಲ", "గ్యాస్ కనెక్షన్ లేదు", "ഗ്യാസ് കണക്ഷൻ ഇല്ല"])) {
    updates.householdHasLpg = false; recognizedFields.push("Household LPG (self-declared)");
  } else if (has(text, ["has lpg", "lpg connection", "gas connection", "एलपीजी कनेक्शन", "எரிவாயு இணைப்பு", "ಗ್ಯಾಸ್ ಸಂಪರ್ಕ", "గ్యాస్ కనెక్షన్", "ഗ്യാസ് കണക്ഷൻ"])) {
    updates.householdHasLpg = true; recognizedFields.push("Household LPG (self-declared)");
  }

  if (recognizedFields.length === 0) {
    followUpQuestions.push("Which State or Union Territory do you live in?");
    followUpQuestions.push("What is your approximate annual household income?");
    followUpQuestions.push("What is your occupation and area of residence (rural or urban)?");
  } else {
    if (updates.state === undefined) followUpQuestions.push("Which State or Union Territory do you live in?");
    if (updates.annualIncome === undefined) followUpQuestions.push("What is your approximate annual household income?");
    if (updates.age === undefined) followUpQuestions.push("What is your age, if relevant to the benefit you want to explore?");
  }

  return {
    updates,
    recognizedFields: Array.from(new Set(recognizedFields)),
    followUpQuestions,
    note: "These are suggested profile fields extracted from your message. Review every value before running an eligibility assessment. This is not an official eligibility decision."
  };
}
