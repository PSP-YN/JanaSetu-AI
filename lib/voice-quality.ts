export type VoiceLanguage = "english" | "hindi" | "kannada" | "tamil" | "telugu" | "malayalam";

const expectedScript: Record<VoiceLanguage, RegExp> = {
  english: /\p{Script=Latin}/u,
  hindi: /\p{Script=Devanagari}/u,
  kannada: /\p{Script=Kannada}/u,
  tamil: /\p{Script=Tamil}/u,
  telugu: /\p{Script=Telugu}/u,
  malayalam: /\p{Script=Malayalam}/u
};

export function validateVoiceTranscript(value: string, language: VoiceLanguage):
  | { ok: true; transcript: string }
  | { ok: false; reason: string } {
  const transcript = value.replace(/\s+/g, " ").trim();
  if (!transcript) return { ok: false, reason: "No speech was recognised. Try again or type your answer." };

  const letters = Array.from(transcript).filter((character) => /\p{L}/u.test(character));
  if (letters.length < 2) return { ok: false, reason: "The transcript was too short to verify. Try again or type your answer." };
  const matchingLetters = letters.filter((character) => expectedScript[language].test(character)).length;
  if (matchingLetters / letters.length < 0.65) {
    return { ok: false, reason: "The speech model returned a different writing system for the selected language. Try browser speech or type your answer." };
  }

  const words = transcript.toLocaleLowerCase().match(/\p{L}+/gu) ?? [];
  if (words.length >= 10) {
    const frequencies = new Map<string, number>();
    for (const word of words) frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
    const mostRepeated = Math.max(...frequencies.values());
    if (mostRepeated / words.length > 0.35) {
      return { ok: false, reason: "The speech model returned repetitive text. Try again in a quieter place or type your answer." };
    }
  }

  return { ok: true, transcript };
}
