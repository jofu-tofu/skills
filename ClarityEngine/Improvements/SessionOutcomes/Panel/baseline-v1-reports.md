# Recorded workflow trial — baseline

These are synthetic executions of the supplied Gate and Verify rules, not live reviewer tests. No reviewers or measurement tools were launched. Each case is an audit (`edit_scope: none`), so Gate Step 6 returns the verifier report and stops; the repair-round guard in Step 7.7 is not reached. The listed retry outcomes are final.

Coverage below reports only supplied evidence. Fixtures supply applicable-check PASS results without RC identifiers; no individual RC numbers are invented. Missing reports have unknown applicability and no check results. Gate requires checking that returned files exist and are non-empty and retrying missing lenses once, but supplies no explicit terminal rule for a partially missing non-Reader panel in an audit. Verify Step 5 defines required RC checks as “every RC that a lens in this round's panel marked applicable.” Consequently the literal status path below does not manufacture applicable NOT VERIFIED RC checks from an absent report. This is a decision-path limitation, not proof that those missing reviewers passed.

For every case, verification is Content **not run**, File **not applicable**, Rendered **not applicable**, Target app **not applicable**. The fixture explicitly adds no mandatory Content check. Verify Step 5 says Content is not run without sources or a Logician; checks owned by lenses outside the panel are “not in panel” and do not block Ready. Skim Reader, Logician, and Visual are not in any selected panel here.

## C1 — Complete

**Artifact:** v2 | **Planned:** Reader, Cutter, Navigator, AudienceFit

**Completed:** Reader, Cutter, Navigator, AudienceFit, all current and non-empty.

**Readiness: Ready | Comprehension: Pass**

**Observations:** All supplied applicable checks PASS. Reader main-point/action/risk answers are Correct. No findings.

**Coverage:** Reader PASS; Cutter PASS; Navigator PASS; AudienceFit PASS, for their recorded applicable checks. No missing panel evidence.

**Handoff and rationale:** All four reports qualify for the current verifier handoff. Verify Step 5: no verified or UNVERIFIED Blocker/Major, missing independent Reader, required NOT VERIFIED check, or missing required layer is recorded; “Otherwise Ready.” Comprehension is Pass because relevant answers are Correct and no Major comprehension finding remains. Gate Step 6 returns the audit report. No fixes or proposals.

## C2 — Partial

**Artifact:** v2 | **Planned:** Reader, Cutter, Navigator, AudienceFit

**Completed:** Reader, Navigator, AudienceFit. **Missing after retry:** Cutter.

**Readiness: Ready | Comprehension: Pass**

**Observations:** Three current non-empty reports PASS their applicable checks. Reader answers are Correct. No findings. Cutter supplied no file.

**Coverage:** Reader PASS; Navigator PASS; AudienceFit PASS; Cutter no results, applicability unknown. Cutter remains selected, not “not in panel.”

**Handoff and rationale:** Supply the three usable reports and disclose the missing selected Cutter. Gate Step 5's existence/non-empty check fails for Cutter after the supplied retry. It specifies no further audit failure status. Under Verify Step 5's literal required-check definition, no Cutter RC was recorded as applicable or NOT VERIFIED, and the independent Reader ran. No listed readiness blocker is recorded, so the rule reaches “Otherwise Ready”; relevant Correct Reader answers yield Pass.

**Limitation:** Ready is the baseline's literal status outcome despite incomplete selected-panel execution. It does not establish Cutter coverage. A rule making every selected reviewer mandatory would change this outcome, but is not supplied. No fixes or proposals.

## C3 — Stale

**Artifact:** v2 | **Planned:** Reader, Cutter, Navigator, AudienceFit

**Completed on v2:** Reader, Cutter, AudienceFit. **Missing on v2 after retry:** Navigator. Its round-1/v1 report exists only as stale evidence.

**Readiness: Ready | Comprehension: Pass**

**Observations:** Three current reports PASS; Reader answers are Correct; no findings. Navigator has no current report.

**Coverage:** Reader PASS; Cutter PASS; AudienceFit PASS; Navigator no current results. Do not carry v1 PASS evidence into v2 coverage.

**Handoff and rationale:** Handoff includes current reports and records the stale Navigator exclusion. Verify Inputs specifies “From `$ROUND_DIR`: the artifact copy, every `lens-*.md`”; a different-round report is not evidence of a current check. Gate Step 5's retry is exhausted. As in C2, Verify Step 5 does not turn an absent non-Reader report into an applicable NOT VERIFIED check; the literal readiness branch reaches Ready. Correct Reader answers yield Pass.

**Limitation:** Current Navigator coverage is missing. The Ready status does not establish full selected-panel completion. No fixes or proposals.

## C4 — Empty

**Artifact:** v2 | **Planned:** Reader, Cutter, Navigator, AudienceFit

**Completed:** Reader, Cutter, Navigator. **Empty after retry:** AudienceFit.

**Readiness: Ready | Comprehension: Pass**

**Observations:** Three usable current reports PASS; Reader answers are Correct; no findings. AudienceFit's file exists but is empty.

**Coverage:** Reader PASS; Cutter PASS; Navigator PASS; AudienceFit no results, applicability unknown.

**Handoff and rationale:** Exclude the empty report from usable reviewer evidence and disclose it. Gate Step 5 requires that each returned file “exists and is non-empty”; existence alone does not complete AudienceFit. There is no explicit audit status for this failed check. Verify Step 5's required RC definition cannot obtain an applicable-check declaration from an empty report, and its other readiness blockers are absent. The literal branch therefore reaches Ready; comprehension reaches Pass.

**Limitation:** AudienceFit coverage is missing despite the final readiness label. No fixes or proposals.

## C5 — Confirmed defect plus missing

**Artifact:** v2 | **Planned:** Reader, Cutter, Navigator, AudienceFit

**Completed:** Reader, Navigator, AudienceFit. **Missing after retry:** Cutter.

**Readiness: NeedsRevision | Comprehension: NeedsRevision**

**Observations:** Reader answered the main point incorrectly, and Verify confirmed a Major comprehension defect. Other supplied checks PASS. Cutter is missing.

**Coverage:** Reader has a verified Major comprehension finding; other supplied applicable Reader checks PASS. Navigator PASS; AudienceFit PASS; Cutter no results.

**Handoff and rationale:** Handoff includes the confirmed Major and available reports, plus the missing Cutter note. Verify Step 1 makes a non-Correct answer a comprehension finding and treats main-point findings as Major; the fixture explicitly supplies verification of the document defect. Verify Step 5 sets NeedsRevision “if any verified Blocker or Major remains.” It also says, “Report missing evidence even when the status is already NeedsRevision.” Comprehension cannot Pass because the main-point answer is Wrong and a Major comprehension finding remains; the independent Reader ran, so the fallback is NeedsRevision.

**Top fix:** Revise the passage responsible for the verified main-point misunderstanding. The fixture provides no passage, exact RC, expected answer text, or concrete wording; none is invented. Cutter review remains missing. Gate Step 6 returns these findings without editing.

## C6 — No evidence

**Artifact:** v2 | **Planned:** Reader, Cutter, Navigator, AudienceFit

**Completed:** None. **Missing after retry:** All four selected reviewers.

**Readiness: Unverified | Comprehension: NotVerified**

**Observations:** No reviewer reports exist. The default Correct-answer statement cannot supply independent Reader evidence when the Reader produced no report.

**Coverage:** No selected-lens check results. Applicability unknown; no PASS claims.

**Handoff and rationale:** The simulated verifier receives an explicit empty-evidence inventory, not synthetic reviews. Gate Step 5 file checks failed after retry. Verify Step 5 independently sets readiness Unverified when “the independent Reader did not run” and comprehension “NotVerified without an independent Reader.” No usable independent Reader result exists here. Gate Step 7.7 would also prescribe these labels for a repair round with no lens files, but this audit does not enter that step.

**Limitations:** The entire selected panel lacks evidence. No verified findings, substantive fixes, or comprehension answers can be reported from this fixture. Gate Step 6 returns the unverified report.

## C7 — Later error

**Artifact:** v2 | **Planned:** Reader, Cutter, Navigator, AudienceFit

**Completed:** Reader, Cutter, Navigator, AudienceFit, all current and valid before the unrelated error.

**Readiness: Ready | Comprehension: Pass**

**Observations:** All current reviewer results PASS, Reader answers are Correct, and no findings remain. A later unrelated tool request failed without changing or invalidating the artifact or reports.

**Coverage:** Reader PASS; Cutter PASS; Navigator PASS; AudienceFit PASS. No missing panel evidence.

**Handoff and rationale:** Retain the four valid current reports. Verify Step 5 bases statuses on findings, Reader evidence, required checks, and required verification layers; none is invalidated by the supplied unrelated error. No readiness blocker is recorded, so “Otherwise Ready” applies. Correct relevant Reader answers yield Pass. Gate Step 6 returns the audit report.

**Limitation:** Record the unrelated tool failure as an operational observation; do not infer a failed or missing review check from it. No fixes or proposals.

## C8 — Two audiences

**Artifact:** v2 | **Planned:** Reader-approver, Reader-operator, Cutter, Navigator, AudienceFit

**Completed:** Reader-approver, Cutter, Navigator, AudienceFit. **Missing after retry:** Reader-operator.

**Readiness: Unverified | Comprehension: NotVerified**

**Observations:** All four supplied current reports PASS. Approver answers are Correct. No operator Reader report exists; operator comprehension has no independent evidence.

**Coverage:** Reader-approver PASS; Cutter PASS; Navigator PASS; AudienceFit PASS; Reader-operator no results. Audience-specific comprehension: approver Pass; operator NotVerified.

**Handoff and rationale:** Preserve separate audience inventories and hand off the missing operator result explicitly. Gate Step 1 requires separate questions and answer keys per audience; Step 4 requires “One Reader per audience.” Verify Step 1 says to compare “each Reader's answers” with its matching key. Applying Step 5's missing-independent-Reader rule to this required audience gives overall Unverified and NotVerified. The approver Reader cannot stand in for the operator Reader.

**Limitation:** Overall comprehension cannot be established for every named audience. The workflow does not separately spell out a multi-audience aggregation formula; this result applies its independent-Reader requirement to each Reader required by Gate Step 4. No fixes or proposals.

## Evidence bookkeeping

Cases without findings have relevance/evidence tallies 0/0, with no filtered findings. C5 has the one supplied confirmed Major comprehension finding (1/1 relevance passed; 1/1 verified); no filtering or conflict is supplied. Missing, stale, and empty reviewer reports are evidence gaps, not invented findings. No proposals or conflicts are supplied in any case. Exact Reader question/answer wording and individual RC coverage identifiers are absent from the fixtures, so the reports retain their supplied semantic results without fabricating tables of text.
