#!/usr/bin/env python3
"""Fail CI if any of the four scheme packets accidentally looks approved or incomplete."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {"pm-kisan", "pmay-u-2", "pm-ujjwala", "pm-usp-csss"}
files = list((ROOT / "docs/scheme-reviews").glob("*.json"))
packets = {}

for path in files:
    packet = json.loads(path.read_text("utf-8"))
    scheme = packet.get("schemeId")
    if scheme not in EXPECTED:
        continue
    assert scheme not in packets, f"{scheme}: duplicate review packet"
    packets[scheme] = packet
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

assert set(packets) == EXPECTED, f"Missing packets: {sorted(EXPECTED - set(packets))}"

csss_facts = [
    str(fact)
    for evidence in packets["pm-usp-csss"].get("sourceEvidence", [])
    for fact in evidence.get("facts", [])
]
csss_l2_date_facts = [fact for fact in csss_facts if "30.11.2026" in fact]
assert csss_l2_date_facts, "CSSS L2 verification date must remain documented"
assert all(
    re.search(r"\bL2\b.*verification|verification.*\bL2\b", fact, re.IGNORECASE)
    for fact in csss_l2_date_facts
), "Every CSSS fact mentioning 30.11.2026 must label it as L2 verification"

pmuy_facts = " ".join(str(fact) for evidence in packets["pm-ujjwala"].get("sourceEvidence", []) for fact in evidence.get("facts", []))
assert "₹2,050" in pmuy_facts and "₹1,600" in pmuy_facts and "5 kg amount" in pmuy_facts, "PMUY connection-assistance details must remain documented"
pmay_facts = json.dumps(packets["pmay-u-2"].get("sourceEvidence", []), ensure_ascii=False)
assert "39-page PDF" in pmay_facts and "Aadhaar OTP" in pmay_facts, "Full AHP SOP review findings must remain in the packet"
pmk_facts = " ".join(str(fact) for evidence in packets["pm-kisan"].get("sourceEvidence", []) for fact in evidence.get("facts", []))
assert "2030–31" in pmk_facts and "24th instalment" in pmk_facts, "PM-KISAN continuation and latest portal notice must remain in the packet"

print(f"Validated {len(packets)} independent-review packets: all pending, two distinct blank human reviewers each.")
