import type { CitizenProfile, LanguageCode } from "./catalog";
import { parseCitizenProfile } from "./profile-validation";

export type FormAssistantBackup = {
  app: "JanaSetu";
  schemaVersion: 1;
  exportedAt: string;
  language: LanguageCode;
  profile: CitizenProfile;
};

export function buildFormAssistantBackup(
  value: unknown,
  language: LanguageCode,
  exportedAt = new Date().toISOString()
): FormAssistantBackup {
  const profile = parseCitizenProfile(value);
  if (!profile) throw new Error("The citizen profile is invalid. Review it before exporting.");
  return { app: "JanaSetu", schemaVersion: 1, exportedAt, language, profile };
}
