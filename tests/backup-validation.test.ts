import test from "node:test";
import assert from "node:assert/strict";
import { parseBackupApplications, parseBackupAssessments, parseBackupDocuments, parseBackupLanguage, parseBackupProfile, parseBackupTasks } from "../lib/backup-validation";
import { SCHEMES } from "../lib/catalog";

const validProfile = { fullName: "Synthetic Citizen", state: "Karnataka", district: "Mysuru" };

test("backup profile parser rejects extra fields, unknown State/UT and invalid types", () => {
  assert.equal(parseBackupProfile({ ...validProfile, state: "Atlantis" }), null);
  assert.equal(parseBackupProfile({ ...validProfile, aadhaar: "1234" }), null);
  assert.equal(parseBackupProfile({ ...validProfile, age: "thirty" }), null);
  assert.equal(parseBackupProfile(validProfile)?.state, "Karnataka");
});

test("backup language falls back safely to English for unknown locale values", () => {
  assert.equal(parseBackupLanguage("kn"), "kn");
  assert.equal(parseBackupLanguage("xx"), "en");
});

test("backup documents strip path components and enforce the metadata-only size limit", () => {
  const docs = parseBackupDocuments([
    { id: "DOC-1", name: "../../proof.pdf", type: "application/pdf", size: 100, addedAt: "2026-11-03T00:00:00Z", status: "uploaded" },
    { id: "DOC-2", name: "too-large.pdf", type: "application/pdf", size: 13 * 1024 * 1024, addedAt: "2026-11-03T00:00:00Z" },
    { id: "DOC-3", name: { bad: true }, type: "image/png", size: 10, addedAt: "2026-11-03T00:00:00Z" }
  ]);
  assert.equal(docs.length, 1);
  assert.equal(docs[0].name, "proof.pdf");
  assert.match(docs[0].status, /manual verification pending/i);
});

test("backup tasks discard malformed objects and normalize to open reminder state", () => {
  const tasks = parseBackupTasks([{ id: "task-1", title: "Follow up", dueAt: "2026-11-10", note: "Check portal", status: "done" }, { id: "task-2", title: {}, dueAt: "bad", note: "" }]);
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].status, "open");
});

test("backup application imports ignore untrusted source URLs and review flags", () => {
  const scheme = SCHEMES[0];
  const apps = parseBackupApplications([{ id: "JS-20261103-ABCDE", schemeId: scheme.id, schemeName: "Spoof", citizenName: "Synthetic Citizen", state: "Karnataka", district: "Mysuru", status: "Reviewed", reviewRequired: false, sourceUrl: "javascript:alert(1)", createdAt: "2026-11-03T00:00:00Z", reviewedAt: "2026-11-03T00:00:00Z" }]);
  assert.equal(apps.length, 1);
  assert.equal(apps[0].sourceUrl, scheme.sourceUrl);
  assert.equal(apps[0].schemeReviewStatus, scheme.reviewStatus);
  assert.equal(apps[0].reviewRequired, true);
  assert.equal(apps[0].reviewedAt, null);
});

test("backup assessments always require a fresh evaluation after restore", () => {
  const assessment = parseBackupAssessments([{ schemeId: "pm-kisan", state: "potential_match", headline: "Old match", explanation: "Old", checks: [], nextActions: [], schemeReviewStatusAtAssessment: "approved" }]);
  assert.equal(assessment.length, 1);
  assert.equal(assessment[0].schemeReviewStatusAtAssessment, "pending");
});


test("trusted localStorage hydration preserves approved scheme snapshots and citizen review markers", () => {
  const scheme = SCHEMES[0];
  const previousStatus = scheme.reviewStatus;
  scheme.reviewStatus = "approved";
  try {
    const applicationRecord = {
      id: "JS-20261103-ABCDE", schemeId: scheme.id, schemeName: scheme.name,
      citizenName: "Synthetic Citizen", state: "Karnataka", district: "Mysuru",
      reviewRequired: false, createdAt: "2026-11-03T00:00:00Z", reviewedAt: "2026-11-03T01:00:00Z"
    };
    const untrustedImport = parseBackupApplications([applicationRecord]);
    const trustedLocal = parseBackupApplications([applicationRecord], { trustLocalStorage: true });
    assert.equal(untrustedImport[0].reviewRequired, true);
    assert.equal(untrustedImport[0].reviewedAt, null);
    assert.equal(trustedLocal[0].reviewRequired, false);
    assert.equal(trustedLocal[0].reviewedAt, "2026-11-03T01:00:00.000Z");

    const assessmentRecord = {
      schemeId: scheme.id, state: "potential_match", headline: "Previous result",
      explanation: "Synthetic local assessment", checks: [], nextActions: [],
      schemeReviewStatusAtAssessment: "approved"
    };
    assert.equal(parseBackupAssessments([assessmentRecord])[0].schemeReviewStatusAtAssessment, "pending");
    assert.equal(parseBackupAssessments([assessmentRecord], { trustLocalStorage: true })[0].schemeReviewStatusAtAssessment, "approved");
  } finally {
    scheme.reviewStatus = previousStatus;
  }
});
