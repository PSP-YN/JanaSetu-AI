import test from "node:test";
import assert from "node:assert/strict";
import { validateVoiceTranscript } from "@/lib/voice-quality";

test("voice transcript guard accepts the selected language script", () => {
  for (const [language, transcript] of [
    ["english", "I am a farmer"],
    ["hindi", "मैं कर्नाटक में किसान हूँ"],
    ["kannada", "ನಾನು ಕರ್ನಾಟಕದ ರೈತ"],
    ["tamil", "நான் கர்நாடகாவில் விவசாயி"],
    ["telugu", "నేను కర్ణాటకలో రైతును"],
    ["malayalam", "ഞാൻ കർണാടകയിലെ കർഷകനാണ്"]
  ] as const) {
    assert.equal(validateVoiceTranscript(transcript, language).ok, true, language);
  }
});

test("voice transcript guard rejects cross-script output and repetitive decoding loops", () => {
  const wrongScript = validateVoiceTranscript("यह पर वो वो वो वो वो", "kannada");
  assert.equal(wrongScript.ok, false);
  if (!wrongScript.ok) assert.match(wrongScript.reason, /different writing system/);

  const loop = validateVoiceTranscript("യാർ യാർ യാർ യാർ യാർ യാർ യാർ യാർ യാർ യാർ യാർ യാർ", "malayalam");
  assert.equal(loop.ok, false);
  if (!loop.ok) assert.match(loop.reason, /repetitive text/);
});
