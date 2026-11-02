import { SCHEMES, type Assessment, type Scheme } from "./catalog";

export function invalidateUnapprovedAssessments(value: unknown, schemes: Scheme[] = SCHEMES): Assessment[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Assessment => Boolean(item && typeof item === "object" && typeof item.schemeId === "string"))
    .map((item) => {
      const scheme = schemes.find((entry) => entry.id === item.schemeId);
      if (!scheme || scheme.reviewStatus === "approved") return item;
      return {
        ...item,
        state: "needs_verification" as const,
        headline: "Human review pending",
        explanation: "This saved result predates the current scheme approval state. Its earlier match result has been invalidated. Do not treat it as an eligibility decision.",
        checks: [],
        nextActions: ["Wait for two independent source and rule approvals.", "Verify current conditions with the official department."]
      };
    });
}

export type StoredApplicationReview = {
  schemeId: string;
  reviewRequired: boolean;
  assessmentState?: Assessment["state"];
  status: string;
  reviewedAt?: string | null;
};

export function invalidateUnapprovedApplications<T extends StoredApplicationReview>(
  value: unknown,
  schemes: Scheme[] = SCHEMES
): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is T => Boolean(item && typeof item === "object" && typeof item.schemeId === "string"))
    .map((item) => {
      const scheme = schemes.find((entry) => entry.id === item.schemeId);
      if (!scheme || scheme.reviewStatus === "approved") return item;
      return {
        ...item,
        reviewRequired: true,
        assessmentState: "needs_verification" as const,
        status: "Scheme review pending — not an eligibility result",
        reviewedAt: null
      };
    });
}
