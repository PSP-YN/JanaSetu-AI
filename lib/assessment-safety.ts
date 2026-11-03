import { SCHEMES, type Assessment, type Scheme } from "./catalog";

export function invalidateUnapprovedAssessments(value: unknown, schemes: Scheme[] = SCHEMES): Assessment[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Assessment => Boolean(item && typeof item === "object" && typeof item.schemeId === "string"))
    .map((item) => {
      const scheme = schemes.find((entry) => entry.id === item.schemeId);
      const approvalChanged = !scheme || scheme.reviewStatus !== "approved" || item.schemeReviewStatusAtAssessment !== "approved";
      if (!approvalChanged) return item;
      const missingScheme = !scheme;
      const pendingApproval = Boolean(scheme && scheme.reviewStatus !== "approved");
      return {
        ...item,
        schemeReviewStatusAtAssessment: scheme?.reviewStatus ?? "pending",
        state: "needs_verification" as const,
        headline: missingScheme ? "Scheme no longer in the current catalogue" : pendingApproval ? "Human review pending" : "Scheme approval changed — re-run assessment",
        explanation: missingScheme
          ? "This saved result refers to a scheme that is no longer in the current catalogue. Its earlier result is invalidated; verify the scheme and current rules with the official department."
          : pendingApproval
            ? "This saved result predates or conflicts with the current scheme approval state. Its earlier match result has been invalidated. Do not treat it as an eligibility decision."
            : "This saved result was created before the scheme's current approval state was recorded. Re-run the assessment against the approved current rule set before acting.",
        checks: [],
        nextActions: missingScheme
          ? ["Open the official scheme source and confirm it is still active.", "Do not rely on this saved assessment."]
          : pendingApproval
            ? ["Wait for two independent source and rule approvals.", "Verify current conditions with the official department."]
            : ["Re-run the assessment using the current approved scheme rules.", "Verify current conditions with the official department."]
      };
    });
}

export type StoredApplicationReview = {
  schemeId: string;
  reviewRequired: boolean;
  schemeReviewStatus?: "pending" | "approved" | "missing";
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
      if (!scheme) {
        return {
          ...item,
          reviewRequired: true,
          schemeReviewStatus: "missing" as const,
          assessmentState: "needs_verification" as const,
          status: "Scheme no longer in the current catalogue — verify manually",
          reviewedAt: null
        };
      }
      if (scheme.reviewStatus !== "approved") {
        return {
          ...item,
          reviewRequired: true,
          schemeReviewStatus: "pending" as const,
          assessmentState: "needs_verification" as const,
          status: "Scheme review pending — not an eligibility result",
          reviewedAt: null
        };
      }
      return { ...item, schemeReviewStatus: "approved" as const };
    });
}
