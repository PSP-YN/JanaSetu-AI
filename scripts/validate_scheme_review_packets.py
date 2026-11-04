#!/usr/bin/env python3
"""Fail CI if any of the four scheme packets accidentally looks approved or incomplete."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {"pm-kisan", "pmay-u-2", "pm-ujjwala", "pm-usp-csss"}
files = list((ROOT / "docs/scheme-reviews").glob("*.json"))
found = set()
for path in files:
    packet = json.loads(path.read_text("utf-8"))
    scheme = packet.get("schemeId")
    if scheme not in EXPECTED: continue
    found.add(scheme)
    assert packet.get("schemaVersion") == 2, f"{scheme}: unexpected packet schema"
    assert packet.get("reviewStatus") == "pending", f"{scheme}: approval must remain pending"
    assert packet.get("sourceReviewStatus") == "partial_current_source_review_not_approval", f"{scheme}: source review overclaimed"
    assert packet.get("sourceEvidence") and len(packet["sourceEvidence"]) >= 2, f"{scheme}: insufficient evidence references"
    assert packet.get("eligibilityMatrix") and len(packet["eligibilityMatrix"]) >= 4, f"{scheme}: missing eligibility matrix"
    assert packet.get("boundaryTests") and len(packet["boundaryTests"]) >= 5, f"{scheme}: insufficient proposed boundary tests"
    assert all(test.get("reviewFixtureStatus") == "proposed_not_executed" and test.get("executionEvidence") is None for test in packet["boundaryTests"]), f"{scheme}: proposed tests incorrectly marked executed"
    reviewers = packet.get("reviewers") or []
    assert len(reviewers) == 2, f"{scheme}: two reviewer roles required"
    assert {reviewer.get("role") for reviewer in reviewers} == {"independent_source_reviewer", "independent_rule_reviewer"}, f"{scheme}: reviewer roles are not independent"
    assert all(reviewer.get("name") is None and reviewer.get("decision") == "pending" and reviewer.get("reviewedAt") is None and not reviewer.get("evidence") for reviewer in reviewers), f"{scheme}: reviewer slots must remain blank pending human sign-off"
    assert "AI-assisted" in packet.get("approvalNote", ""), f"{scheme}: missing AI-not-approval boundary"
assert found == EXPECTED, f"Missing packets: {sorted(EXPECTED - found)}"
print(f"Validated {len(found)} independent-review packets: all pending, two distinct blank human reviewers each.")
