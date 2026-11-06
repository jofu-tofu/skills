# Recorded workflow executions — panel B

These eight executions use the supplied synthetic observations, including completed retries. No reviewers or measurement tools were launched. The observations below are supplied evidence; statuses are the result of applying the candidate workflows.

All artifacts are plain-text short-form chats, current version v2, with no edits requested. For every case, Verification is **Content not run; File not applicable; Rendered not applicable; Target app not applicable**. Content is not run because there are no separate sources or Logician; the fixture adds no requirement for that layer. Skim Reader, Logician, and Visual are intentionally outside the panel because this is short-form nonvisual text. Their checks are **not in panel**, not missing.

The case records below serve as panel bookkeeping and the final report handoff. Applicable checks from completed current reviewers retain their supplied PASS results. The fixtures do not enumerate RC identifiers, question wording, or individual answers, so those details are not invented. Gate Step 6 sends each panel, including unresolved reviewers, to Verify, saves the returned report, and stops because no edits are requested. The reports below represent that decision path, not live agent execution.

## C1 — Complete

**Artifact:** v2 | **Readiness: Ready** | **Comprehension: Pass**

**Observed panel:** Planned: Reader, Cutter, Navigator, AudienceFit. Completed: all four, with non-empty v2 reports. No missing evidence. Reader main point/action/risk answers are Correct. No findings.

**Coverage:** Reader PASS; Cutter PASS; Navigator PASS; AudienceFit PASS, for their supplied applicable checks. Intentional exclusions and verification layers are as stated above.

**Decision and exact rule:** Verify Step 5, Readiness: “Otherwise `Ready`.” All planned reviewers completed, no verified or unverified Blocker/Major remains, and no required layer is missing. Comprehension: “`Pass` when every answer touching the main point, ask, decision, or risk is Correct and no Major comprehension finding remains.”

**Fixes:** None. **Limitations:** Recorded synthetic review evidence; excluded checks were not performed.

## C2 — Partial

**Artifact:** v2 | **Readiness: Unverified** | **Comprehension: Pass**

**Observed panel:** Planned: Reader, Cutter, Navigator, AudienceFit. Completed: Reader, Navigator, AudienceFit, each non-empty on v2. Cutter returned no file after retry. Reader answers are Correct. No findings.

**Coverage:** Reader PASS; Navigator PASS; AudienceFit PASS; Cutter **NOT VERIFIED — missing report**. Cutter remains planned; it is not reclassified as excluded.

**Decision and exact rule:** Gate Step 5: “after retry, leave an unresolved reviewer in the planned panel as NOT VERIFIED.” Verify Step 5: readiness is “`Unverified` if … a required check is NOT VERIFIED.” Required checks include “every planned reviewer whose applicable checks could not be established because its evidence is missing.” Independent Reader evidence supports Pass under the comprehension rule quoted in C1.

**Handoff:** Partial evidence goes to Verify with Cutter unresolved. **Fixes:** None established. **Limitations:** Cutter coverage is unknown; no absence-of-defects conclusion is inferred for it.

## C3 — Stale

**Artifact:** v2 | **Readiness: Unverified** | **Comprehension: Pass**

**Observed panel:** Planned: Reader, Cutter, Navigator, AudienceFit. Completed on v2: Reader, Cutter, AudienceFit. Navigator supplied only round-1 v1 evidence; no v2 report exists after retry. Reader answers are Correct. No current findings.

**Coverage:** Reader PASS; Cutter PASS; AudienceFit PASS; Navigator **NOT VERIFIED — stale v1 evidence**. Navigator's earlier report is recorded as stale, not as a current completion.

**Decision and exact rule:** Gate Step 4: “earlier-round output is not current evidence.” Verify Step 5: “A planned reviewer with missing, empty, or earlier-artifact evidence remains NOT VERIFIED after retry; do not remove it from the required panel.” The required-check rule makes readiness Unverified. Current Reader answers support Pass.

**Handoff:** Send current reports and the stale-evidence record to Verify. **Fixes:** None established. **Limitations:** v2 navigation checks have no current independent evidence.

## C4 — Empty

**Artifact:** v2 | **Readiness: Unverified** | **Comprehension: Pass**

**Observed panel:** Planned: Reader, Cutter, Navigator, AudienceFit. Completed on v2: Reader, Cutter, Navigator. AudienceFit's returned file is empty after retry. Reader answers are Correct. No findings.

**Coverage:** Reader PASS; Cutter PASS; Navigator PASS; AudienceFit **NOT VERIFIED — empty output**. The empty path is recorded but is not a completed review.

**Decision and exact rule:** Gate Step 5: “Check that each returned file exists and is non-empty.” Verify Step 5 expressly keeps “missing, empty, or earlier-artifact evidence” NOT VERIFIED after retry. Its required-check rule yields Unverified; current independent Reader results yield Pass.

**Handoff:** Partial evidence goes to Verify with AudienceFit unresolved. **Fixes:** None established. **Limitations:** AudienceFit applicability and results are unavailable.

## C5 — Confirmed defect plus missing evidence

**Artifact:** v2 | **Readiness: NeedsRevision** | **Comprehension: NeedsRevision**

**Observed panel:** Planned: Reader, Cutter, Navigator, AudienceFit. Completed on v2: Reader, Navigator, AudienceFit. Cutter is missing after retry. Reader answered the main point incorrectly; Verify confirms a Major comprehension defect. Other supplied checks pass.

**Coverage:** Reader **confirmed Major comprehension defect**; Navigator PASS; AudienceFit PASS; Cutter **NOT VERIFIED — missing report**. Other applicable completed checks retain PASS.

**Decision and exact rule:** Verify Step 1: a non-Correct answer “is Major when the question concerns the main point, the ask, the decision, or the top risk.” Verify Step 5: “`NeedsRevision` if any verified Blocker or Major remains” and “Report missing evidence even when the status is already `NeedsRevision`.” Comprehension cannot Pass because a Major comprehension finding remains; the otherwise rule is NeedsRevision.

**Fixes:** Address the confirmed main-point comprehension defect. The fixture supplies no passage, RC identifier, or proposed wording, so no precise edit is fabricated. **Handoff:** Deliver the confirmed defect and missing Cutter evidence together; do not edit in this audit. **Limitations:** Cutter review is still required; NeedsRevision does not imply full panel completion.

## C6 — No evidence

**Artifact:** v2 | **Readiness: Unverified** | **Comprehension: NotVerified**

**Observed panel:** Planned: Reader, Cutter, Navigator, AudienceFit. Completed: none. All four failed to produce reports after retry. No independent Reader answers exist; the generic fixture default of Correct cannot substitute for absent evidence.

**Coverage:** Reader NOT VERIFIED; Cutter NOT VERIFIED; Navigator NOT VERIFIED; AudienceFit NOT VERIFIED. Applicability cannot be established for their checks. No findings are established from these absent reports.

**Decision and exact rule:** Verify Step 5 makes readiness Unverified when “the independent Reader did not run” or required checks are NOT VERIFIED. Comprehension is “`NotVerified` when any intended audience lacks current independent Reader evidence.” Gate Step 7.7 additionally states for an empty repair-round panel: “If none exist, the round fails: write `report.md` saying the lenses did not run, set readiness and comprehension to `Unverified` and `NotVerified`, and do not present the repaired artifact as reviewed.” No repair round is specified here, so Step 5 independently determines the same statuses without inventing one.

**Handoff:** Record that the lenses did not produce evidence and return an unreviewed artifact status. **Fixes:** None can be established. **Limitations:** No independent review occurred; this is not a clean review.

## C7 — Later unrelated error

**Artifact:** v2 | **Readiness: Ready** | **Comprehension: Pass**

**Observed panel:** Planned: Reader, Cutter, Navigator, AudienceFit. Completed: all four, valid non-empty v2 reports. A later unrelated tool request failed without changing or invalidating artifact or reports. Reader answers are Correct; no findings.

**Coverage:** Reader PASS; Cutter PASS; Navigator PASS; AudienceFit PASS. No reviewer becomes missing because of the later error.

**Decision and exact rule:** Verify Step 5: “Preserve checks already established for this artifact even if another reviewer or a later tool call fails.” The complete current evidence still meets the Ready and Pass rules; the unrelated error does not establish a failed required check.

**Handoff:** Return the established review, retaining the unrelated error as an observation. **Fixes:** None. **Limitations:** The unrelated request failed; its purpose and error text are unspecified and are not invented. It does not limit the supplied review evidence.

## C8 — Two audiences

**Artifact:** v2 | **Readiness: Unverified** | **Comprehension: NotVerified**

**Observed panel:** Planned: Reader-approver, Reader-operator, Cutter, Navigator, AudienceFit. Completed on v2: Reader-approver, Cutter, Navigator, AudienceFit. Reader-operator is missing after retry. Approver answers are Correct; all other supplied completed checks pass.

**Coverage:** Reader-approver PASS; Reader-operator **NOT VERIFIED — missing report**; Cutter PASS; Navigator PASS; AudienceFit PASS. Audience results: approver **Pass**; operator **NotVerified**.

**Decision and exact rule:** Gate Step 4 requires “One Reader per audience.” Verify Step 5 includes “audience-specific Readers” in planned coverage and retains missing reviewers as NOT VERIFIED. This missing required check makes readiness Unverified. Comprehension is “`NotVerified` when any intended audience lacks current independent Reader evidence; retain completed audiences' results separately.”

**Handoff:** Send partial audience coverage to Verify and retain the approver result separately. **Fixes:** None established. **Limitations:** Approver success does not establish operator comprehension.

## Findings bookkeeping

C1–C4 and C6–C8 have no supplied findings: Relevance 0/0; Evidence 0/0. Those zero counts do not replace missing panel evidence. C5 has one supplied confirmed Major comprehension finding: Relevance 1/1; Evidence 1/1 verified. No cases supply out-of-scope, taste, downgraded, invalid, false-positive, unneeded-addition, misrouted, or unverified individual findings. Missing reviewer evidence is reported in coverage, not invented as an individual finding. No conflicts, author proposals, or declined fixes are supplied.
