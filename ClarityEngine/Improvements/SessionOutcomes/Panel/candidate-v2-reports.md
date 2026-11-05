# Recorded workflow execution: ten cases

This is a bounded execution of the supplied ReadabilityGate and Verify workflows using synthetic recorded results, not a live reviewer-performance test. Only those workflows and panel-cases-v2.md were read. No reviewers or measurement tools were launched. Missing/empty results already include the permitted retry. The fixture's request for eight reports is superseded by its added C9 and C10 and the explicit ten-case task.

## Common bookkeeping and handoff

Each case has a logical current-round panel manifest for artifact v2. Planned and completed reviewers are recorded separately below. Completed means the fixture establishes a non-empty report attributable to v2; paths and RC identifiers were not supplied and are not invented. This aggregate file records the simulated manifests and final reports; it does not claim that actual lens files or per-case folders were created.

For C1–C7 and C9, planned panel P = Reader, Cutter, Navigator, AudienceFit. For C8 and C10, planned panel P2 = Reader-approver, Reader-operator, Cutter, Navigator, AudienceFit. Skim Reader, Logician and Visual are intentional short-form/nonvisual exclusions, not missing reviewers. Their RCs are “not in panel.” Applicable RC checks reported by current completed reviewers are PASS unless a case states a defect. The fixtures do not identify individual RCs, so coverage below preserves the reported level without inventing applicability.

Each eligible report is handed to Verify; missing, empty and stale reports are recorded as evidence gaps, not scored. Verify returns the report for the orchestrator to save. No edits are requested, so Gate Step 6 returns the report and stops. C10 first executes the specified repair-rerun selection, then uses its supplied results.

All final reports have Verification: **Content not run; File not applicable; Rendered not applicable; Target app not applicable**. Verify Step 5 says Content “is not run without sources or a Logician.” The fixtures explicitly add no mandatory Content-verification requirement, so that shared limitation does not independently block Ready. Independent model Reader results are synthetic fixtures, not evidence of human-reader performance.

## C1 — Complete

**Artifact:** v2 | **Readiness:** Ready | **Comprehension:** Pass

- Observed manifest: planned P; completed Reader, Cutter, Navigator, AudienceFit; missing none.
- Reader results: main point/action/risk Correct, as supplied.
- Coverage: all completed applicable checks PASS; intentional exclusions as above.
- Fixes: none. Missing evidence: none in the selected panel.
- Decision: Verify Step 5 gives Ready after no verified or unverified Blocker/Major, missing independent Reader, required check gap, or required-layer gap remains: “Otherwise `Ready`.” Comprehension is Pass because every critical answer is Correct and no Major comprehension finding remains.

## C2 — Partial

**Artifact:** v2 | **Readiness:** Unverified | **Comprehension:** Pass

- Observed manifest: planned P; completed Reader, Navigator, AudienceFit; Cutter missing after retry.
- Reader results: main point/action/risk Correct.
- Coverage: completed applicable checks PASS; **Cutter NOT VERIFIED**; intentional exclusions as above.
- Fixes: none. Missing evidence: current Cutter report; its applicability cannot be established.
- Decision: Gate Step 5 requires leaving an unresolved reviewer “in the planned panel as NOT VERIFIED.” Verify Step 5 includes “every planned reviewer whose applicable checks could not be established because its evidence is missing” in required checks. Readiness is therefore Unverified; completed Reader evidence still establishes comprehension Pass.

## C3 — Stale

**Artifact:** v2 | **Readiness:** Unverified | **Comprehension:** Pass

- Observed manifest: planned P; completed Reader, Cutter, AudienceFit; Navigator has only round-1 v1 evidence and no current report after retry.
- Reader results: main point/action/risk Correct from v2.
- Coverage: current completed applicable checks PASS; **Navigator NOT VERIFIED**; intentional exclusions as above. Stale Navigator checks do not count as current coverage.
- Fixes: none. Missing evidence: current Navigator report.
- Decision: Verify Step 0 says “Exclude stale, empty, and unattributable reports from scoring and adjudication; list them as evidence gaps instead.” Its required-check gap yields Unverified under Step 5. Current Reader answers yield Pass.

## C4 — Empty

**Artifact:** v2 | **Readiness:** Unverified | **Comprehension:** Pass

- Observed manifest: planned P; completed Reader, Cutter, Navigator; AudienceFit file empty after retry.
- Reader results: main point/action/risk Correct.
- Coverage: completed applicable checks PASS; **AudienceFit NOT VERIFIED**; intentional exclusions as above.
- Fixes: none. Missing evidence: usable AudienceFit report.
- Decision: Gate Step 5 checks that every returned file “exists and is non-empty”; Verify Step 0 excludes empty evidence. AudienceFit remains planned and NOT VERIFIED, so Step 5 gives Unverified. The independent Reader's passing results remain valid.

## C5 — Confirmed defect plus missing

**Artifact:** v2 | **Readiness:** NeedsRevision | **Comprehension:** NeedsRevision

- Observed manifest: planned P; completed Reader, Navigator, AudienceFit; Cutter missing after retry.
- Reader results: main point Wrong; action/risk Correct. Verify confirms a Major comprehension defect.
- Coverage: confirmed Major comprehension defect; other completed applicable checks PASS; **Cutter NOT VERIFIED**; intentional exclusions as above.
- Fixes: address the confirmed main-point comprehension defect. A location, quote, RC number and exact wording repair are not provided; none is fabricated.
- Missing evidence: current Cutter report remains an explicit gap even though it does not determine the headline status.
- Decision: Verify Step 1 makes a comprehension finding Major when it concerns the main point. Step 5 sets NeedsRevision “if any verified Blocker or Major remains” and says “Report missing evidence even when the status is already `NeedsRevision`.” A confirmed Major comprehension finding also rules out comprehension Pass.

## C6 — No evidence

**Artifact:** v2 | **Readiness:** Unverified | **Comprehension:** NotVerified

- Observed manifest: planned P; completed none; all four missing after retry.
- Reader results: not scored. The fixture's default correct-answer convention cannot stand in for a nonexistent Reader report.
- Coverage: **Reader, Cutter, Navigator and AudienceFit NOT VERIFIED**. No current applicable-RC results established; intentional exclusions as above.
- Fixes: none established. Missing evidence: every planned reviewer. The lenses did not run successfully; artifact v2 is not presented as reviewed.
- Decision: Verify Step 5 sets Unverified when “the independent Reader did not run” or a required check is NOT VERIFIED, and NotVerified when an intended audience lacks current independent Reader evidence. Gate Step 7.7 explicitly defines the same no-evidence outcome for repair rounds, but this case need not be assumed to be a repair round: Verify's rules independently establish both statuses.

## C7 — Later error

**Artifact:** v2 | **Readiness:** Ready | **Comprehension:** Pass

- Observed manifest: planned P; completed Reader, Cutter, Navigator, AudienceFit; missing none. A later unrelated tool request failed without changing or invalidating artifact or evidence.
- Reader results: main point/action/risk Correct.
- Coverage: all completed applicable checks PASS; intentional exclusions as above.
- Fixes: none. Missing evidence: none in the selected panel. Limitation: unrelated later tool failure is recorded separately.
- Decision: Verify Step 0 says “Preserve checks already established for this artifact even if another reviewer or a later tool call fails.” The error creates no required evidence gap in this fixture. Step 5 therefore yields Ready and Pass.

## C8 — Two audiences

**Artifact:** v2 | **Readiness:** Unverified | **Comprehension:** NotVerified

- Observed manifest: planned P2; completed Reader-approver, Cutter, Navigator, AudienceFit; Reader-operator missing after retry.
- Reader results: approver main point/action/risk Correct; operator not scored.
- Coverage: completed applicable checks PASS; **Reader-operator NOT VERIFIED**; intentional exclusions as above.
- Fixes: none. Missing evidence: independent current Reader evidence for the operator audience. Approver comprehension remains established separately.
- Decision: Gate Step 4 requires “One Reader per audience.” Verify Step 5 sets comprehension NotVerified “when any intended audience lacks current independent Reader evidence; retain completed audiences' results separately.” The missing planned reviewer is also a required-check gap, so readiness is Unverified.

## C9 — Stale negative report

**Artifact:** v2 | **Readiness:** Unverified | **Comprehension:** Pass

- Observed manifest: planned P; completed Reader, Cutter, AudienceFit; Navigator has only a v1 report alleging a Major setup defect, fixed in v2 and not attributable to current text. No v2 Navigator report exists after retry.
- Reader results: main point/action/risk Correct from v2.
- Coverage: current completed applicable checks PASS; **Navigator NOT VERIFIED**; intentional exclusions as above.
- Fixes: none established. **The old Major does not enter current Fixes and does not trigger NeedsRevision.** Missing evidence: current Navigator report; stale report retained only as an evidence-gap observation.
- Decision: Verify Step 0 permits only attributable current-artifact reports in Steps 1–4 and explicitly says “A finding from an older artifact cannot establish a defect in the current one.” Missing current Navigator evidence still blocks Ready under Step 5. Passing current Reader evidence supports Pass, not a substitute Navigator pass.

## C10 — Repair with two audiences

**Artifact:** v2 | **Readiness:** Unverified | **Comprehension:** NotVerified

- Rerun selection: before consuming results, dispatch **Reader-approver and Reader-operator**, plus Cutter and Navigator. Gate Step 7.7 requires “one fresh Reader per intended audience, the Cutter, the Navigator, and every other lens that had a verified finding in a changed section.” Both audiences remain in the brief; neither Reader's round-1 output covers v2.
- AudienceFit is included in this fixture's supplied rerun panel and has completed current evidence. The fixture does not say whether AudienceFit had a verified finding in a changed section, so the workflow's conditional obligation to rerun it cannot independently be established. Its inclusion does not change the outcome.
- Observed manifest after recorded dispatch results: planned P2; completed Reader-approver, Cutter, Navigator, AudienceFit; Reader-operator missing after retry.
- Reader results: approver main point/action/risk Correct from v2; operator not scored. Earlier operator Reader evidence does not establish current comprehension.
- Coverage: completed applicable checks PASS; **Reader-operator NOT VERIFIED**; intentional exclusions as above.
- Fixes: none. Missing evidence: operator's current independent Reader report. Approver's passing results are retained separately.
- Handoff: Gate Step 7.7 says “Partial evidence goes to Verify with missing reviewers still NOT VERIFIED.” This is a partial-evidence handoff, not the no-evidence branch. Verify Step 0 excludes the earlier Reader reports, and Step 5 yields Unverified readiness and NotVerified comprehension for the missing intended audience.

## Reporting limits

No exact question wording, expected answers, evidence paths, current-round numbers (except the identified stale round), RC applicability lists, or full finding records were supplied. The reports therefore preserve recorded status evidence and explicitly leave those details unspecified. Numeric relevance/evidence tallies and detailed fix text cannot be reconstructed without inventing inputs. No additional rule was inferred from the unconsulted reference materials.
